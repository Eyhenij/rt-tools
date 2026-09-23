import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideHttpClient } from '@angular/common/http';
import { Injectable, provideZonelessChangeDetection, signal, Signal } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { applicationConfig, Decorator, Preview } from '@storybook/angular';

import { provideTransloco, Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';

import { provideRtIDBStorage, provideRtStorage } from '@rt-tools/core';

import { provideRtIcons } from '../src/lib/components/icon';
import { provideRtKitLabels, TRtKitLabelKey, TRtKitLabelParams, TRtKitTranslator } from '../src/lib/i18n';
import { RT_KIT_LABELS_RU } from './showcase-labels.ru';
import { SHOWCASE_MESSAGES_RU } from './showcase-messages.ru';

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
const showcaseTranslator: Signal<TRtKitTranslator> = signal<TRtKitTranslator>((key: TRtKitLabelKey, params?: TRtKitLabelParams): string => {
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
 * Загрузчик словаря экрана. Словарь лежит рядом готовым объектом, а не файлом, который тянут по
 * сети: витрина собирается в статику, и запрос за переводом на снимке уходил бы в никуда —
 * страница снималась бы с ключами вместо подписей.
 *
 * Нужен он ради целых экранов уровня `Templates`: они берут подписи так же, как настоящее
 * приложение, — ключом через `| transloco`. Компонентам кита он не нужен и ничего им не меняет:
 * свои подписи кит берёт функцией-переводчиком из `provideRtKitLabels`.
 */
@Injectable({ providedIn: 'root' })
class ShowcaseTranslocoLoader implements TranslocoLoader {
    public getTranslation(): Observable<Translation> {
        return of(SHOWCASE_MESSAGES_RU);
    }
}

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
/** История, поданная декоратору: частичное применение, которое зовут без аргументов. */
type TDecoratorStory = Parameters<Decorator>[0];

/** Обстановка истории так, как её объявляет сама витрина. */
type TDecoratorContext = Parameters<Decorator>[1];

const applyTheme: (theme: string) => void = (theme: string): void => {
    document.documentElement.dataset['theme'] = theme === 'dark' ? 'dark' : 'light';
};

/**
 * Набор оформления всей страницы. Пара половин в историях показывает оба набора рядом, но всё, что
 * кит выносит поверх страницы — боковая панель, меню, окно, — живёт у `<body>`, вне половины, и
 * рисовалось своим набором. Признак на `<html>` достаёт и до них, и до значков: значок ищет признак
 * у ближайшего предка. Фиолетовая тема — та же, что на витрине первого кита.
 */
const applyPreset: (preset: string) => void = (preset: string): void => {
    const root: HTMLElement = document.documentElement;

    if (preset === 'own') {
        delete root.dataset['preset'];
    } else {
        root.dataset['preset'] = 'material';
    }

    if (preset === 'material-violet') {
        root.dataset['showcaseMaterialTheme'] = 'violet';
    } else {
        delete root.dataset['showcaseMaterialTheme'];
    }
};

const preview: Preview = {
    decorators: [
        applicationConfig({
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                // Адрес витрины живёт в хеше: путь страницы занят самой витриной — она открывает
                // историю адресом `iframe.html`, — и роутер, пишущий туда же, перезагружал бы
                // показ на каждом переходе.
                //
                // Набор маршрутов пуст: истории целых экранов объявляют свои сами, уже на
                // поднятом роутере. Внесённые сюда, они тянут за собой компоненты кита в момент
                // разбора настройки показа — раньше, чем те успевают объявиться, — и витрина
                // падает на круговом импорте вся целиком, а не одной историей.
                provideRouter([], withHashLocation()),
                provideRtStorage(),
                // Настройки колонок таблица держит в IndexedDB и внедряет службу полем: без
                // провайдера сама таблица не поднимается — истории падали на NG0201, показывая
                // пустую разметку вместо строк.
                provideRtIDBStorage(),
                provideRtIcons('/icons'),
                provideRtKitLabels({ translator: showcaseTranslator, locale: signal<string>('ru') }),
                // Подписи целых экранов уровня `Templates`. Стоят здесь, а не декоратором той
                // истории, которой понадобились: `| transloco` без провайдера роняет отрисовку
                // целиком, и следующая такая история падала бы заново.
                provideTransloco({
                    config: {
                        availableLangs: ['ru'],
                        defaultLang: 'ru',
                        reRenderOnLangChange: false,
                        prodMode: true,
                    },
                    loader: ShowcaseTranslocoLoader,
                }),
            ],
        }),
        // Типы берутся у самого декоратора витрины, а не собираются рядом: `StoryFn` описывает
        // историю целиком и требует аргументов, а декоратору приходит её частичное применение —
        // уже с подставленными значениями, и зовут его без аргументов.
        (story: TDecoratorStory, context: TDecoratorContext): ReturnType<Decorator> => {
            applyTheme(String(context.globals['theme'] ?? 'light'));
            applyPreset(String(context.globals['preset'] ?? 'own'));

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
        preset: {
            description: 'Набор оформления всей страницы — пишется в `<html data-preset>`',
            toolbar: {
                title: 'Набор',
                icon: 'paintbrush',
                items: [
                    { value: 'own', title: 'Свой набор' },
                    { value: 'material', title: 'Material' },
                    { value: 'material-violet', title: 'Material, фиолетовая тема первого кита' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: 'light',
        preset: 'own',
    },
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        options: {
            // Разделы идут по уровням атомарного дизайна: сначала основы, потом атомы, молекулы,
            // организмы и целые экраны. Порядок задаётся здесь, а не именами разделов: по алфавиту
            // молекулы встали бы перед организмами, а атомы — после обоих.
            storySort: {
                order: [
                    'Foundation',
                    ['Design Tokens', ['Overview', 'Colors', 'Semantic', 'Spacing', 'Theming']],
                    'Atoms',
                    'Molecules',
                    'Organisms',
                    'Templates',
                    '*',
                ],
            },
        },
    },
};

export default preview;
