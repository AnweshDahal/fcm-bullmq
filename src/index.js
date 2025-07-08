const cors = require("cors");
const express = require("express");
const moment = require("moment");
const { notificationQueue } = require("./bullMQ");
require("dotenv").config({ path: `${__dirname}/../.env` });
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const statusMonitor = require("express-status-monitor");

const app = express();

app.use(cors());

app.use(express.json());

app.use(statusMonitor());

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "FCM+BullMQ running!",
    data: null,
  });
});

app.post(
  "/queue/add",
  async (req, res, next) => {
    try {
      const publicKey = fs.readFileSync("./keys/public.key");
      if (req.headers.authorization) {
        jsonwebtoken.verify(
          req.headers.authorization,
          publicKey,
          (err, decoded) => {
            if (err) {
              res.status(403).json({
                message: "Invalid Token",
                data: null,
              });
            } else {
              next();
            }
          }
        );
      } else {
        res.status(403).json({
          message: "Token not supplied",
          data: null,
        });
      }
    } catch (err) {
      console.error("[Error: Queue/Add]", err);
      res.status(500).json({
        message: "Internale Server Error",
        data: null,
      });
    }
  },
  async (req, res) => {
    try {
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
      const delay =
        (parseInt(req.body.triggerOn) - moment().utc().unix().valueOf()) * 1000; // must be epoch in UTC+00:00
      console.log("delay", delay);
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
        }
      );

      res.status(200).json({
        message: "Job Added",
        data: null,
      });
    } catch (err) {
      console.error("[Error: Queue/Add]:", err);
      res.status(500).json({
        message: "Internal Server Error",
        data: null,
      });
    }
  }
);

app.listen(app.get("port"), () => {
  console.log(`listening on port ${app.get("port")} in ${app.get("env")} mode`);
});
