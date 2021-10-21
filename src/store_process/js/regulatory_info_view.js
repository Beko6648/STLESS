window.jQuery = window.$ = require('jquery');
const { ipcRenderer } = require('electron');

$(() => {
    $(document).on('click', '#system_setting_button', () => {
        (async () => {
            const data = await ipcRenderer.invoke('goto_system_setting', 'goto_system_setting:fromRegulatory_info_view');
            console.log('goto_system_setting', data);
        })()
    })

    $(document).on('click', '#camera_setting_button', () => {
        (async () => {
            const data = await ipcRenderer.invoke('goto_camera_setting', 'goto_camera_setting:fromRegulatory_info_view');
            console.log('goto_camera_setting', data);
        })()
    })

    // 店内客数が変化したタイミングで規制情報が送られてくる
    ipcRenderer.on("update_regulation_info", (event, regulatory_info_obj) => {
        let number_of_people = regulatory_info_obj.number_of_people;
        let regulatory_status = regulatory_info_obj.regulatory_status;

        console.log('number_of_people', number_of_people);
        console.log('regulatory_status', regulatory_status);

        switch (regulatory_status) {
            case 'allow_entry.html':
                $('#regulatory_status').html('入店許可');
                break;
            case 'regulation_nearing.html':
                $('#regulatory_status').html('規制間近');
                break;
            case 'regulation_and_time.html':
                $('#regulatory_status').html('入店規制');
                break;

            default:
                break;
        }

        $('#number_of_people').html(number_of_people);
    })
})