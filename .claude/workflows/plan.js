// rt-kit v0.33.1 · workflows/plan.js · a481e9b4f48e · правится надстройкой, не здесь
export const meta = {
    name: 'plan',
    description: 'After the grill with the owner: whether the work is needed, whether it reaches its points, the product agreement, its adversarial review and the implementation plan',
    whenToUse: 'The grill of the owner\'s request is closed, the task folder is created, the code is not written yet',
    phases: [
        { title: 'Need', detail: 'what the work gives and what is dropped from it' },
        { title: 'Points', detail: 'where the product stands, the point of the work and the milestone' },
        { title: 'Agreement', detail: 'the feature spec in proposed/ from the grill' },
        { title: 'Critique', detail: 'what is left unsaid in the agreement' },
        { title: 'Plan', detail: 'stages with readiness signs and the split into tasks' },
        { title: 'Goal', detail: 'the critic compares the plan with the owner\'s words' },
    ],
};

// The task folder arrives in args; without it the pipeline has nothing to read. The grill of the
// owner's request lies in it and stays the only source: retelling it in the prompt means losing
// the owner's words, for whose sake it was written down.
const dir = typeof args === 'string' ? args : (args?.dir ?? '');
if (!dir) {
    throw new Error('Нужна папка задачи: передай её строкой в args, например docs/tasks/<ветка>');
}

const grill = `${dir}/grill.md`;

const WORTH = {
    type: 'object',
    additionalProperties: false,
    required: ['verdict', 'gives', 'drop'],
    properties: {
        verdict: { type: 'string', enum: ['do', 'do trimmed', 'postpone'] },
        gives: { type: 'string', description: 'what the owner will get' },
        drop: { type: 'array', items: { type: 'string' }, description: 'what is dropped without losing the goal' },
        risks: { type: 'array', items: { type: 'string' } },
    },
};

const POINTS = {
    type: 'object',
    additionalProperties: false,
    required: ['verdict', 'passport', 'pointA', 'point', 'sign', 'milestone', 'misses'],
    properties: {
        verdict: { type: 'string', enum: ['reaches', 'longer route', 'does not reach'] },
        passport: { type: 'string', description: 'the product passport, five to seven lines' },
        pointA: { type: 'string', description: 'point A: where the product stands now' },
        point: { type: 'string', description: 'the change a person will see after this work' },
        sign: { type: 'string', description: 'what shows the point is reached, and who sees it' },
        milestone: { type: 'string', description: 'point G: the milestone of the epic; empty for work outside an epic' },
        misses: {
            type: 'array',
            description: 'the proved misses of the route',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['miss', 'proof', 'step'],
                properties: {
                    miss: { type: 'string' },
                    proof: { type: 'string', description: 'what proves it, with its source' },
                    step: { type: 'string', description: 'the shortest step that closes it, and its cost' },
                },
            },
        },
    },
};

const DRAFT = {
    type: 'object',
    additionalProperties: false,
    required: ['path', 'rules', 'gaps'],
    properties: {
        path: { type: 'string', description: 'the created directory in docs/specs/*/proposed/' },
        rules: { type: 'array', items: { type: 'string' }, description: 'the rules, one line each' },
        gaps: { type: 'array', items: { type: 'string' }, description: 'gaps that cannot be closed without the owner' },
    },
};

const FINDINGS = {
    type: 'object',
    additionalProperties: false,
    required: ['findings'],
    properties: {
        findings: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['what', 'where', 'cost'],
                properties: {
                    what: { type: 'string', description: 'what is left unsaid' },
                    where: { type: 'string', description: 'the file and the rule verbatim' },
                    cost: { type: 'string', description: 'what it will turn into in the code' },
                },
            },
        },
    },
};

const PLAN = {
    type: 'object',
    additionalProperties: false,
    required: ['tasks', 'steps', 'acceptance'],
    properties: {
        tasks: {
            type: 'array',
            description: 'how many tasks the work splits into; one is the usual case',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'slug', 'why', 'point', 'sign'],
                properties: {
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    why: { type: 'string', description: 'why this is rolled back separately' },
                    point: { type: 'string', description: 'the change a person will see after this task' },
                    sign: { type: 'string', description: 'what shows the point is reached, and who sees it' },
                },
            },
        },
        steps: {
            type: 'array',
            maxItems: 8,
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
        acceptance: { type: 'array', items: { type: 'string' } },
    },
};

