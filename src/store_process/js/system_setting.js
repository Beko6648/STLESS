window.jQuery = window.$ = require('jquery');
const { ipcRenderer } = require('electron');

$(() => {
    $(document).on('click', '#end_system_setting_button', () => {
        (async () => {
            const data = await ipcRenderer.invoke('goto_regulatory_info_view', 'goto_regulatory_info_view :fromSystem_setting');
            console.log('goto_regulatory_info_view ', data);
        })()
    })
})