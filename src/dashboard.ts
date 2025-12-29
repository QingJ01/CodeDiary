import * as vscode from 'vscode';
import { Storage } from './storage';

export class DashboardPanel {
    public static currentPanel: DashboardPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private readonly storage: Storage;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, storage: Storage) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.storage = storage;

        this.update();

        this.panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(extensionUri: vscode.Uri, storage: Storage) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DashboardPanel.currentPanel) {
            DashboardPanel.currentPanel.panel.reveal(column);
            DashboardPanel.currentPanel.update();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'codediaryDashboard',
            'CodeDiary Dashboard',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri, storage);
    }

    public dispose() {
        DashboardPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private update() {
        this.panel.webview.html = this.getHtmlContent();
    }

    private getHtmlContent(): string {
        const dataJson = JSON.stringify(this.storage.getAllData());

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeDiary Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        :root {
            --bg: #030712;
            --card: rgba(15, 23, 42, 0.6);
            --border: rgba(255, 255, 255, 0.08);
            --accent: #38bdf8;
            --secondary: #8b5cf6;
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --glow: rgba(56, 189, 248, 0.15);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 40px;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.08) 0%, transparent 40%);
        }

        .mesh-gradient {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: -1;
            opacity: 0.4;
            filter: blur(100px);
            background: 
                radial-gradient(at 10% 20%, #0c4a6e 0px, transparent 50%),
                radial-gradient(at 80% 0%, #1e1b4b 0px, transparent 50%),
                radial-gradient(at 90% 80%, #2e1065 0px, transparent 50%);
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 48px;
        }

        .brand-zone h1 {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }

        .brand-zone p { color: var(--text-dim); font-size: 16px; }

        .streak-badge {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.2);
            padding: 8px 16px;
            border-radius: 99px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #f59e0b;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: var(--card);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 28px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card:hover { border-color: rgba(56, 189, 248, 0.3); transform: translateY(-5px); }

        .stat-label { color: var(--text-dim); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; display: block; }
        .stat-value { font-size: 36px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .stat-unit { font-size: 14px; color: var(--text-dim); margin-left: 4px; }

        .main-layout { display: grid; grid-template-columns: 1.6fr 1.4fr; gap: 20px; }

        .chart-card {
            background: #0d1117; /* GitHub Dark Dimmed Background */
            border: 1px solid #30363d;
            border-radius: 6px; /* GitHub Standard Radius */
            padding: 24px;
        }

        .heatmap-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .heatmap-legend {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            font-size: 12px;
            padding: 0 10px;
            margin-top: 5px;
            color: var(--text-dim);
        }

        .legend-right {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .legend-box {
            width: 10px;
            height: 10px;
            border-radius: 2px;
        }

        .chart-title { font-size: 18px; font-weight: 600; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .chart-title .icon { color: var(--accent); }

        #heatmap { height: 210px; width: 100%; }
        #hourlyChart { height: 260px; width: 100%; }
        #languageChart { height: 260px; width: 100%; }

        .heatmap-wrapper {
            width: 100%;
            overflow-x: auto;
            display: flex;
            justify-content: flex-start; /* 允许从左开始滚动 */
            padding-bottom: 5px;
        }
        
        /* 居中处理：当内容未溢出时 */
        @media (min-width: 800px) {
            .heatmap-wrapper { justify-content: center; }
        }

        #heatmap { 
            height: 160px; 
            width: 100%;
            min-width: 720px; /* 关键：防止格子宽度被挤压 */
        }

        @media (max-width: 968px) {
            .stats-grid { grid-template-columns: 1fr 1fr; }
            .main-layout { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="mesh-gradient"></div>
    <div class="container">
        <header>
            <div class="brand-zone">
                <h1>CodeDiary</h1>
                <p>捕获每一颗跳动的字符 ⚡</p>
            </div>
            <div class="streak-badge">
                <span>🔥</span> <span id="streakNum">0</span> 连胜天数
            </div>
        </header>

        <div class="stats-grid" id="statsGrid"></div>

        <div class="chart-card" style="margin-bottom: 20px;">
            <div class="chart-title"><span class="icon">📅</span> 绿墙轨迹 (全年的坚持)</div>
            <div class="heatmap-container">
                <div id="heatmap"></div>
                <div class="heatmap-legend">
                    <div class="legend-right">
                        <span>更少</span>
                        <div class="legend-box" style="background: #161b22; border-radius: 0"></div>
                        <div class="legend-box" style="background: #0e4429; border-radius: 0"></div>
                        <div class="legend-box" style="background: #006d32; border-radius: 0"></div>
                        <div class="legend-box" style="background: #26a641; border-radius: 0"></div>
                        <div class="legend-box" style="background: #39d353; border-radius: 0"></div>
                        <span>更多</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="main-layout">
            <div class="chart-card">
                <div class="chart-title"><span class="icon">🕐</span> 活跃韵律 (今日分布)</div>
                <div id="hourlyChart"></div>
            </div>
            <div class="chart-card">
                <div class="chart-title"><span class="icon">💻</span> 语言编年史</div>
                <div id="languageChart"></div>
            </div>
        </div>
    </div>

    <script>
        const allData = ${dataJson};
        const today = new Date().toISOString().slice(0, 10);
        
        const todayData = allData[today] || { total: { chars: 0, lines: 0, manualChars: 0 }, hourly: {}, languages: {}, projects: {} };
        const totalLines = Object.values(allData).reduce((s, d) => s + (d.total?.lines || 0), 0);
        const activeDays = Object.keys(allData).filter(k => (allData[k].total?.lines || 0) > 0).length;

        const stats = [
            { label: '今日击键', value: todayData.total.chars, unit: 'Chars', color: '#38bdf8' },
            { label: '今日产出', value: todayData.total.lines, unit: 'Lines', color: '#f8fafc' },
            { label: '历史总量', value: totalLines, unit: 'Lines', color: '#f8fafc' },
            { label: '专注天数', value: activeDays, unit: 'Days', color: '#8b5cf6' }
        ];

        document.getElementById('statsGrid').innerHTML = stats.map(s => \`
            <div class="stat-card">
                <span class="stat-label">\${s.label}</span>
                <div class="stat-value" style="color: \${s.color}">\${s.value.toLocaleString()}<span class="stat-unit">\${s.unit}</span></div>
            </div>
        \`).join('');

        const calculateStreak = () => {
            let streak = 0;
            let check = new Date();
            if (!allData[today] || (allData[today].total?.lines || 0) === 0) check.setDate(check.getDate() - 1);
            
            for(let i=0; i<365; i++) {
                const k = check.toISOString().slice(0, 10);
                if(allData[k] && (allData[k].total?.lines || 0) > 0) {
                    streak++;
                    check.setDate(check.getDate() - 1);
                } else break;
            }
            return streak;
        };
        document.getElementById('streakNum').innerText = calculateStreak();

        const theme = {
            textStyle: { fontFamily: 'Outfit, sans-serif', color: '#94a3b8' },
            tooltip: {
                confine: true, /* 关键：防止 Tooltip 溢出容器被遮挡 */
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255,255,255,0.1)',
                textStyle: { color: '#f1f5f9' },
                backdropFilter: 'blur(8px)',
                borderRadius: 12
            }
        };

        const heatmap = echarts.init(document.getElementById('heatmap'));
        const hmData = [];
        const start = new Date(); start.setDate(start.getDate() - 364);
        for(let i=0; i<=365; i++) {
            const d = new Date(start); d.setDate(d.getDate() + i);
            const k = d.toISOString().slice(0, 10);
            hmData.push([k, allData[k]?.total?.lines || 0]);
        }

        heatmap.setOption({
            backgroundColor: 'transparent',
            tooltip: {
                ...theme.tooltip,
                formatter: (p) => {
                    return '<div style="font-weight:600;margin-bottom:4px;">' + p.data[0] + '</div>' +
                           '<div style="color:#39d353">' + p.data[1].toLocaleString() + ' 行代码</div>';
                }
            },
            visualMap: {
                show: false, min: 0, max: 200,
                inRange: { color: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] }
            },
            calendar: {
                top: 40, bottom: 10, left: 30, right: 10,
                range: [start.toISOString().slice(0,10), today],
                cellSize: 13,
                itemStyle: { 
                    borderColor: '#0d1117', /* 恢复为深色背景色，形成自然的间距 */
                    borderWidth: 3, 
                    borderRadius: 2 /* 恢复圆角 */
                },
                splitLine: { show: false }, 
                dayLabel: { color: '#94a3b8', fontSize: 10, nameMap: 'cn', firstDay: 0 },
                monthLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'normal' },
                yearLabel: { show: false }
            },
            series: { 
                type: 'heatmap', 
                coordinateSystem: 'calendar', 
                data: hmData,
                emphasis: { 
                    disabled: false,
                    itemStyle: { 
                        shadowBlur: 3, 
                        shadowColor: 'rgba(56, 189, 248, 0.5)',
                        borderWidth: 1,
                        borderColor: '#fff' 
                    } 
                }
            }
        });

        const hourly = echarts.init(document.getElementById('hourlyChart'));
        const hData = Array(24).fill(0).map((_, i) => todayData.hourly[i] || 0);
        hourly.setOption({
            ...theme,
            grid: { top: 20, left: 0, right: 0, bottom: 20, containLabel: true },
            xAxis: { type: 'category', data: Array.from({length:24}, (_,i)=>i+'h'), axisLine: {show: false}, axisTick: {show: false} },
            yAxis: { show: false },
            series: [{
                type: 'bar', data: hData,
                itemStyle: { 
                    color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0, color:'#38bdf8'}, {offset:1, color:'rgba(56,189,248,0.1)'}]),
                    borderRadius: [6,6,0,0] 
                },
                barMaxWidth: 16
            }],
            tooltip: { trigger: 'axis', axisPointer: { type: 'none' }, confine: true }
        });

        const lang = echarts.init(document.getElementById('languageChart'));
        const lData = Object.entries(todayData.languages).map(([k, v]) => ({ name: k, value: v.chars }));
        lang.setOption({
            ...theme,
            series: [{
                type: 'pie', 
                radius: ['50%', '70%'], /* 缩小半径，留出更多呼吸空间 */
                center: ['50%', '55%'], /* 略微下沉 */
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#0d1117', borderWidth: 5 }, /* 边框色同步为深色背景 */
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff', formatter: '{b}\\n{d}%' } },
                data: lData.length ? lData : [{ value: 1, name: '暂无', itemStyle: { color: '#1e293b' } }]
            }]
        });

        window.addEventListener('resize', () => { [heatmap, hourly, lang].forEach(c => c.resize()); });
    </script>
</body>
</html>`;
    }
}
