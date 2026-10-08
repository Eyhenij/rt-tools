import { Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { classesOf, createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE, RtDynamicSelectorPopupComponent } from './rt-dynamic-selector-popup.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
    { id: 3, name: 'Vera' },
];

type TPopupFixture = ComponentFixture<RtDynamicSelectorPopupComponent<IPerson>>;

/**
 * Двойник наблюдателя пересечений: в среде без браузера его нет, а догрузка держится на нём.
 * Помнит свои экземпляры — приход маяка в видимость повторяется на последнем.
 */
class ObserverDouble {
    public static readonly created: ObserverDouble[] = [];

    constructor(public readonly callback: IntersectionObserverCallback) {
        ObserverDouble.created.push(this);
    }

    public observe(): void {
        // Наблюдать нечего: приход маяка вызывает сам тест.
    }

    public disconnect(): void {
        // Снимать нечего.
    }

    public reach(): void {
        this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
}

function setup(inputs: Readonly<Record<string, unknown>> = {}, providers: Provider[] = []): TPopupFixture {
    return createRtFixture<RtDynamicSelectorPopupComponent<IPerson>>(
        RtDynamicSelectorPopupComponent,
        { entities: PEOPLE, keyExp: 'id', displayExp: 'name', ...inputs },
        { providers: [provideRouter([]), ...providers] }
    );
}

function type(fixture: TPopupFixture, text: string): void {
    const field: HTMLInputElement | null = (qa(fixture, 'dynamic-selector-search')?.nativeElement as HTMLElement).querySelector('input');

    if (field === null) {
        throw new Error('поле поиска не нарисовано');
    }

    field.value = text;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

/**
 * Нажатие строки по её подписи — так же, как нажимает человек. Флажок получает отметку через
 * `ngModel`, а тот пишет значение микрозадачей: без ожидания видно состояние до нажатия.
 */
async function clickRow(fixture: TPopupFixture, label: string, init: MouseEventInit = {}): Promise<void> {
    const row: HTMLElement | undefined = qaAll(fixture, 'dynamic-selector-option')
        .map((option: { nativeElement: HTMLElement }): HTMLElement => option.nativeElement)
        .find((option: HTMLElement): boolean => textOf(option).includes(label));

    row?.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

function tickedLabels(fixture: TPopupFixture): string[] {
    return qaAll(fixture, 'dynamic-selector-option')
        .map((option: { nativeElement: HTMLElement }): HTMLElement => option.nativeElement)
        .filter((option: HTMLElement): boolean => option.querySelector('[aria-checked="true"]') !== null)
        .map((option: HTMLElement): string => textOf(option));
}

function rowLabels(fixture: TPopupFixture): string[] {
    return qaAll(fixture, 'dynamic-selector-option').map((option: { nativeElement: HTMLElement }): string => textOf(option.nativeElement));
}

function isApplyDisabled(fixture: TPopupFixture): boolean {
    return (qa(fixture, 'dynamic-selector-apply')?.nativeElement as HTMLButtonElement).disabled;
}

describe('RtDynamicSelectorPopupComponent', (): void => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-443 — серверный поиск отдаёт запрос через паузу и строки не отбирает', (): void => {
        jest.useFakeTimers();
        const fixture: TPopupFixture = setup({ localSearch: false });
        const queries: string[] = [];

        fixture.componentInstance.searchChange.subscribe((query: string): void => void queries.push(query));
        type(fixture, 'an');
        type(fixture, 'ann');
        jest.advanceTimersByTime(RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE - 1);

        expect(queries).toEqual([]);

        jest.advanceTimersByTime(1);

        expect(queries).toEqual(['ann']);
        expect(qaAll(fixture, 'dynamic-selector-option')).toHaveLength(3);
    });

    it('SC-UKV-448 — «Применить» выключено, пока ничего не отмечено', async (): Promise<void> => {
        const fixture: TPopupFixture = setup();

        expect(isApplyDisabled(fixture)).toBe(true);

        await clickRow(fixture, 'Anna');

        expect(isApplyDisabled(fixture)).toBe(false);
    });

    it('SC-UKV-449 — конец списка просит страницу один раз, когда догрузка кончилась', (): void => {
        ObserverDouble.created.length = 0;
        const windowDouble: Window & typeof globalThis = Object.assign(Object.create(window) as Window & typeof globalThis, {
            IntersectionObserver: ObserverDouble,
        });
        const fixture: TPopupFixture = setup({ lazyLoad: true, fetching: true }, [{ provide: WINDOW, useValue: windowDouble }]);
        let pages: number = 0;

        fixture.componentInstance.loadMore.subscribe((): void => void (pages += 1));
        ObserverDouble.created.at(-1)?.reach();

        expect(qa(fixture, 'dynamic-selector-fetching')).not.toBeNull();
        expect(pages).toBe(0);

        fixture.componentRef.setInput('fetching', false);
        fixture.detectChanges();
        ObserverDouble.created.at(-1)?.reach();

        expect(pages).toBe(1);
    });

    it('SC-UKV-450 — поиск без совпадений говорит «No results»', (): void => {
        const fixture: TPopupFixture = setup();

        type(fixture, 'zzz');

        expect(qaAll(fixture, 'dynamic-selector-option')).toHaveLength(0);
        expect(textOf(qa(fixture, 'dynamic-selector-no-results'))).toContain('No results');
    });

    it('SC-UKV-451 — разделитель стоит под последней видимой закреплённой строкой', (): void => {
        const fixture: TPopupFixture = setup({ pinnedKeys: [1, 2] });

        type(fixture, 'a');
        const rows: HTMLElement[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.rt-dynamic-selector-popup__row'));

        expect(rows.map((row: HTMLElement): string => textOf(row))).toEqual(['Anna', 'Vera']);
        expect(classesOf(rows[0])).toContain('rt-dynamic-selector-popup__row--separated');
        expect(classesOf(rows[1])).not.toContain('rt-dynamic-selector-popup__row--separated');
    });

    it('SC-UKV-457 — при выключенном выборе нескольких простое нажатие оставляет одну отметку', async (): Promise<void> => {
        const fixture: TPopupFixture = setup({ multiToggleShown: true });

        await clickRow(fixture, 'Anna');
        await clickRow(fixture, 'Boris');

        expect(tickedLabels(fixture)).toEqual(['Boris']);

        await clickRow(fixture, 'Vera', { ctrlKey: true });

        expect(tickedLabels(fixture)).toEqual(['Boris', 'Vera']);
    });

    it('SC-UKV-737 — пункт, отмеченный во время поиска, стоит на месте до смены запроса', async (): Promise<void> => {
        const fixture: TPopupFixture = setup();

        type(fixture, 'a');
        // Флажок получает начальное значение от `ngModel` микрозадачей: нажатие до неё она перепишет.
        await fixture.whenStable();
        await clickRow(fixture, 'Vera');

        expect(rowLabels(fixture)).toEqual(['Anna', 'Vera']);
        expect(tickedLabels(fixture)).toEqual(['Vera']);

        type(fixture, 'an');

        expect(rowLabels(fixture)).toEqual(['Vera', 'Anna']);
        expect(tickedLabels(fixture)).toEqual(['Vera']);
    });

    it('ссылка внизу появляется, когда названы и заголовок, и адрес', (): void => {
        expect(qa(setup({ navigateTitle: 'All people' }), 'dynamic-selector-nav')).toBeNull();
        expect(textOf(qa(setup({ navigateTitle: 'All people', navigateLink: '/people' }), 'dynamic-selector-nav'))).toBe('All people');
    });
});
