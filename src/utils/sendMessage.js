const admin = require("../firebase");

export const sendMessage = async ({ deviceFCMToken, title, body }) => {
  return admin
    .messaging()
    .send({
      notification: {
        title: title,
        body: body,
      },
      token: deviceFCMToken,
    })
    .then((response) => ({
      success: true,
      data: response,
    }));
};
