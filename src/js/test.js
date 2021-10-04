var { PythonShell } = require('python-shell');

//PythonShellのインスタンスpyshellを作成する。jsから呼ぶ出すpythonファイル名は'sample.py'
var pyshell = new PythonShell('../python/sample.py');

//jsからpythonコードに'5'を入力データとして提供する 
pyshell.send(5);

//pythonコード実施後にpythonからjsにデータが引き渡される。
//pythonに引き渡されるデータは「data」に格納される。
pyshell.on('message', function (data) {
    console.log(data);
});