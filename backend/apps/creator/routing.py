from django.urls import re_path
from .consumers import ThumbnailConsumer

websocket_urlpatterns = [
    re_path(r"ws/thumbnail/$", ThumbnailConsumer.as_asgi()),
]
