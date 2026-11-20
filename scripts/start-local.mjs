import { spawn } from 'node:child_process';
import path from 'node:path';
const cli = path.resolve('node_modules', 'tsx', 'dist', 'cli.mjs');
const child = spawn(process.execPath, [cli, 'server.ts'], { stdio: 'inherit', env: { ...process.env, CENTRAL_LOCAL_MODE: '1' } });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
