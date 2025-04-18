// Import necessary modules
require('dotenv').config();
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const User = require('../model/userModel');
const generateToken = require('../utils/generateToken');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// Configure Mailgen
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'YourAppName',
        link: 'https://yourappwebsite.com'
    }
});

// Registration function
exports.register = async (req, res) => {
    try {
        const { username, email, password ,phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create new user (password will be hashed in pre-save middleware)
        const newUser = new User({
            username,
            email,
            password,
            phoneNumber, // Do not hash here; it will be handled in the schema
            verificationCode
        });
        await newUser.save();

        // Configure email content
        const emailBody = {
            body: {
                name: username,
                intro: 'Thank you for registering with M.M scents!',
                action: {
                    instructions: 'Use this code to verify your email:',
                    button: {
                        color: '#22BC66',
                        text: `Verification Code: ${verificationCode}`,
                        link: 'https://yourappwebsite.com/verify'
                    }
                },
                outro: 'If you did not register, ignore this email.'
            }
        };

        // Send verification email
        const mailContent = mailGenerator.generate(emailBody);
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Email Verification - M.M scents',
            html: mailContent
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ msg: 'Registration successful. Check email for verification code.' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        // Check if the user is verified
        if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email before logging in' });

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password comparison failed");
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate a token
        const token = generateToken(user._id, user.isAdmin);

        res.status(200).json({
            message: 'Login successful',
            token,
            isAdmin: user.isAdmin,
            userId: user._id
        });
       
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error });
    }
};





exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: 'User not found' });
        if (user.verificationCode === code) {
            user.isVerified = true;
            user.verificationCode = null; // Clear code after verification
            await user.save();

            // Generate a token
            const token = generateToken(user._id, user.isAdmin);

            return res.status(200).json({
                msg: 'Email verified successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    token,
                    isAdmin: user.isAdmin
                }
            });
        } else {
            return res.status(400).json({ msg: 'Invalid verification code' });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).populate('Addtocard.ProductId'); // Populate ProductId for details
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};


// Controller function to get a user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password from the response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
};

 exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};


exports.getUserInfo = async (req, res) => {
    try {
        const userId = req.user.id; // اليوزر من التوكن
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [firstName, lastName] = user.username.split(' ');

        res.json({
            email: user.email,
            phone: user.phoneNumber,
            firstName: firstName || '',
            lastName: lastName || ''
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
      await sendEmail(email, 'Reset Your Password', `
        <p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>
      `);
  
      res.status(200).json({ message: "Reset link sent to email" });
    } catch (error) {
      res.status(500).json({ message: "Error sending reset link" });
    }
  };
  

  exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset Password Error:", error.message);
      res.status(400).json({ message: "Invalid or expired token" });
    }
  };