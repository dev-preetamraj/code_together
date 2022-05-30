from django.urls import path
from .consumers import CodeConsumer, ChatConsumer

websocket_urlpatterns = [
    path('ws/code/<str:room_id>/<str:username>/', CodeConsumer.as_asgi()),
    path('ws/chat/<str:room_id>/<str:username>/', ChatConsumer.as_asgi())
]