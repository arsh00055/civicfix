import nodemailer from 'nodemailer';

interface EmailProps {
    to: string;

    subject: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendEmail({ to, subject, html }: EmailProps) {
    try {
        const mailOptions = {
            from: `"CivicFix" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, data: info };
        
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}