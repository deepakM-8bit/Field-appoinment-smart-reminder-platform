import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass:process.env.EMAIL_APP_PASS
    }
});

export async function sendEmail({to, subject, html}) {
    try{
        await transporter.sendMail({
            from:`Field Appointment System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        
        console.log("email sent to:", to);
    }catch(err){
        console.error("email sned failed:", err.message);
        throw err;
    }
    
}