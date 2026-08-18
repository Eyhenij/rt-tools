// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { OpenAsideButtonComponent } from './open-aside-button.component';

const meta: Meta<OpenAsideButtonComponent> = {
    title: 'Components/Aside',
    component: OpenAsideButtonComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {},
    args: { onClick: fn() },
};

export default meta;
type TStory = StoryObj<OpenAsideButtonComponent>;

export const Aside: TStory = {
    args: {},
};

/**
 * Панель, открытая нажатием. До нажатия в кадре одна кнопка: ни шапка, ни подвал, ни блок
 * ошибки запроса со своей кнопкой копирования на витрине не показаны ничем.
 */
export const AsideOpened: TStory = {
    args: {},
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const trigger: HTMLElement | null = canvasElement.querySelector('button');

        if (!trigger) {
            throw new Error('Кнопка, открывающая панель, в истории не отрисована');
        }

        await userEvent.click(trigger);
        await waitFor(() => expect(document.querySelector('rtui-aside-error-box')).toBeTruthy());
    },
};
