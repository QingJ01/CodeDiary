import * as vscode from 'vscode';
import { Tracker } from './tracker';
import { Storage } from './storage';
import { DashboardPanel } from './dashboard';

let tracker: Tracker;

export function activate(context: vscode.ExtensionContext) {
    const storage = new Storage(context.globalStorageUri);
    tracker = new Tracker(storage, context);

    // 状态栏
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarItem.command = 'codediary.openDashboard';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 更新状态栏显示
    const updateStatusBar = () => {
        const today = tracker.getTodayStats();
        const quote = getQuote(today.lines);
        const streak = tracker.getStreak();
        statusBarItem.text = `$(code) 今日 ${today.lines} 行 ${quote} | 🔥${streak}天`;
        statusBarItem.tooltip = `今日字符: ${today.chars} (手动: ${today.manualChars})`;
    };

    // 监听文档变更
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            tracker.onDocumentChange(event);
            updateStatusBar();
        })
    );

    // 注册打开看板命令
    context.subscriptions.push(
        vscode.commands.registerCommand('codediary.openDashboard', () => {
            DashboardPanel.createOrShow(context.extensionUri, storage);
        })
    );

    // 初始化状态栏
    updateStatusBar();

    // 定时保存
    const saveInterval = setInterval(() => {
        tracker.save();
    }, 60000); // 每分钟保存一次
    context.subscriptions.push({ dispose: () => clearInterval(saveInterval) });
}

export function deactivate() {
    if (tracker) {
        tracker.save();
    }
}

function getQuote(lines: number): string {
    if (lines >= 1000) return '🚀 指尖生花！';
    if (lines >= 500) return '✨ 代码诗人！';
    if (lines >= 100) return '💪 稳步前进！';
    if (lines > 0) return '🌱 加油奋斗者！';
    return '⏳ 今天还没动笔哦~';
}
