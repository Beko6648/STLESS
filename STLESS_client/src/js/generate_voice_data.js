// coefontAPI
const accessKey = 'jpOtbBMYPwuTnKXABPfRTaW98'
const accessSecret = '8JbsMWs3tY4zOKkWRC2wDlvgg1m5fhckbDfjjCRm'
const greeting_array = [
    'いらっしゃいませ。どうぞおはいりください',
    'ごにゅうてんいただけます。ひつようさいていげんのにんずうでごにゅうてんください',
    'にゅうてんきせいちゅうです。かんかくをあけておまちください',
]

greeting_array.forEach((greeting, index) => {
    const data = JSON.stringify({
        'coefont': '30f57cf2-e73f-456b-8e0c-ca87cbbe4361',
        'text': greeting,
        'speed': 0.9,
    })
    const date = String(Math.floor(Date.now() / 1000))
    const signature = crypto.createHmac('sha256', accessSecret).update(date + data).digest('hex')

    axios.post('https://api.coefont.cloud/v1/text2speech', data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': accessKey,
            'X-Coefont-Date': date,
            'X-Coefont-Content': signature
        },
        responseType: 'stream'
    })
        .then(response => {
            response.data.pipe(fs.createWriteStream(`./src/display/voices/greeting_${index}.wav`))
            console.log('成功');
        })
        .catch(error => {
            console.log(error)
        })
});