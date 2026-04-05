require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(">>> BOOTING SERVER...");

// 1. GLOBAL CORS & PREFLIGHT HANDLER (Immediate response)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }
    next();
});

// 2. Serve static files (Frontend)
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
    console.log(">>> Health check hit!");
    res.status(200).send('City Service Portal works!');
});

// 3. Middlewares
app.use(express.json());
app.use(cors());

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint to send emails
app.post('/send-email', async (req, res) => {
    const { toEmail, complaintId, title, category, description, location, status } = req.body;

    if (!toEmail || !complaintId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Determine target email based on category
    let targetEmail = toEmail; // default to user email
    let intendedDepartment = 'General Support';
    let subjectPrefix = 'Complaint Registered';

    if (category === 'Water Problem') {
        targetEmail = 'watertests12@gmail.com';
        intendedDepartment = 'watertests12@gmail.com (Water Department)';
        subjectPrefix = 'Urgent: Water Issue';
    } else if (category === 'Road Issue') {
        targetEmail = 'roadtests12@gmail.com';
        intendedDepartment = 'roadtests12@gmail.com (Road Department)';
        subjectPrefix = 'Urgent: Road Damage Alert';
    } else {
        targetEmail = 'electrictytest12@gmail.com';
        intendedDepartment = 'electrictytest12@gmail.com (Electricity Department)';
        subjectPrefix = 'Urgent: Power/Electricity Fault';
    }

    try {
        const emailContent = `
                <div style="font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #1e003b, #07030e, #8e2de2); padding: 40px; color: #ffffff;">
                    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); max-width: 600px; margin: 0 auto; color: #ffffff;">
                        <h2 style="text-align: center; color: #00d2ff; margin-top: 0; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);">City Service Portal</h2>
                        <h3 style="text-align: center; margin-bottom: 30px; letter-spacing: 1px;">New Complaint Registered</h3>
                        
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9);">Hello,</p>
                        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9);">A new <strong>${category}</strong> complaint has been successfully registered in our system. Please review the details below:</p>
                        
                        <div style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 20px; margin-top: 25px;">
                            <table style="width: 100%; border-collapse: collapse; color: #ffffff;">
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; width: 40%; color: rgba(255, 255, 255, 0.8);">Complaint ID</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #00d2ff; font-weight: 500;">#${complaintId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Internal Routing</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #38ef7d; font-weight: bold;">${intendedDepartment}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Category</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${category || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Title</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${title}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Description</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${description || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Location</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${location || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: 600; color: rgba(255, 255, 255, 0.8);">Status</td>
                                    <td style="padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: #f39c12; font-weight: bold;">${status}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 10px; font-weight: 600; color: rgba(255, 255, 255, 0.8);">Submitted By</td>
                                    <td style="padding: 12px 10px;">${toEmail}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="margin-top: 35px; text-align: center;">
                            <a href="#" style="background: linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(58, 123, 213, 0.4);">View Dashboard</a>
                        </div>
                        <p style="margin-top: 30px; font-size: 14px; text-align: center; color: rgba(255,255,255,0.6);">Thank you for helping us serve the city better.</p>
                    </div>
                </div>
            `;

        // Send email with Nodemailer
        const info = await transporter.sendMail({
            from: `"City Service Portal" <${process.env.EMAIL_USER}>`,
            to: targetEmail.split(',').map(e => e.trim()), 
            subject: `${subjectPrefix} - #${complaintId} (${title})`,
            html: emailContent,
        });

        res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Unexpected Internal Error:', error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server is running on port ${PORT}`);
});
