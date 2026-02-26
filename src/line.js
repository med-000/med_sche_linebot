const line = require("@line/bot-sdk");
const cron = require("node-cron");
const { scheformat } = require("./scheduler");
const { updateCheckbox } = require("./notion");
require("dotenv").config();

const client = new line.Client({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
});

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";

  const d = new Date(dateStr);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  if (hh === "00" && min === "00") {
    return `${yyyy}/${mm}/${dd}`;
  }

  return `${yyyy}/${mm}/${dd} ${hh}:${min}~`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${hh}:${min}~`;
};

const sendToUser = async (text) => {
  try {
    await client.pushMessage(process.env.LINE_USER_ID, {
      type: "text",
      text,
    });
  } catch (err) {
    console.error("個人送信エラー:", err.message);
  }
};

const sendToGroup = async (text) => {
  try {
    await client.pushMessage(process.env.LINE_GROUP_ID, {
      type: "text",
      text,
    });
  } catch (err) {
    console.error("グループ送信エラー:", err.message);
  }
};

const batchNotify = async () => {
  const { familyPublicFiltered } = await scheformat();
  const now = new Date();

  const targets = familyPublicFiltered
    .filter((item) => {
      const created = new Date(item.createdAt);
      const diffHours = (now - created) / (1000 * 60 * 60);
      return diffHours <= 24 && item.isBatchNotified === false;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (targets.length === 0) return;

  const message =
    "力樹が以下の予定を更新しました\n" +
    targets
      .map((item) => {
        const dateText = formatDateTime(item.date);
        return `${dateText} ${item.name} ${item.what}`;
      })
      .join("\n");

  await sendToGroup(message);

  for (const item of targets) {
    await updateCheckbox(item.id, "追加通知", true);
  }
};

const todayNotify = async () => {
  const { familyPublicFiltered } = await scheformat();
  const today = new Date();
  const todayStr = today.toDateString();

  const targets = familyPublicFiltered
    .filter((item) => {
      if (!item.date) return false;
      return (
        new Date(item.date).toDateString() === todayStr &&
        item.isTodayNotified === false
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (targets.length === 0) return;

  const month = today.getMonth() + 1;
  const day = today.getDate();

  const message =
    `力樹の今日(${month}/${day})の予定\n` +
    targets
      .map((item) => {
        const timeText = formatTime(item.date);
        return `${timeText} ${item.name} ${item.what}`;
      })
      .join("\n");

  await sendToGroup(message);

  for (const item of targets) {
    await updateCheckbox(item.id, "当日通知", true);
  }
};

const reminderCheck = async () => {
  const { formatted } = await scheformat();
  const now = new Date();

  for (const item of formatted) {
    if (item.remainder && item.isReminderNotified === false) {
      const reminderDate = new Date(item.remainder);

      if (now >= reminderDate) {
        await sendToUser(
          `「${item.name}」があるよ！\n${formatTime(item.date)}`,
        );
        await updateCheckbox(item.id, "事前通知済み", true);
      }
    }

    if (item.reremaind === true) {
      await sendToUser(`「${item.name}」の再通知だよ`);
      await updateCheckbox(item.id, "再通知", false);
    }
  }
};

const startScheduler = () => {
  cron.schedule(
    "0 21 * * *",
    async () => {
      await batchNotify();
    },
    { timezone: "Asia/Tokyo" },
  );

  cron.schedule(
    "0 6 * * *",
    async () => {
      await todayNotify();
    },
    { timezone: "Asia/Tokyo" },
  );

  cron.schedule(
    "* * * * *",
    async () => {
      await reminderCheck();
    },
    { timezone: "Asia/Tokyo" },
  );

  console.log("通知システム起動中...");
};

module.exports = {
  startScheduler,
  batchNotify,
  todayNotify,
  reminderCheck,
};
