/**
 * Контракты `rt-night-grid` — плотная сетка суток.
 *
 * Домен в ui-kit не протаскивается: сетка знает про «свободно / основное /
 * второстепенное», а не про статусы броней. Маппинг доменных состояний на эти
 * три — забота потребителя.
 */
export namespace IRtNightGrid {
    export type State = 'free' | 'primary' | 'secondary';

    export interface Cell {
        readonly id: string;
        readonly state: State;
        /** Нативный title: подпись дня и, если занят, чем именно. */
        readonly title: string;
    }
}
