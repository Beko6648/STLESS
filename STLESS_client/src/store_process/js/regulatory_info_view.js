const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#system_setting_button').addEventListener('click', () => {
        (async () => {
            const data = await ipcRenderer.invoke('goto_system_setting', 'goto_system_setting:fromRegulatory_info_view');
            console.log('goto_system_setting', data);
        })()
    })

    document.querySelector('#camera_streaming_button').addEventListener('click', () => {
        (async () => {
            const data = await ipcRenderer.invoke('camera_streaming', 'camera_streaming:fromRegulatory_info_view');
            console.log('camera_streaming', data);
        })()
    })

    // カメラ設定画面を廃止したのでコメントアウト
    // document.querySelector('#camera_setting_button').addEventListener('click', () => {
    //     (async () => {
    //         const data = await ipcRenderer.invoke('goto_camera_setting', 'goto_camera_setting:fromRegulatory_info_view');
    //         console.log('goto_camera_setting', data);
    //     })()
    // })

    // 店内客数が変化したタイミングで規制情報が送られてくる
    ipcRenderer.on("update_regulation_info", (event, regulatory_info_obj) => {
        let number_of_people = regulatory_info_obj.number_of_people;
        let regulatory_status = regulatory_info_obj.regulatory_status;

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
        regulatory_info_obj.camera_data.forEach(camera_data => {
            const camera_id = camera_data.camera_id;
            const enter_count = camera_data.enter_count;
            const leave_count = camera_data.leave_count;

            let camera_data_element = document.querySelectorAll('.camera_data')[camera_id];

            camera_data_element.querySelector('.enter_count_value').innerHTML = enter_count;
            camera_data_element.querySelector('.leave_count_value').innerHTML = leave_count;
        });
        const enter_or_leave = regulatory_info_obj.camera_data[0];
        const camera_id = regulatory_info_obj.camera_data[1];


    })

    ipcRenderer.on('update_camera_data', (event, data) => {
        const enter_or_leave = data[0];
        const camera_id = data[1];

        console.log('update_camera_data', data);
        document.querySelectorAll('.camera_data').forEach((element, index) => {
            if (index === camera_id) {
                console.log(element);
            }
        })
    })
})