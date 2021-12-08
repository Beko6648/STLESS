window.addEventListener('DOMContentLoaded', () => {
    const greeting = new Audio('../voices/greeting_0.wav');
    greeting.play();

    const socket = io();
    socket.on('next_html', (next_html) => {
        console.log(next_html);
        if (displaying_URL != next_html) {
            switch (next_html) {
                case 'allow_entry.html':
                    document.querySelector('html').style.backgroundColor = `${display_setting.allow_card.color_input}`;
                    break;
                case 'regulation_nearing.html':
                    document.querySelector('html').style.backgroundColor = `${display_setting.near_card.color_input}`;
                    break;
                case 'regulation_and_time.html':
                    document.querySelector('html').style.backgroundColor = `${display_setting.regulation_card.color_input}`;
                    break;
                case 'regulation_without_time.html':
                    document.querySelector('html').style.backgroundColor = `${display_setting.regulation_card.color_input}`;
                    break;

                default:
                    break;
            }
            anim.setDirection(-1);
            anim.play();
            document.querySelector('.regulatory_info').classList.remove('open');
            document.querySelector('.regulatory_info').classList.add('close');
            document.querySelector('.graph_container').classList.remove('open');
            document.querySelector('.graph_container').classList.add('close');
            anim.onLoopComplete = (() => {
                anim.stop();
                window.location.assign(next_html);
            })
        }
    })

    const displaying_URL = 'allow_entry.html';
    // let next_html = '';
    let display_setting = null;
    let graph_data = null;

    let animContainer = null;
    let params = null;
    let anim = null;


    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/display_setting_and_graph_data");
    xhr.addEventListener("load", function (e) {
        graph_data = JSON.parse(xhr.responseText).graph_data;
        display_setting = JSON.parse(xhr.responseText).display_setting;
        console.log(display_setting);
        document.querySelector('html').style.backgroundColor = `${display_setting.allow_card.color_input}`;
        document.querySelector('.regulatory_icon').innerHTML = display_setting.allow_card.icon_input;
        document.querySelector('.regulatory_message').innerHTML = `${display_setting.allow_card.title_input}<br>${display_setting.allow_card.subtitle_input}`;

        graph_data = graph_data.map(function (item) {
            return {
                x: moment(item.hour, 'H').add(30, 'minutes').format('HH:mm'),
                // 100を超えるときには、100にする
                y: (item.avg / 20 * 100) < 100 ? (item.avg / 20 * 100) : 100
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
                    fill: 'origin',
                    borderColor: `rgba(0, 0, 0, 0.3)`,
                    backgroundColor: `rgba(0, 0, 0, 0.1)`,
                    color: '#ffffff',
                },
                    // {
                    //     label: '満員',
                    //     data: [
                    //         { x: "06:30", y: 100 }, { x: "21:30", y: 100 }
                    //     ],
                    //     // fill: 'origin',
                    //     borderColor: `rgba(210, 3, 3, 0.8)`,
                    //     backgroundColor: `rgba(210, 3, 3, 0.8)`,
                    //     color: '#ffffff',
                    // }
                ],
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
                            },
                        },
                        ticks: {
                            color: '#000',
                            font: { size: 30 },
                            callback: function (value, index, values) {
                                return moment(value, 'HH:mm').format('H') + '時';
                            }
                        }
                    },
                    y: {
                        min: 0,
                        // max: 120,
                        max: 100,
                        ticks: {
                            color: '#000',
                            font: { size: 20 },
                            // maxTicksLimit: 5,
                            stepSize: 10,
                            callback: function (value, index, values) {
                                return value + '%';
                            }
                        }
                    },

                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    // title: {
                    //     display: true,
                    //     text: '過去１週間の時間帯別満員度',
                    //     color: '#000',
                    //     font: {
                    //         size: 50
                    //     }
                    // },
                    filler: {
                        propagate: true
                    },
                    labels: {
                        font: {
                            size: 40
                        }
                    }
                }
            }
        });


        // アニメーションで使用するコンテナとパラメータを宣言する
        animContainer = document.getElementById('lottie');
        // Adobe After Effectsから書き出したアニメーションデータ
        animationData = { "assets": [], "v": "4.3.0", "ddd": 0, "layers": [{ "ddd": 0, "ind": 0, "ty": 1, "nm": "blob__yellow", "ks": { "o": { "k": 100 }, "r": { "k": 0 }, "p": { "k": [540, 540, 0] }, "a": { "k": [540, 540, 0] }, "s": { "k": [{ "i": { "x": [0.222, 0.222, 0.667], "y": [1, 1, 0.667] }, "o": { "x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167] }, "n": ["0p222_1_0p167_0p167", "0p222_1_0p167_0p167", "0p667_0p667_0p167_0p167"], "t": 4, "s": [0, 0, 100], "e": [100, 100, 100] }, { "t": 15 }] } }, "hasMask": true, "masksProperties": [{ "cl": true, "inv": false, "mode": "a", "pt": { "k": [{ "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "n": "0p833_0p833_0p167_0p167", "t": 4, "s": [{ "i": [[26.858, -3.247], [25.249, -14.754], [-5.297, -33], [-16.249, -9.037], [-28.885, -3.379], [-21, -2.703], [-40.627, 14.108], [-1.297, 12], [7.283, 17.874], [17.465, 10.855]], "o": [[-19, 2.297], [-25.249, 14.754], [5.297, 33], [14.667, 8.157], [28.885, 3.379], [21, 2.703], [17.679, -6.139], [3.22, -29.802], [-8.734, -21.435], [-22.887, -14.224]], "v": [[476, 432.703], [431.249, 460.246], [379.703, 490], [426.333, 512.843], [462.115, 534.621], [501, 518.297], [551.321, 547.139], [565.297, 516], [575.717, 473.126], [521.887, 477.224]] }], "e": [{ "i": [[145.748, 0], [141.126, -140.618], [22.297, -160], [-7.41, -117.525], [-128.115, -71.621], [-127.399, 0], [-141.321, 102.861], [0, 194.556], [64.283, 87.874], [138.363, 82.457]], "o": [[-214.963, 0], [-141.795, 141.284], [-17.361, 124.581], [3.667, 58.158], [116.055, 64.879], [236.39, 0], [145.858, -106.163], [0, -112.43], [-95.835, -131.005], [-116.724, -69.561]], "v": [[506, 3.703], [219.249, 247.246], [9.703, 488], [92.333, 749.842], [72.115, 1023.621], [526, 936.297], [953.321, 953.139], [978.297, 592], [1063.717, 236.126], [768.887, 177.224]] }] }, { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "n": "0p833_0p833_0p167_0p167", "t": 21, "s": [{ "i": [[145.748, 0], [141.126, -140.618], [22.297, -160], [-7.41, -117.525], [-128.115, -71.621], [-127.399, 0], [-141.321, 102.861], [0, 194.556], [64.283, 87.874], [138.363, 82.457]], "o": [[-214.963, 0], [-141.795, 141.284], [-17.361, 124.581], [3.667, 58.158], [116.055, 64.879], [236.39, 0], [145.858, -106.163], [0, -112.43], [-95.835, -131.005], [-116.724, -69.561]], "v": [[506, 3.703], [219.249, 247.246], [9.703, 488], [92.333, 749.842], [72.115, 1023.621], [526, 936.297], [953.321, 953.139], [978.297, 592], [1063.717, 236.126], [768.887, 177.224]] }], "e": [{ "i": [[281.812, 0], [0, 0], [0, -256], [0, -126.158], [0, 0], [-271.5, 0], [0, 0], [0, 148.875], [0, 156.126], [0, 0]], "o": [[-281.812, 0], [0, 0], [0, 256], [0, 126.158], [0, 0], [271.5, 0], [0, 0], [0, -148.875], [0, -156.126], [0, 0]], "v": [[501.812, 0.016], [-0.001, -0.004], [-0.297, 416], [0, 845.842], [0.115, 1079.621], [532.5, 1080.297], [1080.036, 1079.997], [1080.047, 652.875], [1079.967, 268.126], [1080.012, -0.026]] }] }, { "t": 32 }] }, "o": { "k": 100 }, "x": { "k": 0 }, "nm": "Mask 1" }], "sw": 1080, "sh": 1080, "sc": `${display_setting.allow_card.color_input}`, "ip": 4, "op": 33, "st": 4, "bm": 0, "sr": 1 }, { "ddd": 0, "ind": 1, "ty": 1, "nm": "blob__white", "ks": { "o": { "k": 100 }, "r": { "k": 0 }, "p": { "k": [540, 540, 0] }, "a": { "k": [540, 540, 0] }, "s": { "k": [{ "i": { "x": [0.222, 0.222, 0.667], "y": [1, 1, 0.667] }, "o": { "x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167] }, "n": ["0p222_1_0p167_0p167", "0p222_1_0p167_0p167", "0p667_0p667_0p167_0p167"], "t": 0, "s": [0, 0, 100], "e": [100, 100, 100] }, { "t": 11 }] } }, "hasMask": true, "masksProperties": [{ "cl": true, "inv": false, "mode": "a", "pt": { "k": [{ "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "n": "0p833_0p833_0p167_0p167", "t": 0, "s": [{ "i": [[26.858, -3.247], [25.249, -14.754], [-5.297, -33], [-16.249, -9.037], [-28.885, -3.379], [-21, -2.703], [-40.627, 14.108], [-1.297, 12], [7.283, 17.874], [17.465, 10.855]], "o": [[-19, 2.297], [-25.249, 14.754], [5.297, 33], [14.667, 8.157], [28.885, 3.379], [21, 2.703], [17.679, -6.139], [3.22, -29.802], [-8.734, -21.435], [-22.887, -14.224]], "v": [[476, 432.703], [431.249, 460.246], [379.703, 490], [426.333, 512.843], [462.115, 534.621], [501, 518.297], [551.321, 547.139], [565.297, 516], [575.717, 473.126], [521.887, 477.224]] }], "e": [{ "i": [[145.748, 0], [141.126, -140.618], [22.297, -160], [-7.41, -117.525], [-128.115, -71.621], [-127.399, 0], [-141.321, 102.861], [0, 194.556], [64.283, 87.874], [138.363, 82.457]], "o": [[-214.963, 0], [-141.795, 141.284], [-17.361, 124.581], [3.667, 58.158], [116.055, 64.879], [236.39, 0], [145.858, -106.163], [0, -112.43], [-95.835, -131.005], [-116.724, -69.561]], "v": [[506, 3.703], [219.249, 247.246], [9.703, 488], [92.333, 749.842], [72.115, 1023.621], [526, 936.297], [953.321, 953.139], [978.297, 592], [1063.717, 236.126], [768.887, 177.224]] }] }, { "i": { "x": 0.833, "y": 0.833 }, "o": { "x": 0.167, "y": 0.167 }, "n": "0p833_0p833_0p167_0p167", "t": 17, "s": [{ "i": [[145.748, 0], [141.126, -140.618], [22.297, -160], [-7.41, -117.525], [-128.115, -71.621], [-127.399, 0], [-141.321, 102.861], [0, 194.556], [64.283, 87.874], [138.363, 82.457]], "o": [[-214.963, 0], [-141.795, 141.284], [-17.361, 124.581], [3.667, 58.158], [116.055, 64.879], [236.39, 0], [145.858, -106.163], [0, -112.43], [-95.835, -131.005], [-116.724, -69.561]], "v": [[506, 3.703], [219.249, 247.246], [9.703, 488], [92.333, 749.842], [72.115, 1023.621], [526, 936.297], [953.321, 953.139], [978.297, 592], [1063.717, 236.126], [768.887, 177.224]] }], "e": [{ "i": [[281.812, 0], [0, 0], [0, -256], [0, -126.158], [0, 0], [-271.5, 0], [0, 0], [0, 148.875], [0, 156.126], [0, 0]], "o": [[-281.812, 0], [0, 0], [0, 256], [0, 126.158], [0, 0], [271.5, 0], [0, 0], [0, -148.875], [0, -156.126], [0, 0]], "v": [[501.812, 0.016], [-0.001, -0.004], [-0.297, 416], [0, 845.842], [0.115, 1079.621], [532.5, 1080.297], [1080.036, 1079.997], [1080.047, 652.875], [1079.967, 268.126], [1080.012, -0.026]] }] }, { "t": 28 }] }, "o": { "k": 100 }, "x": { "k": 0 }, "nm": "Mask 1" }], "sw": 1080, "sh": 1080, "sc": "#ffffff", "ip": 0, "op": 33, "st": 0, "bm": 0, "sr": 1 }], "ip": 0, "op": 33, "fr": 60, "w": 1080, "h": 1080 };
        params = {
            container: animContainer,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            animationData: animationData,
            rendererSettings: {
                preserveAspectRatio: 'none'
            }
        };

        // bodyMovinアニメーションの読み込み
        anim = lottie.loadAnimation(params);
        document.querySelector('.regulatory_info').classList.add('open');
        document.querySelector('.graph_container').classList.add('open');

    });
    xhr.send();
})