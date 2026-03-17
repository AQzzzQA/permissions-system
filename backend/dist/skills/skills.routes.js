"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skills_controller_1 = __importDefault(require("../skills/skills.controller"));
const router = (0, express_1.Router)();
// 技能管理路由
router.use('/skills', skills_controller_1.default);
exports.default = router;
