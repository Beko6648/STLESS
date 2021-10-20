window.jQuery = window.$ = require('jquery');
const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();

$(() => {
    // ページ読み込み時、過去の設定を読み取って初期値を表示する
    if (store.has('system_setting')) {
        const system_setting = store.get('system_setting');
        $('.display_setting_card').each((index, card_element) => {
            const card_id = card_element.id;
            let input_elements = card_element.querySelectorAll('input');

            input_elements.forEach((input_element) => {
                input_element.value = system_setting[`${card_id}`][`${input_element.classList[0]}`];
            })
        })
    }

    // 設定完了ボタン押下時、設定を保存してページ遷移
    $(document).on('click', '#end_system_setting_button', () => {
        let system_setting_obj = {};

        $('.display_setting_card').each((index, card_element) => {
            const card_id = card_element.id;
            let card_setting_obj = {};
            let input_elements = card_element.querySelectorAll('input');

            input_elements.forEach((input_element) => {
                console.log(`${card_id}_${input_element.classList[0]}`, input_element.value);
                card_setting_obj[`${input_element.classList[0]}`] = input_element.value;
            })
            system_setting_obj[`${card_id}`] = card_setting_obj;
        })

        store.set('system_setting', system_setting_obj);


        (async () => {
            const data = await ipcRenderer.invoke('goto_regulatory_info_view', 'goto_regulatory_info_view :fromSystem_setting');
            console.log('goto_regulatory_info_view ', data);
        })()
    })
})