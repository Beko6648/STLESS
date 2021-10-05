const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PythonShell } = require('python-shell');

// Chromiumによるバックグラウンド処理の遅延対策
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch("disable-background-timer-throttling");

let people_in_store_queue = [];
let shopping_time_queue = [];

// アプリの起動準備が完了したら
app.once('ready', () => {
    //PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'
    var pyshell = new PythonShell(path.join(__dirname, '../python/sample.py'), { mode: 'json' });

    //pythonコード実施後にpythonからjsにデータが引き渡される。
    //pythonに引き渡されるデータは「data」に格納される。
    pyshell.on('message', function (data) {
        // console.log(data);

        if (data.hasOwnProperty('people_cnt_in_store')) {

        } else {
            people_in_store_queue_control(data.time_data, data.enter_or_leave);
        }

    });

    // 客が出入りしたときに呼ばれ、客の買い物時間を計算する関数
    let people_in_store_queue_control = (time_data, enter_or_leave) => {
        // 受け取った時間のミリ秒を０に
        const date = new Date(time_data);
        date.setMilliseconds(0);

        if (enter_or_leave) {　// 入店時ならキューに追加
            people_in_store_queue.push(date);

            console.log('people_in_store_queue', people_in_store_queue);
        } else { // 退店時ならキューの先頭を取り出し、{入店時間,退店時間}というセットで買い物時間キューに格納
            const enter_time = people_in_store_queue.shift();
            const leave_time = time_data;

            shopping_time_queue.push({
                enter_time: enter_time,
                leave_time: leave_time
            })

            console.log('shopping_time_queue', shopping_time_queue);
        }
    }

    let Regulatory_Process = (people_cnt_in_store, max_people_in_store, enter_time_info) => {
        
    }


    // ウィンドウを開く
    testWindow = new BrowserWindow({
        show: false,
        backgroundColor: '#FFF',
        width: 800,
        height: 500,
        title: 'テストウィンドウ',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            pageVisibility: true,
            backgroundThrottling: false,
        }
    });
    testWindow.loadFile(path.join(__dirname, '../html/page_test.html'));

    // 読み込みが完了してからウィンドウを表示する
    testWindow.once('ready-to-show', () => {
        testWindow.show();
    });
});