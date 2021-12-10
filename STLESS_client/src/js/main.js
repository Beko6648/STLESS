const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const Store = require('electron-store');
const store = new Store();
const path = require('path');
const { PythonShell } = require('python-shell');
const moment = require("moment");
const ULID = require('ulid')
const express = require('express');
const express_app = express();
const port = 3000;
const httpServer = require("http").createServer(express_app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);
const mysql = require('mysql');
const cron = require('node-cron');
// api利用のためのモジュール
const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')

// Chromiumによるバックグラウンド処理の遅延対策
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch("disable-background-timer-throttling");

// オプションとして変更できる変数の初期化
let regulation_nearing_ratio = 0.8; // 規制間近とする人数割合
let debug_mode = false // デバッグモード
// システム設定の初期設定
const initial_system_setting = {
    max_people_in_store: 10,
    system_start_time: '08:00',
    system_end_time: '22:00',
}

// 変数の初期化
let connection = null; // mysqlを利用するための変数
let store_window = null; // アプリウィンドウ
let people_in_store_queue = []; // 店内の客を管理するキュー入店時間を値として持っている
let shopping_time_queue = []; // 入退店データキュー入店時間,退店時間を値として持っている
let waiting_time_estimation_data = { hour: 0, minute: 10, second: 0 }; // 待ち時間推測用データ 形式{ hour, minute }
let leave_time_array = []; // ３人分の予想退店時間が格納された配列
let next_html = 'allow_entry.html'; // 規制情報表示ディスプレイに表示させるhtml
let is_allow_first_customer = false; // 先頭のお客様を許可するかどうか
let max_people_in_store = null; // 店舗最大許容人数
if (store.has('system_setting')) max_people_in_store = store.get('system_setting').max_people_in_store;
let is_system_running = false; // システムの動作時間内かどうか
let camera_data = [ // カメラデータ
    {
        camera_id: 0,
        enter_count: 0,
        leave_count: 0,
        streaming_address: 'http://192.168.2.121:8000/',
        is_open_window: false,
    },
    {
        camera_id: 1,
        enter_count: 0,
        leave_count: 0,
        streaming_address: 'http://10.10.50.196:8000/',
        is_open_window: false,
    }
];


