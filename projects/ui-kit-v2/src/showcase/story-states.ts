/**
 * Состояния взаимодействия для витрины: наведение, нажатие, фокус с клавиатуры.
 *
 * Мышью в статичной сетке ни одно из них не поймать, а стилизованы они в трети SCSS кита.
 * Рисует их `storybook-addon-pseudo-states`: он переписывает правила со `:hover` на классовые
 * и вешает класс на элементы, подошедшие под селектор из параметра истории.
 *
 * Признак — атрибут, а не класс, намеренно. Класс на элементе пришлось бы писать
 * `[class]`-привязкой, а её у половины кита занимает `@HostBinding('class')` самого
 * компонента: две привязки на один атрибут разрешаются неочевидно. Атрибут не пересекается
 * ни с чем.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 */

/** Признак, по которому аддон находит элемент селектором. */
export const STORY_STATE_ATTRIBUTE: string = 'data-story-state';

/** Одно состояние: подпись для ряда и значение признака (у обычного его нет). */
export interface IStoryState {
    readonly name: string;
    readonly state: string | null;
}

/** Состояния, которые есть у всего, что принимает наведение и фокус. */
export const STORY_STATES: readonly IStoryState[] = [
    { name: 'обычное', state: null },
    { name: 'наведение', state: 'hover' },
    { name: 'нажатие', state: 'active' },
    { name: 'фокус с клавиши', state: 'focus-visible' },
];

/** Подпись состояния для `app-story-row`. */
export const storyStateLabel: (value: IStoryState) => string = (value: IStoryState): string => value.name;

/**
 * Параметр `pseudo` для истории состояний. Ставится в `parameters` рядом с историей: без него
 * признаки в разметке есть, а классы аддон не вешает, и все ячейки выглядят обычными.
 */
export const STORY_PSEUDO_PARAMETERS: Readonly<Record<string, string>> = {
    hover: `[${STORY_STATE_ATTRIBUTE}='hover']`,
    active: `[${STORY_STATE_ATTRIBUTE}='active']`,
    focusVisible: `[${STORY_STATE_ATTRIBUTE}='focus-visible']`,
};
