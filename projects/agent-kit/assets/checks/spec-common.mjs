/**
 * Общее для всех предметов сверки спеков: что считается доменом, чем читается дерево и чем
 * режется документ на разделы и пункты.
 *
 * Модуль назван не `check-*`, и это не украшение: умолчание пакета собирает набор гейта пуша
 * перебором имён `check-<что>.mjs` в каталоге проверок, и помощник с таким именем гейт стал бы
 * гонять как отдельную проверку.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const SPECS_DIR = CONFIG.specsDir;
const CONSTITUTION_DIR = 'docs/constitution';
/**
 * Каталоги под `docs/specs`, доменами не являющиеся: шаблон содержит образцы с
 * плейсхолдерами, и обязательных разделов у них нет.
 */
const NOT_DOMAINS = ['_template'];
/**
 * Где ищутся тесты. Берётся из настройки дерева, а не из кода: зашитые здесь корни молча не
 * находили ни одного теста у дерева, которое держит код иначе, — и каждый сценарий выглядел
 * непокрытым, притом что тест на него был.
 */
const TEST_ROOTS = CONFIG.sourceRoots;
/** Где ищется вызов символа из привязки. */
const SOURCE_ROOTS = [...CONFIG.sourceRoots, ...(CONFIG.schemaFile ? [CONFIG.schemaFile.split('/')[0]] : [])];
const SKIPPED_DIRS = CONFIG.skippedDirs;

/**
 * `### SC-BK-03 — заявка на занятые даты`
 *
 * Номер принимается от одной цифры до трёх. Заголовок, не подошедший под шаблон, сценария не
 * заводит и отказа не даёт: дерево, пронумеровавшее сценарии с единицы, теряло бы первые
 * девять из них молча — ни в покрытии, ни в долгах, при зелёной сверке.
 */
const SCENARIO_HEADING = /^###\s+(SC-([A-Z]{2,4})-(\d{1,3}))\s+—\s+(.+?)\s*$/;
/** Отметка осознанно непокрытого сценария; причина обязательна */
const UNCOVERED = /^Не покрыто:\s*\S/;
/** Тест есть, но проверяет не всё обещанное или идёт другим путём */
const PARTIAL = /^Покрытие:\s*частичное\s*—\s*\S/;
/** Упоминание сценария в заголовке теста; номер той же длины, что и в заголовке сценария */
const SCENARIO_REFERENCE = /\bSC-[A-Z]{2,4}-\d{1,3}\b/g;
/** Строка обещания сценария; её продолжения идут с отступом */
const PROMISE = /^Тогда\s+\S/;
/**
 * Человек перед экраном и его восприятие. Границы слова не ставятся: `\b` в JavaScript
 * считает буквой только латиницу, и `\bгость\b` не совпал бы ни разу.
 */
const ACTOR = /(гост[ьяию]|владел(?:ец|ьца|ьцу|ьцем)|сотрудник\w*|оператор\w*|пользовател\w+)/i;
const PERCEIVES = /(вид(?:ит|ят|но)|чита(?:ет|ют)|смотр(?:ит|ят))/i;
/** Сквозные тесты: только они идут тем же путём, что пользователь */
const E2E_ROOTS = CONFIG.e2eRoots;

/**
 * Якорь правила: `путь/к/файлу.ts:символ` в обратных кавычках. Расширение до восьми
 * букв — иначе `schema.prisma` не считается путём, и правило про умолчание колонки
 * выглядит как правило без якоря. Заглавные и десять букв нужны ради `api.Dockerfile`:
 * без них правило про режим исполнения образа считалось правилом с пустой привязкой,
 * а привязать его больше не к чему — режим объявлен ровно там.
 *
 * Символ — любая буква, а не только латинская: тексты, которые исполняет модель, написаны
 * своим языком, и латиницей в них называется ровно то, что утверждения не держит — имя поля
 * шапки, имя инструмента. Привязанное к имени поля утверждение остаётся зелёным, когда текст
 * переписан целиком. Алфавит не перечисляется диапазонами: перечисленные молча не покрывают
 * соседнего, и промах выглядит отсутствием привязки. Путь при этом остаётся латинским — он
 * адрес в дереве, а не слово текста.
 *
 * Решётка перед именем законна: приватное поле класса объявлено с ней, и записанное без неё имя
 * называет метод не тем именем, каким он объявлен. Проверка при этом остаётся зелёной — граница
 * слова перед решёткой есть, — поэтому промах не краснеет ни разу и виден только чтением.
 */
