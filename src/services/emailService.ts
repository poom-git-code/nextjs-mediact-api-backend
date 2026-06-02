import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com", // เปลี่ยนเป็น SMTP server ของคุณ
  port: 587,
  secure: false, // true สำหรับ port 465, false สำหรับ port อื่นๆ
  auth: {
    user: "your-email@example.com", // เปลี่ยนเป็นอีเมลของคุณ
    pass: "your-email-password", // เปลี่ยนเป็นรหัสผ่านของคุณ
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: '"Your Name" <your-email@example.com>', // เปลี่ยนเป็นชื่อและอีเมลของคุณ
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: " + error);
    throw error;
  }
};