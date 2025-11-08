#!/usr/bin/env ts-node
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var inquirer_1 = require("inquirer");
var chalk_1 = require("chalk");
var simpleGit = require("simple-git");
var child_process_1 = require("child_process");
var git = simpleGit.default ? simpleGit.default() : simpleGit();
var CONFIG_FILE = path_1.default.resolve(".submodules.json");
var MEDIA_DIR = path_1.default.resolve("media");
// ========== 工具函数 ==========
function loadConfig() {
    if (fs_extra_1.default.existsSync(CONFIG_FILE))
        return fs_extra_1.default.readJSONSync(CONFIG_FILE);
    return { modules: [] };
}
function saveConfig(config) {
    fs_extra_1.default.writeJSONSync(CONFIG_FILE, config, { spaces: 2 });
    console.log(chalk_1.default.green("✅ 已更新 .submodules.json"));
}
function getModuleByName(name, config) {
    return config.modules.find(function (m) { return m.name === name; });
}
// ========== 基本命令 ==========
function initConfig() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (fs_extra_1.default.existsSync(CONFIG_FILE)) {
                console.log(chalk_1.default.yellow("⚠️ 配置文件已存在"));
                return [2 /*return*/];
            }
            saveConfig({ modules: [], settings: { autoSync: true } });
            console.log(chalk_1.default.green("✅ 已创建 .submodules.json"));
            return [2 /*return*/];
        });
    });
}
function addSubmodule(repo, localPath, name) {
    return __awaiter(this, void 0, void 0, function () {
        var answers, config, _a, dist, copyToMedia;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(!repo || !localPath || !name)) return [3 /*break*/, 2];
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            { type: "input", name: "name", message: "模块名称：" },
                            { type: "input", name: "repo", message: "Git 仓库 URL：" },
                            { type: "input", name: "localPath", message: "本地路径（相对当前项目）：" },
                        ])];
                case 1:
                    answers = _b.sent();
                    (repo = answers.repo, localPath = answers.localPath, name = answers.name);
                    _b.label = 2;
                case 2:
                    config = loadConfig();
                    if (getModuleByName(name, config)) {
                        console.log(chalk_1.default.red("❌ 模块已存在"));
                        return [2 /*return*/];
                    }
                    console.log(chalk_1.default.cyan("\uD83D\uDCE6 \u6DFB\u52A0\u5B50\u6A21\u5757 ".concat(name, "...")));
                    return [4 /*yield*/, git.subModuleAdd(repo, localPath)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            { type: "input", name: "dist", message: "构建产物目录（相对模块根目录）", default: "dist" },
                            {
                                name: "copyToMedia",
                                type: "confirm",
                                message: "构建完成后是否复制到 /media 目录？",
                                default: true,
                            },
                        ])];
                case 4:
                    _a = _b.sent(), dist = _a.dist, copyToMedia = _a.copyToMedia;
                    config.modules.push({
                        name: name,
                        repo: repo,
                        path: localPath,
                        build: { dist: dist, copyToMedia: copyToMedia },
                    });
                    saveConfig(config);
                    console.log(chalk_1.default.green("\u2705 \u5DF2\u6DFB\u52A0 ".concat(name)));
                    return [2 /*return*/];
            }
        });
    });
}
function updateAll() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(chalk_1.default.cyan("🔄 更新所有子模块..."));
                    return [4 /*yield*/, git.subModule(["update", "--init", "--recursive", "--remote"])];
                case 1:
                    _a.sent();
                    console.log(chalk_1.default.green("✅ 所有子模块已更新"));
                    return [2 /*return*/];
            }
        });
    });
}
function syncSubmodules() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(chalk_1.default.cyan("🔍 检查并同步子模块..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.subModule(["sync", "--recursive"])];
                case 2:
                    _a.sent();
                    console.log(chalk_1.default.green("✅ 子模块已同步"));
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log(chalk_1.default.red("❌ 同步失败"), e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function removeSubmodule(name) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result, mod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = loadConfig();
                    if (!!name) return [3 /*break*/, 2];
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                name: "name",
                                type: "list",
                                message: "选择要删除的模块：",
                                choices: config.modules.map(function (m) { return m.name; }),
                            },
                        ])];
                case 1:
                    result = _a.sent();
                    name = result.name;
                    _a.label = 2;
                case 2:
                    mod = getModuleByName(name, config);
                    if (!mod) {
                        console.log(chalk_1.default.red("❌ 未找到模块"));
                        return [2 /*return*/];
                    }
                    console.log(chalk_1.default.cyan("\uD83D\uDDD1 \u5220\u9664\u5B50\u6A21\u5757 ".concat(name, "...")));
                    return [4 /*yield*/, git.subModule(["deinit", "-f", mod.path])];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.remove(path_1.default.join(".git/modules", mod.path))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.remove(mod.path)];
                case 5:
                    _a.sent();
                    config.modules = config.modules.filter(function (m) { return m.name !== name; });
                    saveConfig(config);
                    console.log(chalk_1.default.green("\u2705 \u5DF2\u5220\u9664 ".concat(name)));
                    return [2 /*return*/];
            }
        });
    });
}
// ========== 构建与同步 ==========
function buildAll() {
    return __awaiter(this, arguments, void 0, function (ciMode) {
        var config, _i, _a, mod, modPath, distPath, copyTarget;
        var _b, _c;
        if (ciMode === void 0) { ciMode = false; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    config = loadConfig();
                    _i = 0, _a = config.modules;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    mod = _a[_i];
                    modPath = path_1.default.resolve(mod.path);
                    distPath = path_1.default.resolve(modPath, ((_b = mod.build) === null || _b === void 0 ? void 0 : _b.dist) || "dist");
                    copyTarget = path_1.default.resolve(MEDIA_DIR, mod.name);
                    console.log(chalk_1.default.cyan("\uD83C\uDFD7 \u6784\u5EFA ".concat(mod.name, "...")));
                    if (!fs_extra_1.default.existsSync(path_1.default.join(modPath, "package.json"))) {
                        console.log(chalk_1.default.yellow("\u26A0\uFE0F \u8DF3\u8FC7 ".concat(mod.name, "\uFF08\u65E0 package.json\uFF09")));
                        return [3 /*break*/, 4];
                    }
                    try {
                        (0, child_process_1.execSync)("npm install", { cwd: modPath, stdio: ciMode ? "ignore" : "inherit" });
                        (0, child_process_1.execSync)("npm run build", { cwd: modPath, stdio: ciMode ? "ignore" : "inherit" });
                    }
                    catch (_e) {
                        console.error(chalk_1.default.red("\u274C \u6784\u5EFA\u5931\u8D25: ".concat(mod.name)));
                        return [3 /*break*/, 4];
                    }
                    if (!((_c = mod.build) === null || _c === void 0 ? void 0 : _c.copyToMedia)) return [3 /*break*/, 4];
                    if (!fs_extra_1.default.existsSync(distPath)) {
                        console.log(chalk_1.default.red("\u274C \u6784\u5EFA\u76EE\u5F55\u4E0D\u5B58\u5728: ".concat(distPath)));
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, fs_extra_1.default.ensureDir(copyTarget)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, fs_extra_1.default.copy(distPath, copyTarget)];
                case 3:
                    _d.sent();
                    console.log(chalk_1.default.green("\u2705 \u5DF2\u540C\u6B65\u5230 /media/".concat(mod.name)));
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    console.log(chalk_1.default.green("🎉 所有模块构建完成"));
                    return [2 /*return*/];
            }
        });
    });
}
// ========== 主逻辑 ==========
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, command, args, ciMode, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = process.argv, command = _a[2], args = _a.slice(3);
                    ciMode = args.includes("--ci");
                    _b = command;
                    switch (_b) {
                        case "init": return [3 /*break*/, 1];
                        case "add": return [3 /*break*/, 3];
                        case "update": return [3 /*break*/, 5];
                        case "sync": return [3 /*break*/, 7];
                        case "remove": return [3 /*break*/, 9];
                        case "build": return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 1: return [4 /*yield*/, initConfig()];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 3: return [4 /*yield*/, addSubmodule(args[0], args[1], args[2])];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 5: return [4 /*yield*/, updateAll()];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 7: return [4 /*yield*/, syncSubmodules()];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 9: return [4 /*yield*/, removeSubmodule(args[0])];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 11: return [4 /*yield*/, buildAll(ciMode)];
                case 12:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, interactiveMenu()];
                case 14:
                    _c.sent();
                    _c.label = 15;
                case 15: return [2 /*return*/];
            }
        });
    });
}
// ========== 交互式菜单 ==========
function interactiveMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var action, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        {
                            name: "action",
                            type: "list",
                            message: "选择操作：",
                            choices: [
                                { name: "初始化配置文件", value: "init" },
                                { name: "添加子模块", value: "add" },
                                { name: "同步子模块配置", value: "sync" },
                                { name: "更新所有子模块", value: "update" },
                                { name: "删除子模块", value: "remove" },
                                { name: "构建并同步所有模块", value: "build" },
                                { name: "退出", value: "exit" },
                            ],
                        },
                    ])];
                case 1:
                    action = (_b.sent()).action;
                    _a = action;
                    switch (_a) {
                        case "init": return [3 /*break*/, 2];
                        case "add": return [3 /*break*/, 4];
                        case "update": return [3 /*break*/, 6];
                        case "sync": return [3 /*break*/, 8];
                        case "remove": return [3 /*break*/, 10];
                        case "build": return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 14];
                case 2: return [4 /*yield*/, initConfig()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 4: return [4 /*yield*/, addSubmodule()];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 6: return [4 /*yield*/, updateAll()];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 8: return [4 /*yield*/, syncSubmodules()];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 10: return [4 /*yield*/, removeSubmodule()];
                case 11:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 12: return [4 /*yield*/, buildAll()];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 14:
                    process.exit(0);
                    _b.label = 15;
                case 15: return [4 /*yield*/, interactiveMenu()];
                case 16:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
