import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement, EnvironmentProviders, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';

/**
 * Обвязка для спек кита. Здесь собрано то, без чего не поднимается ни один
 * компонент: `HttpClient` (его тянет реестр иконок), хранилище и `PlatformService`.
 *
 * Подписей в этом списке нет намеренно: кит берёт их у токена, у которого есть
 * английское умолчание, и спека получает готовый текст без единой настройки.
 * Спеке, проверяющей подписи приложения, а не умолчания, надо добавить свой
 * `provideRtKitLabels(...)` в `providers` — общая обвязка его не навязывает.
 */

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

/**
 * Собирает `FileList` из обычного массива: в jsdom его нельзя ни создать, ни
 * присвоить, а компоненты выбора файлов читают именно `FileList` — с `length`,
 * `item()` и доступом по индексу.
 *
 * Порядок ключей важен: разложение массива приносит с собой собственный
 * `length`, поэтому свой ставится после него — иначе он же и затрётся.
 */
export function fileListOf(files: readonly File[]): FileList {
    return {
        ...files,
        length: files.length,
        item: (index: number): File | null => files[index] ?? null,
    } as unknown as FileList;
}
