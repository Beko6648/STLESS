const Chart = require('chart.js');
const moment = require('moment');
require('chartjs-adapter-moment');
const Store = require('electron-store');
const store = new Store();
const mysql = require('mysql');

document.addEventListener('DOMContentLoaded', function () {
    // mysqlへの接続
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'stless_db'
    });

    const store_id = store.get('store_id');

    let sql_result = [];
    connection.query(`SELECT shopping_date, shopping_time, people_in_store_count FROM shopping_time_data_table WHERE store_id = '${store_id}'`, function (error, results, fields) {
        if (error) throw error;
        sql_result = results;
    }).on('end', function () {
        console.log(sql_result);
    });


    data = [];
    for (let i = 0; i <= 24; i++) {
        data[i] = { x: moment(`2021-5-23 ${i}:0:0`), y: Math.random() * 100 };
    }
    let ctx = document.getElementById('mychart');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Red',
                data: data,
                borderColor: '#f88',
            }],
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        min: moment('2021-5-23 0:0:0'),
                        max: moment('2021-5-24 0:0:0'),
                        displayFormats: {
                            hour: 'HH:mm',
                        },
                        tooltipFormat: 'HH:mm',
                    },
                },
                y: {
                    min: 0,
                    max: 100,
                },
            },
        },
    });
});