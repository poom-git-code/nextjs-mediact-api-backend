export const sendEmail = async (to: string, subject: string, message: string) => {
    console.log(`Email sent to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    // คุณสามารถปรับให้เชื่อมต่อ SMTP หรือใช้บริการอีเมล เช่น Nodemailer, AWS SES
  };