// アプリの起動準備が完了したら
app.once('ready', () => {

    // 設定の保存場所を表示
    console.log('設定ファイルの保存場所', store.path);
    // テスト用：設定情報をクリアする
    // store.clear();


    // mysqlへの接続
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stless_db'
    });


    //-------------------------------------------------
    // グラフデータと待ち時間推測用データを生成する
    generate_graph_data();
    generate_wait_time_estimation_data();
    // 初回起動時なら、初期設定を行う関数
    initialize_setting();


    // ウィンドウの設定
    store_window = new BrowserWindow({
        show: false,
        title: 'STLESS',
        backgroundColor: '#F8F9FA',
        width: 1000,
        height: 800,
        minWidth: 800,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            pageVisibility: true,
            backgroundThrottling: false,
        }
    });
    // 規制情報表示画面を開く
    store_window.loadFile(path.join(__dirname, '../store_process/html/regulatory_info_view.html'));
    if (debug_mode) {
        // 開発者ツールウィンドウを表示する
        store_window.webContents.openDevTools();
    }

    // ウィンドウの読み込みが完了してからウィンドウを表示する
    store_window.once('ready-to-show', () => {
        store_window.show();
    });



    // 規制情報表示ディスプレイAPI------------------------------------------------------------------------

    // 規制情報表示ディスプレイのためにhttpサーバを立てる
    express_app.use(express.static(path.join(__dirname, '../display')));
    // express_app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

    // 規制情報表示にディスプレイ設定を引き渡す
    express_app.get("/api/display_setting", function (req, res, next) {
        res.json(store.get('display_setting'));
    });

    // 規制情報表示にディスプレイ設定とグラフ描画用データを引き渡す
    express_app.get("/api/display_setting_and_graph_data", function (req, res, next) {
        res.json({
            'display_setting': store.get('display_setting'),
            'graph_data': store.get('graph_data'),
        });
    });

    // 規制情報表示htmlからのリクエストに対し、待ち時間を格納した配列を返す
    express_app.get("/api/leave_time_array", function (req, res, next) {
        res.json(leave_time_array);
    });



    // socket.ioでのカメラとの接続
    io.on('connection', function (socket) {
        console.log('connected------------------------------------------------------');
        // 規制情報表示ディスプレイからの接続があったときに現在表示すべき規制情報を送信する
        io.emit('next_html', next_html);

        socket.on('python', function (data) {
            console.log(data);

            // プログラム起動時には、falseを受け取り、スルーするように
            if (data === false) return;

            // カメラデータを更新する
            let enter_or_leave = data[0];
            let camera_id = data[1];

            if (is_system_running) { // システムが動作中ならば、queue_controlとregulatory_processを実行する
                if (enter_or_leave === 'enter') {
                    camera_data[camera_id].enter_count++;
                } else if (enter_or_leave === 'leave' && people_in_store_queue.length !== 0) {
                    camera_data[camera_id].leave_count++;
                }
                people_in_store_queue_control(enter_or_leave); // 店内客数を更新する
                calculate_leave_time_array(); // 店内客数に応じて待ち時間を計算する
                regulatory_process(); // 規制判断を行う

                // 店内客数の変化を規制情報確認画面用に通知する
                store_window.webContents.send('update_regulation_info', {
                    number_of_people: people_in_store_queue.length,
                    regulatory_status: next_html,
                    camera_data: camera_data
                });
            } else {
                console.log('システム終了時刻を過ぎています');
            }
        });

        socket.on('/', function (data) {
            console.log(data);
        })
    });


    httpServer.listen(port, function () {
        console.log('server listening. port:' + port);
    });



    //PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'----------------------------------------------------------------
    // let pyshell = new PythonShell(path.join(__dirname, '../python/sample.py'), { mode: 'json', pythonOptions: ['-u'] })

    // pythonからのメッセージを受け取り、queue_controlとregulatory_processに引き渡す
    // pyshell.on('message', function (data) {
    //     // console.log(data);

    //     // カメラデータを更新する
    //     let enter_or_leave = data[0];
    //     let camera_id = data[1];

    //     if (is_system_running) { // システムが動作中ならば、queue_controlとregulatory_processを実行する
    //         if (enter_or_leave === 'enter') {
    //             camera_data[camera_id].enter_count++;
    //         } else if (enter_or_leave === 'leave' && people_in_store_queue.length !== 0) {
    //             camera_data[camera_id].leave_count++;
    //         }
    //         people_in_store_queue_control(enter_or_leave); // 店内客数を更新する
    //         calculate_leave_time_array(); // 店内客数に応じて待ち時間を計算する
    //         regulatory_process(); // 規制判断を行う

    //         // 店内客数の変化を規制情報確認画面用に通知する
    //         store_window.webContents.send('update_regulation_info', {
    //             number_of_people: people_in_store_queue.length,
    //             regulatory_status: next_html,
    //             camera_data: camera_data
    //         });
    //     } else {
    //         console.log('システム終了時刻を過ぎています');
    //     }
    // });


    // 1時間おきにシステムの動作期間内かどうかを確認し、動作期間外になったらバッチ処理を行う
    // cron.schedule('0 0 */1 * * *', () => {
    // デバッグ用の1分刻みチェック
    // cron.schedule('0 */1 * * * *', () => {
    cron.schedule('*/20 * * * * *', () => {
        console.log('cron処理');
        judge_is_system_running();
    });

    // アプリ起動時の動作期間確認
    judge_is_system_running();

});

// 客が出入りしたときに呼ばれ、客の買い物時間を計算する関数
let people_in_store_queue_control = (enter_or_leave) => {
    // const arg_date = moment(time_data);
    const arg_date = moment().format('YYYY-MM-DD HH:mm:ss');

    if (enter_or_leave === 'enter') { // 入店時ならキューに追加
        people_in_store_queue.push(moment(arg_date).format('YYYY-MM-DD HH:mm:ss'));

    } else if (enter_or_leave === 'leave') { // 退店時ならキューの先頭を取り出し、{入店時間,退店時間}というセットで買い物時間キューに格納
        if (people_in_store_queue.length !== 0) {
            const enter_time = people_in_store_queue.shift();
            const leave_time = moment(arg_date).format('YYYY-MM-DD HH:mm:ss');

            shopping_time_queue.push({
                enter_time: enter_time,
                leave_time: leave_time,
                people_in_store_count: people_in_store_queue.length,
            });
        } else {
            console.log('退店時に店内客数が0です');
        }
    } else {
        console.log('enterかleaveを入力してください');
    }
    if (debug_mode) console.log('店内客数', people_in_store_queue.length);
}

