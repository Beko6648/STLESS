const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();

window.addEventListener('DOMContentLoaded', () => {
    // グローバル変数の初期化
    let saved_number_of_entrance = null;
    let saved_entrance_name_and_ip_array = []

    // 入力されている出入り口数に応じた数の出入り口名とIPアドレス入力欄を表示する関数
    const draw_entrance_name_and_ip_settings = () => {
        const number_of_entrance = document.querySelector('#number_of_entrance').value;

        const is_saved = (saved_entrance_name_and_ip_array.length == saved_number_of_entrance);
        document.querySelector('#camera_ip_container').innerHTML = '';
        for (let i = 0; i < number_of_entrance; i++) {
            document.querySelector('#camera_ip_container').innerHTML += `
            <div class='entrance_input_container flex flex-row justify-center'>
                <div class="m-1">
                    <label class="text-gray-700 px-1">
                        カメラ${i + 1}の出入り口名
                    </label>
                    <input type="text" class="entrance_name_input rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    id="entrance_name_${i + 1}" value="${is_saved && i < saved_entrance_name_and_ip_array.length ? saved_entrance_name_and_ip_array[i].entrance_name : ''}" placeholder="カメラ${i + 1}の出入り口名">
                </div>
                <div class="m-1">
                    <label class="text-gray-700 px-1">
                        カメラ${i + 1}のIPアドレス
                    </label>
                    <input type="text" class="camera_ip_input rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    id="camera_ip_${i + 1}" value="${is_saved && i < saved_entrance_name_and_ip_array.length ? saved_entrance_name_and_ip_array[i].camera_ip : ''}" placeholder="カメラ${i + 1}のIPアドレス">
                </div>
            </div>
            `;
        }
    }



    // 出入り口数が保存されていたら初期値を上書き、保存されていなければ初期値として1を入力
    if (store.has('camera_setting')) {
        saved_number_of_entrance = store.get('camera_setting').number_of_entrance;
        document.querySelector('#number_of_entrance').value = saved_number_of_entrance;
        document.querySelector('#number_of_entrance_display').innerHTML = saved_number_of_entrance;
        saved_entrance_name_and_ip_array = store.get('camera_setting').entrance_name_and_ip_array;
    } else {
        document.querySelector('#number_of_entrance').value = 1;
        document.querySelector('#number_of_entrance_display').innerHTML = 1;
    }

    // 出入り口数、初期値の数だけ描画する
    draw_entrance_name_and_ip_settings();


    // 出入り口数が変化したら、再描画
    document.querySelector('#number_of_entrance').addEventListener('change', () => {
        draw_entrance_name_and_ip_settings();
    })

    // 設定保存ボタンが押されたら
    document.querySelector('#end_camera_setting_button').addEventListener('click', () => {
        let entrance_name_and_ip_array = [];
        let camera_setting = {};

        document.querySelectorAll('.entrance_input_container').forEach((container_element) => {
            const entrance_name = container_element.querySelector('.entrance_name_input');
            const camera_ip = container_element.querySelector('.camera_ip_input');
            entrance_name_and_ip_array.push({
                entrance_name: entrance_name.value,
                camera_ip: camera_ip.value
            });
        })
        camera_setting['number_of_entrance'] = document.querySelector('#number_of_entrance').value;
        camera_setting['entrance_name_and_ip_array'] = entrance_name_and_ip_array;
        store.set('camera_setting', camera_setting);
        console.log(entrance_name_and_ip_array);

        const system_setting = {
            max_people_in_store: document.querySelector('#max_people_in_store_input').value,
            system_start_time: document.querySelector('#system_start_time_input').value,
            system_end_time: document.querySelector('#system_end_time_input').value
        }
        store.set('system_setting', system_setting);

        // メインプロセスへ規制情報表示画面へのページ遷移を依頼する
        (async () => {
            const data = await ipcRenderer.invoke('goto_regulatory_info_view', 'goto_regulatory_info_view:fromCamera_setting');
            console.log('goto_regulatory_info_view', data);
        })()
    })

    // input number
    document.querySelector('#entrance_decrement').addEventListener("click", (e) => {
        // const btn = e.target.parentNode.parentElement.querySelector('#decrement');
        const target = document.querySelector('#number_of_entrance');
        let value = Number(target.value);
        value--;
        target.value = value;
        document.querySelector('#number_of_entrance_display').innerHTML = value;
        draw_entrance_name_and_ip_settings();
    });

    document.querySelector('#entrance_increment').addEventListener("click", (e) => {
        // const btn = e.target.parentNode.parentElement.querySelector('#increment');
        const target = document.querySelector('#number_of_entrance');
        let value = Number(target.value);
        value++;
        target.value = value;
        document.querySelector('#number_of_entrance_display').innerHTML = value;
        draw_entrance_name_and_ip_settings();
    });

    document.querySelector('#max_people_decrement').addEventListener("click", (e) => {
        // const btn = e.target.parentNode.parentElement.querySelector('#decrement');
        const target = document.querySelector('#max_people_in_store_input');
        let value = Number(target.value);
        value--;
        target.value = value;
        document.querySelector('#max_people_in_store_display').innerHTML = value;
        draw_entrance_name_and_ip_settings();
    });

    document.querySelector('#max_people_increment').addEventListener("click", (e) => {
        // const btn = e.target.parentNode.parentElement.querySelector('#increment');
        const target = document.querySelector('#max_people_in_store_input');
        let value = Number(target.value);
        value++;
        target.value = value;
        document.querySelector('#max_people_in_store_display').innerHTML = value;
        draw_entrance_name_and_ip_settings();
    });
})