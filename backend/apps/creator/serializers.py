from rest_framework import serializers

class VideoJobCreateSerializer( serializers.Serializer):
    path=serializers.CharField() # path 받기