// 推定退店時間を計算する関数
let calculate_leave_time_array = () => {
    let first_three_in_line = people_in_store_queue.slice(-3); // 店内に最初に入った３人分の入店時間を切り出す

    // 3人分の入店時間に待ち時間推測用データを加算し、規制表示の内容を決定する
    leave_time_array = first_three_in_line.map((value) => {
        let entry_date = moment(value); // 格納されていた入店時間データ

        // 待ち時間推測用データ（平均買い物時間）を加算する
        entry_date.add(waiting_time_estimation_data.hour, 'hours');
        entry_date.add(waiting_time_estimation_data.minute, 'minutes');
        entry_date.add(waiting_time_estimation_data.second, 'seconds'); // 中間発表のため秒を追加する

        return entry_date.toISOString();
    })
}

// 客が出入りしたときに呼ばれ、規制判断を行う関数
let regulatory_process = () => {
    let people_count = people_in_store_queue.length;
    let old_next_html = next_html;
    let allow_first_customer = false;

    if (max_people_in_store <= people_count) { // 規制する場合
        next_html = 'regulation_and_time.html';
        if (debug_mode) console.log('規制');
    } else if (max_people_in_store * regulation_nearing_ratio <= people_count) { // 規制間近
        if (next_html === 'regulation_and_time.html') {
            // 先頭のお客様・・・通知する
            io.emit('allow_first_customer', true);
            allow_first_customer = true;
        }
        next_html = 'regulation_nearing.html';
        if (debug_mode) console.log('規制間近');
    } else {
        if (next_html === 'regulation_and_time.html') {
            // 先頭のお客様・・・通知する
            io.emit('allow_first_customer', true);
            allow_first_customer = true;
        }
        next_html = 'allow_entry.html';
        if (debug_mode) console.log('許可');
    }

    // 規制状態が変化したら、規制情報確認画面に通知する
    if (old_next_html !== next_html && !allow_first_customer) {
        io.emit('next_html', next_html);
    }
}

