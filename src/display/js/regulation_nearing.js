$(() => {
    const api_access = () => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/next_html");
        xhr.addEventListener("load", function (e) {
            let next_html = JSON.parse(xhr.responseText);
            console.log(next_html);
            window.location.assign(next_html);
        });
        xhr.send();
    }

    setInterval(api_access, 1000);
})