const cors = require("cors");
const express = require("express");
const moment = require("moment");
const { notificationQueue } = require("./bullMQ");
require("dotenv").config({ path: `${__dirname}/../.env` });

const app = express();

app.use(cors());

app.use(express.json());

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "FCM+BullMQ running!",
    data: null,
  });
});

app.post("/queue/add", async (req, res) => {
  if (!req.body.FCMToken) {
    res.status(422).json({
      message: "Device FCM Token is required",
      data: null,
    });
  }

  if (!req.body.title) {
    res.status(422).json({
      message: "Message title is required",
      data: null,
    });
  }

  if (!req.body.body) {
    res.status(422).json({
      message: "Message body is required",
      data: null,
    });
  }

  if (!req.body.triggerOn) {
    res.status(422).json({
      message: "Trigger time is required",
      data: null,
    });
  }
  const delay = moment.unix(req.body.triggerOn).utc().diff(moment());
  // ? Add a new job to queue
  await notificationQueue.add(
    "send-notification",
    {
      title: req.body.title,
      body: req.body.body,
      FCMToken: req.body.FCMToken,
    },
    {
      delay,
      attempts: 2,
      removeOnComplete: true,
    }
  );
});

app.listen(app.get("port"), () => {
  console.log(`listening on port ${app.get("port")} in ${app.get("env")} mode`);
});
