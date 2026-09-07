#!/usr/bin/env node
// rt-kit v0.25.0 · checks/check-hook-scope.mjs · a01e5f872c14 · правится надстройкой, не здесь
/**
 * The audit of a guard declaration against what its body branches on.
 *
 * A guard carries its own event and call pattern itself — by the `# rt-hook:` line in the second
 * line of the file; the agent settings subscribe it by that line. The body meanwhile can do more
 * than is declared: it branches on a tool name absent from the pattern — and the call never reaches
 * that branch. From outside the guard looks like it works: the path is named, the file is laid out,
 * the scenario set is green, because it calls the guard directly with substituted input and does
 * not read the declaration at all.
 *
 * Worse, the discrepancy reads as a miss of the tree. A tree that subscribed the guard wider than
 * its declaration gets a refusal from the layout audit and narrows the subscription down to the
 * declaration — removing the coverage that worked along with the discrepancy. This is fixed in the
 * package, and the tree pays for it.
 *
 * What is checked: tool names from the `case` branches on the tool name against the pattern of the
 * declaration. Comments and refusal texts are not read: a tool name is mentioned there too, and
 * what is judged is what the guard branches on.
 *
 * FAIL-OPEN: there is no hooks directory — nothing to check, zero code.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const HOOKS = join(ROOT, '.claude/hooks');

/** The declaration of a guard: the event and the call pattern. */
const DECLARATION = /^#\s*rt-hook:\s*(\S+)(?:[ \t]+(\S.*))?$/m;

/** A `case` branch on a tool name: `Bash | mcp__webstorm__execute_tool)`. */
const TOOL_CASE = /^[ \t]*([A-Za-z_][\w-]*(?:__[\w-]+)*(?:[ \t]*\|[ \t]*[A-Za-z_][\w-]*(?:__[\w-]+)*)*)\)/;

/** The tool names the guard body branches on. */
function branchedTools(text) {
    const lines = text.split('\n');
    const tools = new Set();
    let inside = false;

    for (const line of lines) {
        const code = line.replace(/^([^#]*)#.*$/, '$1');

        if (/case[ \t]+"?\$(\{)?(tool|RT_HOOK_TOOL)/.test(code) || /case[ \t]+"\$\(rt_hook_tool\)"/.test(code)) {
            inside = true;
            continue;
        }

        if (inside && /^[ \t]*esac\b/.test(code)) {
            inside = false;
            continue;
        }

        if (!inside) {
            continue;
        }

        const branch = code.match(TOOL_CASE);
        if (branch) {
            for (const name of branch[1].split('|')) {
                const tool = name.trim();
                // The asterisk is the "everything else" branch, and it is not a tool name.
                if (tool && tool !== '*') {
                    tools.add(tool);
                }
            }
        }
    }

    return [...tools];
}

/** Whether the pattern of the declaration covers this tool name. */
function covers(matcher, tool) {
    try {
        return new RegExp(`^(?:${matcher})$`).test(tool);
    } catch {
        // A pattern that cannot be parsed is a discrepancy of its own, and it may not be passed
        // over in silence: a tool name under it will match nothing, while the declaration looks
        // written.
        return false;
    }
}

function main() {
    if (!existsSync(HOOKS)) {
        console.log('check-hook-scope: каталога хуков в дереве нет — сверять нечего');

        return 0;
    }

    const faults = [];

    for (const file of readdirSync(HOOKS).filter((one) => one.endsWith('.sh')).sort()) {
        const text = readFileSync(join(HOOKS, file), 'utf8');
        const declared = text.match(DECLARATION);
        if (!declared || !declared[2]) {
            continue;
        }

        const matcher = declared[2].trim();
        for (const tool of branchedTools(text)) {
            if (!covers(matcher, tool)) {
                faults.push(`${file}: тело ветвится на «${tool}», а объявление его не называет`);
            }
        }
    }

    if (faults.length > 0) {
        console.log(`check-hook-scope: расхождений ${faults.length}\n`);

        for (const fault of faults) {
            console.log(`  ${fault}`);
        }

        console.log('\nВетка тела, которой нет в объявлении, не исполняется ни разу: под этим именем гард');
        console.log('не зовут. Объявление правится в источнике пакета, а не в разложенной копии.');

        return 1;
    }

    console.log('check-hook-scope: объявления гардов покрывают то, на что ветвятся их тела — сошлось');

    return 0;
}

process.exit(main());
