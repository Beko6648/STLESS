$(() => {
    const displaying_URL = 'regulation_and_time.html'

    const api_access = () => {
        let A_xhr = new XMLHttpRequest();
        A_xhr.open("GET", "/api/next_html");
        A_xhr.addEventListener("load", function (e) {
            let next_html = JSON.parse(A_xhr.responseText);
            console.log(next_html);
            if (displaying_URL != next_html) {
                window.location.assign(next_html);
            }
        });
        A_xhr.send();

        let B_xhr = new XMLHttpRequest();
        B_xhr.open("GET", "/api/leave_time_array");
        B_xhr.addEventListener("load", function (e) {
            $('.waiting_time_display').html('');

            let leave_time_array = JSON.parse(B_xhr.responseText);
            console.log(leave_time_array);

            leave_time_array.forEach((value, index) => {
                let leave_date = moment(value);
                let now_date = moment();

                console.log('予想退店時間', leave_date.format('HH:mm:ss'));
                console.log('現在時間', now_date.format('HH:mm:ss'));

                // 差分の分数を計算
                let waiting_time = Math.round(leave_date.diff(now_date, 'minutes'));
                if (waiting_time <= 1) {
                    $('.waiting_time_display').append(`<div class='waiting_time'>${index + 1}組目: まもなく入店いただけます。</div>`)
                } else {
                    $('.waiting_time_display').append(`<div class='waiting_time'>${index + 1}組目: 約${waiting_time}分</div>`)
                }
            })
        });
        B_xhr.send();
    }

    setInterval(api_access, 1000);
})