"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const match_process_controller_1 = require("../controllers/match-process.controller");
const router = express_1.default.Router();
// Admin API's
router.get("/all", match_process_controller_1.getAllMatchProcesses);
router.get("/one", match_process_controller_1.getSpecificMatchProcess);
router.post("/add", match_process_controller_1.addMatchProcess);
exports.default = router;
