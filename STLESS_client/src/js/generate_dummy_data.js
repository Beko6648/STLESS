const moment = require("moment");
const mysql = require('mysql2');
const { resolve } = require("path/posix");

// mysqlへの接続
// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'stless_db'
// });

let connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stless_db'
});


const get_random_int = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const delete_shopping_time_data = async () => {
    connection.query(`DELETE FROM shopping_time_data_table`, function (error, results, fields) {
        if (error) throw error;
        // console.log(results);
    }).on('end', () => {
        return true;
    })
}


const generate_dummy_data = () => {
    const store_id = '01FM66J6MZBC8P98KTN52HD23A';
    const system_start_time = moment('06:00', 'HH:mm');
    const system_end_time = moment('22:00', 'HH:mm');

    let start_time = moment().hour(6).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'); // 開店時間
    let end_time = moment().hour(22).minute(0).second(0).add(7, 'days').format('YYYY-MM-DD HH:mm:ss'); // 閉店時間

    let now_date = moment().hour(6).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');

    console.log('now_date', now_date);

    let count = 0;
    let people_in_store_queue = [];
    let shopping_time_queue = [];

    // for (let i = 0; i < 10; i++) {
    while (now_date < end_time) {
        console.log('-------------------------------------------------------------------');
        count++;
        console.log('count:', count);

        // 現在時刻を1分ずつ経過させる
        now_date = moment(now_date).add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        // 現在時刻が開店時間でなければ何を行わない
        const is_between = moment(moment(now_date).format('HH:mm'), 'HH:mm').isBetween(moment(system_start_time, 'HH:mm'), moment(system_end_time, 'HH:mm'));
        if (!is_between) {
            continue;
        }

        const is_run_event = Math.random() < 0.4; // 入退店イベントが起きるかどうか
        const enter_or_leave = Math.random() < 0.5; // 入店か退店か

        if (is_run_event) {
            if (enter_or_leave) { // 入店
                people_in_store_queue.push(moment(now_date).format('YYYY-MM-DD HH:mm:ss'));
                console.log('入店');
            } else { // 退店
                const enter_time = people_in_store_queue.shift();
                const leave_time = moment(now_date).format('YYYY-MM-DD HH:mm:ss');

                shopping_time_queue.push({
                    enter_time: enter_time,
                    leave_time: leave_time,
                    people_in_store_count: people_in_store_queue.length,
                })
                console.log('退店');
            }
        }
    }


    shopping_time_queue.forEach(data => {
        const enter_time = moment(data.enter_time, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        const leave_time = moment(data.leave_time, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        const diff_minutes = moment(leave_time, 'YYYY-MM-DD HH:mm:ss').diff(moment(enter_time, 'YYYY-MM-DD HH:mm:ss'), 'minutes');
        const hh = Math.floor(diff_minutes / 60);
        const mm = diff_minutes % 60;
        const diff_time = moment(`${hh}:${mm}:00`, 'HH:mm:ss').format('HH:mm:ss');

        const people_in_store_count = data.people_in_store_count;

        console.log(enter_time, leave_time, diff_time, people_in_store_count);

        connection.query(`INSERT INTO shopping_time_data_table (store_id, shopping_date, shopping_time, people_in_store_count) VALUES ('${store_id}', '${enter_time}', '${diff_time}', '${people_in_store_count}')`, function (error, results, fields) {
            if (error) throw error;
            // console.log(results);
        })
    });
}

(async () => {
    // await delete_shopping_time_data();
    generate_dummy_data();
})();