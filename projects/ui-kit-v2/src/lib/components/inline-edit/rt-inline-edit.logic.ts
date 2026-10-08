import { IRtInlineEdit } from './rt-inline-edit.model';

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
 * Ушёл ли фокус из компонента. Переход на свои кнопки уходом не считается: нажатие «Сохранить» или
 * «Отмена» начинается с ухода фокуса из поля. Неизвестная цель — окно или пустое место — уход.
 */
export function inlineEditLeaves(host: Node, target: EventTarget | null): boolean {
    return !(target instanceof Node && host.contains(target));
}
