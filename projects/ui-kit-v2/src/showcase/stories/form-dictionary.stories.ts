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
 * Плитка настройки: запись-`label` в общей рамке, нажимается целиком. Четыре плитки повторяют
 * кадры макета `Setting Tile` — включена и выключена, в покое и при наведении — при ширине кадра
 * 492. Наведение рисует аддон состояний.
 */
export const SettingTile: StoryObj<TestRtFormSettingTileComponent> = {
    render: (): { template: string } => ({ template: '<app-form-setting-tile />' }),
    decorators: [moduleMetadata({ imports: [TestRtFormSettingTileComponent] })],
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

/** Плитка настройки в окне телефона: длинное название переносится, выключатель стоит справа. */
export const SettingTileNarrow: StoryObj<TestRtFormSettingTileComponent> = {
    render: (): { template: string } => ({ template: '<app-form-setting-tile [narrow]="true" />' }),
    decorators: [moduleMetadata({ imports: [TestRtFormSettingTileComponent] })],
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS, snapshot: { fullPage: true, viewport: STORY_PHONE_VIEWPORT } },
};
