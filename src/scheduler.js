const { getSchedules } = require("./notion");

const scheformat = async () => {
  const schedules = await getSchedules();

  const formatted = schedules.map((schedule) => {
    return {
      id: schedule.id,
      createdAt: schedule.created_time,

      name: schedule.properties["名前"]?.title?.[0]?.plain_text || "",

      date: schedule.properties["日付"]?.date?.start || null,

      remainder: schedule.properties["事前通知"]?.date?.start || null,

      isReminderNotified:
        schedule.properties["事前通知済み"]?.checkbox ?? false,

      public: schedule.properties["public"]?.checkbox ?? false,

      what:
        schedule.properties["what"]?.multi_select
          ?.map((tag) => tag.name)
          .join(" ") || "",

      reremaind: schedule.properties["再通知"]?.checkbox ?? false,

      isBatchNotified: schedule.properties["追加通知"]?.checkbox ?? false,

      isTodayNotified: schedule.properties["当日通知"]?.checkbox ?? false,
    };
  });

  const familyPublicFiltered = formatted.filter((item) => item.public === true);

  return {
    formatted,
    familyPublicFiltered,
  };
};

module.exports = { scheformat };
