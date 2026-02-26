require("dotenv").config();
const { startScheduler } = require("./scheduler");

startScheduler();
console.log("Bot started");
