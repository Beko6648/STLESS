window.jQuery = window.$ = require('jquery');
const Store = require('electron-store');
const store = new Store();

$(() => {
    // グローバル変数の初期化
    let saved_number_of_entrance = null;
    let saved_entrance_name_and_ip_array = []

    // 入力されている出入り口数に応じた数の出入り口名とIPアドレス入力欄を表示する関数
    const draw_entrance_name_and_ip_settings = () => {
        const number_of_entrance = $('#number_of_entrance').val();

        const is_saved = (saved_entrance_name_and_ip_array.length == saved_number_of_entrance);
        $('#camera_ip_container').html('');
        for (let i = 0; i < number_of_entrance; i++) {
            $('#camera_ip_container').append(`
            <div class='entrance_input_container'>
                <input type="text" class="entrance_name_input" id="entrance_name_${i + 1}" value="${is_saved && i < saved_entrance_name_and_ip_array.length ? saved_entrance_name_and_ip_array[i].entrance_name : ''}" placeholder="カメラ${i + 1}の出入り口名">
                <input type="text" class="camera_ip_input" id="camera_ip_${i + 1}" value="${is_saved && i < saved_entrance_name_and_ip_array.length ? saved_entrance_name_and_ip_array[i].camera_ip : ''}" placeholder="カメラ${i + 1}のIPアドレス">
            </div>
            `);
        }
    }



    // 出入り口数が保存されていたら初期値を上書き、保存されていなければ初期値として1を入力
    if (store.has('number_of_entrance')) {
        console.log('出入り口数が保存されていたら初期値を上書き');
        saved_number_of_entrance = store.get('number_of_entrance');
        $('#number_of_entrance').val(saved_number_of_entrance);
    } else {
        $('#number_of_entrance').val(1);
    }

    // 各出入り口の名前とIPが保存されていれば初期値として表示
    if (store.has('entrance_name_and_ip_array')) {
        console.log('各出入り口の名前とIPが保存されていれば初期値として表示');
        saved_entrance_name_and_ip_array = store.get('entrance_name_and_ip_array');
    }

    // 出入り口数、初期値の数だけ描画する
    draw_entrance_name_and_ip_settings();


    // 出入り口数が変化したら、再描画
    $(document).on('change', '#number_of_entrance', () => {
        draw_entrance_name_and_ip_settings();
    })

    // 設定保存ボタンが押されたら
    $(document).on('click', '#end_camera_setting_button', () => {
        let entrance_name_and_ip_array = [];

        $('.entrance_input_container').each((index, container_element) => {
            const entrance_name = container_element.querySelector('.entrance_name_input');
            const camera_ip = container_element.querySelector('.camera_ip_input');
            entrance_name_and_ip_array.push({
                entrance_name: entrance_name.value,
                camera_ip: camera_ip.value
            });
        })
        store.set('number_of_entrance', $('#number_of_entrance').val());
        store.set('entrance_name_and_ip_array', entrance_name_and_ip_array);
        saved_entrance_name_and_ip_array = entrance_name_and_ip_array;
        console.log(entrance_name_and_ip_array);
    })
})