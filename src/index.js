require("dotenv").config();
const { startScheduler } = require("./line");

startScheduler();
console.log("Bot started");
