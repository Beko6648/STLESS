const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();

window.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時、過去の設定を読み取って初期値を表示する
    if (store.has('display_setting')) {
        const display_setting = store.get('display_setting');

        // 設定カードの色付け
        document.querySelector('#allow_card').style.backgroundColor = display_setting.allow_card.color_input
        document.querySelector('#near_card').style.backgroundColor = display_setting.near_card.color_input
        document.querySelector('#regulation_card').style.backgroundColor = display_setting.regulation_card.color_input

        document.querySelectorAll('.display_setting_card').forEach((card_element) => {
            const card_id = card_element.id;
            let input_elements = card_element.querySelectorAll('input');

            input_elements.forEach((input_element) => {
                input_element.value = display_setting[`${card_id}`][`${input_element.classList[0]}`];
            })
        })
    }
    if (store.has('system_setting')) {
        const system_setting = store.get('system_setting');

        document.querySelector('#max_people_in_store_input').value = system_setting.max_people_in_store;
        document.querySelector('#max_people_in_store_display').innerHTML = system_setting.max_people_in_store;
        document.querySelector('#system_start_time_input').value = system_setting.system_start_time;
        document.querySelector('#system_end_time_input').value = system_setting.system_end_time;

    }

    // 設定完了ボタン押下時、設定を保存してページ遷移
    document.querySelector('#end_system_setting_button').addEventListener('click', () => {
        let display_setting_obj = {};

        document.querySelectorAll('.display_setting_card').forEach((card_element) => {
            const card_id = card_element.id;
            let card_setting_obj = {};
            let input_elements = card_element.querySelectorAll('input');

            input_elements.forEach((input_element) => {
                console.log(`${card_id}_${input_element.classList[0]}`, input_element.value);
                card_setting_obj[`${input_element.classList[0]}`] = input_element.value;
            })
            display_setting_obj[`${card_id}`] = card_setting_obj;
        })
        store.set('display_setting', display_setting_obj);

        const system_setting = {
            max_people_in_store: document.querySelector('#max_people_in_store_input').value,
            system_start_time: document.querySelector('#system_start_time_input').value,
            system_end_time: document.querySelector('#system_end_time_input').value
        }
        store.set('system_setting', system_setting);


        (async () => {
            await ipcRenderer.invoke('update_setting', 'update_setting :fromSystem_setting');
            const data = await ipcRenderer.invoke('goto_regulatory_info_view', 'goto_regulatory_info_view :fromSystem_setting');
            console.log('goto_regulatory_info_view ', data);
        })()
    })


    // カラーピッカー
    document.querySelectorAll('input[type=color]').forEach((item) => {
        item.addEventListener('change', (e) => {
            console.log('change');
            e.target.parentElement.style.backgroundColor = e.target.value;
        })
    })

    const colorPickers = document.querySelectorAll(
        `input[type=color]`
    );

    colorPickers.forEach(colorPicker => {
        colorPicker.parentElement.style.backgroundColor = colorPicker.value;
    });


    // input number
    document.querySelector('#decrement').addEventListener("click", (e) => {
        // const btn = e.target.parentNode.parentElement.querySelector('#decrement');
        const target = document.querySelector('#max_people_in_store_input');
        let value = Number(target.value);
        value--;
        target.value = value;
        document.querySelector('#max_people_in_store_display').innerHTML = value;
    });

    document.querySelector('#increment').addEventListener("click", (e) => {
        // const btn = e.target.parentNode.parentElement.querySelector('#increment');
        const target = document.querySelector('#max_people_in_store_input');
        let value = Number(target.value);
        value++;
        target.value = value;
        document.querySelector('#max_people_in_store_display').innerHTML = value;
    });
})