/**
 * Что команды учётных записей печатают.
 *
 * Строки собираются здесь, а не там, где ходят к хранилищу: печать — это решение, и оно
 * проверяется вызовом. Пароль сюда не приходит ни доводом, ни полем строки — печатать его
 * нечему и негде.
 */

/** Запись в списке: чем она называется, действует ли и когда ею входили. */
export interface IAccountSummaryRow {
    readonly name: string;
    /** Пусто — запись действует. Отключённая входа не заводит, а её прежние входы оборваны. */
    readonly disabledAt: Date | null;
    /** Время последнего входа. Пусто — этой записью ещё не входили ни разу. */
    readonly lastLoginAt: Date | null;
}

/** День без часов: список читает человек, и час входа ему ничего не говорит. */
function day(at: Date): string {
    return at.toISOString().slice(0, 'YYYY-MM-DD'.length);
}

/**
 * Список учётных записей: имя, состояние и день последнего входа.
 *
 * Пустой список говорит, чем заводится первая запись: свежая служба иначе выглядит поломкой
 * входа — любая пара отбивается тем же отказом, и отличить «ты ошибся» от «заводить некого»
 * нечем.
 */
export function accountListLines(rows: readonly IAccountSummaryRow[]): string[] {
    if (rows.length === 0) {
        return ['учётных записей не заведено ни одной', 'первая заводится командой account:add <имя>'];
    }

    return [
        `учётных записей заведено: ${rows.length}`,
        ...rows.map((row: IAccountSummaryRow): string => {
            const state: string = row.disabledAt ? `отключена ${day(row.disabledAt)}` : 'действует';
            const entered: string = row.lastLoginAt ? `последний вход ${day(row.lastLoginAt)}` : 'входов не было';

            return `  ${row.name} — ${state}, ${entered}`;
        }),
    ];
}
