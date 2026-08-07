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

/**
 * Отдельные состояния. Набор компонента собирается из них, а не пишется строками на месте:
 * подпись и значение признака должны совпадать на всех страницах, иначе одно и то же состояние
 * в двух матрицах подписано по-разному и читается как два разных.
 */
export const STORY_STATE_DEFAULT: IStoryState = { name: 'обычное', state: null };
export const STORY_STATE_HOVER: IStoryState = { name: 'наведение', state: 'hover' };
export const STORY_STATE_ACTIVE: IStoryState = { name: 'нажатие', state: 'active' };
export const STORY_STATE_FOCUS_VISIBLE: IStoryState = { name: 'фокус с клавиши', state: 'focus-visible' };
export const STORY_STATE_FOCUS_WITHIN: IStoryState = { name: 'фокус внутри', state: 'focus-within' };

/** Состояния, которые есть у всего, что принимает наведение и фокус. */
export const STORY_STATES: readonly IStoryState[] = [STORY_STATE_DEFAULT, STORY_STATE_HOVER, STORY_STATE_ACTIVE, STORY_STATE_FOCUS_VISIBLE];

/**
 * Состояния поля, у которого рамку рисует коробка вокруг контрола. Фокус ловится **внутри**:
 * принимает его `<input>`, а `:focus-visible` на самой коробке не совпадает ни с чем.
 * Нажатия у поля нет — оно не кнопка.
 */
export const STORY_FIELD_STATES: readonly IStoryState[] = [STORY_STATE_DEFAULT, STORY_STATE_HOVER, STORY_STATE_FOCUS_WITHIN];

/**
 * Состояния поля, у которого рамку рисует сам контрол (`<textarea>`, нативный переключатель).
 * Тогда фокус — обычный `:focus-visible`, но передавать его надо со спуском до контрола.
 */
export const STORY_CONTROL_STATES: readonly IStoryState[] = [STORY_STATE_DEFAULT, STORY_STATE_HOVER, STORY_STATE_FOCUS_VISIBLE];

/** Подпись состояния для `app-story-row`. */
export const storyStateLabel: (value: IStoryState) => string = (value: IStoryState): string => value.name;

/**
 * Параметр `pseudo` для истории состояний. Ставится в `parameters` рядом с историей: без него
 * признаки в разметке есть, а классы аддон не вешает, и все ячейки выглядят обычными.
 *
 * Аддон вешает класс ровно на тот элемент, что подошёл под селектор, а правило со `:hover`
 * написано на том элементе, который стилизован. У части кита это не хост, а настоящий контрол
 * внутри шаблона (`<button>` в `rt-icon-button`) — признак ставится снаружи, на хост, и тогда
 * нужен спуск до контрола. Он и передаётся аргументом.
 *
 * @param target — селектор стилизованного элемента внутри хоста; пусто, если стилизован сам хост.
 */
export function storyPseudoParameters(target: string = ''): Readonly<Record<string, string>> {
    const at: (state: string) => string = (state: string): string =>
        `[${STORY_STATE_ATTRIBUTE}='${state}']${target === '' ? '' : ` ${target}`}`;

    return {
        hover: at('hover'),
        active: at('active'),
        focusVisible: at('focus-visible'),
        focusWithin: at('focus-within'),
    };
}

/** Готовый параметр для случая, когда стилизован сам элемент с признаком. */
export const STORY_PSEUDO_PARAMETERS: Readonly<Record<string, string>> = storyPseudoParameters();
