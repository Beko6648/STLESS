import socketio
import time
from datetime import datetime


class MyCustomNamespace(socketio.ClientNamespace):  # 名前空間を設定するクラス
    def on_connect(self):
        print('[{}] connect'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')))

    def on_disconnect(self):
        print('[{}] disconnect'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')))

    def on_response(self, msg):
        print('[{}] response : {}'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'), msg))


class SocketIOClient:

    def __init__(self, host, path):
        self.host = host
        self.path = path
        self.sio = socketio.Client()

    def connect(self):

        self.sio.register_namespace(MyCustomNamespace(self.path))  # 名前空間を設定
        self.sio.connect(self.host)  # サーバーに接続
        # バックグラウンドタスクの登録 (123は引数の書き方の参考のため、処理には使っていない)
        self.sio.start_background_task(self.my_background_task, 123)
        self.sio.wait()  # イベントが待ち

    def my_background_task(self, my_argument):  # ここにバックグランド処理のコードを書く
        while True:
            self.sio.emit('broadcast_message', my_argument, namespace=self.path)  # ターミナルで入力された文字をサーバーに送信
            self.sio.sleep(1)


if __name__ == '__main__':
    # SocketIOClientクラスをインスタンス化
    sio_client = SocketIOClient('http://192.168.0.10:3000', '/test')
    sio_client.connect()
