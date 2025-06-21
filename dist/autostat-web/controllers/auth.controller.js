"use strict";
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
exports.signupAdmin = exports.loginAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const auth_models_1 = require("../models/auth.models");
dotenv_1.default.config();
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield auth_models_1.UserModel.findOne({ email: email });
        if (!user) {
            res.status(400).json({ error: "Email does't exist in our database" });
            return;
        }
        // Check password against the user's hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.userID, email: user.email }, process.env.AUTOSTAT_JWT_SECRET, { expiresIn: "1h" });
        res.json({ token: token, admin: { email: user.email, firstName: user.firstName, lastName: user.lastName, organization: user.organization, userID: user.userID }, });
    }
    catch (error) {
        console.error("Login error:", error);
        res
            .status(500)
            .json({ message: "Unable to process login at this time", error: error });
    }
});
exports.loginAdmin = loginAdmin;
// Sign a new admin up
const signupAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, profile, organization } = req.body;
    // Check if user already exists
    const existingUser = yield auth_models_1.UserModel.findOne({ email: email });
    if (existingUser) {
        res.status(400).json({ error: "This email already exists. Try logging in instead" });
        return;
    }
    // Hash password
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    const userID = `adm-${(0, uuid_1.v4)()}`;
    // Structure for user's data
    const userData = {
        userID,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profile,
        organization
    };
    // Save structure to database
    yield auth_models_1.UserModel.create(userData);
    // Generate verification token
    const token = jsonwebtoken_1.default.sign({ email }, process.env.AUTOSTAT_JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({
        message: "Onboarded user successfully.",
        admin: userData,
        token: token
    });
});
exports.signupAdmin = signupAdmin;
