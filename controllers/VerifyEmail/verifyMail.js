import nodemailer from 'nodemailer';

// Configure the transport options using Mailtrap credentials
var transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: "api",
        pass: "170cb24dbf3d1da78197d663bf50a916"
    }
});
function generateVerificationCode() {
    let digits = '0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += digits[Math.floor(Math.random() * 10)];
    }
    return code;
}

export default async function SendVerificationEmail(tempUser) {
    const verificationCode = generateVerificationCode();
    tempUser.verificationCode = verificationCode;
    await tempUser.save();
    const mailOptions = {
        from: 'treasure.find.oni2024@treasurefindonigim.cloud',
        to: [tempUser.email],                // Recipient's email
        subject: 'Verificați adresa de e-mail',
        text: `Vă rugăm să folosiți următorul cod pentru a verifica adresa de e-mail: ${verificationCode}`, // Fallback text version
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px;">
          <h1 style="color: #007BFF;">Bine ați venit la OniGim 2024!</h1>
          <p style="font-size: 16px; color: #666;">Vă mulțumim că v-ați înregistrat! Vă rugăm să verificați adresa de e-mail pentru a începe!</p>
          <div style="margin: 20px;">
            <p style="font-size: 24px; font-weight: bold; color: #000;">Cod de verificare:</p>
            <div style="background-color: #E0E0E0; padding: 10px; margin: 20px auto; width: 200px; font-size: 22px; font-weight: bold; border-radius: 5px; color: #000;">
              ${verificationCode}
            </div>
            <p style="font-size: 16px; color: #666;">Introduceți acest cod în aplicație pentru a completa procesul de înregistrare.</p>
          </div>
          <footer style="font-size: 12px; color: #777; margin-top: 20px;">
            <p>Dacă nu ați solicitat acest e-mail, vă rugăm să-l ignorați.</p>
          </footer>
        </div>
      `,
    };

    try {
        //let info = 
        await transporter.sendMail(mailOptions);
        //console.log("Verification email sent successfully", info);
    } catch (error) {
        console.error("Failed to send verification email", error);
    }
}
