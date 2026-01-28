from django.db import models

class VideoJob(models.Model):
    path=models.TextField() # 프론트에서 받는 blob 경로 넣기
    