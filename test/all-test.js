require("dotenv").config();

const { batchNotify, todayNotify, reminderCheck } = require("../src/line");

async function runTests() {
  console.log("==== テスト開始 ====");

  console.log("① まとめ通知テスト");
  await batchNotify();

  console.log("② 当日通知テスト");
  await todayNotify();

  console.log("③ 事前通知＆再通知テスト");
  await reminderCheck();

  console.log("==== テスト終了 ====");
}

runTests();
