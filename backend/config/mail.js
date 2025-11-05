import { createTransport } from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const sendEmail = async (to, subject, html) => {
  try {
    // console.log(to, subject, text);

    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // console.log("to, subject, text", transporter);

    await transporter.sendMail({
      from: `"NetCafeteria" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Email not sent");
  }
};

export default sendEmail;
