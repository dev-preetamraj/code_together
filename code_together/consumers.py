import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

class CodeConsumer(WebsocketConsumer):
    def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.username = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f"room_{self.room_id}"

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

    # Receive source_code from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        source_code = text_data_json['source_code']
        languageID = text_data_json['languageID']
        input_text = text_data_json['input_text']
        output_text = text_data_json['output_text']
        print(output_text)

        # Send source_code to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'write_source_code',
                'source_code': source_code,
                'languageID': languageID,
                'input_text': input_text,
                'output_text': output_text,
                'sender_channel_name': self.channel_name
            }
        )

    # Receive source_code from room group
    def write_source_code(self, event):
        source_code = event['source_code']
        languageID = event['languageID']
        input_text = event['input_text']
        output_text = event['output_text']

        # Send source_code to WebSocket
        if self.channel_name != event.get('sender_channel_name'):
            self.send(text_data=json.dumps({
                'source_code': source_code,
                'languageID': languageID,
                'input_text': input_text,
                'output_text': output_text
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