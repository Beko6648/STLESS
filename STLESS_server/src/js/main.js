// 参考のためサーバで必要そうなライブラリとその使い方のヒントになりそうな部分をアプリのmain.jsからコピーした

const path = require('path');
const moment = require("moment");
const ULID = require('ulid')
const express = require('express');
const express_app = express();
const router = express.Router();
const port = 3000;
const mysql = require('mysql');

// mysqlへの接続
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stless_db'
});

store.set('display_setting', display_setting);
connection.query(`INSERT INTO store_table (id, data_transfer_flag) VALUES ('${store_id}', '0')`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
});


// 規制情報表示ディスプレイのためにhttpサーバを立てる
express_app.use(express.static(path.join(__dirname, '../display')));
express_app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// 規制情報表示にディスプレイ設定を引き渡す
express_app.get("/api/display_setting", function (req, res, next) {
    res.json(store.get('display_setting'));
});
// 規制情報表示htmlからのリクエストに対し、次に表示するhtml情報を返す
express_app.get("/api/next_html", function (req, res, next) {
    res.json(next_html);
});
// 規制情報表示htmlからのリクエストに対し、待ち時間を格納した配列を返す
express_app.get("/api/leave_time_array", function (req, res, next) {
    res.json(leave_time_array);
});
express_app.get("/api/next_html_and_leave_time_array", function (req, res, next) {
    res.json([next_html, leave_time_array]);
});



