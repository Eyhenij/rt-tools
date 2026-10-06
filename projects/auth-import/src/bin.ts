#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';

import { run } from './cli.js';

process.exitCode = await run(process.argv.slice(2), process.env, {
    fetch,
    readFile: (path: string): Promise<string> => readFile(path, 'utf8'),
    out: (line: string): void => {
        process.stdout.write(`${line}\n`);
    },
    err: (line: string): void => {
        process.stderr.write(`${line}\n`);
    },
});
