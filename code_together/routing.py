from django.urls import path
from .consumers import CodeConsumer, ChatConsumer, UserConsumer

websocket_urlpatterns = [
    path('ws/code/<str:room_id>/<str:username>/', CodeConsumer.as_asgi()),
    path('ws/chat/<str:room_id>/<str:username>/', ChatConsumer.as_asgi()),
    path('ws/user/<str:room_id>/<str:username>/', UserConsumer.as_asgi()),
]