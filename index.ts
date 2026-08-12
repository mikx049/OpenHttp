const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";

let proc: ReturnType<typeof Bun.spawn>;

if (isWindows) {
    proc = Bun.spawn([
        "powershell.exe",
        "-NoProfile",
        "-Command",
        "Start-Process powershell.exe " +
        "-ArgumentList '-NoProfile','-NoExit','-Command','bun run tui.ts' " +
        "-WorkingDirectory 'server' -Wait",
    ], {
        onExit(subprocess, exitCode, signalCode, error) {
            console.log("TUI CLOSED");
            console.log("PID:", subprocess.pid);
            console.log("Exit code:", exitCode);
            console.log("Signal:", signalCode);

            if (error) {
                console.error("ERROR:", error);
            }
        },
    });
} else if (isLinux) {
    proc = Bun.spawn([
        "bun",
        "run",
        "tui.ts",
    ], {
        cwd: "server",

        onExit(subprocess, exitCode, signalCode, error) {
            console.log("TUI CLOSED");
            console.log("PID:", subprocess.pid);
            console.log("Exit code:", exitCode);
            console.log("Signal:", signalCode);

            if (error) {
                console.error("ERROR:", error);
            }
        },
    });
} else {
    throw new Error(`Unsupported platform: ${process.platform}`);
}