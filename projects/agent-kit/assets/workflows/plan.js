export const meta = {
    name: 'plan',
    description: 'После разбора с владельцем: нужна ли работа, договорённость о продукте, её состязательный разбор и замысел реализации',
    whenToUse: 'Разбор просьбы владельца закрыт, папка задачи заведена, код ещё не пишется',
    phases: [
        { title: 'Нужность', detail: 'что даёт работа и что из неё выкидывается' },
        { title: 'Договорённость', detail: 'спек фичи в proposed/ по разбору' },
        { title: 'Критика', detail: 'что в договорённости недосказано' },
        { title: 'Замысел', detail: 'этапы с признаками готовности и разбивка на задачи' },
    ],
};

// Папка задачи приходит в args; без неё конвейеру нечего читать. Разбор просьбы владельца
// лежит в ней и остаётся единственным источником: пересказывать его в промпте значит терять
// слова владельца, ради которых он и записан.
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
        verdict: { type: 'string', enum: ['делать', 'делать урезанно', 'отложить'] },
        gives: { type: 'string', description: 'что владелец получит' },
        drop: { type: 'array', items: { type: 'string' }, description: 'что выкидывается без потери цели' },
        risks: { type: 'array', items: { type: 'string' } },
    },
};

const DRAFT = {
    type: 'object',
    additionalProperties: false,
    required: ['path', 'rules', 'gaps'],
    properties: {
        path: { type: 'string', description: 'заведённая директория в docs/specs/*/proposed/' },
        rules: { type: 'array', items: { type: 'string' }, description: 'правила по одной строке' },
        gaps: { type: 'array', items: { type: 'string' }, description: 'пробелы, которые не закрыть без владельца' },
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
                    what: { type: 'string', description: 'что недосказано' },
                    where: { type: 'string', description: 'файл и правило дословно' },
                    cost: { type: 'string', description: 'чем обернётся в коде' },
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
            description: 'на сколько задач делится работа; одна — обычный случай',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'slug', 'why'],
                properties: {
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    why: { type: 'string', description: 'почему это откатывается отдельно' },
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
                    scope: { type: 'string', description: 'что входит и что НЕ входит' },
                    done: { type: 'string', description: 'проверяемый признак готовности' },
                },
            },
        },
        acceptance: { type: 'array', items: { type: 'string' } },
    },
};

phase('Нужность');
const worth = await agent(
    `Разбор просьбы владельца — \`${grill}\`. Прочитай его целиком.\n\n` +
        `Скажи, что эта работа даёт владельцу, что из неё выкидывается без потери цели и почему её ` +
        `стоит делать сейчас, а не через полгода. Отвергнутое называй с причиной.`,
    { agentType: 'business-analyst', label: 'нужность', schema: WORTH }
);
log(`Нужность: ${worth.verdict}; выкидывается пунктов ${worth.drop.length}`);

if (worth.verdict === 'отложить') {
    log('Работа не начинается: решение относится владельцу.');
    return { worth, stopped: 'аналитик предложил отложить — решение за владельцем' };
}

phase('Договорённость');
const draft = await agent(
    `Разбор просьбы владельца — \`${grill}\`. Прочитай его целиком и напиши по нему договорённость ` +
        `о продукте: \`docs/specs/<домен>/proposed/<фича>/\`.\n\n` +
        `Из работы выкинуто: ${worth.drop.join('; ') || '— ничего'}.\n\n` +
        `Пробелы, которые не закрываются разбором, не додумывай — верни их списком.`,
    { agentType: 'spec-writer', label: 'договорённость', schema: DRAFT }
);
log(`Договорённость: ${draft.path}, правил ${draft.rules.length}, пробелов ${draft.gaps.length}`);

phase('Критика');
const critique = await agent(
    `Договорённость — \`${draft.path}\`, разбор просьбы владельца — \`${grill}\`.\n\n` +
        `Состязательно разбери договорённость: что недосказано, где два прочтения, какие случаи ` +
        `не названы. Ничего не правь.`,
    { agentType: 'spec-critic', label: 'критика', schema: FINDINGS }
);
log(`Критика: находок ${critique.findings.length}`);

phase('Замысел');
const plan = await agent(
    `Разбор просьбы владельца — \`${grill}\`, договорённость — \`${draft.path}\`.\n\n` +
        `Находки состязательного разбора:\n${critique.findings.map((f) => `- ${f.what} (${f.where})`).join('\n') || '— нет'}\n\n` +
        `Собери замысел реализации: этапы с границами и проверяемым признаком готовности у каждого. ` +
        `Отдельно скажи, на сколько задач делится работа: делится то, что придётся откатывать порознь, ` +
        `а не то, что просто объёмно. Одна задача — обычный случай.`,
    { agentType: 'project-manager', label: 'замысел', schema: PLAN }
);
log(`Замысел: задач ${plan.tasks.length}, этапов ${plan.steps.length}`);

// Ничего не записывается на диск отсюда: замысел и пробелы уходят владельцу, а `plan.md`
// пишет главный агент — вопросы к владельцу задаёт только он.
return { worth, draft, critique: critique.findings, plan };
