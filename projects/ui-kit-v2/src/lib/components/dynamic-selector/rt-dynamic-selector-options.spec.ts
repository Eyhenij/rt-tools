import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtDynamicInputComponent } from './dynamic-input/rt-dynamic-input.component';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
    { id: 3, name: 'Vera' },
    { id: 4, name: 'Victor' },
];

@Component({
    selector: 'rt-dynamic-selector-options-host',
    template: `
        <rt-dynamic-selector
            keyExp="id"
            displayExp="name"
            [entities]="people"
            [removeShown]="removeShown()"
            [listActionsShown]="listActionsShown()"
            [invitation]="invitation()"
            [extraChanged]="extraChanged()"
            [searchTerm]="searchTerm()"
            [formControl]="control"
            (listReset)="resets = resets + 1"
            (listCleared)="clears = clears + 1"
            (searchChange)="searches.push($event)"
            (popupOpenChange)="openChanges.push($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicSelectorComponent],
})
class SelectorHostComponent {
    public readonly people: IPerson[] = PEOPLE;
    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([1, 2]);
    public readonly removeShown: WritableSignal<boolean> = signal(true);
    public readonly listActionsShown: WritableSignal<boolean> = signal(true);
    public readonly invitation: WritableSignal<boolean> = signal(false);
    public readonly extraChanged: WritableSignal<boolean> = signal(false);
    public readonly searchTerm: WritableSignal<string> = signal('');
    public resets: number = 0;
    public clears: number = 0;
    public readonly searches: string[] = [];
    public readonly openChanges: boolean[] = [];
}

@Component({
    selector: 'rt-dynamic-input-options-host',
    template: `
        <rt-dynamic-input
            [removeShown]="removeShown()"
            [listActionsShown]="listActionsShown()"
            [extraChanged]="extraChanged()"
            [formControl]="control"
            (listReset)="resets = resets + 1"
            (listCleared)="clears = clears + 1" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicInputComponent],
})
class InputHostComponent {
    public readonly control: FormControl<string[] | null> = new FormControl<string[] | null>(['a@x.com']);
    public readonly removeShown: WritableSignal<boolean> = signal(true);
    public readonly listActionsShown: WritableSignal<boolean> = signal(true);
    public readonly extraChanged: WritableSignal<boolean> = signal(false);
    public resets: number = 0;
    public clears: number = 0;
}

