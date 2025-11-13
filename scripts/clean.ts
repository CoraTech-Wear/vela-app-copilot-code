import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function cleanSubmodule(name: string) {
  const modulesPath = path.join('.git', 'modules', name);
  console.log(chalk.yellow(`🧹 清理子模块 ${name}`));

  try {
    execSync(`git rm --cached ${name}`, { stdio: 'inherit' });
  } catch { console.log('（忽略 rm 缓存错误）'); }

  try { fs.rmSync(name, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(modulesPath, { recursive: true, force: true }); } catch {}

  execSync(`git config -f .git/config --remove-section submodule.${name} || true`, { stdio: 'ignore' });

  console.log(chalk.green(`✅ 子模块 ${name} 已彻底清理完毕`));
}

