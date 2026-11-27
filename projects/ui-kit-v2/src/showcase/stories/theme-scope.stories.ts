import { Meta, StoryObj } from '@storybook/angular';

import { TestRtThemeScopeDarkSetComponent } from './component/test-rt-theme-scope-dark-set.component';
import { TestRtThemeScopeComponent } from './component/test-theme-scope.component';

/**
 * История уровня основ, а не компонента: показывает приём, общий для всего кита, и поэтому
 * лежит при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней
 * не относится — у неё нет ни осей входов, ни состояний.
 *
 * Пары тем у неё нет намеренно: тема и есть её предмет. Половина, которой тулбар навязал бы
 * свою тему, показала бы ту же метку на другом фоне — вторая половина повторила бы первую и
 * ничего бы не сличала. Третьего состояния темы — «идти за машиной» — кадром не показать вовсе:
 * оно разрешается ответом машины, а машина у снимающего кадр всегда одна.
 */
export default {
    title: 'Foundation/Design Tokens/Theme Scope',
    component: TestRtThemeScopeComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtThemeScopeComponent>;

type TStory = StoryObj<TestRtThemeScopeComponent>;

export const ThemeScope: TStory = {};

/**
 * Тёмный узел набора внутри светлого куска под `rt-theme-dark` на `<html>`: кусок остаётся
 * светлым, а узел берёт свою тёмную тему.
 */
export const DarkSetNode: TStory = {
    render: () => ({
        moduleMetadata: { imports: [TestRtThemeScopeDarkSetComponent] },
        template: `<app-theme-scope-dark-set />`,
    }),
};
