"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const download_controller_1 = require("../controllers/download.controller");
const router = express_1.default.Router();
// Admin API's
router.post("/", download_controller_1.generatePDF);
exports.default = router;
