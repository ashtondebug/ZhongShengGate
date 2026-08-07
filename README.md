# 众生界 · ZhongShengGate

东方幻想题材的灵能战略 RPG 网页游戏（Alpha 原型）。

![version](https://img.shields.io/badge/version-0.1.0-blue)
![react](https://img.shields.io/badge/react-19-61DAFB)
![typescript](https://img.shields.io/badge/typescript-5.8-3178C6)
![vite](https://img.shields.io/badge/vite-6-646CFF)
![build](https://img.shields.io/badge/build-passing-brightgreen)
![tests](https://img.shields.io/badge/tests-26%20passed-brightgreen)
![license](https://img.shields.io/badge/license-MIT-green)

> 官方仓库：[GitHub](https://github.com/ashtondebug/ZhongShengGate) ｜ 国内镜像：[GitCode](https://gitcode.com/2302_80290412/ZhongShengGate)（仅供国内访问与部署，**请通过 GitHub 参与贡献**）

## 项目简介

《众生界》是一款运行于浏览器中的东方幻想战略 RPG。玩家作为初入「众生界」的探索者，沿「探索 → 获取资源 → 强化能力 → 解锁区域 → 挑战更强领域」的核心循环成长，逐步揭开世界背后的秘密。

当前为可玩的 Alpha 原型，纯前端实现、无后端依赖、可离线运行；架构已为后续多人化（Supabase / WebSocket）预留扩展。

## 功能特性

- 三条命运之道：人类探索者 / 灵能觉醒者 / 异界行者，差异化初始属性与能力
- 节点式战略地图：区域解锁、危险等级、资源情报、路线连接
- 随机探索事件：资源、战斗、剧情三类，属性判定分支与多结局
- 回合制战斗：普通攻击 / 技能 / 防御 / 撤退，元素克制、冷却与灵力消耗
- 能力树：空间、御灵、元素、感知多系灵能，支持学习与升级
- 任务系统：委托板接取、进度追踪（猎杀 / 收集 / 探索）、达标领取奖励
- 背包系统：消耗品 / 材料 / 遗物分类管理，支持使用与出售
- 隐藏 BOSS：特定区域、等级与概率条件触发的隐秘强敌
- 彩蛋：主界面连点标题即可发掘隐藏奖励
- 程序化音效与 BGM：基于 Web Audio API 实时合成，无外部资源
- 玻璃拟态界面：磨砂玻璃质感，全页面响应式适配
- 本地自动存档：游戏进度持久化于浏览器 localStorage

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
| --- | --- |
| Node.js | ≥ 20（推荐 22 / 24） |
| npm | ≥ 10 |

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（自动打开浏览器）
npm run dev
```

Windows 用户亦可直接双击 `install.bat` 与 `start.bat`。

### 构建与测试

```bash
# 类型检查
npm run typecheck

# 单元测试
npm test

# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | React 19、TypeScript 5.8 |
| 构建 | Vite 6、Tailwind CSS 4 |
| 动画 | Framer Motion |
| 图标 | Font Awesome 6 |
| 音频 | Web Audio API（程序化合成） |
| 测试 | Vitest |

## 项目结构

```
src/
  components/  UI 组件（HUD、玻璃卡片、日志、粒子背景等）
  pages/       游戏界面（首页、创建、主界面、地图、探索、战斗、能力、任务、背包）
  systems/     纯游戏逻辑（角色 / 战斗 / 探索 / 资源 / 物品 / 任务）
  data/        Mock 静态数据（路径、技能、敌人、区域、事件、物品、任务）
  hooks/       状态管理与存档（useGameState）
  types/       TypeScript 类型定义
  styles/      全局主题与玻璃拟态样式
tests/         单元测试（systems 纯函数）
```

## 测试

测试覆盖核心玩法逻辑：角色成长、战斗结算、探索事件、资源系统、物品背包、任务进度与隐藏 BOSS 触发条件，均为纯函数单元测试。

```bash
npm test
```

预期输出：

```
Test Files  3 passed (3)
     Tests  26 passed (26)
```

## 路线图

- [ ] 更多探索区域与事件
- [ ] 社交系统
- [ ] 探索事件掉落物品、商店系统
- [ ] Supabase 多人后端（账号 / 云存档 / 联机）

## 许可证

本项目采用 [MIT](./LICENSE) 许可证，Copyright (c) 2026 ashtondebug。
