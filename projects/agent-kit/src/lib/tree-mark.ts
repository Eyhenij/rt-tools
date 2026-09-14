/**
 * Признак дерева: чем дерево называет себя приёму.
 *
 * Лежит отдельно от отправки: признак читают отправка, отметка груза и строка запуска, а
 * отправка сама выросла до предела длины файла.
 */
import { createHash } from 'node:crypto';

/** Длина признака дерева в знаках шестнадцатеричной записи. */
const SLUG_LENGTH: number = 12;

/**
 * Адрес удалённого репозитория, приведённый к одному виду.
 *
 * Форм у него несколько — `git@host:владелец/имя.git`, `https://host/владелец/имя`, — и все они
 * ведут к одному дереву. Две рабочие копии одного репозитория обязаны дать один признак, а
 * непривёденные формы дали бы два.
 */
export function remoteMarkOf(remote: string): string {
    const named: string = remote
        .trim()
        .replace(/\.git$/, '')
        .replace(/^[a-z+]+:\/\//i, '')
        .replace(/^[^@/]+@/, '')
        .replace(/:/g, '/');
    let end: number = named.length;

    while (end > 0 && named[end - 1] === '/') {
        end -= 1;
    }

    return named.slice(0, end).toLowerCase();
}

/**
 * Признак дерева: короткое значение, различающее деревья и не выдающее их адреса.
 *
 * Считается хешем от адреса репозитория: по нему адрес не восстанавливается, а у двух рабочих
 * копий одного репозитория он один. Репозитория нет — берётся то, что назвала настройка: иначе
 * все такие деревья слились бы в одно, и число деревьев в сводке стало бы неправдой молча.
 */
export function treeSlugOf(remote: string, spoken: string): string {
    const mark: string = remoteMarkOf(remote);

    return mark ? createHash('sha256').update(mark, 'utf8').digest('hex').slice(0, SLUG_LENGTH) : spoken;
}
