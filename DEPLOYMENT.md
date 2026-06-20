# Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Start all services**
```bash
docker-compose up -d
```

2. **Services**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

3. **Initialize database**
```bash
docker-compose exec backend python seed.py
```

4. **View logs**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

5. **Stop services**
```bash
docker-compose down
```

---

## Production Deployment

### Environment Variables

Create `.env.production`:
```
ENVIRONMENT=production
DATABASE_URL=postgresql://user:password@host:5432/inventory_db
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
SENTRY_DSN=your-sentry-dsn
```

### Building for Production

1. **Build images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Push to registry** (Docker Hub, AWS ECR, etc.)
```bash
docker tag inventory-backend:latest your-registry/inventory-backend:latest
docker push your-registry/inventory-backend:latest
```

### Deployment Platforms

#### AWS ECS/Fargate
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag inventory-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/inventory-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/inventory-backend:latest
```

#### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/inventory-backend
gcloud run deploy inventory-backend --image gcr.io/PROJECT_ID/inventory-backend
```

#### Heroku
```bash
heroku container:login
heroku container:push web -a inventory-app
heroku container:release web -a inventory-app
```

#### DigitalOcean App Platform
```bash
doctl apps create --spec app.yaml
```

---

## Database Migrations

### Create migration
```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
```

### Apply migrations
```bash
docker-compose exec backend alembic upgrade head
```

### Rollback
```bash
docker-compose exec backend alembic downgrade -1
```

---

## Monitoring & Logging

### Container Health Checks
```bash
docker-compose ps
```

### View container logs
```bash
docker-compose logs [service-name]
```

### Real-time monitoring
```bash
docker stats
```

### Persistent logging (ELK Stack)
- Configure Elasticsearch endpoint
- Update docker-compose with logging driver
- Set up Kibana dashboard

---

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Set SECRET_KEY to strong random value
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Configure monitoring/alerting
- [ ] Review audit logs regularly
- [ ] Update dependencies regularly

---

## Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing
- Use Nginx/HAProxy in front of services
- Configure sticky sessions if needed
- Monitor load distribution

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker-compose exec backend python -m pytest
```

### Database connection error
```bash
docker-compose exec backend python -c "from app.core.database import engine; engine.execute('SELECT 1')"
```

### Port already in use
```bash
docker-compose down
# or use different ports:
docker-compose -e "BACKEND_PORT=8001" up
```

### Reset everything
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
docker-compose exec backend python seed.py
```

---

## Backup & Recovery

### Backup database
```bash
docker-compose exec -T postgres pg_dump -U postgres inventory_db > backup.sql
```

### Restore database
```bash
docker-compose exec -T postgres psql -U postgres inventory_db < backup.sql
```

### Automated backups (cron)
```bash
# backup.sh
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker-compose exec -T postgres pg_dump -U postgres inventory_db > backups/backup_$TIMESTAMP.sql
```

---

## Performance Optimization

### Database indexes
```bash
docker-compose exec backend python -c "
from app.core.database import engine
engine.execute('CREATE INDEX idx_users_email ON users(email)')
engine.execute('CREATE INDEX idx_products_sku ON products(sku)')
"
```

### Connection pooling
- Adjust in docker-compose environment
- Monitor with `docker stats`

### Caching
- Consider Redis for session/cache storage
- Update docker-compose with Redis service

---

## CI/CD Pipeline

### GitHub Actions
- Automated testing on push
- Docker image building
- Health checks
- Automatic deployment

### Enable workflows
1. Create `.github/workflows/deploy.yml`
2. Configure secrets in GitHub settings
3. Push to trigger workflows

---

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Review audit logs: `/api/audit-logs`
3. Check system status: `/api/health`
4. Review documentation

---

**Last Updated**: June 2026
**Docker Compose Version**: 2.0+
**Python Version**: 3.13+
**Node Version**: 20+
