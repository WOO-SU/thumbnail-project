import json
from channels.generic.websocket import AsyncWebsocketConsumer
from ....worker.tasks import make_thumbnail_task


class ThumbnailConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"type": "connected"}))
    
    async def receive(self, text_data=None, bytes_data=None):
        msg = json.loads(text_data or "{}")
        if msg.get("type") != "enqueue":
            await self.send(text_data=json.dumps({"type": "error", "message": "type must be enqueue"}))
            return

        path = msg.get("path", "")
        if not path:
            await self.send(text_data=json.dumps({"type": "error", "message": "path is required"}))
            return

        try:
            make_thumbnail_task.delay(path=path, reply_channel=self.channel_name)
        except Exception as e:
            # 🔥 여기서 에러를 프론트로 바로 보여줌
            await self.send(text_data=json.dumps({
                "type": "queue_error",
                "error": repr(e)
            }))
            return

        await self.send(text_data=json.dumps({"type": "queued", "path": path}))

    # async def receive(self, text_data=None, bytes_data=None):
    #     msg = json.loads(text_data or "{}")
    #     if msg.get("type") != "enqueue":
    #         await self.send(text_data=json.dumps({"type": "error", "message": "type must be enqueue"}))
    #         return

    #     path = msg.get("path", "")
    #     if not path:
    #         await self.send(text_data=json.dumps({"type": "error", "message": "path is required"}))
    #         return

    #     # ✅ job_id 대신 "이 연결(channel_name)"을 워커에게 넘김
    #     make_thumbnail_task.delay(path=path, reply_channel=self.channel_name)

    #     await self.send(text_data=json.dumps({"type": "queued", "path": path}))

    # # ✅ 워커가 channel_layer.send()로 보낸 이벤트를 여기서 받아 프론트에 전달
    async def thumbnail_done(self, event):
        await self.send(text_data=json.dumps(event))



class ThumbnailProducer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"type": "connected"}))
    
    async def receive(self, text_data=None, bytes_data=None):
        msg = json.loads(text_data or "{}")
        if msg.get("type") != "enqueue":
            await self.send(text_data=json.dumps({"type": "error", "message": "type must be enqueue"}))
            return

        path = msg.get("path", "")
        if not path:
            await self.send(text_data=json.dumps({"type": "error", "message": "path is required"}))
            return

        try:
            make_thumbnail_task.delay(path=path, reply_channel=self.channel_name)
        except Exception as e:
            # 🔥 여기서 에러를 프론트로 바로 보여줌
            await self.send(text_data=json.dumps({
                "type": "queue_error",
                "error": repr(e)
            }))
            return

        await self.send(text_data=json.dumps({"type": "queued", "path": path}))

    # async def receive(self, text_data=None, bytes_data=None):
    #     msg = json.loads(text_data or "{}")
    #     if msg.get("type") != "enqueue":
    #         await self.send(text_data=json.dumps({"type": "error", "message": "type must be enqueue"}))
    #         return

    #     path = msg.get("path", "")
    #     if not path:
    #         await self.send(text_data=json.dumps({"type": "error", "message": "path is required"}))
    #         return

    #     # ✅ job_id 대신 "이 연결(channel_name)"을 워커에게 넘김
    #     make_thumbnail_task.delay(path=path, reply_channel=self.channel_name)

    #     await self.send(text_data=json.dumps({"type": "queued", "path": path}))

    # # ✅ 워커가 channel_layer.send()로 보낸 이벤트를 여기서 받아 프론트에 전달
    async def thumbnail_done(self, event):
        await self.send(text_data=json.dumps(event))