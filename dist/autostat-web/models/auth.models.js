"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserModel = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../../database");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profile: { type: String, required: false },
    userID: { type: String },
    password: { type: String, required: true },
    organization: { type: String, required: true },
}, { collection: 'users' });
let UserModel = null;
const getUserModel = () => {
    if (!UserModel) {
        const hisMajesty = (0, database_1.getConnection)('hisMajesty');
        UserModel = hisMajesty.model('reviews', UserSchema);
    }
    return UserModel;
};
exports.getUserModel = getUserModel;
