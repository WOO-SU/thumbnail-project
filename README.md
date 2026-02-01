# Thumbnail-project

## Not frontend

### Docker init and setup
```bash
docker compose up -d --build
```
### Docker shutdown
```bash
docker compose down
```
### Docker logs monitoring
```bash
docker compose logs -f backend worker
```

## Backend
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### After that, access site by:
[http://localhost:8000/admin/](http://localhost:8000/admin/)
