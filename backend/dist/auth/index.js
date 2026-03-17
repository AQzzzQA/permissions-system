"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const qq_binding_controller_1 = __importDefault(require("./qq-binding.controller"));
const router = (0, express_1.Router)();
// 原有的认证路由
router.use('/', auth_controller_1.default);
// QQ 绑定路由
router.post('/bind-admin', (req, res, next) => (0, qq_binding_controller_1.default)(req, res, next));
router.post('/bind-client', (req, res, next) => (0, qq_binding_controller_1.default)(req, res, next));
router.get('/user-by-qq/:qq', (req, res, next) => (0, qq_binding_controller_1.default)(req, res, next));
router.post('/generate-invite', (req, res, next) => (0, qq_binding_controller_1.default)(req, res, next));
exports.default = router;
