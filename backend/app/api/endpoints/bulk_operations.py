from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import csv
import io
from app.core.database import get_db
from app.core.rbac import check_permission
from app.core.audit import record_audit_log
from app.models import (
    User, Product, Customer, Supplier, Category, Warehouse,
    SerialNumber, Batch, Purchase, Sale, Invoice, Quote, ProductReturn
)

router = APIRouter()


class BulkUpdateItem(BaseModel):
    id: int
    updates: Dict[str, Any]


class BulkDeleteRequest(BaseModel):
    ids: List[int]
    entity_type: str


class BulkExportRequest(BaseModel):
    ids: List[int]
    entity_type: str
    format: str = "csv"  # csv, json


# Mapping of entity types to models
ENTITY_MODELS = {
    "products": Product,
    "customers": Customer,
    "suppliers": Supplier,
    "categories": Category,
    "warehouses": Warehouse,
    "serial_numbers": SerialNumber,
    "batches": Batch,
    "purchases": Purchase,
    "sales": Sale,
    "invoices": Invoice,
    "quotes": Quote,
    "returns": ProductReturn,
}

# Permission mapping
ENTITY_PERMISSIONS = {
    "products": "products",
    "customers": "customers",
    "suppliers": "suppliers",
    "categories": "categories",
    "warehouses": "warehouses",
    "serial_numbers": "serial_numbers",
    "batches": "batches",
    "purchases": "purchases",
    "sales": "sales",
    "invoices": "invoices",
    "quotes": "quotes",
    "returns": "returns",
}


@router.post("/update")
async def bulk_update(
    request: List[BulkUpdateItem],
    entity_type: str = Query(...),
    current_user: User = Depends(check_permission("update")),
    db: Session = Depends(get_db),
):
    """Bulk update entities"""
    if entity_type not in ENTITY_MODELS:
        raise HTTPException(status_code=400, detail=f"Unknown entity type: {entity_type}")
    
    # Check permission
    permission = f"{ENTITY_PERMISSIONS[entity_type]}_update"
    if not any(p.name == permission for p in current_user.role.permissions if current_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    model = ENTITY_MODELS[entity_type]
    updated_count = 0
    errors = []
    
    try:
        for item in request:
            try:
                entity = db.query(model).filter(model.id == item.id).first()
                if not entity:
                    errors.append(f"Entity {item.id} not found")
                    continue
                
                # Update fields
                for field, value in item.updates.items():
                    if hasattr(entity, field):
                        setattr(entity, field, value)
                    else:
                        errors.append(f"Entity {item.id}: Unknown field '{field}'")
                
                # Record audit log
                record_audit_log(
                    db, current_user.id, f"bulk_update_{entity_type}",
                    f"Updated {entity_type} {item.id}", entity_type, item.id
                )
                
                updated_count += 1
            except Exception as e:
                errors.append(f"Entity {item.id}: {str(e)}")
        
        db.commit()
        
        return {
            "updated_count": updated_count,
            "total_count": len(request),
            "errors": errors,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk update failed: {str(e)}")


@router.post("/delete")
async def bulk_delete(
    request: BulkDeleteRequest,
    current_user: User = Depends(check_permission("delete")),
    db: Session = Depends(get_db),
):
    """Bulk delete entities"""
    if request.entity_type not in ENTITY_MODELS:
        raise HTTPException(status_code=400, detail=f"Unknown entity type: {request.entity_type}")
    
    # Check permission
    permission = f"{ENTITY_PERMISSIONS[request.entity_type]}_delete"
    if not any(p.name == permission for p in current_user.role.permissions if current_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    model = ENTITY_MODELS[request.entity_type]
    deleted_count = 0
    errors = []
    
    try:
        for entity_id in request.ids:
            try:
                entity = db.query(model).filter(model.id == entity_id).first()
                if not entity:
                    errors.append(f"Entity {entity_id} not found")
                    continue
                
                # Record audit log before deletion
                record_audit_log(
                    db, current_user.id, f"bulk_delete_{request.entity_type}",
                    f"Deleted {request.entity_type} {entity_id}", request.entity_type, entity_id
                )
                
                db.delete(entity)
                deleted_count += 1
            except Exception as e:
                errors.append(f"Entity {entity_id}: {str(e)}")
        
        db.commit()
        
        return {
            "deleted_count": deleted_count,
            "total_count": len(request.ids),
            "errors": errors,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk delete failed: {str(e)}")


@router.post("/export")
async def bulk_export(
    request: BulkExportRequest,
    current_user: User = Depends(check_permission("view")),
    db: Session = Depends(get_db),
):
    """Bulk export entities to CSV or JSON"""
    if request.entity_type not in ENTITY_MODELS:
        raise HTTPException(status_code=400, detail=f"Unknown entity type: {request.entity_type}")
    
    # Check permission
    permission = f"{ENTITY_PERMISSIONS[request.entity_type]}_view"
    if not any(p.name == permission for p in current_user.role.permissions if current_user.role):
        raise HTTPException(status_code=403, detail="Permission denied")
    
    model = ENTITY_MODELS[request.entity_type]
    entities = db.query(model).filter(model.id.in_(request.ids)).all()
    
    if not entities:
        raise HTTPException(status_code=404, detail="No entities found")
    
    if request.format == "json":
        # Convert to JSON-serializable format
        data = []
        for entity in entities:
            entity_dict = {}
            for column in entity.__table__.columns:
                value = getattr(entity, column.name)
                # Convert datetime to string
                if hasattr(value, 'isoformat'):
                    value = value.isoformat()
                entity_dict[column.name] = value
            data.append(entity_dict)
        
        return {"data": data, "format": "json", "count": len(data)}
    
    elif request.format == "csv":
        # Convert to CSV
        output = io.StringIO()
        if entities:
            # Get column names
            columns = [column.name for column in entities[0].__table__.columns]
            writer = csv.DictWriter(output, fieldnames=columns)
            writer.writeheader()
            
            for entity in entities:
                row = {}
                for column in columns:
                    value = getattr(entity, column)
                    # Convert datetime to string
                    if hasattr(value, 'isoformat'):
                        value = value.isoformat()
                    row[column] = value
                writer.writerow(row)
        
        from fastapi.responses import StreamingResponse
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={request.entity_type}_export.csv"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'json'")


@router.get("/stats")
async def bulk_operation_stats(
    entity_type: Optional[str] = Query(None),
    current_user: User = Depends(check_permission("view")),
    db: Session = Depends(get_db),
):
    """Get statistics about entities for bulk operations"""
    stats = {}
    
    for entity_name, model in ENTITY_MODELS.items():
        if entity_type and entity_name != entity_type:
            continue
        
        try:
            total_count = db.query(model).count()
            stats[entity_name] = {
                "total_count": total_count,
                "last_updated": db.query(model).order_by(model.updated_at.desc()).first().updated_at if hasattr(model, 'updated_at') else None,
            }
        except Exception as e:
            stats[entity_name] = {"error": str(e)}
    
    return stats
