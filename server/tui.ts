import blessed from "neo-blessed";
import { join } from "node:path";

const SERVER_DIR = process.cwd();
const PID_FILE = join(SERVER_DIR, ".server.pid");

const screen = blessed.screen({
    smartCSR: true,
    title: "MyHttp Server TUI",
});

let serverProcess: ReturnType<typeof Bun.spawn> | null = null;

const menu = blessed.list({
    top: 2,
    left: 2,
    width: 32,
    height: 8,

    items: [
        "START",
        "STOP",
        "TERMINAL",
    ],

    keys: true,
    vi: false,
    mouse: true,

    border: {
        type: "line",
    },

    label: " MyHttp Server ",

    style: {
        selected: {
            inverse: true,
        },
    },
});

screen.append(menu);
menu.focus();

function isServerStarted(): boolean {
    return serverProcess !== null;
}

function startServer() {
    if (isServerStarted()) {
        return;
    }

    if (process.platform === "win32") {
        const command =
            "$p = Start-Process powershell.exe " +
            "-ArgumentList '-NoProfile','-NoExit','-Command','bun run server.ts' " +
            `-WorkingDirectory '${SERVER_DIR}' ` +
            "-PassThru; " +
            `Set-Content -Path '${PID_FILE}' -Value $p.Id; ` +
            "$p.WaitForExit(); " +
            `Remove-Item '${PID_FILE}' -ErrorAction SilentlyContinue`;

        serverProcess = Bun.spawn([
            "powershell.exe",
            "-NoProfile",
            "-Command",
            command,
        ], {
            onExit() {
                serverProcess = null;
            },
        });

        return;
    }

    if (process.platform === "linux") {
        serverProcess = Bun.spawn([
            "bash",
            "-c",
            `bun run server.ts & echo $! > "${PID_FILE}"; wait`,
        ], {
            cwd: SERVER_DIR,
            onExit() {
                serverProcess = null;
            },
        });
    }
}

function stopServer() {
    if (!serverProcess) {
        return;
    }

    if (process.platform === "win32") {
        Bun.spawnSync([
            "taskkill",
            "/PID",
            String(serverProcess.pid),
            "/T",
            "/F",
        ]);
    } else if (process.platform === "linux") {
        Bun.spawnSync([
            "kill",
            String(serverProcess.pid),
        ]);
    }

    serverProcess = null;
}

function openTerminal() {
    if (!serverProcess) {
        return;
    }

    if (process.platform === "win32") {
        Bun.spawn([
            "powershell.exe",
            "-NoProfile",
            "-Command",
            "Start-Process powershell.exe " +
                "-ArgumentList '-NoProfile','-NoExit','-Command','bun run terminal.ts' " +
                `-WorkingDirectory '${SERVER_DIR}'`,
        ]);

        return;
    }

    if (process.platform === "linux") {
        // Najpierw próbujemy popularne terminale Linux.
        const terminals = [
            ["x-terminal-emulator", "-e", "bun", "run", "terminal.ts"],
            ["gnome-terminal", "--", "bun", "run", "terminal.ts"],
            ["konsole", "-e", "bun", "run", "terminal.ts"],
            ["xfce4-terminal", "--command", "bun run terminal.ts"],
        ];

        for (const command of terminals) {
            try {
                Bun.spawn(command, {
                    cwd: SERVER_DIR,
                });

                break;
            } catch {
                continue;
            }
        }
    }
}

menu.on("select", () => {
    switch (menu.selected) {
        case 0:
            startServer();
            break;

        case 1:
            stopServer();
            break;

        case 2:
            openTerminal();
            break;
    }
});

screen.key(["q", "escape", "C-c"], () => {
    screen.destroy();
    process.exit(0);
});

screen.render();