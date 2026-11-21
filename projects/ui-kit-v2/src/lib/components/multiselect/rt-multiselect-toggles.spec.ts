import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtToggleSwitchComponent } from '../toggle-switch/rt-toggle-switch.component';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';
import { rtMultiselectAllValues, rtMultiselectSummary } from './rt-multiselect-toggles.logic';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Продукты', value: 'food' },
    { label: 'Хозтовары', value: 'home' },
    { label: 'Ремонт', value: 'repair' },
    { label: 'Связь', value: 'comm' },
    { label: 'Транспорт', value: 'transport' },
];

const ALL: ReadonlyArray<string> = OPTIONS.map((option: IRtSelect.Option<string>): string => option.value);

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(false);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(false);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(false);
}

function providersFor(narrow: boolean): Provider[] {
    const stub: BreakpointsStub = new BreakpointsStub();
    stub.viewportNarrow.set(narrow);
    stub.phone.set(narrow);
    stub.narrow.set(narrow);
    return [{ provide: BreakpointsService, useValue: stub }];
}

@Component({
    selector: 'rt-multiselect-toggles-host',
    template: `
        <rt-multiselect look="toggles" placeholder="Категории" [options]="opts">
            <div rtMultiselectExtra><rt-toggle-switch label="Скрыть пустые" /></div>
        </rt-multiselect>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMultiselectComponent, RtToggleSwitchComponent],
})
class ExtraHostComponent {
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function press<T>(fixture: ComponentFixture<T>, anchor: string): void {
    (qa(fixture, anchor)?.nativeElement as HTMLElement).click();
    settle(fixture);
}

function setup(
    narrow: boolean,
    chosen: ReadonlyArray<string>,
    inputs: Readonly<Record<string, unknown>> = {}
): ComponentFixture<RtMultiselectComponent<string>> {
    const fixture: ComponentFixture<RtMultiselectComponent<string>> = createRtFixture(
        RtMultiselectComponent<string>,
        { options: OPTIONS, look: 'toggles', placeholder: 'Категории', ...inputs },
        { providers: providersFor(narrow) }
    );
    fixture.componentInstance.writeValue([...chosen]);
    settle(fixture);
    return fixture;
}

function summaryText<T>(fixture: ComponentFixture<T>): string {
    return qa(fixture, 'multiselect-summary')?.nativeElement.textContent.replace(/\s+/g, ' ').trim() ?? '';
}

function isOpen(): boolean {
    return document.querySelector('[qa-dataid="multiselect-panel"]') !== null;
}

function rowSwitches(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="multiselect-option-switch"]'));
}

/** NgModel передаёт значение переключателю отложенно: ждём устойчивости, потом читаем. */
async function switchedOn<T>(fixture: ComponentFixture<T>): Promise<number> {
    await fixture.whenStable();
    fixture.detectChanges();
    return rowSwitches().filter((node: HTMLElement): boolean => node.querySelector('[aria-checked="true"], input:checked') !== null).length;
}

describe('Мультиселект с переключателями', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1697 — поле с переключателями пишет сводку выбора вместо чипов', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(false, ALL);
        expect(summaryText(fixture)).toBe('All');
        expect(qa(fixture, 'multiselect-chip')).toBeNull();

        fixture.componentInstance.writeValue(['food', 'home', 'repair']);
        settle(fixture);
        expect(summaryText(fixture)).toBe('3 of 5');
        expect(qa(fixture, 'multiselect-chip')).toBeNull();

        fixture.componentInstance.writeValue([]);
        settle(fixture);
        expect(summaryText(fixture)).toBe('Категории');
        expect(qa(fixture, 'multiselect-chip')).toBeNull();

        // Чистые функции сводки: значение вне списка не считается.
        expect(rtMultiselectAllValues(OPTIONS)).toEqual(ALL);
        expect(rtMultiselectSummary(ALL, ALL).state).toBe('all');
        expect(rtMultiselectSummary(ALL, ['food', 'zzz'])).toEqual({ state: 'some', count: 1, total: 5 });
        expect(rtMultiselectSummary(ALL, ['zzz']).state).toBe('none');
    });

    it('SC-UKV-1698 — строка с переключателем меняет своё значение и оставляет панель открытой', async (): Promise<void> => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(false, ['home']);
        let chosen: ReadonlyArray<string> = [];
        fixture.componentInstance.registerOnChange((value: ReadonlyArray<string>): void => {
            chosen = value;
        });
        press(fixture, 'multiselect-trigger');
        expect(await switchedOn(fixture)).toBe(1);

        (document.querySelectorAll('[qa-dataid="multiselect-option"]')[0] as HTMLElement).click();
        settle(fixture);

        expect(chosen).toContain('food');
        expect(chosen).toContain('home');
        expect(await switchedOn(fixture)).toBe(2);
        expect(isOpen()).toBe(true);
        expect(document.querySelector('[qa-dataid="multiselect-panel"]')?.classList.contains('rt-multiselect__panel--toggles')).toBe(true);
    });

    it('SC-UKV-1699 — «Показать все» включает всё, а при включённом всём снимает', async (): Promise<void> => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(false, ['food', 'home', 'repair']);
        let chosen: ReadonlyArray<string> = [];
        fixture.componentInstance.registerOnChange((value: ReadonlyArray<string>): void => {
            chosen = value;
        });
        press(fixture, 'multiselect-trigger');

        (document.querySelector('[qa-dataid="multiselect-show-all"]') as HTMLElement).click();
        settle(fixture);
        expect([...chosen].sort()).toEqual([...ALL].sort());
        expect(await switchedOn(fixture)).toBe(5);

        (document.querySelector('[qa-dataid="multiselect-show-all"]') as HTMLElement).click();
        settle(fixture);
        expect(chosen).toEqual([]);
        expect(await switchedOn(fixture)).toBe(0);
        expect(isOpen()).toBe(true);
    });

    it('SC-UKV-1700 — свои переключатели приложения стоят над чертой, значения — под ней', (): void => {
        const fixture: ComponentFixture<ExtraHostComponent> = createRtFixture(ExtraHostComponent, {}, { providers: providersFor(false) });
        press(fixture, 'multiselect-trigger');

        const head: HTMLElement = document.querySelector('[qa-dataid="multiselect-toggles-head"]') as HTMLElement;
        const showAll: HTMLElement = document.querySelector('[qa-dataid="multiselect-show-all"]') as HTMLElement;
        const divider: HTMLElement = document.querySelector('[role="separator"]') as HTMLElement;
        const list: HTMLElement = document.querySelector('.rt-multiselect__list') as HTMLElement;
        const extra: HTMLElement = document.querySelector('[rtMultiselectExtra]') as HTMLElement;

        expect(head).not.toBeNull();
        expect(head.contains(showAll)).toBe(true);
        expect(head.contains(extra)).toBe(true);
        expect(extra.textContent).toContain('Скрыть пустые');
        const order: Element[] = Array.from(
            document.querySelectorAll('[qa-dataid="multiselect-toggles-head"], [role="separator"], .rt-multiselect__list')
        );
        expect(order).toEqual([head, divider, list]);
        expect(list.querySelectorAll('[qa-dataid="multiselect-option"]').length).toBe(5);
    });

    it('SC-UKV-1701 — в шторке у поля с переключателями нет подвала', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(true, ['food']);

        press(fixture, 'multiselect-trigger');

        const sheet: HTMLElement | null = document.querySelector('.rt-popover-sheet');
        expect(sheet).not.toBeNull();
        expect(sheet?.querySelectorAll('[qa-dataid="multiselect-option"]').length).toBe(5);
        expect(sheet?.querySelector('[qa-dataid="multiselect-sheet-footer"]')).toBeNull();
    });
});
