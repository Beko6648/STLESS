const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時に情報を更新する
    (async () => {
        const data = await ipcRenderer.invoke('get_regulation_info', 'get_regulation_info:fromRegulatory_info_view');
        console.log('get_regulation_info', data);
        update_regulation_info(data);
    })();

    // ボタン押下時の処理
    document.querySelector('#system_setting_button').addEventListener('click', () => {
        (async () => {
            const data = await ipcRenderer.invoke('goto_system_setting', 'goto_system_setting:fromRegulatory_info_view');
            console.log('goto_system_setting', data);
        })()
    })

    document.querySelectorAll('.camera_streaming_button').forEach((element) => {
        element.addEventListener('click', () => {
            (async () => {
                const data = await ipcRenderer.invoke('camera_streaming', 'camera_streaming:fromRegulatory_info_view');
                console.log('camera_streaming', data);
            })()
        })
    })

    // 店内客数が変化したタイミングで送られてくる規制情報を元に表示を更新する
    ipcRenderer.on("update_regulation_info", (event, regulation_info_obj) => {
        update_regulation_info(regulation_info_obj);
    })

    // 規制情報を元に表示を更新する関数
    const update_regulation_info = (regulation_info_obj) => {
        let number_of_people = regulation_info_obj.number_of_people;
        let regulatory_status = regulation_info_obj.regulatory_status;

        console.log('number_of_people', number_of_people);
        console.log('regulatory_status', regulatory_status);

        switch (regulatory_status) {
            case 'allow_entry.html':
                document.querySelector('#regulatory_status').innerHTML = '入店許可';
                break;
            case 'regulation_nearing.html':
                document.querySelector('#regulatory_status').innerHTML = '規制間近';
                break;
            case 'regulation_and_time.html':
                document.querySelector('#regulatory_status').innerHTML = '入店規制';
                break;

            default:
                break;
        }

        document.querySelector('#number_of_people').innerHTML = number_of_people;


        // カメラ情報（出入り口情報を更新）
        regulation_info_obj.camera_data.forEach(camera_data => {
            const camera_id = camera_data.camera_id;
            const enter_count = camera_data.enter_count;
            const leave_count = camera_data.leave_count;

            let camera_data_element = document.querySelectorAll('.camera_data')[camera_id];

            camera_data_element.querySelector('.enter_count_value').innerHTML = enter_count;
            camera_data_element.querySelector('.leave_count_value').innerHTML = leave_count;
        });
    }
})