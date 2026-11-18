// The task flow as an executable scenario: the data language of `flow-syntax.mjs`, nothing here runs.
// A state is left when its exit is measured; the first state whose exit is unmet is where the work
// stands. A release case says when a turn may end before the scenario does. A new fact is a new
// measurer in `measure/`; a new combination of facts is a line here.
({
  source: {
    git: { open: {} },
    tree: { open: {} },
    host: { open: {} },
    marks: { open: {} },
    owner: { open: {} },
    session: { open: {} },
    steps: { open: {} },
  },

  measure: {
    grill: { written: { git: source.git, tree: source.tree } },
    epic: {
      declared: { git: source.git, host: source.host, tree: source.tree },
      nextTaken: { git: source.git, host: source.host, tree: source.tree, owner: source.owner },
      mergedMarked: { git: source.git, host: source.host, tree: source.tree },
      finished: { git: source.git, host: source.host, tree: source.tree },
      ownerStep: { git: source.git, host: source.host, tree: source.tree, owner: source.owner },
    },
    agreement: { named: { git: source.git, tree: source.tree } },
    task: { taken: { git: source.git, host: source.host } },
    plan: { approved: { git: source.git, marks: source.marks, steps: source.steps } },
    progress: {
      mirrors: { git: source.git, steps: source.steps },
      done: { git: source.git, tree: source.tree, marks: source.marks, steps: source.steps },
    },
    footprint: { touched: { git: source.git } },
    folder: { archived: { git: source.git } },
    pr: { handed: { git: source.git, host: source.host } },
    copy: {
      outsideEpic: { git: source.git, host: source.host, tree: source.tree },
      outOfScenario: { git: source.git, host: source.host, tree: source.tree },
    },
    owner: { saidStop: { owner: source.owner }, nudged: { owner: source.owner } },
    session: {
      wrote: { session: source.session },
      role: { session: source.session },
      menuLost: { session: source.session },
      forbidden: { session: source.session },
      idle: { session: source.session },
    },
    host: { silent: { host: source.host } },
  },

  state: {
    request: {
      title: 'просьба-не-разобрана',
      action: 'explore the tree, then ask the questions',
      pattern: 'task-flow-start',
      exit: measure.grill.written,
    },
    epic: {
      title: 'эпик-заведён',
      action: 'take the epic branch from the main branch; the epic card moves with the first task',
      pattern: 'epic-flow-declare',
      exit: measure.epic.declared,
    },
    grill: {
      title: 'разбор-закрыт',
      action: 'write the product agreement, or the reason there is none',
      pattern: 'task-flow-start',
      exit: measure.agreement.named,
    },
    agreement: {
      title: 'договорённость-записана',
      action: 'create the task, the branch from the epic branch, and the folder',
      pattern: 'task-flow-start',
      exit: measure.task.taken,
    },
    taken: {
      title: 'задача-взята',
      action: 'write the plan',
      pattern: 'task-flow-start',
      exit: measure.plan.approved,
    },
    planned: {
      title: 'замысел-записан',
      action: 'do the first stage',
      pattern: 'task-flow-start',
      exit: measure.progress.mirrors,
    },
    stage: {
      title: 'этап-идёт',
      action: 'finish the stage: `step N.M` measures each step and marks it done',
      pattern: 'task-flow-resume',
      exit: measure.progress.done,
    },
    stagesOver: {
      title: 'этапы-кончились',
      action: 'merge the agreement, bring the texts up to date, run the suite',
      pattern: 'task-flow-close',
      exit: measure.footprint.touched,
    },
    reviewOver: {
      title: 'разбор-кончился',
      action: 'take the folder apart by the last commit',
      pattern: 'task-flow-archive',
      exit: measure.folder.archived,
    },
    folderGone: {
      title: 'папка-разобрана',
      action: 'the work queue audit, then open the PR',
      pattern: 'task-flow-close',
      exit: measure.pr.handed,
    },
    handed: {
      title: 'работа-отдана',
      action: 'send the rules review to the background, then take the next task of the epic',
      pattern: 'task-flow-archive',
      exit: measure.epic.nextTaken,
    },
    merged: {
      title: 'влито',
      action: 'mark the task merged in the epic plan by the branch of the next task',
      pattern: 'task-flow-resume',
      exit: measure.epic.mergedMarked,
    },
    epicOver: {
      title: 'задачи-эпика-кончились',
      action: 'open the PR of the epic into the main branch',
      pattern: 'task-flow-close',
      exit: measure.epic.finished,
      end: true,
    },
  },

  release: {
    scenarioEnd: {
      when: { any: [measure.epic.finished, { all: [measure.copy.outsideEpic, measure.pr.handed] }] },
      order: 1,
      log: 'the end of the scenario',
    },
    stopWord: { when: measure.owner.saidStop, order: 2, log: 'a stop word of the owner' },
    noWrite: {
      when: {
        any: [
          measure.copy.outOfScenario,
          { all: [{ not: measure.session.wrote }, { not: measure.owner.nudged }] },
        ],
      },
      order: 3,
      log: 'no write to the tree, or a branch outside the scenario',
    },
    role: { when: measure.session.role, order: 4, log: 'a role session' },
    hostSilent: { when: measure.host.silent, order: 5, log: 'the host did not answer twice' },
    menuLost: { when: measure.session.menuLost, order: 8, log: 'the menu did not reach the owner' },
  },

  words: {
    stop: [
      'стоп', 'стой', 'хватит', 'остановись', 'прекрати', 'не сейчас', 'подожди', 'погоди', 'жди',
      'пауза', 'отбой', 'на сегодня всё', 'stop', 'wait', 'not now', 'pause',
    ],
    stopExcept: [
      'продолжай', 'делай', 'работай', 'доделывай', 'иди дальше', 'делай дальше', 'сначала', 'спрашивать',
      'спрашивай', 'asking', 'keep going', 'go on',
    ],
    holdAfter: ['стоять', 'останавлива', 'ждать'],
    nudge: '(?<![\\p{L}])(?<!не )(продолжай|доделывай|работай|делай дальше|работаешь)(?![\\p{L}])|почему (ты )?(стоишь|встал|остановил)|что дальше|дальше\\?|^(ну )?(и )?что там|^ну и\\s*[?!.]|какого .*останов',
    write: [
      'git commit', 'git push', 'git add', 'git merge', 'git rm', 'git mv', 'sed -i', 'perl -pi', 'gh pr', 'npm run task:new', 'pnpm run task:new', 'npm run task:move',
      'pnpm run task:move', 'npm run agent-kit:sync', 'pnpm run agent-kit:sync',
    ],
    menu: ['отложить RT-N', 'сделаю сам', 'стоп'],
    legacyBranches: ['RT-3276-conversation-checks', 'RT-3329-task-flow-scenario'],
  },

  expect: {
    exit: { pattern: '^exit (\\d+)$', compare: 'exit' },
    line: { pattern: '^`(.*)`$', compare: 'line' },
    regex: { pattern: '^/(.*)/$', compare: 'regex' },
    number: { pattern: '^(=|>=|<=) ?(-?\\d+)$', compare: 'number' },
  },
});
