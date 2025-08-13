"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auth.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_models_1 = require("../models/user.models");
const uuid_1 = require("uuid");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
const otp_verification_models_1 = require("../models/otp-verification.models");
const secret_models_1 = require("../models/secret.models");
dotenv.config();
// Nodemailer
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const router = express_1.default.Router();
const SECRET_KEY = "your-secret-key"; // Same as in auth middleware
// Mock user database (replace with actual database in production)
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        // Check if user already exists
        const existingUser = yield user_models_1.UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const customerID = (0, uuid_1.v4)();
        const userData = {
            customerID,
            email,
            emails: [
                {
                    email: email,
                    verified: false,
                },
            ],
            //   password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            verified: false,
        };
        const secretData = {
            password: hashedPassword,
            customerID,
        };
        const savedUser = yield user_models_1.UserModel.create(userData);
        //     sendOTPVerificationCode(customerID, email)
        // });
        const savedSecret = yield secret_models_1.SecretModel.create(secretData);
        // Create a request object for sending OTP
        const otpRequest = {
            body: {
                customerID: userData.customerID,
                email: userData.email,
            },
        };
        // Send OTP verification code
        yield sendOTPVerificationCode(otpRequest);
        res.status(201).json({
            message: "User registered successfully. Verification Code sent.",
            user: { email: savedUser.email, customerID: savedUser.customerID },
        });
        // // Generate JWT
        // const token = jwt.sign({ id: userData.customerID }, SECRET_KEY, {
        //   expiresIn: "1h",
        // });
        // if (savedUser && savedSecret) {
        //   res.status(201).json({
        //     message: "User registered successfully",
        //     token,
        //     user: { email: savedUser.email, customerID: savedUser.customerID },
        //   });
        // }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if the user exists
        const user = yield user_models_1.UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        // Check if the user is verified
        if (!user.verified) {
            const otpRequest = {
                body: {
                    customerID: user.customerID,
                    email: user.email,
                },
            };
            // Send OTP verification code
            yield sendOTPVerificationCode(otpRequest);
            // return res.status(401).json({ error: "User not verified. OTP sent." });
            // Return a 200 response with a prompt
            return res.status(200).json({
                message: "User not verified, OTP sent.",
                user: { email: user.email, customerID: user.customerID },
            });
        }
        // Fetch hashed password from SecretModel
        const secret = yield secret_models_1.SecretModel.findOne({ userID: user._id });
        if (!secret) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        // Compare provided password with stored hash
        const isPasswordValid = yield bcrypt_1.default.compare(password, secret.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.customerID, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({
            token,
            user: { email: user.email, customerID: user.customerID },
        });
    }
    catch (error) {
        console.error("Error in /signin route:", error.message);
        res.status(500).json({ error: "Server error: " + error.message });
    }
}));
router.post("/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerID, otp, email } = req.body;
        if (!customerID || !otp) {
            return res.status(400).json({
                status: "Failed",
                error: "Empty OTP details are not allowed.",
            });
        }
        else {
            const otpRecords = yield otp_verification_models_1.OTPVerificationModel.find({
                customerID,
            });
            if (otpRecords.length <= 0) {
                return res.status(404).json({
                    status: "Failed",
                    error: "Account record does not exist or has been verified already.",
                });
            }
            else {
                const { expiresAt } = otpRecords[0];
                const hashedOTP = otpRecords[0].otp;
                if (expiresAt.getTime() < Date.now()) {
                    yield otp_verification_models_1.OTPVerificationModel.deleteMany({ customerID });
                    return res.status(400).json({
                        status: "Failed",
                        error: "Code has expired. Please try requesting another.",
                    });
                }
                else {
                    const isMatch = yield bcrypt_1.default.compare(otp, hashedOTP);
                    if (!isMatch) {
                        return res.status(400).json({
                            status: "Failed",
                            error: "Invalid OTP. Please check your email for the correct OTP.",
                        });
                    }
                    else {
                        // If OTP is valid, update the user's verification status
                        // await UserModel.updateOne(
                        //   { customerID: customerID },
                        //   { verified: true },
                        //   { emails: {email: email, verified: true}}
                        // );
                        yield user_models_1.UserModel.updateOne({ customerID, "emails.email": email }, // Match the customer and the specific email
                        {
                            $set: {
                                "emails.$.verified": true, // Use the positional operator to update the correct element in the array
                                verified: true, // Update the top-level verified status as well
                            },
                        });
                        yield otp_verification_models_1.OTPVerificationModel.deleteOne({ customerID });
                        // Generate JWT token
                        const token = jsonwebtoken_1.default.sign({ id: customerID }, SECRET_KEY, {
                            expiresIn: "1h",
                        });
                        return res.status(200).json({
                            status: "Success",
                            message: "Account successfully verified.",
                            token,
                            user: { customerID },
                        });
                    }
                }
            }
        }
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            status: "Failed",
            error: "An error occurred while verifying the OTP. Please try again later.",
            details: error.message,
        });
    }
}));
router.post("/resend-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerID, email } = req.body;
        if (!customerID || !email) {
            return res.status(400).json({
                status: "Failed",
                error: "Empty user details are not allowed.",
            });
        }
        else {
            yield otp_verification_models_1.OTPVerificationModel.deleteMany({ customerID });
            // Create a request object for sending OTP
            const otpRequest = {
                body: {
                    customerID: customerID,
                    email: email,
                },
            };
            yield sendOTPVerificationCode(otpRequest);
        }
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({
            status: "Failed",
            error: "An error occurred while resending the OTP. Please try again later.",
            details: error.message,
        });
    }
}));
// // Generate a password reset token
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;
//     // Check if the user exists
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     // Generate a reset token
//     const resetToken = crypto.randomBytes(20).toString('hex');
//     user.resetToken = resetToken;
//     user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
//     await user.save();
//  res.status(200).json({ message: 'Password reset token sent' });
//   } catch (error) {
//     console.error('Error generating reset token:', error);
//     res.status(500).json({ error: 'An error occurred while generating the reset token' });
//   }
// });
// // Reset password using the reset token
// router.post('/reset-password', async (req, res) => {
//   try {
//     const { resetToken, newPassword } = req.body;
//     // Find the user with the provided reset token
//     const user = await UserModel.findOne({
//       resetToken,
//       resetTokenExpiration: { $gt: Date.now() },
//     });
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid or expired reset token' });
//     }
//     // Encrypt and hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);
//     // Update the user's password and reset token fields
//     user.password = hashedPassword;
//     user.resetToken = undefined;
//     user.resetTokenExpiration = undefined;
//     await user.save();
//     res.status(200).json({ message: 'Password reset successful' });
//   } catch (error) {
//     console.error('Error resetting password:', error);
//     res.status(500).json({ error: 'An error occurred while resetting the password' });
//   }
// });
function sendOTPVerificationCode(req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log("SMTP Host:", process.env.SMTP_HOST);
            // console.log("SMTP Port:", process.env.SMTP_PORT);
            // console.log("SMTP User:", process.env.SMTP_USER);
            const { customerID, email } = req.body;
            // Generate OTP
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
            const saltrounds = 10;
            const hashedOTP = yield bcrypt_1.default.hash(otp, saltrounds);
            // Prepare email options
            const mailOptions = {
                from: "CVGen",
                to: email,
                subject: "CVGen: Verification Code",
                html: `<span>Your OTP code is: <b>${otp}</b>. This expires in 1 hour.</span>`, // HTML body
            };
            // Save OTP to database
            const body = {
                customerID: customerID,
                otp: hashedOTP,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000, // 1 hour
            };
            yield otp_verification_models_1.OTPVerificationModel.create(body);
            // Send email
            yield transporter.sendMail(mailOptions);
            // Return success
            return { success: true, message: "Verification Code sent." };
        }
        catch (error) {
            console.error("Error sending OTP verification code:", error);
            return { success: false, message: "Failed to send verification code." };
        }
    });
}
exports.default = router;
