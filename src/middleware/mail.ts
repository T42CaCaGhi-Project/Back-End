import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { EventoInterface } from "../schemas/evento";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: "fenfesta@gmail.com",
    pass: process.env.EMAIL_APP_PSSW,
  },
});

/* const notifyMail: MailOptions = {
    from: '"Fen Festa" <fenfesta@gmail.com>',
      to: "eli.casotti@gmail.com",
      subject: "Test",
      text: "Test text",
      html: "<b>Test Html</b>",
} */

export const mail = async (
  dest: string,
  mailType: string,
  event?: EventoInterface
) => {
  try {
    const mailBody: MailOptions = {
      from: '"Fen Festa" <fenfesta@gmail.com>',
      to: dest,
    };
    switch (mailType) {
      case "notify":
        mailBody.subject = "Evento Imminente";
        mailBody.html = `<h1>${event.title}</h1>`;
        break;
      case "test":
        mailBody.subject = "Test Mail";
        mailBody.html = `<h1>Test mail to ${dest}</h1>`;
      default:
        break;
    }
    const info = await transporter.sendMail(mailBody);
  } catch (err) {
    console.log(err.message);
  }
};
