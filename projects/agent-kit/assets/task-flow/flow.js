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
    records: { open: {} },
    design: { open: {} },
    coupling: { open: {} },
  },

  measure: {
    grill: { written: { git: source.git, tree: source.tree } },
    epic: {
      declared: { git: source.git, host: source.host, tree: source.tree },
      nextTaken: { git: source.git, host: source.host, tree: source.tree },
      mergedMarked: { git: source.git, host: source.host, tree: source.tree },
      finished: { git: source.git, host: source.host, tree: source.tree },
    },
    agreement: { named: { git: source.git, tree: source.tree } },
    task: { taken: { git: source.git, host: source.host } },
    plan: { approved: { git: source.git, marks: source.marks, steps: source.steps, records: source.records } },
    progress: {
      mirrors: { git: source.git, steps: source.steps },
      done: { git: source.git, tree: source.tree, marks: source.marks, steps: source.steps },
    },
    footprint: { touched: { git: source.git } },
    design: {
      held: { git: source.git, design: source.design, coupling: source.coupling },
      gaps: { git: source.git, design: source.design, coupling: source.coupling },
    },
    folder: { archived: { git: source.git } },
    pr: { handed: { git: source.git, host: source.host } },
    copy: {
      outsideEpic: { git: source.git, host: source.host, tree: source.tree },
      outOfScenario: { git: source.git, host: source.host, tree: source.tree },
    },
    owner: {
      saidStop: { owner: source.owner },
      interrupted: { owner: source.owner },
      nudged: { owner: source.owner },
      stopCall: { owner: source.owner, session: source.session },
      backgroundBeforeStop: { owner: source.owner, session: source.session },
    },
    session: {
      wrote: { session: source.session },
      role: { session: source.session },
      menuLost: { session: source.session },
      forbidden: { session: source.session },
      idle: { session: source.session, tree: source.tree },
      unread: { session: source.session },
      waiting: { session: source.session, tree: source.tree },
      hung: { session: source.session, tree: source.tree },
    },
    host: { silent: { host: source.host } },
    // Read by the verdict before the release cases: a CI run nobody watches or a red run nobody read
    // holds the stop, the end of the scenario included.
    ci: { hold: { git: source.git, host: source.host, tree: source.tree, session: source.session, owner: source.owner } },
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
      action: 'create the task, the branch from its base, and the folder',
      pattern: 'task-flow-start',
      exit: measure.task.taken,
    },
    taken: {
      title: 'задача-взята',
      action: 'write the plan; once the owner approves it, run plan-red',
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
      exit: { all: [measure.footprint.touched, measure.design.held] },
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
      action: 'merge the PRs of the chain bottom-up, mark the merged tasks by the branch of the next one',
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
    // The owner stops the work by a stop word or by Esc; the turns a notice wakes after either are
    // released until a working order of `words.resume`. Own background started before the stop is held
    // ahead of these cases by `stopHold` of the verdict, until it is taken down or two refusals named it.
    stopWord: { when: measure.owner.saidStop, order: 2, log: 'a stop word of the owner' },
    interrupted: { when: measure.owner.interrupted, order: 3, log: 'the owner interrupted the turn' },
    // The state «работа-отдана» sends work to the background by its own action and goes on: there
    // the wait releases nothing.
    background: {
      when: { all: [measure.session.waiting, { not: measure.pr.handed }] },
      order: 4,
      log: 'a background task of the session runs',
    },
    noWrite: {
      when: {
        any: [
          measure.copy.outOfScenario,
          { all: [{ not: measure.session.wrote }, { not: measure.owner.nudged }] },
        ],
      },
      order: 5,
      log: 'no write to the tree, or a branch outside the scenario',
    },
    role: { when: measure.session.role, order: 6, log: 'a role session' },
    hostSilent: { when: measure.host.silent, order: 7, log: 'the host did not answer twice' },
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
    holdAfter: ['стоять', 'останавлива', 'ждать', 'спрашива'],
    // The stop holds until a working order: the plan of epic RT-3602, approved by the owner 24.11.
    resume: [
      'продолжай', 'продолжить', 'работай', 'делай', 'сделай', 'делай дальше', 'доделывай', 'иди дальше', 'доведи',
      'исправляй', 'чини', 'вливай', 'влей', 'мержи', 'вмержи', 'отправляй', 'выпускай', 'выпусти', 'обнови', 'заведи',
      'бери', 'ночной режим', 'одобряю', 'доделай', 'заверши', 'закончи', 'исправь', 'почини', 'переделай', 'запушь',
      'поехали', 'давай дальше', 'выпустить', 'вмержить', 'влить', 'запушить', 'продолжи', 'продолжаем', 'работаем',
      'keep going', 'go on', 'continue', 'proceed', 'go ahead', 'resume', 'carry on', 'fix it', 'do it', 'merge it',
    ],
    // A complaint about a stop is a working order, a question too: the owner's word 26.11 «Жалоба — тоже приказ».
    // A complaint that work was not stopped is none: `notStopped` of the stop measure keeps the stop.
    stopComplaint: [
      'почему ты стоишь', 'почему стоишь', 'почему ты встал', 'почему встал', 'почему ты остановил', 'почему остановил',
      'почему ты бросил', 'почему бросил', 'снова остановил', 'опять остановил', 'снова стоишь', 'опять стоишь', 'только что стоял',
      'заблокировал работу', 'блокируешь работу', 'работа заблокирована', 'работа стоит', 'работа полностью стоит',
      'хватит стоять', 'хватит останавлива', 'хватит ждать', 'хватит спрашива', 'не стой', 'не останавливайся',
      'не останавливайтесь', 'чё стоишь', 'что стоишь', 'чего стоишь', 'чё встал', 'что встал', 'чего встал', 'опять встал',
      'снова встал', 'бросил работу', 'всё бросил', 'прекратил работу', 'почему ты не работаешь', 'почему ничего не делаешь', 'почему ты ничего не делаешь', 'почему ты не продолжаешь',
      'почему не продолжаешь', 'чего ты ждёшь', 'чего ждёшь',
    ],
    stopInside: ['стоп', 'стой', 'stop', 'хватит', 'прекрати', 'не двигайся', 'остановить работу', 'остановись', 'прекрати работать', 'сделай паузу', 'сделай перерыв'],
    stay: ['без предпочтения', 'инцидент', 'разбор', 'приёмник', 'приемник'],
    nudge: '(?<![\\p{L}])(?<!не )(продолжай|доделывай|работай|делай дальше|работаешь)(?![\\p{L}])|почему (ты )?(стоишь|встал|остановил)|что дальше|дальше\\?|^(ну )?(и )?что там|^ну и\\s*[?!.]|какого .*останов',
    write: [
      'git commit', 'git push', 'git add', 'git merge', 'git rm', 'git mv', 'sed -i', 'perl -pi', 'gh pr', 'npm run task:new', 'pnpm run task:new', 'npm run task:move',
      'pnpm run task:move', 'npm run agent-kit:sync', 'pnpm run agent-kit:sync',
    ],
    menu: ['отложить RT-N', 'подскажу путь'],
    legacyBranches: ['RT-3276-conversation-checks', 'RT-3329-task-flow-scenario'],
  },

  expect: {
    exit: { pattern: '^exit (\\d+)$', compare: 'exit' },
    line: { pattern: '^`(.*)`$', compare: 'line' },
    regex: { pattern: '^/(.*)/$', compare: 'regex' },
    number: { pattern: '^(=|>=|<=) ?(-?\\d+)$', compare: 'number' },
  },
});
