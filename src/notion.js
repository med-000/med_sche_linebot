require("dotenv").config();
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const getSchedules = async () => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_SCHEDB_ID,
    });

    return response.results;
  } catch (err) {
    console.error("Notion取得エラー:", err.message);
    return [];
  }
};

const updateCheckbox = async (pageId, fieldName, value) => {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        [fieldName]: {
          checkbox: value,
        },
      },
    });
  } catch (err) {
    console.error(`Notion更新エラー (${fieldName}):`, err.message);
  }
};

const updateDate = async (pageId, fieldName, dateValue) => {
  try {
    if (!(dateValue instanceof Date)) {
      throw new Error("dateValue must be a Date object");
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        [fieldName]: {
          date: {
            start: dateValue.toISOString(),
          },
        },
      },
    });
  } catch (err) {
    console.error(`Notion日付更新エラー (${fieldName}):`, err.message);
  }
};

module.exports = {
  getSchedules,
  updateCheckbox,
  updateDate,
};
