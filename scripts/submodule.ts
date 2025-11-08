#!/usr/bin/env ts-node

import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import * as simpleGit from "simple-git";
import { execSync } from "child_process";

const git = (simpleGit as any).default ? (simpleGit as any).default() : (simpleGit as any)();
const CONFIG_FILE = path.resolve(".submodules.json");
const MEDIA_DIR = path.resolve("media");

interface Submodule {
  name: string;
  repo: string;
  path: string;
  build?: {
    dist: string; // 构建产物目录
    copyToMedia?: boolean;
  };
}

interface Config {
  modules: Submodule[];
  settings?: {
    autoSync?: boolean;
  };
}

// ========== 工具函数 ==========
function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) return fs.readJSONSync(CONFIG_FILE);
  return { modules: [] };
}

function saveConfig(config: Config) {
  fs.writeJSONSync(CONFIG_FILE, config, { spaces: 2 });
  console.log(chalk.green("✅ 已更新 .submodules.json"));
}

function getModuleByName(name: string, config: Config): Submodule | undefined {
  return config.modules.find(m => m.name === name);
}

// ========== 基本命令 ==========

async function initConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow("⚠️ 配置文件已存在"));
    return;
  }
  saveConfig({ modules: [], settings: { autoSync: true } });
  console.log(chalk.green("✅ 已创建 .submodules.json"));
}

async function addSubmodule(repo?: string, localPath?: string, name?: string) {
  if (!repo || !localPath || !name) {
    const answers = await inquirer.prompt<{ name: string; repo: string; localPath: string }>([
      { type: "input", name: "name", message: "模块名称：" },
      { type: "input", name: "repo", message: "Git 仓库 URL：" },
      { type: "input", name: "localPath", message: "本地路径（相对当前项目）：" },
    ]);
    ({ repo, localPath, name } = answers);
  }

  const config = loadConfig();
  if (getModuleByName(name!, config)) {
    console.log(chalk.red("❌ 模块已存在"));
    return;
  }

  console.log(chalk.cyan(`📦 添加子模块 ${name}...`));
  await git.subModuleAdd(repo!, localPath!);

  // 询问构建目录
  const { dist, copyToMedia } = await inquirer.prompt<{ dist: string; copyToMedia: boolean }>([
    { type: "input", name: "dist", message: "构建产物目录（相对模块根目录）", default: "dist" },
    {
      name: "copyToMedia",
      type: "confirm",
      message: "构建完成后是否复制到 /media 目录？",
      default: true,
    },
  ]);

  config.modules.push({
    name: name!,
    repo: repo!,
    path: localPath!,
    build: { dist, copyToMedia },
  });

  saveConfig(config);
  console.log(chalk.green(`✅ 已添加 ${name}`));
}

async function updateAll() {
  console.log(chalk.cyan("🔄 更新所有子模块..."));
  await git.subModule(["update", "--init", "--recursive", "--remote"]);
  console.log(chalk.green("✅ 所有子模块已更新"));
}

async function syncSubmodules() {
  console.log(chalk.cyan("🔍 检查并同步子模块..."));
  try {
    await git.subModule(["sync", "--recursive"]);
    console.log(chalk.green("✅ 子模块已同步"));
  } catch (e) {
    console.log(chalk.red("❌ 同步失败"), e);
  }
}

async function removeSubmodule(name?: string) {
  const config = loadConfig();

  if (!name) {
    const result = await inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "选择要删除的模块：",
        choices: config.modules.map(m => m.name),
      },
    ]);
    name = result.name;
  }

  const mod = getModuleByName(name!, config);
  if (!mod) {
    console.log(chalk.red("❌ 未找到模块"));
    return;
  }

  console.log(chalk.cyan(`🗑 删除子模块 ${name}...`));
  await git.subModule(["deinit", "-f", mod.path]);
  await fs.remove(path.join(".git/modules", mod.path));
  await fs.remove(mod.path);

  config.modules = config.modules.filter(m => m.name !== name);
  saveConfig(config);

  console.log(chalk.green(`✅ 已删除 ${name}`));
}

// ========== 构建与同步 ==========
async function buildAll(ciMode = false) {
  const config = loadConfig();

  for (const mod of config.modules) {
    const modPath = path.resolve(mod.path);
    const distPath = path.resolve(modPath, mod.build?.dist || "dist");
    const copyTarget = path.resolve(MEDIA_DIR, mod.name);

    console.log(chalk.cyan(`🏗 构建 ${mod.name}...`));

    if (!fs.existsSync(path.join(modPath, "package.json"))) {
      console.log(chalk.yellow(`⚠️ 跳过 ${mod.name}（无 package.json）`));
      continue;
    }

    try {
      execSync("npm install", { cwd: modPath, stdio: ciMode ? "ignore" : "inherit" });
      execSync("npm run build", { cwd: modPath, stdio: ciMode ? "ignore" : "inherit" });
    } catch {
      console.error(chalk.red(`❌ 构建失败: ${mod.name}`));
      continue;
    }

    // 同步构建产物到 media
    if (mod.build?.copyToMedia) {
      if (!fs.existsSync(distPath)) {
        console.log(chalk.red(`❌ 构建目录不存在: ${distPath}`));
        continue;
      }
      await fs.ensureDir(copyTarget);
      await fs.copy(distPath, copyTarget);
      console.log(chalk.green(`✅ 已同步到 /media/${mod.name}`));
    }
  }

  console.log(chalk.green("🎉 所有模块构建完成"));
}

// ========== 主逻辑 ==========
async function main() {
  const [, , command, ...args] = process.argv;
  const ciMode = args.includes("--ci");

  switch (command) {
    case "init":
      await initConfig();
      break;
    case "add":
      await addSubmodule(args[0], args[1], args[2]);
      break;
    case "update":
      await updateAll();
      break;
    case "sync":
      await syncSubmodules();
      break;
    case "remove":
      await removeSubmodule(args[0]);
      break;
    case "build":
      await buildAll(ciMode);
      break;
    default:
      await interactiveMenu();
  }
}

// ========== 交互式菜单 ==========
async function interactiveMenu() {
  const { action } = await inquirer.prompt([
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
  ]);

  switch (action) {
    case "init":
      await initConfig();
      break;
    case "add":
      await addSubmodule();
      break;
    case "update":
      await updateAll();
      break;
    case "sync":
      await syncSubmodules();
      break;
    case "remove":
      await removeSubmodule();
      break;
    case "build":
      await buildAll();
      break;
    default:
      process.exit(0);
  }

  await interactiveMenu();
}

main();
