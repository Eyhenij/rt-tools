import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection, signal, Signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { applicationConfig, Preview } from '@storybook/angular';

import { provideRtIDBStorage, provideRtStorage } from '@rt-tools/core';

import { provideRtIcons } from '../src/lib/components/icon';
import { provideRtKitLabels, RtKitLabelKey, RtKitLabelParams, RtKitTranslator } from '../src/lib/i18n';
import { RT_KIT_LABELS_RU } from './showcase-labels.ru';

/**
 * Подписи кита в витрине — русские, как и всё демонстрационное содержимое.
 *
 * Своего языка у кита нет: он берёт подписи функцией-переводчиком, которую даёт
 * приложение. Витрина здесь и есть приложение, и без этой функции она осталась
 * бы на английском умолчании — «Cancel» стояло бы рядом с «Отклонить заявку».
 *
 * Русский набор лежит рядом с витриной, а не в пакете: потребителю кита он не
 * достаётся, и формулировки продукта кит по-прежнему не знает.
 */
const showcaseTranslator: Signal<RtKitTranslator> = signal<RtKitTranslator>((key: RtKitLabelKey, params?: RtKitLabelParams): string => {
    const text: string | undefined = RT_KIT_LABELS_RU[key];
    if (text === undefined) {
        return '';
    }

    return params === undefined
        ? text
        : text.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match: string, name: string): string =>
              params[name] === undefined ? match : String(params[name])
          );
});

/**
 * Данные русской локали для `DatePipe`. Кит их не везёт намеренно: дату он форматирует по
 * активному языку приложения, а данные языка регистрирует само приложение. Витрина здесь и
 * есть приложение — без этой строки переписка падала на `Missing locale data for "ru"` и
 * рисовала пустоту вместо ленты сообщений.
 */
registerLocaleData(localeRu);

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
                // Настройки колонок таблица держит в IndexedDB и внедряет службу полем: без
                // провайдера сама таблица не поднимается — истории падали на NG0201, показывая
                // пустую разметку вместо строк.
                provideRtIDBStorage(),
                provideRtIcons('/icons'),
                provideRtKitLabels({ translator: showcaseTranslator, locale: signal<string>('ru') }),
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
