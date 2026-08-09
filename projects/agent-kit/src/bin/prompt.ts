/**
 * Терминал: сырой режим, перерисовка и восстановление курсора. Решений здесь нет — переход
 * состояния по нажатой клавише живёт в `lib/picker.ts` и проверяется спекой.
 *
 * Всё, что этот модуль обязан сделать помимо перерисовки, — вернуть терминал в прежнее
 * состояние на любом выходе. Оставленный сырой режим ломает не программу, а оболочку после
 * неё: ввод перестаёт отзываться, и виноватым выглядит терминал.
 */
import process from 'node:process';

import { IChoice, IPickerState, pickerOf, pressChunk, renderPicker, singlePickerOf } from '../lib/picker.js';

const HIDE_CURSOR: string = `${String.fromCharCode(27)}[?25l`;
const SHOW_CURSOR: string = `${String.fromCharCode(27)}[?25h`;
const UP_AND_CLEAR: string = `${String.fromCharCode(27)}[1A${String.fromCharCode(27)}[2K`;

/** Спросить можно только там, где есть кого спрашивать: в конвейере и в CI — некого. */
export const canAsk: () => boolean = (): boolean => Boolean(process.stdin.isTTY && process.stdout.isTTY);

function draw(state: IPickerState, question: string, previous: number): number {
    const lines: readonly string[] = renderPicker(state, question);
    process.stdout.write(UP_AND_CLEAR.repeat(previous) + lines.join('\n') + '\n');

    return lines.length;
}

/** Спрашивание как таковое: сырой режим, перерисовка и возврат терминала на любом выходе. */
function askWith(
    start: (choices: readonly IChoice[]) => IPickerState,
    choices: readonly IChoice[],
    question: string
): Promise<readonly string[] | null> {
    if (!choices.length) {
        return Promise.resolve([]);
    }

    return new Promise((resolve: (value: readonly string[] | null) => void): void => {
        let state: IPickerState = start(choices);
        let drawn: number = 0;

        /** Обработчик приходит доводом, чтобы отпустить терминал ровно тот, что его занял. */
        const stop: (handler: (chunk: Buffer) => void) => void = (handler: (chunk: Buffer) => void): void => {
            process.stdin.off('data', handler);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdout.write(SHOW_CURSOR);
        };

        const onData: (chunk: Buffer) => void = (chunk: Buffer): void => {
            state = pressChunk(state, chunk.toString('utf8'));
            if (state.done || state.cancelled) {
                stop(onData);
                resolve(state.cancelled ? null : [...state.chosen]);

                return;
            }
            drawn = draw(state, question, drawn);
        };

        process.stdout.write(HIDE_CURSOR);
        drawn = draw(state, question, 0);
        // Сырой режим: клавиша доходит нажатием, а не строкой по enter, и Ctrl-C приходит
        // знаком в потоке вместо сигнала — потому он и разбирается наравне с остальными.
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onData);
    });
}

/**
 * Выбор галочками. Возвращает выбранные идентификаторы, а на брошенном выборе — `null`:
 * подставлять вместо ответа умолчание нельзя, потому что «взять всё» — тоже решение.
 */
export function ask(choices: readonly IChoice[], question: string): Promise<readonly string[] | null> {
    return askWith(pickerOf, choices, question);
}

/**
 * Выбор одного из. Тем же путём и с тем же брошенным выбором: вид, выбранный за проект молча,
 * разложил бы ему чужой git-flow — и заметил бы это тот, кто пошёл открывать заявку на слияние.
 */
export async function askOne(choices: readonly IChoice[], question: string): Promise<string | null> {
    const chosen: readonly string[] | null = await askWith(singlePickerOf, choices, question);

    return chosen?.length ? chosen[0] : null;
}
