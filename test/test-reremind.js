require("dotenv").config();
const { reminderCheck } = require("../src/line");

(async () => {
  console.log("=== 再通知テスト開始 ===");
  await reminderCheck();
  console.log("=== テスト終了 ===");
})();
