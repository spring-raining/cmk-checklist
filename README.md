# cmk-checklist

[![CircleCI](https://circleci.com/gh/spring-raining/cmk-checklist.svg?style=svg)](https://circleci.com/gh/spring-raining/cmk-checklist)

コミケットカタログ向けチェックファイル(CSV形式)の読み込み・書き込み

## installation

```
npm install cmk-checklist
```

## Usage

### read

```javascript
const checklist = require('cmk-checklist');
const fs = require('fs');

// checklist.csvを読み込み
const file = fs.readFileSync('./checklist.csv');

checklist.read(file).then((result) => {
  console.log(result.header.eventName);
}).catch((error) => {
  console.log(error);
});

// Async/Await形式で読み込み
async function read() {
  const result = await checklist.read(file);
  console.log(result.header.eventName);
});

// Callbackを設定
checklist.read(file, (err, result) => {
  if (err) console.log(err);
  else console.log(result.header.eventName);
});
```

### write

```javascript
const checklist = require('cmk-checklist');
const fs = require('fs');

async function write() {
  // 既存のチェックリストを読み込み
  const file = fs.readFileSync('./checklist.csv');
  let chk = await checklist.read(file);

  // チェックリストを新規作成
  chk = new checklist.Checklist();
  // コミケ開催番号を指定して作成
  chk = new checklist.Checklist(91);

  // サークルを追加
  chk.circles.append({
    serialNumber: 129936,
    colorNumber: 1,
    pageNumber: 831,
    cutIndex: 21,
    week: '金',
    area: '西',
    block: 'れ',
    spaceNumber: 19,
    spaceNumberSub: 'a',
    genreCode: 112,
    circleName: 'apricot+',
    circleNameYomi: 'アプリコットプラス',
    penName: '蒼樹うめ',
  });

  // チェックリストを書き込み
  const output = await checklist.write(chk);
  fs.writeFileSync('./output.csv', new Buffer(output));
}
```

## license

[MIT](https://github.com/spring-raining/cmk-checklist/blob/master/LICENCE)

## Author

[spring-raining](https://github.com/spring-raining)
