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
    })

})