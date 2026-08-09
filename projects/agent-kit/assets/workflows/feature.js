export const meta = {
    name: 'feature',
    description: 'План от PM, реализация по шагам, веер проверок QA и приёмка по исходному запросу',
    whenToUse: 'Крупная правка, которая заденет несколько слоёв: контракт, хранилище, приложения, переводы',
    phases: [
        { title: 'План', detail: 'PM разбивает задачу на шаги с признаками готовности' },
        { title: 'Реализация', detail: 'по шагу за раз — рабочее дерево одно на всех' },
        { title: 'Проверка', detail: 'QA веером: тесты, сборка, браузер, состязательный разбор' },
        { title: 'Приёмка', detail: 'PM сверяет сделанное с исходным запросом' },
    ],
};

// Задача приходит строкой в args; без неё сценарий бессмыслен.
const task = typeof args === 'string' ? args : (args?.task ?? '');
if (!task) {
    throw new Error('Нужна задача: передай её строкой в args');
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
                    scope: { type: 'string', description: 'что входит и что НЕ входит' },
                    done: { type: 'string', description: 'проверяемый признак готовности' },
                },
            },
        },
        risks: { type: 'array', items: { type: 'string' } },
        acceptance: { type: 'array', items: { type: 'string' }, description: 'критерии приёмки по исходному запросу' },
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
                    evidence: { type: 'string', description: 'вывод команды или замер, а не пересказ' },
                    severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
                    preExisting: { type: 'boolean' },
                },
            },
        },
        checked: { type: 'array', items: { type: 'string' } },
    },
};

phase('План');
const plan = await agent(
    `Задача от пользователя:\n\n${task}\n\nРазбери её и верни план. Шагов не больше шести; ` +
        `каждый — самостоятельная правка с проверяемым признаком готовности.`,
    { agentType: 'project-manager', label: 'план', schema: PLAN }
);
log(`План: ${plan.steps.length} шаг(ов), рисков ${plan.risks.length}`);

// Шаги идут по очереди, а не веером: рабочее дерево одно, и параллельные
// правки одних и тех же файлов затирали бы друг друга.
phase('Реализация');
const done = [];
for (const [index, step] of plan.steps.entries()) {
    const result = await agent(
        `Задача целиком: ${task}\n\nТвой шаг ${index + 1} из ${plan.steps.length}: ${step.title}\n` +
            `Границы: ${step.scope}\nПризнак готовности: ${step.done}\n\n` +
            `Уже сделано на предыдущих шагах:\n${done.join('\n') || '— ничего'}\n\n` +
            `Соблюдай правила дерева из CLAUDE.md и .claude/skills. Перед правкой файла загрузи ` +
            `подходящее правило через инструмент Skill — иначе гейт правил заблокирует правку. ` +
            `Никаких git-команд. Верни коротко: какие файлы изменил и чем подтверждается признак готовности.`,
        { label: `шаг ${index + 1}: ${step.title}`, phase: 'Реализация' }
    );
    done.push(`${step.title}: ${result ?? 'шаг не выполнен'}`);
}

// Здесь барьер оправдан: приёмке нужны все находки разом, а измерения
// независимы и честно параллелятся.
phase('Проверка');
const LENSES = [
    { key: 'тесты', prompt: 'Прогони юнит-тесты и e2e по затронутому. Отдели новые падения от доэтапных.' },
    { key: 'сборка', prompt: 'Прогони сборки затронутых приложений и линтеры. Доэтапные ошибки помечай как доэтапные.' },
    {
        key: 'браузер',
        prompt: 'Проверь результат в браузере замерами: вычисленные стили, геометрия, контраст. Серверы разработки уже подняты — свой не поднимай.',
    },
    {
        key: 'разбор',
        prompt: 'Состязательно разбери правку: граничные значения, вторая локаль, тёмная тема, узкий экран, отвалившийся сервер, отдача страницы сервером.',
    },
];
const reports = (
    await parallel(
        LENSES.map(
            (lens) => () =>
                agent(`Задача, которую выполняли: ${task}\n\nЧто сделано:\n${done.join('\n')}\n\n${lens.prompt}`, {
                    agentType: 'qa-engineer',
                    label: `qa: ${lens.key}`,
                    phase: 'Проверка',
                    schema: FINDINGS,
                })
        )
    )
).filter(Boolean);

const findings = reports.flatMap((report) => report.findings);
const blockers = findings.filter((finding) => finding.severity === 'blocker' && !finding.preExisting);
log(`Находок ${findings.length}, из них блокеров ${blockers.length}`);

phase('Приёмка');
const verdict = await agent(
    `Исходный запрос пользователя:\n\n${task}\n\nКритерии приёмки:\n${plan.acceptance.join('\n')}\n\n` +
        `Что сделано:\n${done.join('\n')}\n\nНаходки проверяющих:\n${JSON.stringify(findings, null, 1)}\n\n` +
        `Вынеси вердикт: что принято, что нет и почему. Отдельно назови, что из исходного запроса ` +
        `осталось незакрытым или тихо сузилось.`,
    { agentType: 'project-manager', label: 'приёмка', phase: 'Приёмка' }
);

return { plan, done, findings, blockers, verdict };