// バッチ処理
const batch_process = () => {
    const store_id = store.get('store_id');

    console.log('shopping_time_queue', shopping_time_queue);


    (async () => {
        await Promise.all(shopping_time_queue.map(async data => {
            const enter_time = moment(data.enter_time, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            const leave_time = moment(data.leave_time, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            const diff_time = moment(moment(leave_time, 'YYYY-MM-DD HH:mm:ss').diff(moment(enter_time, 'YYYY-MM-DD HH:mm:ss'), 'minutes'), 'm').format('HH:mm:ss');
            const people_in_store_count = data.people_in_store_count;

            console.log(enter_time, leave_time, diff_time, people_in_store_count);

            await connection.query(`INSERT INTO shopping_time_data_table (store_id, shopping_date, shopping_time, people_in_store_count) VALUES ('${store_id}', '${enter_time}', '${diff_time}', '${people_in_store_count}');`, function (error, results, fields) {
                if (error) throw error;
            });
        })).then(() => {
            console.log('DBへの書き込みが完了しました');
            // １日分のデータを送信し終わったら、保持中のデータをリセットする
            shopping_time_queue = [];
            people_in_store_queue = [];
            next_html = 'allow_entry.html';
            camera_data[0].enter_count = 0;
            camera_data[0].leave_count = 0;
            camera_data[1].enter_count = 0;
            camera_data[1].leave_count = 0;

            // 店内客数の変化を規制情報確認画面用に通知する
            store_window.webContents.send('update_regulation_info', {
                number_of_people: people_in_store_queue.length,
                regulatory_status: next_html,
                camera_data: camera_data
            });

            // グラフデータを生成し、アプリストレージに保存する
            generate_graph_data();
            // 待ち時間推測用データを更新する
            generate_wait_time_estimation_data();


        });
    })();
}

// 現在システムを動作させてよいか判定する関数
const judge_is_system_running = () => {
    const old_is_system_running = is_system_running;
    const system_setting = store.get('system_setting');

    const system_start_time = moment(system_setting.system_start_time, 'HH:mm');
    const system_end_time = moment(system_setting.system_end_time, 'HH:mm');
    const now = moment().format('HH:mm');
    const is_between = moment(now, 'HH:mm').isBetween(system_start_time, system_end_time);

    is_system_running = is_between;

    if (old_is_system_running === true && is_system_running === false) {
        console.log('システムが停止しました。バッチ処理を行います。');
        // バッチ処理を行う
        batch_process();
    }

    console.log(is_between ? 'システムの動作時間内' : 'システムの動作時間外');
}

// 初回起動時なら初期設定を行う関数
const initialize_setting = () => {
    // 店舗IDが保存されていなければ、初期設定を行う
    if (!store.has('store_id')) {
        console.log('初期設定を行います');
        // 店舗IDの新規生成、DBに登録、自身の店舗IDを保存する
        const store_id = ULID.ulid();

        // 規制情報表示ディスプレイの初期設定
        const display_setting = {
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

        // ストアに初期値を保存
        store.set('store_id', store_id);
        store.set('display_setting', display_setting);
        store.set('system_setting', initial_system_setting);

        // 店舗IDをDBに登録
        connection.query(`INSERT INTO store_table (id, data_transfer_flag) VALUES ('${store_id}', '0')`, function (error, results, fields) {
            if (error) throw error;
        });
        console.log('初期設定完了');
    }
}

// グラフデータを生成し、アプリストレージに保存する関数
const generate_graph_data = () => {
    const store_id = store.get('store_id');
    connection.query(`SELECT WEEK(shopping_date) AS week, HOUR(shopping_date) AS hour, ROUND(AVG(people_in_store_count)) AS avg FROM shopping_time_data_table
                    WHERE store_id = '${store_id}' AND DATEDIFF(CURDATE(),shopping_date)/7 = 0 GROUP BY WEEK(shopping_date), HOUR(shopping_date);`, function (error, results, fields) {
        if (error) throw error;
        store.set('graph_data', results);
    });
}

// 待ち時間推測用データを生成する関数
const generate_wait_time_estimation_data = () => {
    const store_id = store.get('store_id');
    connection.query(`SELECT TRUNCATE(SEC_TO_TIME(AVG(TIME_TO_SEC(shopping_time))),0) AS shopping_time_avg FROM shopping_time_data_table WHERE store_id = '${store_id}'`, function (error, results, fields) {
        if (error) throw error;
        shopping_time_avg = results[0].shopping_time_avg;
        waiting_time_estimation_data.hour = moment(shopping_time_avg, 'HH:mm:ss').hours();
        waiting_time_estimation_data.minute = moment(shopping_time_avg, 'HH:mm:ss').minutes();
        // 秒の部分は無視
        // waiting_time_estimation_data.second = moment(shopping_time_avg, 'HH:mm:ss').seconds();
        console.log('推測用データ', waiting_time_estimation_data);
    });
}

// 以下メインプロセスとレンダラープロセスの通信処理------------------------------------------------------------------------------------------

// カメラ設定画面から規制情報表示画面へ遷移させる処理
ipcMain.handle('goto_regulatory_info_view', (event, message) => {
    console.log(message);
    if (store_window.getSize()[0] < 800 || store_window.getSize()[1] < 800) {
        store_window.setSize(800, 800);
    }
    store_window.setMinimumSize(800, 800);
    store_window.loadFile(path.join(__dirname, '../store_process/html/regulatory_info_view.html'));
    return true;
})

// カメラ設定画面から規制情報表示画面へ遷移させる処理
ipcMain.handle('goto_system_setting', (event, message) => {
    console.log(message);
    store_window.setMinimumSize(600, 750);
    store_window.loadFile(path.join(__dirname, '../store_process/html/system_setting.html'));
    return true;
})

// 規制状況確認画面へ現在の規制状況を返す処理
ipcMain.handle('get_regulation_info', (event, message) => {
    console.log(message);
    const regulation_info = {
        number_of_people: people_in_store_queue.length,
        regulatory_status: next_html,
        camera_data: camera_data
    }
    return regulation_info;
})

// カメラストリーミングを依頼する処理
ipcMain.handle('camera_streaming', (event, camera_id) => {
    if (camera_data[camera_id].is_open_window === true) return;

    camera_data[camera_id].is_open_window = true;

    console.log('camera_id', camera_id);

    io.emit('start_streaming', true);

    let camera_streaming_window = {
        window: new BrowserWindow({
            show: true,
            title: 'CAMERA_STREAMING',
            backgroundColor: '#F8F9FA',
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                pageVisibility: true,
                backgroundThrottling: false,
            }
        }),
        camera_id: camera_id
    }

    camera_streaming_window.window.on('close', () => { camera_data[camera_streaming_window.camera_id].is_open_window = false });


    // camera_data[0].streaming_window.on('closed', () => { console.log('camera_id:0 window closed'); });
    // camera_data[1].streaming_window.on('closed', () => { console.log('camera_id:1 window closed'); });

    switch (camera_id) {
        case 0:
            camera_streaming_window.window.loadURL(camera_data[camera_id].streaming_address);
            break;
        case 1:
            camera_streaming_window.window.loadURL(camera_data[camera_id].streaming_address);
            break;
    }

    return true;
})

// システム設定を更新する処理
ipcMain.handle('update_setting', (event, message) => {
    console.log(message);
    if (store.has('system_setting')) {
        max_people_in_store = store.get('system_setting').max_people_in_store;
    }
    judge_is_system_running();

    return true;
})