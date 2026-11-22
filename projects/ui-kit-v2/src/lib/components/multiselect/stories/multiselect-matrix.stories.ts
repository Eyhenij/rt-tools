import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtMultiselectMatrixComponent } from './component/test-multiselect-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Forms/Multiselect',
    component: TestRtMultiselectMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMultiselectMatrixComponent>;

type TStory = StoryObj<TestRtMultiselectMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Chips: TStory = { args: { part: 'chips' } };

export const Bordered: TStory = { args: { part: 'bordered' } };

/**
 * Рамку и кольцо рисует `<button>` внутри хоста, а признак стоит на хосте — аддону передан
 * спуск до него: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-multiselect__trigger') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };

/**
 * Раскрытый список. Открывает его `play`-функция клавишей, а не щелчком: клавиша заодно
 * подсвечивает первую опцию, и состояние `--active` иначе в витрине не увидеть.
 *
 * Панель рисуется в контейнере оверлеев CDK — за пределами блока истории, поэтому её нет
 * ни в светло-тёмной паре, ни в матрице состояний: тёмную панель смотрят переключателем
 * темы в тулбаре.
 */
export const Panel: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'panel', panel: 'options' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Пустой набор опций: строка `rtKit.uiNoOptions` вместо списка. */
export const PanelEmpty: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'panel', panel: 'empty' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/**
 * Вид `toggles`: три поля макета 8293:3667 в ряд при ширине 280 — «Все», «N из M» и открытое. Панель
 * открытого поля — отдельная история `TogglesPanel`: открытая панель в истории одна.
 */
export const Toggles: TStory = { args: { part: 'toggles' } };

/**
 * Открытая панель вида `toggles`: «Показать все», свой переключатель приложения «Скрыть пустые»
 * из слота `rtMultiselectExtra`, черта и по переключателю на каждую опцию. Открывает её клавиша,
 * как у `Panel`. Узел панели назван снимку параметром `overlay`: обвязка сверяет его наличие
 * в кадре, а не число панелей на странице. Телефонная шторка — история `MultiselectSheet`.
 */
export const TogglesPanel: TStory = {
    parameters: { snapshot: { fullPage: true, overlay: '.rt-multiselect__panel' } },
    args: { part: 'toggles-panel' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/**
 * Дерево опций: в области выбраны все листья — её флажок включён, у округа над ней выбрана часть —
 * промежуточный. Ветки над выбранным раскрыты при открытии, соседний округ свёрнут.
 */
export const PanelTree: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'panel', panel: 'tree' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};
