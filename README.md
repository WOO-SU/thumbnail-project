# Thumbnail-project

지금은 아직 빌드 컨테이너 정의가 끝나지 않았기 때문에, docker compose up -d
파이썬 (pip) 의 경우 requirements.txt,
typescript (npm) 의 경우 package.json , package-lock.json 을 npm init으로 생성하면
아마도 성공적으로 docker compose 가 가능해질 겁니다.

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