function host<T>(type: new () => T, configure: (it: T) => void = (): void => undefined): ComponentFixture<T> {
    const fixture: ComponentFixture<T> = createRtFixture(type, {}, { providers: [provideRouter([])], skipInitialDetect: true });
    configure(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
}

async function settle<T>(fixture: ComponentFixture<T>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

function buttonOf<T>(fixture: ComponentFixture<T>, id: string): HTMLButtonElement | null {
    return ((qa(fixture, id)?.nativeElement as HTMLElement | undefined)?.querySelector('button') as HTMLButtonElement | null) ?? null;
}

function popup(): HTMLElement | null {
    return document.querySelector('rt-dynamic-selector-popup');
}

function selectorOf(fixture: ComponentFixture<SelectorHostComponent>): RtDynamicSelectorComponent<IPerson> {
    return qa(fixture, 'dynamic-selector-rows')?.injector.get(RtDynamicSelectorComponent) as RtDynamicSelectorComponent<IPerson>;
}

async function openPopup(fixture: ComponentFixture<SelectorHostComponent>): Promise<void> {
    (qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLButtonElement).click();
    await settle(fixture);
}

describe('Переключатели динамического селектора', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
    });

    it('SC-UKV-613 — без корзины строки рисуются без кнопки удаления', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void =>
            it.removeShown.set(false)
        );

        expect(qaAll(fixture, 'dynamic-selector-row').length).toBe(2);
        expect(qaAll(fixture, 'dynamic-selector-remove').length).toBe(0);
    });

    it('SC-UKV-613 — текстовый список без корзины тоже рисует строки без неё', (): void => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void =>
            it.removeShown.set(false)
        );

        expect(qaAll(fixture, 'dynamic-selector-row').length).toBe(1);
        expect(qaAll(fixture, 'dynamic-selector-remove').length).toBe(0);
    });

    it('SC-UKV-614 — без панели сброса и очистки кнопка добавления остаётся', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void =>
            it.listActionsShown.set(false)
        );

        expect(qa(fixture, 'dynamic-selector-add')).not.toBeNull();
        expect(qa(fixture, 'dynamic-selector-reset')).toBeNull();
        expect(qa(fixture, 'dynamic-selector-clear')).toBeNull();
    });

    it('SC-UKV-614 — текстовый список без панели держит кнопку добавления', (): void => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void =>
            it.listActionsShown.set(false)
        );

        expect(qa(fixture, 'dynamic-input-add')).not.toBeNull();
        expect(qa(fixture, 'dynamic-selector-reset')).toBeNull();
    });

    it('SC-UKV-615 — без переключателя полоса держит сброс и очистку и уступает место приглашению', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent);

        expect(qa(fixture, 'dynamic-selector-reset')).not.toBeNull();
        expect(qa(fixture, 'dynamic-selector-clear')).not.toBeNull();

        fixture.componentInstance.invitation.set(true);
        fixture.detectChanges();

        expect(qa(fixture, 'dynamic-selector-invitation')).not.toBeNull();
        expect(qa(fixture, 'dynamic-selector-reset')).toBeNull();
    });

    it('SC-UKV-616 — правки в строках включают сброс и очистку; сброс при прежних ключах значение не трогает, оба сообщают о себе', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent);

        expect(buttonOf(fixture, 'dynamic-selector-reset')?.disabled).toBe(true);

        fixture.componentInstance.extraChanged.set(true);
        fixture.detectChanges();
        buttonOf(fixture, 'dynamic-selector-reset')?.click();
        await settle(fixture);

        expect(fixture.componentInstance.resets).toBe(1);
        expect(fixture.componentInstance.control.value).toEqual([1, 2]);

        buttonOf(fixture, 'dynamic-selector-clear')?.click();
        await settle(fixture);

        expect(fixture.componentInstance.clears).toBe(1);
        expect(fixture.componentInstance.control.value).toEqual([]);
    });

    it('SC-UKV-616 — текстовый список с правками в строках сообщает о сбросе, не трогая значение', async (): Promise<void> => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void =>
            it.extraChanged.set(true)
        );

        buttonOf(fixture, 'dynamic-selector-reset')?.click();
        await settle(fixture);

        expect(fixture.componentInstance.resets).toBe(1);
        expect(fixture.componentInstance.control.value).toEqual(['a@x.com']);
    });

    it('SC-UKV-617 — выбор открывается с начальным запросом и не сообщает его поиском', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void =>
            it.searchTerm.set('Vi')
        );

        await openPopup(fixture);
        const search: HTMLInputElement | null = document.querySelector(
            'rt-dynamic-selector-popup [qa-dataid="dynamic-selector-search"] input'
        );
        const options: string[] = Array.from(
            document.querySelectorAll<HTMLElement>('rt-dynamic-selector-popup [qa-dataid="dynamic-selector-option"]')
        ).map((option: HTMLElement): string => textOf(option));

        expect(search?.value).toBe('Vi');
        expect(options).toEqual(['Victor']);
        expect(fixture.componentInstance.searches).toEqual([]);
    });

    it('SC-UKV-618 — селектор говорит, открыт ли выбор, и сообщает каждую перемену', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent);

        expect(selectorOf(fixture).popupOpen()).toBe(false);

        await openPopup(fixture);

        expect(popup()).not.toBeNull();
        expect(selectorOf(fixture).popupOpen()).toBe(true);

        document.querySelector<HTMLElement>('rt-dynamic-selector-popup [qa-dataid="dynamic-selector-cancel"]')?.click();
        await settle(fixture);

        expect(popup()).toBeNull();
        expect(selectorOf(fixture).popupOpen()).toBe(false);
        expect(fixture.componentInstance.openChanges).toEqual([true, false]);
    });
});
