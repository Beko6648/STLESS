const { app, BrowserWindow, ipcMain } = require('electron');
const { PythonShell } = require('python-shell');

// Chromiumによるバックグラウンド処理の遅延対策
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch("disable-background-timer-throttling");

// アプリの起動準備が完了したら
app.once('ready', () => {
    //PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'
    var pyshell = new PythonShell('../python/sample.py');

    PythonShell.run('./src/python/sample.py', null, function (err, result) {
        if (err) throw err;

        console.log(result);
    });

    //pythonコード実施後にpythonからjsにデータが引き渡される。
    //pythonに引き渡されるデータは「data」に格納される。
    pyshell.on('message', function (data) {
        console.log(data);
    });


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