/**
 * Отправка предложения в очередь работ репозитория пакета.
 *
 * Единственное место пакета, которое ходит наружу, и ходит оно только по команде человека:
 * ни один гард в сеть не ходит вовсе. Вынесено отдельно, чтобы команда `propose` осталась
 * проверяемой: спека подставляет двойник и не заводит записей в живом репозитории.
 */
import { execFileSync } from 'node:child_process';

export interface IIssueInput {
    /** `владелец/репозиторий` — читается из манифеста пакета, а не зашито в код. */
    readonly repository: string;
    readonly title: string;
    readonly body: string;
    readonly label: string;
}

/** Чем заводится запись. Двойник в спеке — того же вида. */
export type TSubmit = (input: IIssueInput) => string;

/** Метка, по которой сведение находит предложения среди прочих записей. */
export const FEEDBACK_LABEL: string = 'agent-kit-feedback';

/**
 * `владелец/репозиторий` из адреса, записанного в манифесте пакета. Форм адреса несколько —
 * `git+https://…`, `git@…:…`, — и все они ведут к одной паре имён.
 */
export function repositoryOf(url: string): string {
    const found: RegExpExecArray | null = /(?:github\.com[/:])([^/]+)\/([^/.]+)/.exec(url);

    return found ? `${found[1]}/${found[2]}` : '';
}

/**
 * Запись в очереди работ через помощника хостинга.
 *
 * Помощник может быть подменён оболочкой пользователя, поэтому зовётся он именем, а не строкой
 * оболочки: подмена принимает те же доводы, но уходит в чужую учётную запись.
 */
export const ghIssue: TSubmit = (input: IIssueInput): string =>
    execFileSync(
        'gh',
        ['issue', 'create', '--repo', input.repository, '--title', input.title, '--label', input.label, '--body-file', '-'],
        { input: input.body, encoding: 'utf8' }
    ).trim();