const ANCHOR = /`([\w./-]+\.[A-Za-z]{2,10}):(#?\p{L}[\p{L}\p{N}_-]*|#?_[\w-]*)`/gu;
/**
 * Явный вердикт вместо якоря: статья, которой в дереве исполняться негде. Так бывает
 * законно — правило говорит о службе, которой дерево не держит, или о движении человека,
 * до которого проверке не дотянуться: кнопку слияния нажимают в браузере, где хуков нет
 * вовсе. Якорь такой статье можно поставить только в файл, который её не исполняет, —
 * проверка примет, а читателю совратёт.
 *
 * Принимается вердикт с причиной, а не одно слово: пустой он становится способом закрыть
 * любую строку, и таблица за месяц превращается в список отговорок. Порог длины — та же
 * мера, что у обхода гарда документов: причина короче его причиной не считается.
 *
 * Конец слова ищется отрицательным просмотром, а не `\b`: границей слова JavaScript знает
 * только латиницу, и после кириллической буквы её нет вовсе — вердикт не опознавался ни
 * разу.
 */
const VERDICT = /^\s*(?:\*\*)?Не (?:исполняется|применимо|проверяется)(?![\p{L}\p{N}_])/u;
const VERDICT_MIN = 40;
/** Строка шапки, объявляющая либы, чьи процедуры домен обслуживает */
const PROCEDURE_ROOTS = /^\*\*Процедуры:\*\*\s*(.+)$/;
const BACKTICKED = /`([^`]+)`/g;

const REQUIRED_HEADINGS = [
    '## Зачем',
    '## Терминология',
    '### Как это называется в интерфейсе',
    '## Правила',
    '## Что не входит',
    '## Контракт',
    '### Коды отказов',
    '## Данные',
    '## Экраны и состояния',
    '## Сквозные требования',
    '### Локали',
    '### SEO',
    '### Мобильная раскладка',
    '### Мультиобъектность',
    '## Решения',
    '## Открытые вопросы',
    '## История изменений',
];

const problems = [];
const report = (where, message) => problems.push(`${where}: ${message}`);

function walk(dir, accept) {
    const found = [];
    let entries;
    try {
        entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
    } catch {
        return found;
    }

    for (const entry of entries) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.includes(entry.name)) {
                found.push(...walk(path, accept));
            }
        } else if (accept(entry.name)) {
            found.push(path);
        }
    }

    return found;
}

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const exists = (path) => existsSync(join(ROOT, path));

/** Директории доменов: `docs/specs/<домен>`, кроме шаблона. */
function collectDomains() {
    try {
        return readdirSync(join(ROOT, SPECS_DIR), { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && !NOT_DOMAINS.includes(entry.name))
            .map((entry) => entry.name);
    } catch {
        return [];
    }
}

/**
 * Строки раздела: от его заголовка до следующего заголовка того же или более
 * высокого уровня. Подразделы в раздел входят — «Коды отказов» разбираются
 * отдельно, но остаются частью «Контракта».
 */
function sectionOf(text, heading) {
    const level = heading.match(/^#+/)[0].length;
    const lines = text.split('\n');
    const start = lines.findIndex((line) => line.trimEnd() === heading);
    if (start < 0) {
        return [];
    }
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => {
        const marks = line.match(/^(#+)\s/);

        return marks && marks[1].length <= level;
    });

    return end < 0 ? rest : rest.slice(0, end);
}

/** Пункты списка верхнего уровня вместе с их продолжениями. */
function bulletsOf(lines) {
    const bullets = [];
    for (const [index, line] of lines.entries()) {
        if (/^-\s+\S/.test(line)) {
            bullets.push({ line: index, text: line });
        } else if (bullets.length && /^\s+\S/.test(line)) {
            bullets[bullets.length - 1].text += ` ${line.trim()}`;
        } else if (!line.trim()) {
            continue;
        } else if (/^[#|]/.test(line)) {
            // таблица или заголовок — список кончился
            break;
        }
    }

    return bullets;
}

export {
    SPECS_DIR,
    CONSTITUTION_DIR,
    NOT_DOMAINS,
    TEST_ROOTS,
    SOURCE_ROOTS,
    SKIPPED_DIRS,
    SCENARIO_HEADING,
    UNCOVERED,
    PARTIAL,
    SCENARIO_REFERENCE,
    PROMISE,
    ACTOR,
    PERCEIVES,
    E2E_ROOTS,
    ANCHOR,
    VERDICT,
    VERDICT_MIN,
    PROCEDURE_ROOTS,
    BACKTICKED,
    REQUIRED_HEADINGS,
    problems,
    report,
    walk,
    read,
    exists,
    collectDomains,
    sectionOf,
    bulletsOf,
};
