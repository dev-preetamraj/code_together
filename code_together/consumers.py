import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import RoomGroup, ActiveUser
import time

class CodeConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f"room_{self.room_id}"
        self.room_group, room_created = RoomGroup.objects.get_or_create(room_id=self.room_id)
        self.active_user, user_created = ActiveUser.objects.get_or_create(room_group=self.room_group,username=self.username)

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        try:
            self.active_user.delete()
            users_list = ActiveUser.objects.filter(room_group=self.room_group)
            if(users_list.count()==0):
                self.room_group.delete()
        except Exception as e:
            print(e)
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive source_code from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        source_code = text_data_json['source_code']
        languageID = text_data_json['languageID']
        input_text = text_data_json['input_text']
        output_text = text_data_json['output_text']
        dissable_editor = text_data_json['dissable_editor']
        console_text = text_data_json['console_text']

        # Send source_code to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'write_source_code',
                'source_code': source_code,
                'languageID': languageID,
                'input_text': input_text,
                'output_text': output_text,
                'dissable_editor': dissable_editor,
                'console_text': console_text,
                'sender_channel_name': self.channel_name
            }
        )

    # Receive source_code from room group
    def write_source_code(self, event):
        source_code = event['source_code']
        languageID = event['languageID']
        input_text = event['input_text']
        output_text = event['output_text']
        dissable_editor = event['dissable_editor']
        console_text = event['console_text']

        # Send source_code to WebSocket
        if self.channel_name != event.get('sender_channel_name'):
            self.send(text_data=json.dumps({
                'source_code': source_code,
                'languageID': languageID,
                'input_text': input_text,
                'output_text': output_text,
                'dissable_editor': dissable_editor,
                'console_text': console_text
            }))

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f"chatroom_{self.room_id}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive chat_message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        chat_message = text_data_json['chat_message']
        sender = text_data_json['sender']

        # Send chat_message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'write_chat',
                'chat_message': chat_message,
                'sender': sender,
                'sender_channel_name': self.channel_name
            }
        )

    # Receive chat_message from room group
    def write_chat(self, event):
        chat_message = event['chat_message']
        sender = event['sender']

        # Send source_code to WebSocket
        if self.channel_name != event.get('sender_channel_name'):
            self.send(text_data=json.dumps({
                'chat_message': chat_message,
                'sender': sender,
            }))

class UserConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f"username_{self.room_id}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        
        user_list = []
        self.room_group = RoomGroup.objects.get(room_id=self.room_id)
        active_users = ActiveUser.objects.filter(room_group=self.room_group)
        for user in active_users:
            user_list.append(user.username)
        
        text_data = json.dumps({
            'user_list': user_list
        })
        self.send(text_data=text_data)

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

class DrawConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f"draw_{self.room_id}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
    
    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        lineWidth = text_data_json['lineWidth']
        lineColor = text_data_json['lineColor']
        currX = text_data_json['currX']
        currY = text_data_json['currY']
        painting = text_data_json['painting']

        # Send draw_data to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'send_draw_data',
                'lineWidth': lineWidth,
                'lineColor': lineColor,
                'currX': currX,
                'currY': currY,
                'painting': painting,
                'sender_channel_name': self.channel_name
            }
        )

    def send_draw_data(self, event):
        lineWidth = event['lineWidth']
        lineColor = event['lineColor']
        currX = event['currX']
        currY = event['currY']
        painting = event['painting']

        # Send source_code to WebSocket
        if self.channel_name != event.get('sender_channel_name'):
            self.send(text_data=json.dumps({
                'lineWidth': lineWidth,
                'lineColor': lineColor,
                'currX': currX,
                'currY': currY,
                'painting': painting
            }))