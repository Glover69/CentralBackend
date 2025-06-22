"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../utils/fileUpload");
const router = express_1.default.Router();
router.post("/upload", fileUpload_1.uploadImage);
exports.default = router;