phase('Need');
const worth = await agent(
    `The grill of the owner's request — \`${grill}\`. Read it in full.\n\n` +
        `Say what this work gives the owner, what is dropped from it without losing the goal and why it ` +
        `is worth doing now rather than in half a year. Name what is rejected with the reason.`,
    { agentType: 'business-analyst', label: 'need', schema: WORTH }
);
log(`Need: ${worth.verdict}; items dropped: ${worth.drop.length}`);

if (worth.verdict === 'postpone') {
    log('The work does not start: the decision belongs to the owner.');
    return { worth, stopped: 'the analyst proposed to postpone — the decision is the owner\'s' };
}

phase('Points');
// The role advises and stops nothing: whether work goes on is the owner's decision, and they read
// the misses in the result. A role that is missing or returned nothing costs the phase, not the
// pipeline: a session registers roles when it starts, so a new role is unknown to an older session.
let points = null;
try {
    points = await agent(
        `The grill of the owner's request — \`${grill}\`. Read it in full, together with the epic plan when ` +
            `the work has one.\n\n` +
            `Dropped from the work: ${worth.drop.join('; ') || '— nothing'}.\n\n` +
            `This is the planning mode. Name where the product stands, the point this work must reach and ` +
            `the milestone of the epic, and try to prove that the route misses them.`,
        { agentType: 'product-strategist', label: 'points', schema: POINTS }
    );
} catch (error) {
    log(`Points: the role did not run: ${error.message}`);
}
const misses = points?.misses ?? [];
const missesText = misses.map((m) => `- ${m.miss}: ${m.step}`).join('\n') || '— none';
log(`Points: ${points?.verdict ?? 'no reply'}; misses: ${misses.length}`);

phase('Agreement');
const draft = await agent(
    `The grill of the owner's request — \`${grill}\`. Read it in full and write the product agreement ` +
        `from it: \`docs/specs/<домен>/proposed/<фича>/\`.\n\n` +
        `Dropped from the work: ${worth.drop.join('; ') || '— nothing'}.\n\n` +
        `Proved misses of the route:\n${missesText}\n\n` +
        `Gaps that the grill does not close — do not guess them, return them as a list.`,
    { agentType: 'spec-writer', label: 'agreement', schema: DRAFT }
);
log(`Agreement: ${draft.path}, rules: ${draft.rules.length}, gaps: ${draft.gaps.length}`);

phase('Critique');
const critique = await agent(
    `The agreement — \`${draft.path}\`, the grill of the owner's request — \`${grill}\`.\n\n` +
        `Review the agreement adversarially: what is left unsaid, where there are two readings, which cases ` +
        `are not named. Edit nothing.`,
    { agentType: 'spec-critic', label: 'critique', schema: FINDINGS }
);
log(`Critique: findings: ${critique.findings.length}`);

phase('Plan');
const plan = await agent(
    `The grill of the owner's request — \`${grill}\`, the agreement — \`${draft.path}\`.\n\n` +
        `Findings of the adversarial review:\n${critique.findings.map((f) => `- ${f.what} (${f.where})`).join('\n') || '— none'}\n\n` +
        `Point A: ${points?.pointA || '— not named'}.\nThe milestone of the epic: ${points?.milestone || '— none'}.\n` +
        `Proved misses of the route:\n${missesText}\n\n` +
        `Assemble the implementation plan: stages with boundaries and a checkable readiness sign for each. ` +
        `Say separately how many tasks the work splits into: what splits is what would have to be rolled back ` +
        `separately, not what is merely large. One task is the usual case. Name the point and the sign of ` +
        `each task, so that the tasks add up to the milestone.`,
    { agentType: 'project-manager', label: 'plan', schema: PLAN }
);
log(`Plan: tasks: ${plan.tasks.length}, stages: ${plan.steps.length}`);

phase('Goal');
// The critic is the check that does not stand on what the session wrote, so a run without it ends
// in a failure and not in a plan that looks judged. A resumed run keeps the phases above.
const goal = await agent(
    `The owner's words are the quoted request in \`${grill}\`; read that section only.\n\n` +
        `The plan under review:\n${JSON.stringify(plan, null, 1)}\n\n` +
        `This is the plan mode. Try to prove the plan does not lead to what the owner asked for.`,
    { agentType: 'goal-critic', label: 'goal', phase: 'Goal' }
);

// Nothing is written to disk from here: the plan and the gaps go to the owner, and `plan.md`
// is written by the main agent — only it asks the owner questions.
return { worth, points, draft, critique: critique.findings, plan, goal };
