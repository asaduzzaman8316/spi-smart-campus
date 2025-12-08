const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email service configuration error:', error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

/**
 * Send account creation email to teacher
 * @param {string} teacherEmail - Teacher's email address
 * @param {string} teacherName - Teacher's name
 * @param {string} password - Generated password
 */
const sendAccountCreationEmail = async (teacherEmail, teacherName, password) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM || 'SPI Smart Campus'}" <${process.env.EMAIL_USER}>`,
            to: teacherEmail,
            subject: 'Welcome to SPI Smart Campus - Your Account Details',
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
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .credentials-box {
                            background: white;
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .credential-item {
                            margin: 10px 0;
                        }
                        .credential-label {
                            font-weight: bold;
                            color: #667eea;
                        }
                        .credential-value {
                            font-family: 'Courier New', monospace;
                            background: #f0f0f0;
                            padding: 8px 12px;
                            border-radius: 4px;
                            display: inline-block;
                            margin-top: 5px;
                        }
                        .button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            color: #666;
                            font-size: 12px;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Welcome to SPI Smart Campus!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${teacherName},</p>
                        
                        <p>Your teacher account has been successfully created by the administrator. You can now access the SPI Smart Campus dashboard to manage your classes and routines.</p>
                        
                        <div class="credentials-box">
                            <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
                            
                            <div class="credential-item">
                                <div class="credential-label">Email Address:</div>
                                <div class="credential-value">${teacherEmail}</div>
                            </div>
                            
                            <div class="credential-item">
                                <div class="credential-label">Password:</div>
                                <div class="credential-value">${password}</div>
                            </div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important Security Notice:</strong>
                            <ul style="margin: 10px 0;">
                                <li>Please change your password after your first login</li>
                                <li>Do not share your credentials with anyone</li>
                                <li>Keep this email secure or delete it after changing your password</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button text-white">
                                Login to Dashboard
                            </a>
                        </div>
                        
                        <p>If you have any questions or need assistance, please contact the administrator.</p>
                        
                        <p>Best regards,<br>
                        <strong>SPI Smart Campus Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} SPI Smart Campus. All rights reserved.</p>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send account deletion notification email to teacher
 * @param {string} teacherEmail - Teacher's email address
 * @param {string} teacherName - Teacher's name
 */
const sendAccountDeletionEmail = async (teacherEmail, teacherName) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM || 'SPI Smart Campus'}" <${process.env.EMAIL_USER}>`,
            to: teacherEmail,
            subject: 'SPI Smart Campus - Account Deletion Notice',
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
                        .header {
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .info-box {
                            background: white;
                            border-left: 4px solid #ef4444;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Account Deletion Notice</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${teacherName},</p>
                        
                        <p>We are writing to inform you that your teacher account on SPI Smart Campus has been deleted by the administrator.</p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #ef4444;">Account Details</h3>
                            <p><strong>Email:</strong> ${teacherEmail}</p>
                            <p><strong>Deletion Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <p>As a result of this deletion:</p>
                        <ul>
                            <li>You will no longer be able to access the SPI Smart Campus dashboard</li>
                            <li>Your login credentials have been removed from the system</li>
                            <li>All associated data has been archived</li>
                        </ul>
                        
                        <p>If you believe this was done in error or if you have any questions, please contact the administrator immediately.</p>
                        
                        <p>Best regards,<br>
                        <strong>SPI Smart Campus Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} SPI Smart Campus. All rights reserved.</p>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Account deletion email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending deletion email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendAccountCreationEmail,
    sendAccountDeletionEmail
};
