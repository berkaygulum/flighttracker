import nodemailer from "nodemailer";

export class EmailService {
  static async sendWeeklyReport(email: string, flightData: any[]) {
    // Generate test account if not provided
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e293b;">Haftalık Uçuş Raporu</h1>
        <p>Takip ettiğiniz rotalar için son fiyatlar ve değişimler:</p>
        <ul style="list-style: none; padding: 0;">
          ${flightData
        .map((f) => {
          const changeIcon = f.changeTRY < 0 ? "📉" : f.changeTRY > 0 ? "📈" : "➖";
          const changeText = f.changeTRY !== 0
            ? `<span style="color: ${f.changeTRY < 0 ? 'green' : 'red'}">(${f.changeTRY > 0 ? '+' : ''}${f.changeTRY.toFixed(2)} TRY)</span>`
            : "";

          return `
              <li style="background: #f8fafc; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-weight: bold; margin-bottom: 5px;">
                  ${f.route.origin} -> ${f.route.destination}
                </div>
                <div style="margin-bottom: 5px;">
                  ${new Date(f.current.flightDate).toLocaleDateString("tr-TR")}
                </div>
                <div style="font-size: 1.1em;">
                  ${f.current.priceTRY.toFixed(2)} TRY / ${f.current.priceEUR.toFixed(2)} EUR
                  ${changeIcon} ${changeText}
                </div>
                <div style="color: #64748b; font-size: 0.9em; margin-bottom: 10px;">
                  ${f.current.airline}
                </div>
                <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Detayları Gör
                </a>
              </li>`;
        })
        .join("")}
        </ul>
      </div>
    `;

    const mailOptions = {
      from: '"Flight Tracker" <noreply@flighttracker.com>',
      to: email,
      subject: "Haftalık Uçuş Raporunuz",
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error("Error sending weekly report:", error);
    }
  }

  static async sendPriceAlert(to: string, route: string, date: string, price: string, airline: string) {
    // Generate test account if not provided
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: '"Flight Tracker" <noreply@flighttracker.com>',
      to,
      subject: `Fiyat Alarmı: ${route} - ${date}`,
      html: `
            <h2>Uçuş Fiyat Alarmı</h2>
            <p>Takip ettiğiniz uçuş için güncel en uygun fiyat:</p>
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
                <p><strong>Rota:</strong> ${route}</p>
                <p><strong>Tarih:</strong> ${date}</p>
                <p><strong>Havayolu:</strong> ${airline}</p>
                <p><strong>Fiyat:</strong> <span style="color: green; font-weight: bold;">${price}</span></p>
            </div>
            <p>Daha fazla detay için panele giriş yapabilirsiniz.</p>
        `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Price alert sent to ${to}`);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error("Error sending price alert:", error);
    }
  }
}
