from django.urls import path
from .consumers import CodeConsumer

websocket_urlpatterns = [
    path('ws/code/<str:room_id>/<str:username>/', CodeConsumer.as_asgi())
]