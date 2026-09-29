import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { provideRtKit } from '../../lib/config/rt-kit-config.providers';
import { TestRtKitSettingsComponent } from './component/test-kit-settings.component';

/**
 * История уровня основ, а не компонента: показывает приём, общий для всего кита, и поэтому
 * лежит при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней
 * не относится — у неё нет ни осей входов, ни состояний.
 *
 * Настройки объявлены декоратором самой истории, а не в `preview.ts`: без них кит работает, и
 * история отличается от всей остальной витрины ровно тем, что они заданы. Раздача в общей
 * обвязке перекрасила бы каждую соседнюю историю.
 */
export default {
    title: 'Foundation/Design Tokens/Kit Settings',
    component: TestRtKitSettingsComponent,
    decorators: [
        applicationConfig({
            providers: [provideRtKit({ components: { button: { size: 'lg', appearance: 'outlined' } } })],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtKitSettingsComponent>;

type TStory = StoryObj<TestRtKitSettingsComponent>;

export const KitSettings: TStory = {};
