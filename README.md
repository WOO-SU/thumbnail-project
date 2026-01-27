# Thumbnail-project

typescript (npm) 의 경우 package.json , package-lock.json 을 npm init으로 생성하면
아마도 성공적으로 docker compose 가 가능해질 겁니다.


frontend:
```bash
docker build -t frontend .
```

```bash
docker compose up -d
docker ps # Check for health
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser

# check logs
docker logs -f thumbnail_be
docker logs -f thumbnail_db
```

### After that, access site by:
[http://localhost:8000/admin/](http://localhost:8000/admin/)
