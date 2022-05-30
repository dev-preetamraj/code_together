from django.shortcuts import render
from .models import ActiveUser, RoomGroup

def index(request):
    context = {}
    return render(request, 'index.html', context)

def room(request, room_id, username):
    context = {
        "room_id": room_id,
        "username": username
    }
    # try:
        # room_group = RoomGroup.objects.get(room_id=room_id)
        # active_users = ActiveUser.objects.filter(room_group=room_group)
    #     context['active_users']
    return render(request, 'room.html', context)