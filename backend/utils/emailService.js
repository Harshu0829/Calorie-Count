const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    // Check if using Gmail or custom SMTP
    // Default to 'gmail' if EMAIL_SERVICE is 'gmail' OR (EMAIL_SERVICE is not set AND SMTP_HOST is not set)
    const useGmail = process.env.EMAIL_SERVICE === 'gmail' || (!process.env.EMAIL_SERVICE && !process.env.SMTP_HOST);

    if (useGmail) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD // Use App Password
            }
        });
    } else {
        // Custom SMTP configuration
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        // DEV FALLBACK: If credentials are missing or default, log to console
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
            console.log('================================================');
            console.log(' 📧 [DEV MODE] Mock Email Service');
            console.log(` To: ${email}`);
            console.log(` Subject: Password Reset Request`);
            console.log(` Link: ${resetUrl}`);
            console.log('================================================');
            return { success: true };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"FitTrack" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - FitTrack',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 10px;
                            padding: 30px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 10px;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName || 'there'},</p>
                            
                            <p>We received a request to reset your password for your FitTrack account.</p>
                            
                            <p>Click the button below to reset your password:</p>
                            
                            <center>
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </center>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                            </div>
                            
                            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                            
                            <p>Best regards,<br><strong>The FitTrack Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email (optional)
const sendWelcomeEmail = async (email, userName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"FitTrack" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to FitTrack! 🎉',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 10px;
                            padding: 30px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to FitTrack!</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName},</p>
                            
                            <p>Welcome to FitTrack! We're excited to have you on board.</p>
                            
                            <p>Start tracking your nutrition, achieving your fitness goals, and living a healthier life!</p>
                            
                            <p>Best regards,<br><strong>The FitTrack Team</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail
};
