import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement, EnvironmentProviders, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Observable, of } from 'rxjs';

import { Translation, TranslocoLoader, provideTransloco } from '@jsverse/transloco';

import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { RT_KIT_TRANSLATIONS } from '../lib/i18n/rt-kit-translations';
import { RT_KIT_TRANSLATION_NAMESPACE } from '../lib/i18n/rt-kit-translations.providers';

/**
 * Обвязка для спек кита. Здесь собрано то, без чего не поднимается ни один
 * компонент: словари подписей, `HttpClient` (его тянет реестр иконок), хранилище
 * и `PlatformService`.
 *
 * Отдельным файлом, а не копипастой в каждой спеке, потому что настройка
 * Transloco неочевидна: подписи кита лежат под неймспейсом `rtKit`, и если
 * отдать их не загрузчиком, а `setTranslation` после конфигурации, загрузка
 * языка перетирает их пустым словарём приложения — подпись в разметке молча
 * становится ключом, и проверка текста подтверждает ключ вместо подписи.
 */

/**
 * Загрузчик, отдающий вшитые словари кита под их собственным неймспейсом.
 *
 * Отдаёт именно `of(...)`, а не готовый объект: Transloco оборачивает результат
 * загрузчика в `from()`, и обычный объект там падает — отказ гасится внутренним
 * `catchError`, язык остаётся пустым, а подпись в разметке молча становится
 * пустой строкой. Синхронный Observable проходит `from()` без задержки, поэтому
 * подпись доезжает к первой же отрисовке и спеке не нужно ничего дожидаться.
 */
class RtKitTestTranslationLoader implements TranslocoLoader {
    public getTranslation(lang: string): Observable<Translation> {
        return of({ [RT_KIT_TRANSLATION_NAMESPACE]: RT_KIT_TRANSLATIONS[lang] ?? {} });
    }
}

/** Дополнения к TestBed поверх общей обвязки. */
export interface IRtFixtureOptions {
    providers?: (Provider | EnvironmentProviders)[];
    imports?: Type<unknown>[];
    /** Не гонять первую отрисовку — нужно, когда проверяется состояние до неё. */
    skipInitialDetect?: boolean;
}

/**
 * Провайдеры, общие для всех спек кита.
 *
 * `provideHttpClientTesting` ставится сразу за `provideHttpClient`: `RtIconRegistry`
 * инжектит `HttpClient` в поле, поэтому он нужен даже там, где ни одного запроса
 * не уходит, а backend-заглушка не даёт настоящему запросу уйти незамеченным.
 */
export function provideRtKitTesting(): (Provider | EnvironmentProviders)[] {
    return [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRtUtils(),
        provideRtStorage(),
        // Реестр настроек таблицы держит выбор колонок в IndexedDB и инжектит
        // сервис в поле — без провайдера не поднимается сама таблица.
        provideRtIDBStorage(),
        provideTransloco({
            config: {
                availableLangs: ['en', 'ru'],
                defaultLang: 'en',
                reRenderOnLangChange: false,
                missingHandler: { logMissingKey: false },
            },
            loader: RtKitTestTranslationLoader,
        }),
    ];
}

/** Ставит пачку входов разом. Отрисовку не гоняет — это дело вызывающего. */
export function setInputs<T>(fixture: ComponentFixture<T>, inputs: Readonly<Record<string, unknown>>): void {
    for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
    }
}

/**
 * Поднимает standalone-компонент с общей обвязкой и заданными входами.
 *
 * Входы ставятся только через `setInput`: они — `InputSignal`, присваивание в
 * поле экземпляра их не меняет.
 */
export function createRtFixture<T>(
    component: Type<T>,
    inputs: Readonly<Record<string, unknown>> = {},
    options: IRtFixtureOptions = {}
): ComponentFixture<T> {
    try {
        TestBed.configureTestingModule({
            imports: [component, ...(options.imports ?? [])],
            providers: [...provideRtKitTesting(), ...(options.providers ?? [])],
        });
    } catch {
        // Второй вызов внутри одного теста: настроить уже поднятый TestBed нельзя.
        // Сбрасываем и настраиваем заново — но прежняя фикстура при этом
        // уничтожается, так что двум живым фикстурам в одном тесте не бывать.
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [component, ...(options.imports ?? [])],
            providers: [...provideRtKitTesting(), ...(options.providers ?? [])],
        });
    }

    const fixture: ComponentFixture<T> = TestBed.createComponent(component);
    setInputs(fixture, inputs);

    if (options.skipInitialDetect !== true) {
        fixture.detectChanges();
    }

    return fixture;
}

/**
 * Элемент по `qa-dataid` — тому же атрибуту, по которому разметку находят
 * e2e-проверки. Поиск по нему, а не по классу, привязывает тест к точке,
 * заявленной разметкой, а не к оформлению.
 */
export function qa<T>(fixture: ComponentFixture<T>, id: string): DebugElement | null {
    return fixture.debugElement.query(By.css(`[qa-dataid="${id}"]`));
}

/** Все элементы с данным `qa-dataid`. */
export function qaAll<T>(fixture: ComponentFixture<T>, id: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(`[qa-dataid="${id}"]`));
}

/** Элемент по CSS-селектору. */
export function el<T>(fixture: ComponentFixture<T>, selector: string): DebugElement | null {
    return fixture.debugElement.query(By.css(selector));
}

/** Все элементы по CSS-селектору. */
export function els<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(selector));
}

/** Классы элемента списком. `null` на входе даёт пустой список. */
export function classesOf(target: DebugElement | HTMLElement | null): string[] {
    if (target === null) {
        return [];
    }
    const node: HTMLElement = target instanceof HTMLElement ? target : (target.nativeElement as HTMLElement);
    return Array.from(node.classList);
}

/** Классы host-элемента компонента. */
export function hostClasses<T>(fixture: ComponentFixture<T>): string[] {
    return classesOf(fixture.nativeElement as HTMLElement);
}

/** Текст элемента без краевых пробелов. `null` на входе даёт пустую строку. */
export function textOf(target: DebugElement | HTMLElement | null): string {
    if (target === null) {
        return '';
    }
    const node: HTMLElement = target instanceof HTMLElement ? target : (target.nativeElement as HTMLElement);
    return (node.textContent ?? '').trim();
}

/** Текст всей отрисованной разметки — для проверок «подпись доехала». */
export function renderedText<T>(fixture: ComponentFixture<T>): string {
    return textOf(fixture.nativeElement as HTMLElement);
}
