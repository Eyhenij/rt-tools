import { IRtInlineEdit } from './rt-inline-edit.model';

/** Сколько знаков конца текста видно всегда при обрезке посередине. */
const MIDDLE_TAIL: number = 10;

/**
 * Чем кончается сохранение черновика. Черновик обрезается по краям; пустой не уходит, пока его не
 * разрешили; равный значению закрывает поле и ничего не шлёт.
 */
export function inlineEditOutcome(value: string, draft: string, allowEmpty: boolean): IRtInlineEdit.Outcome {
    const next: string = draft.trim();

    if (next === '' && !allowEmpty) {
        return { kind: 'refuse' };
    }

    return next === value ? { kind: 'close' } : { kind: 'save', value: next };
}

/**
 * Текст для обрезки посередине: последние десять знаков видны всегда, многоточие встаёт в начале.
 * Текст не длиннее двух концов не режется — весь он идёт началом. Знаки считаются по кодовым точкам,
 * поэтому пара суррогатов не рвётся.
 */
export function inlineEditMiddle(text: string): IRtInlineEdit.MiddleParts {
    const chars: string[] = Array.from(text);

    if (chars.length <= MIDDLE_TAIL * 2) {
        return { head: text, tail: '' };
    }

    return { head: chars.slice(0, -MIDDLE_TAIL).join(''), tail: chars.slice(-MIDDLE_TAIL).join('') };
}

/**
 * Ушёл ли фокус из компонента. Переход на свои кнопки уходом не считается: нажатие «Сохранить» или
 * «Отмена» начинается с ухода фокуса из поля. Неизвестная цель — окно или пустое место — уход.
 */
export function inlineEditLeaves(host: Node, target: EventTarget | null): boolean {
    return !(target instanceof Node && host.contains(target));
}
