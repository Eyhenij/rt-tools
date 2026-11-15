import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { STORY_PHONE_VIEWPORT } from '../story-snapshot';
import { STORY_PSEUDO_PARAMETERS } from '../story-states';
import { TestRtFormDictionaryComponent } from './component/test-form-dictionary.component';
import { TestRtFormSettingTileComponent } from './component/test-form-setting-tile.component';

/**
 * История уровня основ, а не компонента: показывает словарь, общий для всех панелей кита, и
 * поэтому лежит при обвязке показа. Договор о покрытии состояний к ней не относится — у словаря
 * нет ни осей входов, ни состояний.
 */
export default {
    title: 'Foundation/Design Tokens/Form Dictionary',
    component: TestRtFormDictionaryComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtFormDictionaryComponent>;

type TStory = StoryObj<TestRtFormDictionaryComponent>;

export const FormDictionary: TStory = {};

/**
 * Состояния плитки: наведение — на самой записи, фокус клавиатуры — на кнопке выключателя внутри
 * неё. Правило записи читает фокус через `:has(:focus-visible)`, и кольцо рисует сам выключатель,
 * поэтому признак фокуса спускается до кнопки.
 */
const SETTING_TILE_PSEUDO: Readonly<Record<string, string>> = {
    ...STORY_PSEUDO_PARAMETERS,
    focusVisible: "[data-story-state='focus-visible'] button.rt-toggle-switch",
};

const STEP_WAIT_MS: number = 5000;

/**
 * Раскрывает пояснения раскрытых плиток. У сворачиваемого текста нет входа раскрытия, а кнопка
 * «Ещё» появляется только после замера переполнения — её и ждём.
 */
async function expandLongText(context: { canvasElement: HTMLElement }): Promise<void> {
    const root: HTMLElement = context.canvasElement;
    const selector: string = '[qa-dataid="setting-tile-expand"] [qa-dataid="collapsible-text-toggle"]';
    const hosts: number = root.querySelectorAll('[qa-dataid="setting-tile-expand"]').length;
    const started: number = Date.now();

    while (root.querySelectorAll(selector).length < hosts) {
        if (Date.now() - started > STEP_WAIT_MS) {
            throw new Error(`За ${STEP_WAIT_MS} мс не дождались кнопок «Ещё»: ${root.querySelectorAll(selector).length} из ${hosts}`);
        }
        await new Promise((resolve: (value: unknown) => void): unknown => setTimeout(resolve, 50));
    }
    root.querySelectorAll<HTMLButtonElement>(selector).forEach((button: HTMLButtonElement): void => button.click());
    await new Promise((resolve: (value: unknown) => void): unknown => requestAnimationFrame(resolve));
}

const SETTING_TILE_DECORATORS: StoryObj<TestRtFormSettingTileComponent>['decorators'] = [
    moduleMetadata({ imports: [TestRtFormSettingTileComponent] }),
];

/**
 * Плитка настройки: запись-`label` в общей рамке, нажимается целиком. Сетка повторяет набор
 * `Setting Tile` макета: короткое, длинное и раскрытое пояснение при включённом и выключенном
 * выключателе × покой, наведение, фокус клавиатуры и отключённая плитка.
 */
export const SettingTile: StoryObj<TestRtFormSettingTileComponent> = {
    render: (): { template: string } => ({ template: '<app-form-setting-tile part="states" />' }),
    decorators: SETTING_TILE_DECORATORS,
    parameters: { pseudo: SETTING_TILE_PSEUDO, snapshot: { fullPage: true } },
    play: expandLongText,
};

/** Та же сетка в светлой и тёмной теме рядом. */
export const SettingTileThemes: StoryObj<TestRtFormSettingTileComponent> = {
    render: (): { template: string } => ({ template: '<app-form-setting-tile part="themes" />' }),
    decorators: SETTING_TILE_DECORATORS,
    parameters: { pseudo: SETTING_TILE_PSEUDO, snapshot: { fullPage: true } },
    play: expandLongText,
};

/** Шаги скругления общей рамки от none до full атрибутом `data-rt-radius`; без него — md. */
export const SettingTileRadius: StoryObj<TestRtFormSettingTileComponent> = {
    render: (): { template: string } => ({ template: '<app-form-setting-tile part="radius" />' }),
    decorators: SETTING_TILE_DECORATORS,
    parameters: { snapshot: { fullPage: true } },
};

/**
 * Плитка настройки в окне телефона: ширина 343, пояснение переносится, выключатель справа. Окно —
 * 375, как в рамке «Узкая ширина» макета, а не общее окно телефона витрины 360: кадр сверяется с
 * макетом наложением.
 */
export const SettingTileNarrow: StoryObj<TestRtFormSettingTileComponent> = {
    render: (): { template: string } => ({ template: '<app-form-setting-tile part="narrow" />' }),
    decorators: SETTING_TILE_DECORATORS,
    parameters: {
        pseudo: SETTING_TILE_PSEUDO,
        snapshot: { fullPage: true, viewport: { width: 375, height: STORY_PHONE_VIEWPORT.height } },
    },
    play: expandLongText,
};
