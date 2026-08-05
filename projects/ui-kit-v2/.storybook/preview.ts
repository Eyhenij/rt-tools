import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { Observable, of } from 'rxjs';

import { provideTransloco, Translation, TranslocoLoader } from '@jsverse/transloco';
import { applicationConfig, Preview } from '@storybook/angular';

import { provideRtStorage } from '@rt-tools/core';

import { provideRtIcons } from '../src/lib/components/icon';
import { provideRtKitTranslations } from '../src/lib/i18n';

/**
 * Словари кита вшиты в пакет и раскладываются `provideRtKitTranslations()`, но
 * `provideTransloco` загрузчик требует всё равно. Отдаём пустой перевод: своих
 * ключей, кроме китовых, у витрины нет.
 */
class RtStorybookTranslocoLoader implements TranslocoLoader {
    public getTranslation(): Observable<Translation> {
        return of({});
    }
}

/**
 * Тему кит держит на `<html data-theme>` — тот же признак, что ставит
 * `ThemeService` в приложении. Переключатель Storybook пишет туда же, поэтому
 * витрина показывает ровно то, что увидит потребитель, а не свою имитацию.
 */
const applyTheme = (theme: string): void => {
    document.documentElement.dataset['theme'] = theme === 'dark' ? 'dark' : 'light';
};

const preview: Preview = {
    decorators: [
        applicationConfig({
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                provideRouter([]),
                provideRtStorage(),
                provideRtIcons('/icons'),
                provideTransloco({
                    config: {
                        availableLangs: ['en', 'ru'],
                        defaultLang: 'en',
                        fallbackLang: 'en',
                        reRenderOnLangChange: true,
                        prodMode: false,
                    },
                    loader: RtStorybookTranslocoLoader,
                }),
                provideRtKitTranslations(),
            ],
        }),
        (story, context) => {
            applyTheme(String(context.globals['theme'] ?? 'light'));

            return story();
        },
    ],
    globalTypes: {
        theme: {
            description: 'Тема кита — пишется в `<html data-theme>`',
            toolbar: {
                title: 'Тема',
                icon: 'circlehollow',
                items: [
                    { value: 'light', title: 'Светлая', icon: 'sun' },
                    { value: 'dark', title: 'Тёмная', icon: 'moon' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: 'light',
    },
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        options: {
            storySort: {
                order: ['Foundation', ['Design Tokens', ['Overview', 'Colors', 'Semantic', 'Spacing', 'Theming']], 'Components', '*'],
            },
        },
    },
};

export default preview;
