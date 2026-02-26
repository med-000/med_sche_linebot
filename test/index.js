const express = require("express");
const line = require("@line/bot-sdk");
require("dotenv").config();

const app = express();

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
};

app.post("/webhook", line.middleware(config), (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.source.type === "group") {
      console.log("GROUP ID:", event.source.groupId);
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
