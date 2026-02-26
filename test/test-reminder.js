require("dotenv").config();
const cron = require("node-cron");
const { reminderCheck } = require("../src/line");

console.log("直前通知リアルテスト開始");

cron.schedule(
  "* * * * *",
  async () => {
    console.log("チェック実行...");
    await reminderCheck();
  },
  { timezone: "Asia/Tokyo" },
);
