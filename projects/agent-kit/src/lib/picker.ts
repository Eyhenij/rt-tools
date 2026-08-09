/**
 * Выбиралка галочками — её состояние и разметка, без единого касания терминала.
 *
 * Отделено от ввода-вывода по той же причине, что и команды: нажатие клавиши — это переход
 * состояния, и проверять его надо спекой, а не глазами на живом терминале. Сырой режим,
 * перерисовка и восстановление курсора живут на краю, в `bin/prompt.ts`, и не решают ничего.
 */

export interface IChoice {
    readonly id: string;
    /** Имя, которым ресурс называют в строке запуска: `access`. */
    readonly name: string;
    /** Заголовок ресурса — им человек и выбирает, имена ему ни о чём не говорят. */
    readonly title: string;
}

export interface IPickerState {
    readonly choices: readonly IChoice[];
    readonly cursor: number;
    readonly chosen: ReadonlySet<string>;
    /**
     * Выбирается ровно один. Вид ресурса галочками не набирается: репозиторий лежит либо в
     * одном месте, либо в другом, и «оба» здесь означало бы два правила поставки в одном дереве.
     */
    readonly single: boolean;
    /** Выбор окончен, `chosen` — ответ. */
    readonly done: boolean;
    /** Выбор брошен: ответа нет, и подставлять вместо него умолчание нельзя. */
    readonly cancelled: boolean;
}

/** Первым предложением взято всё: отказ от закона — решение, и принимать его должен человек. */
export function pickerOf(choices: readonly IChoice[]): IPickerState {
    return {
        choices,
        cursor: 0,
        chosen: new Set(choices.map((choice: IChoice): string => choice.id)),
        single: false,
        done: false,
        cancelled: false,
    };
}

/**
 * Выбор одного из. Отмечено то, что под курсором, и переезд курсора переносит отметку: так
 * ответ есть в любой момент, и enter отвечает без единого нажатия пробела.
 */
export function singlePickerOf(choices: readonly IChoice[]): IPickerState {
    return {
        choices,
        cursor: 0,
        chosen: new Set(choices.slice(0, 1).map((choice: IChoice): string => choice.id)),
        single: true,
        done: false,
        cancelled: false,
    };
}

/**
 * Клавиши сырого потока. Записаны кодами, а не знаками: управляющий знак посреди исходника
 * невидим, и правка рядом с ним ломает разбор молча.
 *
 * Стрелка приходит целиком, тремя знаками, — сравнивать надо всю последовательность.
 */
const ESCAPE: string = String.fromCharCode(27);

export const KEY_UP: string = `${ESCAPE}[A`;
export const KEY_DOWN: string = `${ESCAPE}[B`;
export const KEY_ESCAPE: string = ESCAPE;
export const KEY_CANCEL: string = String.fromCharCode(3);

const UP: readonly string[] = [KEY_UP, 'k'];
const DOWN: readonly string[] = [KEY_DOWN, 'j'];
const DONE: readonly string[] = ['\r', '\n'];
/** Ctrl-C и escape. Оба — «я передумал», и оба обязаны уйти без записи. */
const CANCEL: readonly string[] = [KEY_CANCEL, KEY_ESCAPE];

function moved(state: IPickerState, step: number): IPickerState {
    const count: number = state.choices.length;
    if (!count) {
        return state;
    }
    const cursor: number = (state.cursor + step + count) % count;
    const chosen: ReadonlySet<string> = state.single ? new Set([state.choices[cursor].id]) : state.chosen;

    return { ...state, cursor, chosen };
}

function toggled(state: IPickerState): IPickerState {
    const choice: IChoice | undefined = state.choices[state.cursor];
    if (!choice) {
        return state;
    }
    // При выборе одного пробел ставит отметку, но не снимает: отметить нечего — ответа не
    // осталось бы вовсе, а брошенный выбор здесь говорится отдельной клавишей.
    if (state.single) {
        return { ...state, chosen: new Set([choice.id]) };
    }
    const chosen: Set<string> = new Set(state.chosen);
    if (!chosen.delete(choice.id)) {
        chosen.add(choice.id);
    }

    return { ...state, chosen };
}

function switched(state: IPickerState): IPickerState {
    if (state.single) {
        return state;
    }
    const all: boolean = state.chosen.size === state.choices.length;

    return { ...state, chosen: all ? new Set() : new Set(state.choices.map((choice: IChoice): string => choice.id)) };
}

/**
 * Кусок сырого потока, разобранный на клавиши.
 *
 * Терминал не обещает по куску на нажатие: набранное быстро, вставленное из буфера и всё, что
 * пришло по конвейеру, приезжает одной строкой. Неразобранный кусок читался бы как одна
 * незнакомая клавиша, и выбиралка молча не отзывалась бы ни на что — так она и повисла на
 * первом прогоне через конвейер.
 *
 * Escape-последовательность берётся целиком: `ESC [ A` — это стрелка, а не escape и две буквы.
 */
export function keysOf(chunk: string): readonly string[] {
    const points: readonly string[] = Array.from(chunk);
    const keys: string[] = [];

    for (let index: number = 0; index < points.length; index++) {
        if (points[index] === ESCAPE && points[index + 1] === '[' && points[index + 2] !== undefined) {
            keys.push(points.slice(index, index + 3).join(''));
            index += 2;
        } else {
            keys.push(points[index]);
        }
    }

    return keys;
}

/** Переход состояния по одной нажатой клавише. Незнакомая клавиша не делает ничего. */
export function pressKey(state: IPickerState, key: string): IPickerState {
    if (state.done || state.cancelled) {
        return state;
    }
    if (UP.includes(key)) {
        return moved(state, -1);
    }
    if (DOWN.includes(key)) {
        return moved(state, 1);
    }
    if (CANCEL.includes(key)) {
        return { ...state, cancelled: true };
    }
    if (DONE.includes(key)) {
        return { ...state, done: true };
    }
    if (key === ' ') {
        return toggled(state);
    }
    if (key === 'a') {
        return switched(state);
    }

    return state;
}

/** Кусок потока целиком: разобрать на клавиши и провести состояние через каждую. */
export const pressChunk: (state: IPickerState, chunk: string) => IPickerState = (state: IPickerState, chunk: string): IPickerState =>
    keysOf(chunk).reduce(pressKey, state);

const widest: (choices: readonly IChoice[]) => number = (choices: readonly IChoice[]): number =>
    choices.reduce((width: number, choice: IChoice): number => Math.max(width, choice.name.length), 0);

/** Разметка выбиралки строками. Курсор — стрелкой, выбранное — крестиком или точкой в скобках. */
export function renderPicker(state: IPickerState, question: string): readonly string[] {
    const width: number = widest(state.choices);
    const help: string = state.single
        ? '  ↑↓ — двигаться, enter — готово'
        : '  ↑↓ — двигаться, пробел — выбрать, a — все или ни одного, enter — готово';

    return [
        question,
        help,
        '',
        ...state.choices.map((choice: IChoice, index: number): string => {
            const marked: boolean = state.chosen.has(choice.id);
            const mark: string = state.single ? (marked ? '(•)' : '( )') : marked ? '[x]' : '[ ]';

            return `${index === state.cursor ? '❯' : ' '} ${mark} ${choice.name.padEnd(width)}  ${choice.title}`;
        }),
    ];
}
