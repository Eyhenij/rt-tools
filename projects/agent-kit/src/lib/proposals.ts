/**
 * Предложения по слою правил: разбор файла, отбор того, что уезжает наружу, и проверка на адрес
 * дерева.
 *
 * Файл пишет главный агент после разбора закрытой задачи — по блоку на предложение, с адресом в
 * заголовке. Адрес роль проставляет и так; здесь он впервые становится тем, что читает машина.
 *
 * Проверка на утечку живёт в этом же модуле не для удобства: предложение уезжает в чужой
 * репозиторий целиком, и запрет называть чужое дерево обязан держаться проверкой, а не памятью
 * того, кто пишет.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { byText } from './order.js';

/** Куда главный агент кладёт предложения. Путь от корня дерева. */
export const PROPOSALS_DIR: string = '.claude/rt-kit/proposals';

/** Адрес предложения: куда правка идёт. Наружу уезжает только первый. */
export const TO_PACKAGE: string = 'пакет';
export const TO_COMPANION: string = 'компаньон';
export const TO_TREE: string = 'дерево';

const ADDRESSES: readonly string[] = [TO_PACKAGE, TO_COMPANION, TO_TREE];

/** Разобранный заголовок блока. */
interface IHeading {
    readonly address: string;
    readonly resource: string;
}

/**
 * Заголовок блока: `## <адрес> · <ресурс>`. Разделитель — тот же, что в шаблоне.
 *
 * Разбирается строкой, а не образцом: образец на «слово, разделитель, остаток» перебирает
 * границу слова столько раз, сколько в строке знаков.
 */
function headingOf(line: string): IHeading | null {
    if (!line.startsWith('## ')) {
        return null;
    }

    const rest: string = line.slice(3);
    const at: number = rest.indexOf('·');

    if (at < 0) {
        return null;
    }

    const address: string = rest.slice(0, at).trim();
    const resource: string = rest.slice(at + 1).trim();

    return address && !address.includes(' ') && resource ? { address, resource } : null;
}

/** Пометка об отправке. По ней же предложение узнаётся отправленным. */
const SENT: RegExp = /^- +\*\*отправлено:\*\* *(\S+)/m;

/**
 * Поле ближайшего утверждения: точная цитата строки ресурса, к которой блок относится, — либо
 * слово о том, что ближайшего нет вовсе.
 *
 * Поле обязательно, и обязательно оно затем, чтобы ресурс был прочитан. Мерить похожесть текстов
 * пробовали замером: законное соседство двух статей одного правила дало 0.345 общих значимых
 * слов, а законный перенос удачной статьи на соседнее место — 0.355. Порога между ними нет, и
 * назначенный наугад он отбивал бы правки вместо повторов. Названная цитата судится фактом: она
 * в ресурсе либо есть, либо её там нет.
 */
const NEAREST: RegExp = /^- +\*\*ближайшее:\*\* *([^\n]+)/m;

/**
 * Слово о том, что ближайшего утверждения в ресурсе нет: цитировать нечего.
 *
 * Конец слова здесь проверяется отрицательным просмотром, а не границей слова: границу движок
 * считает по латинице и цифрам, и между «т» и пробелом её нет вовсе — образец с `\b` не совпал
 * бы ни с одним русским словом.
 */
const NOTHING_NEAR: RegExp = /^нет(?![а-яё])/i;

/**
 * Цитата ближайшего утверждения: кавычки-ёлочки, как в остальных текстах дерева.
 *
 * Ищется позициями, а не образцом: образец на «открыть, набрать не-закрывающих, закрыть» линтер
 * отбивает как ветвящийся, и поводы у него есть — строка без закрывающей кавычки перебирается им
 * до конца.
 */
function quotedIn(text: string): string {
    const from: number = text.indexOf('«');
    const to: number = from < 0 ? -1 : text.indexOf('»', from + 1);

    return from >= 0 && to > from ? text.slice(from + 1, to) : '';
}

/** Пометка любого рода: по ней считается сдвиг, когда в файл вставляют ещё одну. */
const MARKED: RegExp = /^- +\*\*(отправлено|отбито):\*\*/m;

export interface IProposal {
    readonly address: string;
    readonly resource: string;
    /** Тело блока без заголовка: место, повод и готовый текст. */
    readonly body: string;
    /** Ссылка на заведённую запись; пусто — не отправлялось. */
    readonly sent: string;
    /** Поле ближайшего утверждения, как его написали; пусто — поля нет вовсе. */
    readonly nearest: string;
    /** Файл, в котором блок лежит, путём от корня дерева. */
    readonly file: string;
    /** Строка заголовка в файле, считая с единицы. */
    readonly line: number;
}

/**
 * Блоки файла предложений.
 *
 * Незаполненный образец пропускается: в шаблоне ресурс стоит скобками — `rules/<правило>.md`, —
 * и отправить его значило бы завести запись о правке несуществующего файла.
 */
