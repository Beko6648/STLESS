const { app, BrowserWindow, ipcMain } = require('electron');
const { PythonShell } = require('python-shell');

// Chromiumによるバックグラウンド処理の遅延対策
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch("disable-background-timer-throttling");

let people_in_store_queue = [];
let shopping_time_queue = [];

// アプリの起動準備が完了したら
app.once('ready', () => {
    //PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'
    var pyshell = new PythonShell('./src/python/sample.py', { mode: 'json' });

    //pythonコード実施後にpythonからjsにデータが引き渡される。
    //pythonに引き渡されるデータは「data」に格納される。
    pyshell.on('message', function (data) {
        console.log(data);
        console.log('time_data', data.time_data);
        console.log('enter_or_leave', data.enter_or_leave);

        if (data.hasOwnProperty('people_cnt_in_store')) {
            
        } else {
            people_in_store_queue
        }

    });

    let people_in_store_queue_control = (time_data, enter_or_leave) => {
        const date = new Date(time_data);
        date.setMilliseconds(0);

        if (enter_or_leave) {
            people_in_store_queue.push(date);
        } else {
            const enter_time = people_in_store_queue.shift();
            const leave_time = time_data;
            shopping_time_queue.push({
                enter_time: enter_time,
                leave_time: leave_time
            })

        }
    }


    // // 常駐モジュールウィンドウを開く
    // residentWindow = new BrowserWindow({
    //     show: false,
    //     backgroundColor: '#FFF',
    //     width: 800,
    //     height: 500,
    //     title: '常駐モジュール',
    //     webPreferences: {
    //         nodeIntegration: true,
    //         contextIsolation: false,
    //         pageVisibility: true,
    //         backgroundThrottling: false,
    //     }
    // });

    // residentWindow.loadFile(path.join(__dirname, 'resident.html'));


    // // 監視モジュールウィンドウを開く
    // watchWindow = new BrowserWindow({
    //     show: false,
    //     backgroundColor: '#FFF',
    //     width: 800,
    //     height: 850,
    //     title: 'クライアント監視モジュール',
    //     webPreferences: {

    //         nodeIntegration: true,
    //         contextIsolation: false,
    //         pageVisibility: true,
    //         backgroundThrottling: false,
    //     }
    // });

    // watchWindow.loadFile(path.join(__dirname, 'watch.html'));
});