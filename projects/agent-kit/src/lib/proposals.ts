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
const SENT: RegExp = /^-\s+\*\*отправлено:\*\*\s*(\S+)/m;

export interface IProposal {
    readonly address: string;
    readonly resource: string;
    /** Тело блока без заголовка: место, повод и готовый текст. */
    readonly body: string;
    /** Ссылка на заведённую запись; пусто — не отправлялось. */
    readonly sent: string;
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
            found.push({ address, resource, body, file, sent: SENT.exec(body)?.[1] ?? '', line: at + 1 });
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

/**
 * Пометка об отправке дописывается в блок, а не в конец файла: блоков в файле несколько.
 *
 * Место считается от номера строки заголовка — но номера у всех блоков посчитаны при разборе, до
 * единой вставки, а каждая вставка сдвигает файл на строку вниз. Поэтому к номеру прибавляется
 * число пометок, уже стоящих выше: без этого вторая пометка встаёт на строку выше своего места,
 * пятая — на четыре, то есть посреди готового текста правки, а последнему блоку её не достаётся
 * вовсе, и при следующей отправке он уезжает вторым разом.
 */
export function markSent(text: string, proposal: IProposal, url: string): string {
    const lines: string[] = text.split('\n');
    const shift: number = lines.slice(0, proposal.line).filter((line: string): boolean => SENT.test(line)).length;
    // Пометка встаёт сразу под заголовок: конец блока определяется следующим заголовком, а его
    // может и не быть — тогда «конец» пришлось бы искать по пустым строкам в хвосте файла.
    lines.splice(proposal.line + shift, 0, `- **отправлено:** ${url}`);

    return lines.join('\n');
}
