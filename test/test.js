require("dotenv").config();
const line = require("@line/bot-sdk");

const client = new line.Client({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
});

async function main() {
  try {
    await client.pushMessage(process.env.LINE_USER_ID, {
      type: "text",
      text: "push成功 🎉",
    });

    console.log("送信成功");
  } catch (err) {
    console.error("エラー:", err);
  }
}

main();
