from django.urls import path
from .views import (
    room
)

urlpatterns = [
    path('room/<str:room_id>/<str:username>/', room, name='room')
]