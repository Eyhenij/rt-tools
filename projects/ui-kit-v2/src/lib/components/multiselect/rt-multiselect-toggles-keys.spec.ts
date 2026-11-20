import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';
import { rtMultiselectCanReset, rtMultiselectKept, rtMultiselectToggleAllNext } from './rt-multiselect-toggles.logic';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Продукты', value: 'food' },
    { label: 'Хозтовары', value: 'home', disabled: true },
    { label: 'Ремонт', value: 'repair' },
];

class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(false);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(false);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(false);
}

function providers(): Provider[] {
    return [{ provide: BreakpointsService, useValue: new BreakpointsStub() }];
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function setup(look: 'list' | 'toggles', chosen: ReadonlyArray<string>): ComponentFixture<RtMultiselectComponent<string>> {
    const fixture: ComponentFixture<RtMultiselectComponent<string>> = createRtFixture(
        RtMultiselectComponent<string>,
        { options: OPTIONS, look, ariaLabel: 'Категории' },
        { providers: providers() }
    );
    fixture.componentInstance.writeValue([...chosen]);
    settle(fixture);
    return fixture;
}

function key<T>(fixture: ComponentFixture<T>, name: string): void {
    (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: name, bubbles: true })
    );
    settle(fixture);
}

function trigger<T>(fixture: ComponentFixture<T>): HTMLElement {
    return qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement;
}

function listen(fixture: ComponentFixture<RtMultiselectComponent<string>>): () => ReadonlyArray<string> {
    let chosen: ReadonlyArray<string> = [];
    fixture.componentInstance.registerOnChange((value: ReadonlyArray<string>): void => {
        chosen = value;
    });
    return (): ReadonlyArray<string> => chosen;
}

describe('Мультиселект — «Показать все», «Сбросить» и клавиатура', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1475 — «Показать все» оставляет отключённые и неизвестные значения и при включении, и при снятии', (): void => {
        const all: ReadonlyArray<string> = ['food', 'repair'];

        expect(rtMultiselectKept(all, ['home', 'zzz', 'food'])).toEqual(['home', 'zzz']);
        expect(rtMultiselectToggleAllNext(all, ['home', 'zzz'])).toEqual(['home', 'zzz', 'food', 'repair']);
        expect(rtMultiselectToggleAllNext(all, ['home', 'food', 'repair'])).toEqual(['home']);
        expect(rtMultiselectCanReset(all, ['home', 'zzz'])).toBe(false);
        expect(rtMultiselectCanReset(all, ['home', 'food'])).toBe(true);

        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup('toggles', ['home', 'zzz']);
        const chosen: () => ReadonlyArray<string> = listen(fixture);
        trigger(fixture).click();
        settle(fixture);

        (document.querySelector('[qa-dataid="multiselect-show-all"]') as HTMLElement).click();
        settle(fixture);
        expect([...chosen()].sort()).toEqual(['food', 'home', 'repair', 'zzz']);

        (document.querySelector('[qa-dataid="multiselect-show-all"]') as HTMLElement).click();
        settle(fixture);
        expect([...chosen()].sort()).toEqual(['home', 'zzz']);
    });

    it('SC-UKV-1476 — «Сбросить» в шторке оставляет отключённые значения и гаснет, когда сбрасывать нечего', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup('list', ['home', 'food']);
        const chosen: () => ReadonlyArray<string> = listen(fixture);
        const stub: BreakpointsStub = TestBed.inject(BreakpointsService) as unknown as BreakpointsStub;
        stub.viewportNarrow.set(true);
        stub.phone.set(true);
        stub.narrow.set(true);
        trigger(fixture).click();
        settle(fixture);

        const reset: HTMLButtonElement = document.querySelector('[qa-dataid="multiselect-sheet-reset"]') as HTMLButtonElement;
        expect(reset.disabled).toBe(false);
        reset.click();
        settle(fixture);

        expect(chosen()).toEqual(['home']);
        expect((document.querySelector('[qa-dataid="multiselect-sheet-reset"]') as HTMLButtonElement).disabled).toBe(true);
    });

    it('SC-UKV-1477 — стрелки первым пунктом ведут на «Показать все», Enter переключает, дальше идут строки', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup('toggles', []);
        const chosen: () => ReadonlyArray<string> = listen(fixture);

        key(fixture, 'ArrowDown');
        const showAll: HTMLElement = document.querySelector('[qa-dataid="multiselect-show-all"]') as HTMLElement;
        expect(showAll.id).not.toBe('');
        expect(trigger(fixture).getAttribute('aria-activedescendant')).toBe(showAll.id);
        expect(showAll.classList).toContain('rt-multiselect__toggle-row--active');

        key(fixture, 'Enter');
        expect([...chosen()].sort()).toEqual(['food', 'repair']);

        key(fixture, 'ArrowDown');
        const firstRow: HTMLElement = document.querySelectorAll<HTMLElement>('[qa-dataid="multiselect-option"]')[0];
        expect(trigger(fixture).getAttribute('aria-activedescendant')).toBe(firstRow.id);
        expect(firstRow.id).not.toBe(showAll.id);

        key(fixture, 'ArrowUp');
        expect(trigger(fixture).getAttribute('aria-activedescendant')).toBe(showAll.id);
    });

    it('SC-UKV-1478 — панель вида с переключателями без роли не несёт aria-label, список несёт', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup('toggles', []);
        trigger(fixture).click();
        settle(fixture);

        const panel: HTMLElement = document.querySelector('[qa-dataid="multiselect-panel"]') as HTMLElement;
        expect(panel.getAttribute('role')).toBeNull();
        expect(panel.getAttribute('aria-label')).toBeNull();
        expect(panel.querySelector('ul')?.getAttribute('aria-label')).toBe('Категории');
        expect(fixture.nativeElement.classList).not.toContain('rt-multiselect--toggles');
    });
});
