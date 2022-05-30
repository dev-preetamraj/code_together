from django.urls import path
from .views import (
    index,
    room
)

urlpatterns = [
    path('', index, name='index'),
    path('room/<str:room_id>/<str:username>/', room, name='room')
]