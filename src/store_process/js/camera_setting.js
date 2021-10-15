window.jQuery = window.$ = require('jquery');

$(() => {
    let number_of_entrances = $('#number_of_entrances').val();

    const draw_camera_ip_settings = () => {
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

    draw_camera_ip_settings();

    $(document).on('change', '#number_of_entrances', (e) => {
        console.log('change');
        number_of_entrances = e.target.value;
        console.log(number_of_entrances);
        draw_camera_ip_settings();
    })
})