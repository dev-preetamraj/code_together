from django.shortcuts import render

def room(request, room_id, username):
    context = {
        "room_id": room_id,
        "username": username
    }
    return render(request, 'room.html', context)