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

    connection.query(`SELECT WEEK(shopping_date) AS week, HOUR(shopping_date) AS hour, ROUND(AVG(people_in_store_count)) AS avg FROM shopping_time_data_table
                    WHERE store_id = '${store_id}' AND DATEDIFF(CURDATE(),shopping_date)/7 = 0 GROUP BY WEEK(shopping_date), HOUR(shopping_date);`, function (error, results, fields) {
        if (error) throw error;
        sql_result = results;
        console.log(sql_result);
        connection.end();

        let graph_data = sql_result.map(function (item) {
            return {
                x: moment(item.hour, 'H').add(30, 'minutes').format('HH:mm'),
                y: item.avg / 20 * 100
            }
        });

        console.log('graph_data', graph_data);

        // グラフの描画
        let ctx = document.getElementById('mychart');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: '店内満員度数',
                    data: graph_data,
                    borderColor: '#f88',
                }],
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'HH:mm',
                            unit: 'hour',
                            stepSize: 1,
                            min: moment('06:00', 'HH:mm'),
                            max: moment('22:00', 'HH:mm'),
                            displayFormats: {
                                hour: 'HH:mm',
                            }
                        },
                    },
                    y: {
                        min: 0,
                        max: 120,
                        ticks: {
                            // maxTicksLimit: 5,
                            stepSize: 10,
                            callback: function (value, index, values) {
                                return value + '%';
                            }
                        }
                    },
                },
                legend: {
                    display: false
                },
            }
        });
    });
});