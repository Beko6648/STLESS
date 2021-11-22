import socketio
import time
from datetime import datetime


class MyCustomNamespace(socketio.ClientNamespace): # 名前空間を設定するクラス
    def on_connect(self):
        print('[{}] connect'.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))

    def on_disconnect(self):
        print('[{}] disconnect'.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))

    def on_response(self, msg):
        print('[{}] response : {}'.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S') , msg))


class SocketIOClient:
    
    def __init__(self, host, path):
        self.host = host 
        self.path = path
        self.sio = socketio.Client()
    
    def connect(self):

        self.sio.register_namespace(MyCustomNamespace(self.path)) # 名前空間を設定
        self.sio.connect(self.host) # サーバーに接続
        # self.sio.start_background_task(self.my_background_task, 123) # バックグラウンドタスクの登録 (123は引数の書き方の参考のため、処理には使っていない)
        # self.sio.wait() # イベントが待ち
        
    # def my_background_task(self, my_argument): # ここにバックグランド処理のコードを書く
    #     while True:
    #         input_data = input("send data:") # ターミナルから入力された文字を取得
    #         self.sio.emit('python', input_data, namespace = self.path) # ターミナルで入力された文字をサーバーに送信
    #         self.sio.sleep(1)

    def my_background_task(self, my_argument): # ここにバックグランド処理のコードを書く
<<<<<<< HEAD
        # while True:
        #     input_data = input("send data:") # ターミナルから入力された文字を取得
        self.sio.emit('python', my_argument, namespace = self.path) # ターミナルで入力された文字をサーバーに送信
        # self.sio.sleep(1)
            

if __name__ == '__main__':
    sio_client = SocketIOClient('http://10.10.50.184:3000/', '/') # SocketIOClientクラスをインスタンス化
    sio_client.connect()
    sio_client.my_background_task(21324)
=======
            self.sio.emit('python', my_argument, namespace = self.path) # ターミナルで入力された文字をサーバーに送信

if __name__ == '__main__':
    sio_client = SocketIOClient('http://localhost:3000/', '/') # SocketIOClientクラスをインスタンス化
    sio_client.connect()
    sleep(10)
    sio_client.my_background_task(123)
>>>>>>> d3a6e08e7253b86c2bbb1f6f4896dc9b6fb5cc4a
