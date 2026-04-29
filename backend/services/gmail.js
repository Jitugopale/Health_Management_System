import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export const SendEmail = async ({ to, subject, html }) => {
  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_USER,
            Name: "Health Management System",
          },
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Error sending email", error.message);
  }
};
