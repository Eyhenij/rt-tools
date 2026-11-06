// rt-kit v0.33.1 · workflows/feature.js · 508cb9febc22 · правится надстройкой, не здесь
export const meta = {
    name: 'feature',
    description: 'A plan from the PM, implementation step by step, a fan of QA checks and acceptance against the original request',
    whenToUse: 'A large edit that will touch several layers: the contract, the storage, the applications, the translations',
    phases: [
        { title: 'Plan', detail: 'the PM splits the task into steps with readiness signs' },
        { title: 'Implementation', detail: 'one step at a time — the working tree is shared by all' },
        { title: 'Check', detail: 'QA as a fan: tests, build, browser, adversarial review' },
        { title: 'Acceptance', detail: 'the PM checks what was done against the original request' },
        { title: 'Points', detail: 'the signs of the points are run, and the miss is proved or refuted' },
        { title: 'Goal', detail: 'the critic compares the result with the original request' },
    ],
};

// The grill is required alongside the task: without the owner's words the Goal phase has nothing to
// compare the result with, and a string call would spend the whole run to learn that at the end.
const task = args?.task ?? '';
if (!task || !args?.grill) {
    throw new Error('A task and the grill are needed: pass { task, grill } in args');
}

const PLAN = {
    type: 'object',
    additionalProperties: false,
    required: ['steps', 'risks', 'acceptance'],
    properties: {
        steps: {
            type: 'array',
            maxItems: 6,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'scope', 'done'],
                properties: {
                    title: { type: 'string' },
                    scope: { type: 'string', description: 'what is included and what is NOT' },
                    done: { type: 'string', description: 'a checkable readiness sign' },
                },
            },
        },
        risks: { type: 'array', items: { type: 'string' } },
        acceptance: { type: 'array', items: { type: 'string' }, description: 'acceptance criteria from the original request' },
    },
};

const FINDINGS = {
    type: 'object',
    additionalProperties: false,
    required: ['findings', 'checked'],
    properties: {
        findings: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['what', 'where', 'evidence', 'severity'],
                properties: {
                    what: { type: 'string' },
                    where: { type: 'string' },
                    evidence: { type: 'string', description: 'command output or a measurement, not a retelling' },
                    severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
                    preExisting: { type: 'boolean' },
                },
            },
        },
        checked: { type: 'array', items: { type: 'string' } },
    },
};

phase('Plan');
const plan = await agent(
    `The task from the user:\n\n${task}\n\nBreak it down and return a plan. No more than six steps; ` +
        `each one is a self-contained edit with a checkable readiness sign.`,
    { agentType: 'project-manager', label: 'plan', schema: PLAN }
);
log(`Plan: ${plan.steps.length} step(s), ${plan.risks.length} risk(s)`);

// The steps go one after another, not as a fan: the working tree is one, and parallel
// edits of the same files would overwrite each other.
phase('Implementation');
const done = [];
for (const [index, step] of plan.steps.entries()) {
    const result = await agent(
        `The whole task: ${task}\n\nYour step ${index + 1} of ${plan.steps.length}: ${step.title}\n` +
            `Boundaries: ${step.scope}\nReadiness sign: ${step.done}\n\n` +
            `Already done on the previous steps:\n${done.join('\n') || '— nothing'}\n\n` +
            `Follow the tree's rules from CLAUDE.md and .claude/skills. Before editing a file, load ` +
            `the matching rule through the Skill tool — otherwise the rules gate will block the edit. ` +
            `No git commands. Return briefly: which files you changed and what confirms the readiness sign.`,
        { label: `step ${index + 1}: ${step.title}`, phase: 'Implementation' }
    );
    done.push(`${step.title}: ${result ?? 'step not done'}`);
}

// Here the barrier is justified: acceptance needs all findings at once, and the measurements
// are independent and honestly run in parallel.
phase('Check');
const LENSES = [
    { key: 'tests', prompt: 'Run the unit tests and the e2e over what was touched. Separate new failures from pre-existing ones.' },
    { key: 'build', prompt: 'Run the builds of the touched applications and the linters. Mark pre-existing errors as pre-existing.' },
    {
        key: 'browser',
        prompt: 'Check the result in the browser by measurements: computed styles, geometry, contrast. The dev servers are already up — do not start your own.',
    },
    {
        key: 'review',
        prompt: 'Review the edit adversarially: boundary values, the second locale, the dark theme, a narrow screen, a server that went down, server-side page rendering.',
    },
];
const reports = (
    await parallel(
        LENSES.map(
            (lens) => () =>
                agent(`The task that was carried out: ${task}\n\nWhat was done:\n${done.join('\n')}\n\n${lens.prompt}`, {
                    agentType: 'qa-engineer',
                    label: `qa: ${lens.key}`,
                    phase: 'Check',
                    schema: FINDINGS,
                })
        )
    )
).filter(Boolean);

const findings = reports.flatMap((report) => report.findings);
const blockers = findings.filter((finding) => finding.severity === 'blocker' && !finding.preExisting);
log(`Findings: ${findings.length}, of them blockers: ${blockers.length}`);

phase('Acceptance');
const verdict = await agent(
    `The user's original request:\n\n${task}\n\nAcceptance criteria:\n${plan.acceptance.join('\n')}\n\n` +
        `What was done:\n${done.join('\n')}\n\nFindings of the reviewers:\n${JSON.stringify(findings, null, 1)}\n\n` +
        `Give a verdict: what is accepted, what is not and why. Name separately what from the original request ` +
        `was left unclosed or quietly narrowed.`,
    { agentType: 'project-manager', label: 'acceptance', phase: 'Acceptance' }
);

phase('Points');
// A role a session has not registered costs this phase, not the done work above it.
let points = null;
try {
    points = await agent(
        `The user's original request:\n\n${task}\n\nWhat was done:\n${done.join('\n')}\n\n` +
            `This is the review mode. Read the points in the task plan and the epic plan, run the sign of each ` +
            `and try to prove the miss.`,
        { agentType: 'product-strategist', label: 'points', phase: 'Points' }
    );
} catch (error) {
    log(`Points: the role did not run: ${error.message}`);
}

phase('Goal');
// The critic gets the request and nothing the pipeline wrote about the work: that is its whole value.
let goal = null;
try {
    // Only the grill holds a quote: the task string is the session's wording.
    goal = await agent(
        `The owner's words are the quoted request in \`${args.grill}\`; read that section only.\n\n` +
            `This is the result mode. The result is the working tree and its diff against the base ` +
            `branch. Try to prove the goal is not met.`,
        { agentType: 'goal-critic', label: 'goal', phase: 'Goal' }
    );
} catch (error) {
    log(`Goal: the role did not run: ${error.message}`);
}

return { plan, done, findings, blockers, verdict, points, goal };
