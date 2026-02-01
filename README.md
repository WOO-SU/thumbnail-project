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


## TODO

GitHub Secrets: Go to your Repo Settings -> Secrets and add AZURE_CREDENTIALS (JSON output from az ad sp create-for-rbac ...).

Azure Container App Env Vars: In the Azure Portal, go to your Container App -> Containers -> Environment variables. Add:

    AZURE_CONNECTION_STRING: (Your real Azure Storage connection string)

    DB_HOST: (Your Azure MySQL host)

    DB_PASSWORD: (Your DB password)

    DEBUG: False

