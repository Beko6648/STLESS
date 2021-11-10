const Chart = require('chart.js');
const moment = require('moment');
require('chartjs-adapter-moment');

document.addEventListener('DOMContentLoaded', function () {
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