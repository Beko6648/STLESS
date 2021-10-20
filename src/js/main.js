const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const store = new Store();
const path = require('path');
const { PythonShell } = require('python-shell');
const moment = require("moment");
const ULID = require('ulid')
const express = require('express');
const express_app = express();
const port = 3000;
const mysql = require('mysql');

// Chromiumによるバックグラウンド処理の遅延対策
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch("disable-background-timer-throttling");

// オプションとして変更できる変数の初期化
let regulation_nearing_ratio = 0.9; // 規制間近とする人数割合

// 変数の初期化
let store_window = null;
let people_in_store_queue = []; // 店内の客を管理するキュー入店時間を値として持っている
let shopping_time_queue = []; // 入退店データキュー入店時間,退店時間を値として持っている
let max_people_in_store = 10; // 店舗最大許容人数
let waiting_time_estimation_data = { hour: 0, minute: 10 }; // 待ち時間推測用データ 形式{ hour, minute }
let leave_time_array = []; // ３人分の予想退店時間が格納された配列
let next_html = 'allow_entry.html'; // 規制情報表示ディスプレイに表示させるhtml


// アプリの起動準備が完了したら
app.once('ready', () => {

    // 設定の保存場所を表示
    console.log('設定ファイルの保存場所', store.path);
    // テスト用：設定情報をクリアする
    store.clear();

    // mysqlへの接続
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stless_db'
    });


    // ウィンドウの設定
    store_window = new BrowserWindow({
        show: false,
        backgroundColor: '#F8F9FA',
        width: 800,
        height: 500,
        title: 'STLESS',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            pageVisibility: true,
            backgroundThrottling: false,
        }
    });

    // 店舗IDが保存されていなければ、初期設定を行う
    if (!store.has('store_id')) {
        // 店舗IDの新規生成、DBに登録、自身の店舗IDを保存する
        const store_id = ULID.ulid();
        store.set('store_id', store_id);
        // 規制情報表示ディスプレイの初期設定を行う
        const system_setting = {
            "allow_card": {
                "color_input": "#00a03e",
                "icon_input": "👍",
                "title_input": "いらっしゃいませ",
                "subtitle_input": "どうぞお入りください"
            },
            "near_card": {
                "color_input": "#f9c00c",
                "icon_input": "⚠",
                "title_input": "ご入店いただけます",
                "subtitle_input": "必要最低限の人数でご入店ください"
            },
            "regulation_card": {
                "color_input": "#d20303",
                "icon_input": "✋",
                "title_input": "入店規制中です",
                "subtitle_input": "間隔を空けてお待ち下さい"
            }
        }
        store.set('system_setting', system_setting);
        connection.query(`INSERT INTO store_table (id, data_transfer_flag) VALUES ('${store_id}', '0')`, function (error, results, fields) {
            if (error) throw error;
            console.log(results);
        });
        // 初期設定としてカメラ設定画面を表示する
        store_window.loadFile(path.join(__dirname, '../store_process/html/camera_setting.html'));
    } else { // 店舗IDが保存されていれば、規制情報表示画面を開く
        store_window.loadFile(path.join(__dirname, '../store_process/html/regulatory_info_view.html'));
    }
    // 開発者ツールウィンドウを表示する
    store_window.webContents.openDevTools();

    // ウィンドウの読み込みが完了してからウィンドウを表示する
    store_window.once('ready-to-show', () => {
        store_window.show();
    });



    // 規制情報表示ディスプレイのためにhttpサーバを立てる
    express_app.use(express.static(path.join(__dirname, '../display')));
    express_app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

    // 規制情報表示htmlからのリクエストに対し、次に表示するhtml情報を返す
    express_app.get("/api/next_html", function (req, res, next) {
        res.json(next_html);
    });
    // 規制情報表示htmlからのリクエストに対し、待ち時間を格納した配列を返す
    express_app.get("/api/leave_time_array", function (req, res, next) {
        res.json(leave_time_array);
    });


    //PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'
    let pyshell = new PythonShell(path.join(__dirname, '../python/sample.py'), { mode: 'json', pythonOptions: ['-u'] })
    // let pyshell = new PythonShell(path.join(__dirname, '../python/People-Counting/run_class.py'), { mode: 'json', pythonOptions: ['-u'] });

    console.log('init_pyshell');

    // pythonからのメッセージを受け取り、queue_controlとregulatory_processに引き渡す
    pyshell.on('message', function (data) {
        // console.log('data', data);
        people_in_store_queue_control(data.time_data, data.enter_or_leave);
        regulatory_process(data.people_count);
    });


    // 客が出入りしたときに呼ばれ、客の買い物時間を計算する関数
    let people_in_store_queue_control = (time_data, enter_or_leave) => {
        const arg_date = moment(time_data);

        if (enter_or_leave === 'enter') { // 入店時ならキューに追加
            people_in_store_queue.push(arg_date);

        } else if (enter_or_leave === 'leave') { // 退店時ならキューの先頭を取り出し、{入店時間,退店時間}というセットで買い物時間キューに格納
            const enter_time = people_in_store_queue.shift();
            const leave_time = arg_date;

            shopping_time_queue.push({
                enter_time: enter_time,
                leave_time: leave_time
            })
        } else {
            console.log('enterかleaveを入力してください');
        }
        console.log('店内客数', people_in_store_queue.length);
    }

    // 客が出入りしたときに呼ばれ、規制判断を行う関数
    let regulatory_process = (people_count) => {
        if (max_people_in_store <= people_count) { // 規制する場合
            let first_three_in_line = people_in_store_queue.slice(-3); // 店内に最初に入った３人分の入店時間を切り出す

            // 3人分の入店時間に待ち時間推測用データを加算し、規制表示の内容を決定する
            leave_time_array = first_three_in_line.map((value) => {
                let entry_date = moment(value); // 格納されていた入店時間データ

                // 待ち時間推測用データ（平均買い物時間）を加算する
                entry_date.add(waiting_time_estimation_data.hour, 'hours');
                entry_date.add(waiting_time_estimation_data.minute, 'minutes');

                return entry_date.toISOString();
            })
            next_html = 'regulation_and_time.html';
        } else if (max_people_in_store * regulation_nearing_ratio <= people_count) { // 規制間近
            next_html = 'regulation_nearing.html';
        } else {
            next_html = 'allow_entry.html';
        }
    }
});

// カメラ設定画面から規制情報表示画面へ遷移させる処理
ipcMain.handle('goto_regulatory_info_view', (event, message) => {
    console.log(message);
    store_window.loadFile(path.join(__dirname, '../store_process/html/regulatory_info_view.html'));
    return true;
})

ipcMain.handle('goto_system_setting', (event, message) => {
    console.log(message);
    store_window.loadFile(path.join(__dirname, '../store_process/html/system_setting.html'));
    return true;
})

ipcMain.handle('goto_camera_setting', (event, message) => {
    console.log(message);
    store_window.loadFile(path.join(__dirname, '../store_process/html/camera_setting.html'));
    return true;
})