$(() => {
    const api_access = () => {
        let A_xhr = new XMLHttpRequest();
        A_xhr.open("GET", "/api/next_html");
        A_xhr.addEventListener("load", function (e) {
            let next_html = JSON.parse(A_xhr.responseText);
            console.log(next_html);
            // window.location.assign(next_html);
        });
        A_xhr.send();

        let B_xhr = new XMLHttpRequest();
        B_xhr.open("GET", "/api/waiting_time_array");
        B_xhr.addEventListener("load", function (e) {
            let waiting_time_array = JSON.parse(B_xhr.responseText);
            console.log(waiting_time_array);
        });
        B_xhr.send();
    }

    setInterval(api_access, 1000);
})