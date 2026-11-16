// rt-kit v0.37.0 · checks/action-of.mjs · e2b69960e33d · правится надстройкой, не здесь
/**
 * The action of a call: the class the decision table knows a tool call by.
 *
 * A row of the table is keyed by its hook, its action and the facts. A guard that judges one kind of
 * call names its action itself; a guard that judges every edit — the window fill, the handover entry,
 * the exam — sees an edit of code, of a plan or of an override alike, and its rows differ only by the
 * action. If such a guard named one action for all of them, a row of the table could be flipped with
 * no effect on the guard, and the table would describe a decision nobody takes.
 *
 * So the action is computed from the call, here, once: every class the call fits, the most specific
 * first. The decider takes the first one the hook has a row for.
 *
 * Content decides some classes: a template whose button has no anchor, a document with officialese.
 * They are asked of the same analyses the content guards run, not of copies of them.
 */
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

import { checkProse } from './check-prose-style.mjs';

const SHELL_TOOLS = new Set(['Bash', 'mcp__webstorm__execute_terminal_command']);
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'mcp__webstorm__create_new_file']);

/** A shell command that writes into a progress or a plan file. */
const SHELL_WRITES_FLOW = /(progress|plan)\.md/;
const SHELL_WRITE = /(>>?|\btee\b|\bsed\s+-i|\bperl\s+-[a-z]*i)/;