export function parseProposals(text: string, file: string): readonly IProposal[] {
    const lines: readonly string[] = text.split('\n');
    const found: IProposal[] = [];
    let at: number = -1;

    const close: (end: number) => void = (end: number): void => {
        if (at < 0) {
            return;
        }
        const heading: IHeading = headingOf(lines[at]) as IHeading;
        const body: string = lines
            .slice(at + 1, end)
            .join('\n')
            .trim();
        const { address, resource }: IHeading = heading;
        if (ADDRESSES.includes(address) && !resource.includes('<')) {
            found.push({
                address,
                resource,
                body,
                file,
                sent: SENT.exec(body)?.[1] ?? '',
                nearest: (NEAREST.exec(body)?.[1] ?? '').trim(),
                line: at + 1,
            });
        }
        at = -1;
    };

    lines.forEach((line: string, index: number): void => {
        if (line.startsWith('## ')) {
            close(index);
            if (headingOf(line) !== null) {
                at = index;
            }
        }
    });
    close(lines.length);

    return found;
}

/** Все файлы предложений дерева, в порядке имён. */
export function readProposals(root: string): readonly IProposal[] {
    const dir: string = join(root, PROPOSALS_DIR);
    if (!existsSync(dir)) {
        return [];
    }

    return readdirSync(dir)
        .filter((name: string): boolean => name.endsWith('.md'))
        .sort(byText)
        .flatMap((name: string): readonly IProposal[] => parseProposals(readFileSync(join(dir, name), 'utf8'), join(PROPOSALS_DIR, name)));
}

export interface ILeak {
    /** Строка блока, считая с единицы от заголовка. */
    readonly line: number;
    readonly text: string;
    readonly why: string;
}

/** Абсолютный путь машины: он не бывает общим ни для одного дерева, кроме этого. */
const ABSOLUTE: RegExp = /(^|[\s(`'"])(~\/|\/(Users|home|var|opt|srv|mnt)\/)\S+/;

/**
 * Что в тексте называет дерево, из которого предложение уезжает.
 *
 * `marks` — имена, которые знает только это дерево: корень, его последнее звено, адрес его
 * удалённого репозитория. Пакет их не угадывает — они приходят доводом с края.
 */
export function leaksIn(text: string, marks: readonly string[]): readonly ILeak[] {
    const found: ILeak[] = [];

    text.split('\n').forEach((line: string, index: number): void => {
        if (ABSOLUTE.test(line)) {
            found.push({ line: index + 1, text: line.trim(), why: 'абсолютный путь этой машины' });

            return;
        }
        const mark: string | undefined = marks.find((value: string): boolean => Boolean(value) && line.includes(value));
        if (mark) {
            found.push({ line: index + 1, text: line.trim(), why: `имя этого дерева: ${mark}` });
        }
    });

    return found;
}

/**
 * Чем дерево себя выдаёт. Последнее звено пути берётся отдельно от полного: в тексте оно
 * встречается чаще, чем путь целиком.
 */
export function marksOf(root: string, remote: string): readonly string[] {
    const name: string = basename(root);

    return [root, name, remote].filter(Boolean);
}

/** Один пробел вместо любой пробельной вереницы: цитата в блоке перенесена по своей ширине. */
function flat(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/** Почему блок не уезжает; пустая строка — уезжает. */
export function nearestMissing(proposal: IProposal, assetsDir: string): string {
    if (!proposal.nearest) {
        return 'поля «ближайшее» нет: назови точную строку ресурса, к которой это относится, и то, чего она не покрывает, — либо напиши «нет»';
    }
    if (NOTHING_NEAR.test(proposal.nearest)) {
        return '';
    }

    const quoted: string = quotedIn(proposal.nearest);
    if (!quoted) {
        return 'ближайшее названо без цитаты: строка ресурса приводится в кавычках-ёлочках дословно — иначе проверить нечего';
    }

    const path: string = join(assetsDir, proposal.resource);
    if (!existsSync(path)) {
        // Ресурса у этого дерева нет — сверять не с чем, и отбивать нечего: блок про ресурс,
        // которого пакет здесь не держит, судится на приёмной стороне.
        return '';
    }

    return flat(readFileSync(path, 'utf8')).includes(flat(quoted))
        ? ''
        : `цитаты нет в «${proposal.resource}»: ${flat(quoted).slice(0, 60)}… — либо ресурс не читали, либо утверждение переписано с тех пор`;
}

/**
 * Пометка об отправке дописывается в блок, а не в конец файла: блоков в файле несколько.
 *
 * Место считается от номера строки заголовка — но номера у всех блоков посчитаны при разборе, до
 * единой вставки, а каждая вставка сдвигает файл на строку вниз. Поэтому к номеру прибавляется
 * число пометок, уже стоящих выше: без этого вторая пометка встаёт на строку выше своего места,
 * пятая — на четыре, то есть посреди готового текста правки, а последнему блоку её не достаётся
 * вовсе, и при следующей отправке он уезжает вторым разом.
 */
export function markSent(text: string, proposal: IProposal, url: string, field: string = 'отправлено'): string {
    const lines: string[] = text.split('\n');
    // Сдвиг считает пометки обоих родов: отбитый блок получает свою, и следующая за ним встала бы
    // строкой выше своего места, если бы её не посчитали.
    const shift: number = lines.slice(0, proposal.line).filter((line: string): boolean => MARKED.test(line)).length;
    // Пометка встаёт сразу под заголовок: конец блока определяется следующим заголовком, а его
    // может и не быть — тогда «конец» пришлось бы искать по пустым строкам в хвосте файла.
    lines.splice(proposal.line + shift, 0, `- **${field}:** ${url}`);

    return lines.join('\n');
}
