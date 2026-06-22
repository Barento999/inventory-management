import os
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.file import File as FileModel

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../../uploads")
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'xlsx', 'xls',
    'doc', 'docx', 'zip', 'rar', '7z'
}

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


def get_file_mime_type(filename: str) -> str:
    """Get MIME type based on extension"""
    ext = get_file_extension(filename)
    mime_types = {
        'txt': 'text/plain',
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'csv': 'text/csv',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
    }
    return mime_types.get(ext, 'application/octet-stream')


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    related_entity: str = Query(None),
    related_id: int = Query(None),
):
    """Upload a file"""
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Save file record to database
    try:
        file_record = FileModel(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=get_file_mime_type(file.filename),
            uploaded_by=current_user.id,
            related_entity=related_entity,
            related_id=related_id,
        )
        
        db.add(file_record)
        db.commit()
        db.refresh(file_record)
        
        return {
            "id": file_record.id,
            "filename": file_record.original_filename,
            "file_size": file_record.file_size,
            "mime_type": file_record.mime_type,
            "uploaded_at": file_record.created_at,
            "url": f"/api/uploads/download/{file_record.id}",
        }
    except Exception as e:
        # Delete file if database save fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to save file record: {str(e)}")


@router.get("/")
async def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0),
    limit: int = Query(50, le=100),
):
    """List uploaded files by current user"""
    files = db.query(FileModel).filter(
        FileModel.uploaded_by == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": f.id,
            "filename": f.original_filename,
            "file_size": f.file_size,
            "mime_type": f.mime_type,
            "uploaded_at": f.created_at,
            "url": f"/api/uploads/download/{f.id}",
        }
        for f in files
    ]


@router.get("/download/{file_id}")
async def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download a file"""
    from fastapi.responses import FileResponse
    
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if file exists on disk
    if not os.path.exists(file_record.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        file_record.file_path,
        filename=file_record.original_filename,
        media_type=file_record.mime_type,
    )


@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a file"""
    file_record = db.query(FileModel).filter(
        FileModel.id == file_id,
        FileModel.uploaded_by == current_user.id,
    ).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete file from disk
    try:
        if os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
    
    # Delete from database
    db.delete(file_record)
    db.commit()
    
    return {"status": "success", "message": "File deleted"}


@router.get("/info/{file_id}")
async def get_file_info(
    file_id: int,
    db: Session = Depends(get_db),
):
    """Get file information"""
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {
        "id": file_record.id,
        "filename": file_record.original_filename,
        "file_size": file_record.file_size,
        "mime_type": file_record.mime_type,
        "uploaded_by": file_record.uploader.name if file_record.uploader else "Unknown",
        "uploaded_at": file_record.created_at,
        "related_entity": file_record.related_entity,
        "related_id": file_record.related_id,
    }
