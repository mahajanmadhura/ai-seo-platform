from channels.generic.websocket import AsyncWebsocketConsumer
import json

class AuditProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.audit_id = self.scope['url_route']['kwargs']['audit_id']
        self.group_name = f'audit_{self.audit_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def audit_progress(self, event):
        await self.send(text_data=json.dumps(event["data"]))