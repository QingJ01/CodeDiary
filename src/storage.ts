import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface LanguageStats {
    chars: number;
    lines: number;
}

export interface DayStats {
    total: {
        chars: number;
        lines: number;
        manualChars: number;
    };
    hourly: { [hour: string]: number };
    languages: { [langId: string]: LanguageStats };
    projects: { [projectName: string]: number };
}

export interface AllData {
    [dateKey: string]: DayStats;
}

export class Storage {
    private storageUri: vscode.Uri;
    private dataFilePath: string;
    private data: AllData;

    constructor(storageUri: vscode.Uri) {
        this.storageUri = storageUri;
        this.dataFilePath = path.join(storageUri.fsPath, 'data.json');
        this.data = this.loadAll();
    }

    private ensureStorageDir(): void {
        const dirPath = this.storageUri.fsPath;
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    private loadAll(): AllData {
        this.ensureStorageDir();
        if (fs.existsSync(this.dataFilePath)) {
            try {
                const content = fs.readFileSync(this.dataFilePath, 'utf-8');
                return JSON.parse(content) as AllData;
            } catch {
                return {};
            }
        }
        return {};
    }

    private getTodayKey(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    loadToday(): DayStats {
        const key = this.getTodayKey();
        if (this.data[key]) {
            return this.data[key];
        }
        return this.createEmptyDayStats();
    }

    private createEmptyDayStats(): DayStats {
        return {
            total: { chars: 0, lines: 0, manualChars: 0 },
            hourly: {},
            languages: {},
            projects: {}
        };
    }

    saveToday(stats: DayStats): void {
        const key = this.getTodayKey();
        this.data[key] = stats;
        this.ensureStorageDir();
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    getAllData(): AllData {
        return this.data;
    }

    calculateStreak(): number {
        const sortedDates = Object.keys(this.data)
            .filter(k => this.data[k].total.lines > 0)
            .sort()
            .reverse();

        if (sortedDates.length === 0) {
            return 0;
        }

        let streak = 0;
        const today = this.getTodayKey();
        let checkDate = new Date();

        // 如果今天没有数据，从昨天开始计算
        if (!this.data[today] || this.data[today].total.lines === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        for (let i = 0; i < 365; i++) {
            const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            if (this.data[key] && this.data[key].total.lines > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }
}
