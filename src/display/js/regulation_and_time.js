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
            let waiting_time_array = [];
            console.log(leave_time_array);

            leave_time_array.forEach((value, index) => {
                let leave_date = new Date(value);
                let now_date = new Date();
                now_date.setHours(now_date.getHours() + 9);

                console.log('予想退店時間', leave_date.toISOString());
                console.log('現在時間', now_date.toISOString());

                // 差分がミリ秒で出てくるため、分数に直す
                let waiting_time = Math.round((leave_date.getTime() - now_date.getTime()) / 60000);
                $('.waiting_time_display').append(`<div class='waiting_time'>${index + 1}組目:${waiting_time}分</div>`)
            })
        });
        B_xhr.send();
    }

    setInterval(api_access, 1000);
})