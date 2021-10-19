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
})