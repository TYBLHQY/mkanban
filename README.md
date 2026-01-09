# mkanban

一个现代化的跨平台看板应用，使用 Tauri + Vue 3 构建。支持任务管理、列表组织和主题自定义。

## 功能特性

- **看板管理**：创建和管理多个看板
- **卡片管理**：组织任务卡片，支持分栏展示
- **主题系统**：多种主题切换，使用 Catppuccin 调色板
- **本地数据库**：SQLite 存储，数据保留在本地
- **跨平台**：Windows、macOS、Linux

## 开发

### 依赖

```sh
pnpm install
```

### 开发

```sh
pnpm tauri:dev
```

### 构建

```sh
pnpm tauri:build
```

### 运行

```sh
pnpm tauri:run
```