/** The layout header within the first twelve lines — the sign the source guard reads. */
const LAYOUT_HEADER = /^\s*(<!--|\/\/|#|\/\*|\*)\s*rt-kit v\S+ · \S+ · [0-9a-f]+/m;

function laidOut(path) {
    try {
        return existsSync(path) && LAYOUT_HEADER.test(readFileSync(path, 'utf8').split('\n', 12).join('\n'));
    } catch {
        return false;
    }
}

function proseDirty(text) {
    try {
        return checkProse(text).length > 0;
    } catch {
        return false;
    }
}

function shellClasses(c) {
    const out = [];
    const has = (re) => re.test(c);
    if (has(/\bgh\s+run\s+rerun\b/)) out.push('rerun_run');
    if (has(/\bgit\s+(reset\s+--hard|checkout\s+--\s|clean\s+-[a-z]*f|restore\b)/)) out.push('discard');
    if (has(/\bgit\s+add\s+[^;&|]*docs\/tasks\//) && has(/\bgit\s+commit\b/)) out.push('commit_folder');
    if (has(/\bgit\s+commit\b[^;&|]*--amend\b/)) out.push('amend_signature');
    if (has(/\bgit\s+commit\b[^;&|]*--no-verify\b/)) out.push('commit_skip_hooks');
    if (has(/\bgit\s+commit\b/)) out.push('commit');
    if (has(/\bgit\s+push\b[^;&|]*--no-verify\b/)) out.push('push_skip_hooks');
    if (has(/\bgit\s+push\b[^]*&&[^]*\bgit\s+push\b/)) out.push('push_multi');
    if (has(/\bgit\s+(checkout|switch)\s+[^&;|]*&&\s*git\s+push\b/)) out.push('push_switch');
    if (has(/\bcd\s+[^&;|]*&&\s*git\s+push\b/)) out.push('push_second_copy');
    if (has(/\bgit\s+push\b/)) out.push('push');
    const created = c.match(/\bgit\s+(?:checkout\s+-b|switch\s+-c)\s+(\S+)(?:\s+([^\s;&|]+))?/);
    if (created) {
        const [, name, base] = created;
        const task = /^[A-Z]+-\d+-/.test(name);
        if (task && /[A-Z]/.test(name.replace(/^[A-Z]+-\d+-/, ''))) out.push('branch_create_bad_name');
        if (task && !(base ?? '').startsWith('origin/')) out.push('branch_create_stale_base');
        if (!task) out.push('branch_create_local');
    }
    if (has(/\bgit\s+(checkout\s+-b|switch\s+-c|branch\s+[^-])/)) out.push('branch_create');
    if (has(/\bgh\s+pr\s+create\b/)) out.push('pr_create');
    if (has(/\bgh\s+pr\s+ready\b/)) out.push('pr_ready');
    if (has(/\bgh\s+pr\s+merge\b/)) out.push('pr_merge');
    if (has(/\bgh\s+pr\s+edit\b[^;&|]*reviewer/)) out.push('set_reviewer');
    if (has(/\btask:new\b/)) out.push('new_task', 'task_new');
    if (has(/\btask:move\b/)) out.push('task_move');
    if (has(/\bgit\s+merge\b/)) out.push('merge_base');
    if (has(SHELL_WRITES_FLOW) && has(SHELL_WRITE)) out.push('shell_write_progress');
    if (has(/(^|[;&|]\s*)cp\s/)) out.push('copy_template');
    if (has(/\bprisma\s+migrate\s+reset\b/)) out.push('db_reset');
    if (has(/\bprisma\s+migrate\s+(deploy|dev)\b/)) out.push('migrate');
    if (has(/\bcurl\b[^;&|]*\b(localhost|127\.0\.0\.1)\b/)) out.push('check_stand');
    if (has(/\brun\s+serve:|\bnx\s+serve\b|\bng\s+serve\b/)) out.push('raise_dev_server');
    if (has(/\bhttp\.server\b|\bnpx\s+(serve|http-server)\b/)) out.push('raise_static');
    return out;
}

function editClasses(tool, input, cwd) {
    const raw = input.file_path ?? input.pathInProject ?? '';
    const path = raw && !isAbsolute(raw) && cwd ? join(cwd, raw) : raw;
    const added = `${input.new_string ?? ''}${input.content ?? ''}${(input.edits ?? []).map((e) => e.new_string ?? '').join('\n')}`;
    const removed = `${input.old_string ?? ''}${(input.edits ?? []).map((e) => e.old_string ?? '').join('\n')}`;
    const write = tool === 'Write' || tool === 'mcp__webstorm__create_new_file';
    const out = [];
    const at = (re) => re.test(path);
    if (at(/\.git\/rt-kit\/steps\//)) out.push('write_marks');
    if (at(/\/\.claude\/handoff\//)) out.push('write_handover');
    if (at(/\/docs\/tasks\/[^/]+\/progress\.md$/)) {
        if (/- \[x\]/.test(added) || /- \[x\]/.test(removed)) out.push('mark_step_done');
        if (/`[а-яё]+(-[а-яё]+)+`/.test(added + removed)) out.push('set_state');
        out.push('edit_progress');
    }
    if (at(/\/docs\/tasks\/[^/]+\/plan\.md$/)) out.push('edit_plan');
    if (at(/\/docs\/plans\/[^/]+\.md$/)) out.push(/отложено/.test(added + removed) ? 'defer_task' : 'edit_plan');
    if (at(/\/assets\/task-flow\/|\/flow-[a-z-]+\.mjs$|\/task-flow-script\.mjs$/)) out.push('edit_flow_description');
    if (at(/\/\.claude\/rt-kit\/observations\//)) out.push('edit_observations');
    if (at(/\/\.claude\/rt-kit\.json$/)) out.push('edit_rtkit_send');
    if (at(/\/\.claude\/rt-kit\/overrides\//)) out.push(...(write ? ['write_override', 'edit_override'] : ['edit_override']));
    if (write && at(/\/docs\/specs\/.+\/proposed\//)) out.push('write_agreement');
    if (at(/\/projects\/[^/]+\/(src|assets)\/(laws|rules|patterns)\//)) out.push('edit_source');
    if (laidOut(path)) out.push('edit_laid_out');
    if (at(/\.html$/)) {
        if (/<(button|a)\b(?![^>]*qa-dataid)[^>]*>/.test(added)) out.push('template_no_anchor');
        if (/<(input|select|textarea)\b/.test(added)) out.push('template_own_primitive');
        out.push('edit_template');
    }
    if (at(/\.md$/)) {
        if (proseDirty(added)) out.push('write_dirty_md');
        out.push('edit_doc');
    }
    if (at(/\.(ts|js|mjs|cjs|tsx|jsx|scss|css|json|sh)$/)) out.push('edit_code');
    return out;
}

/**
 * Every class the call fits, the most specific first, and `work_call` last: any call of work. The
 * input is the hook input as the host gives it.
 */
export function actionsOf(hookInput) {
    const tool = hookInput?.tool_name ?? '';
    const input = hookInput?.tool_input ?? {};
    const out = [];
    if ((hookInput?.hook_event_name ?? '') === 'Stop' || (hookInput?.hook_event_name ?? '') === 'SubagentStop') return ['end_turn'];
    if (tool === 'EndConversation') out.push('end_conversation');
    if (tool === 'Agent' && input.subagent_type === 'strict-teacher') out.push('call_teacher');
    if (tool === 'mcp__claude-in-chrome__select_browser') out.push('select_pinned', 'select_other');
    if (tool === 'mcp__claude-in-chrome__list_connected_browsers') out.push('list_browsers');
    if (tool.startsWith('mcp__claude-in-chrome__')) out.push('browser_call');
    if (/^mcp__(playwright|puppeteer|chrome-devtools|Claude_Browser)__/.test(tool)) out.push('other_driver');
    if (tool === 'mcp__webstorm__execute_run_configuration') out.push(/package\.json$/.test(input.filePath ?? '') ? 'run_manifest_script' : 'run_config_serve');
    if (SHELL_TOOLS.has(tool)) out.push(...shellClasses(String(input.command ?? '')));
    if (EDIT_TOOLS.has(tool)) out.push(...editClasses(tool, input, hookInput?.cwd ?? ''));
    out.push('work_call');
    return out;
}

/** Every class of the call the hook has a row for, the most specific first. */
export function knownActionsOf(hookInput, known) {
    return actionsOf(hookInput).filter((a) => known.has(a));
}

/** The first class of the call the hook has a row for, or null. */
export function actionOf(hookInput, known) {
    return actionsOf(hookInput).find((a) => known.has(a)) ?? null;
}
