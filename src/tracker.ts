import * as vscode from 'vscode';
import { Storage, DayStats, LanguageStats } from './storage';
import { minimatch } from 'minimatch';

export class Tracker {
    private storage: Storage;
    private todayStats: DayStats;
    private config: vscode.WorkspaceConfiguration;

    constructor(storage: Storage, context: vscode.ExtensionContext) {
        this.storage = storage;
        this.config = vscode.workspace.getConfiguration('codediary');
        this.todayStats = this.storage.loadToday();

        // 监听配置变更
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('codediary')) {
                    this.config = vscode.workspace.getConfiguration('codediary');
                }
            })
        );
    }

    onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const doc = event.document;

        // 排除非文件 scheme
        if (doc.uri.scheme !== 'file') {
            return;
        }

        // 检查排除规则
        const excludeGlob = this.config.get<string[]>('excludeGlob', []);
        const filePath = doc.uri.fsPath;
        for (const pattern of excludeGlob) {
            if (minimatch(filePath, pattern, { dot: true })) {
                return;
            }
        }

        const pasteThreshold = this.config.get<number>('pasteThreshold', 50);
        const languageId = doc.languageId;
        const currentHour = new Date().getHours().toString();
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
        const projectName = workspaceFolder?.name || 'unknown';

        for (const change of event.contentChanges) {
            const addedText = change.text;
            const removedLength = change.rangeLength;
            const addedLength = addedText.length;

            // 仅统计新增
            if (addedLength === 0) {
                continue;
            }

            // 计算新增行数
            const newLines = (addedText.match(/\n/g) || []).length;

            // 判断是否为粘贴
            const isManual = addedLength < pasteThreshold;

            // 更新总计
            this.todayStats.total.chars += addedLength;
            this.todayStats.total.lines += newLines;
            if (isManual) {
                this.todayStats.total.manualChars += addedLength;
            }

            // 更新按小时统计
            this.todayStats.hourly[currentHour] = (this.todayStats.hourly[currentHour] || 0) + addedLength;

            // 更新按语言统计
            if (!this.todayStats.languages[languageId]) {
                this.todayStats.languages[languageId] = { chars: 0, lines: 0 };
            }
            this.todayStats.languages[languageId].chars += addedLength;
            this.todayStats.languages[languageId].lines += newLines;

            // 更新按项目统计
            if (!this.todayStats.projects[projectName]) {
                this.todayStats.projects[projectName] = 0;
            }
            this.todayStats.projects[projectName] += addedLength;
        }
    }

    getTodayStats(): { lines: number; chars: number; manualChars: number } {
        return this.todayStats.total;
    }

    getStreak(): number {
        return this.storage.calculateStreak();
    }

    save(): void {
        this.storage.saveToday(this.todayStats);
    }
}
