const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PythonShell } = require('python-shell');

// Chromiumによるバックグラウンド処理の遅延対策
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch("disable-background-timer-throttling");

// オプションとして変更できる変数の初期化
let regulation_nearing_ratio = 0.9; // 規制間近とする人数割合

// 変数の初期化
let people_in_store_queue = []; // 店内の客を管理するキュー入店時間を値として持っている
let shopping_time_queue = []; // 入退店データキュー入店時間,退店時間を値として持っている
let max_people_in_store = null; // 店舗最大許容人数
let waiting_time_estimation_data = null; // 待ち時間推測用データ 形式{ hour, minute }

// アプリの起動準備が完了したら
app.once('ready', () => {
    //PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'
    var pyshell = new PythonShell(path.join(__dirname, '../python/sample.py'), { mode: 'json' });

    //pythonコード実施後にpythonからjsにデータが引き渡される。
    //pythonに引き渡されるデータは「data」に格納される。
    pyshell.on('message', function (data) {
        console.log('data', data);
        regulatory_process(data.people_count);
        people_in_store_queue_control(data.time_data, data.enter_or_leave);
    });


    // 客が出入りしたときに呼ばれ、客の買い物時間を計算する関数
    let people_in_store_queue_control = (time_data, enter_or_leave) => {
        const date = new Date(time_data);

        if (enter_or_leave === 'enter') { // 入店時ならキューに追加
            people_in_store_queue.push(date);
            console.log('people_in_store_queue', people_in_store_queue);

        } else if(enter_or_leave === 'leave') { // 退店時ならキューの先頭を取り出し、{入店時間,退店時間}というセットで買い物時間キューに格納
            const enter_time = people_in_store_queue.shift();
            const leave_time = time_data;

            shopping_time_queue.push({
                enter_time: enter_time,
                leave_time: leave_time
            })

            console.log('shopping_time_queue', shopping_time_queue);
        }else{
            console.log('enterかleaveを入力してください');
        }
    }

    // 客が出入りしたときに呼ばれ、規制判断を行う関数
    let regulatory_process = (people_count) => {
        if (max_people_in_store <= people_count) {　// 規制する場合
            let first_three_in_line = people_in_store_queue.slice(-3); // 店内に最初に入った３人分の入店時間

            // 3人分の入店時間に待ち時間推測用データを加算し、規制表示関数へ引き渡す
            first_three_in_line.map((value) => {
                let entry_date = new Date(value); // 格納されていた入店時間データ
                // 待ち時間推測用データ（平均買い物時間）を加算する
                entry_date.setHours(entry_data.getHours() + waiting_time_estimation_data.hour);
                entry_date.setMinutes(entry_data.getMinutes() + waiting_time_estimation_data.minute);

                return entry_date.toISOString();
            })
            display_regulation_and_time(first_three_in_line);

        }else if (max_people_in_store * regulation_nearing_ratio <= people_count){ // 規制間近
            display_regulation_nearing();
        }else {
            display_allow_entry();
        }
    }


    let display_allow_entry = () => { // 入店許可
        
    }
        
    let display_regulation_nearing = () => { // 規制間近

    }

    let display_regulation_and_time = (waiting_time_array) => { // 規制（待ち時間表示あり）

    }

    let display_regulation = () => { // 規制（待ち時間表示なし）

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