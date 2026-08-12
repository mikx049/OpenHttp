import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const prompt = "server> ";
const PID_FILE = join(process.cwd(), ".server.pid");

function getServerPid(): number | null {
    if (!existsSync(PID_FILE)) {
        return null;
    }

    try {
        const pid = Number(readFileSync(PID_FILE, "utf8").trim());

        if (!Number.isInteger(pid) || pid <= 0) {
            return null;
        }

        return pid;
    } catch {
        return null;
    }
}

function isProcessRunning(pid: number): boolean {
    if (process.platform === "win32") {
        const result = Bun.spawnSync([
            "powershell.exe",
            "-NoProfile",
            "-Command",
            `Get-Process -Id ${pid} -ErrorAction SilentlyContinue`,
        ]);

        return result.exitCode === 0;
    }

    if (process.platform === "linux") {
        const result = Bun.spawnSync([
            "kill",
            "-0",
            String(pid),
        ]);

        return result.exitCode === 0;
    }

    return false;
}

function isServerRunning(): boolean {
    const pid = getServerPid();

    if (pid === null) {
        return false;
    }

    return isProcessRunning(pid);
}

function printPrompt() {
    process.stdout.write(prompt);
}

console.clear();

console.log("╔════════════════════════════════════╗");
console.log("║       MyHttp Server Console        ║");
console.log("╚════════════════════════════════════╝");
console.log("");
console.log("Type 'help' for commands.");
console.log("");

printPrompt();

for await (const line of console) {
    const command = line.trim().toLowerCase();

    switch (command) {
        case "":
            break;

        case "help":
            console.log("");
            console.log("Commands:");
            console.log("  help    Show this help");
            console.log("  status  Show server status");
            console.log("  clear   Clear console");
            console.log("  exit    Close admin console");
            console.log("");
            break;

        case "status": {
            const pid = getServerPid();

            if (pid === null) {
                console.log("Server: OFFLINE");
            } else if (isProcessRunning(pid)) {
                console.log(`Server: ONLINE (PID ${pid})`);
            } else {
                console.log("Server: OFFLINE");
            }

            break;
        }

        case "clear":
            console.clear();
            break;

        case "exit":
        case "quit":
            process.exit(0);

        default:
            console.log(`Unknown command: ${line}`);
            break;
    }

    printPrompt();
}