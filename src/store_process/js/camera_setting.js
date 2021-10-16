window.jQuery = window.$ = require('jquery');

$(() => {
    // 入力されている出入り口数に応じた数の出入り口名とIPアドレス入力欄を表示する関数
    const draw_camera_ip_settings = () => {
        const number_of_entrances = $('#number_of_entrances').val();
        $('#camera_ip_container').html('');
        for (let i = 0; i < number_of_entrances; i++) {
            $('#camera_ip_container').append(`
            <div>
            <input type="text" name="entrance_name_input" id="entrance_name_${i + 1}" placeholder="カメラ${i + 1}の出入り口名">
            <input type="text" name="camera_ip_input" id="camera_ip_${i + 1}" placeholder="カメラ${i + 1}のIPアドレス">
            </div>
            `);
        }
    }

    // 出入り口数、初期値の数だけ描画する
    draw_camera_ip_settings();

    // 出入り口数が変化したら、再描画
    $(document).on('change', '#number_of_entrances', () => {
        draw_camera_ip_settings();
    })
})