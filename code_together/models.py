from django.db import models

class RoomGroup(models.Model):
    room_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.room_id

class ActiveUser(models.Model):
    room_group = models.ForeignKey(RoomGroup, on_delete=models.CASCADE)
    username = models.CharField(max_length=100)

    def __str__(self):
        return self.username