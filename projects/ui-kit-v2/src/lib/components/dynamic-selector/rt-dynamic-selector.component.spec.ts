import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';
import { IRtDynamicSelector } from './rt-dynamic-selector.model';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
    { id: 3, name: 'Vera' },
];

@Component({
    selector: 'rt-dynamic-selector-host',
    template: `
        <rt-dynamic-selector
            keyExp="id"
            displayExp="name"
            [entities]="entities()"
            [mode]="mode()"
            [readonlyKeys]="readonlyKeys()"
            [formControl]="control"
            (listReset)="resets = resets + 1" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicSelectorComponent],
})
class DynamicSelectorHostComponent {
    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([1, 2]);
    public readonly entities: WritableSignal<IPerson[]> = signal<IPerson[]>(PEOPLE);
    public readonly mode: WritableSignal<IRtDynamicSelector.Mode> = signal<IRtDynamicSelector.Mode>('multi');
    public readonly readonlyKeys: WritableSignal<number[]> = signal<number[]>([]);
    public resets: number = 0;
}

type THostFixture = ComponentFixture<DynamicSelectorHostComponent>;

function setup(configure: (host: DynamicSelectorHostComponent) => void = (): void => undefined): THostFixture {
    const fixture: THostFixture = createRtFixture(
        DynamicSelectorHostComponent,
        {},
        { providers: [provideRouter([])], skipInitialDetect: true }
    );

    configure(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

/** Окно выбора живёт в оверлее CDK — его ищут в документе. */
function popup(): HTMLElement | null {
    return document.querySelector('rt-dynamic-selector-popup');
}

function inPopup(id: string): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(`rt-dynamic-selector-popup [qa-dataid="${id}"]`));
}

async function settle(fixture: THostFixture): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

async function openPopup(fixture: THostFixture): Promise<void> {
    (qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLButtonElement).click();
    await settle(fixture);
}

async function pickInPopup(fixture: THostFixture, label: string): Promise<void> {
    inPopup('dynamic-selector-option')
        .find((option: HTMLElement): boolean => textOf(option).includes(label))
        ?.querySelector<HTMLElement>('button, [role="radio"]')
        ?.click();
    await settle(fixture);
}

async function pressInPopup(fixture: THostFixture, id: string): Promise<void> {
    inPopup(id)[0]?.click();
    await settle(fixture);
}

function removeButtons(fixture: THostFixture): HTMLButtonElement[] {
    return qaAll(fixture, 'dynamic-selector-remove').map(
        (remove: { nativeElement: HTMLElement }): HTMLButtonElement => remove.nativeElement.querySelector('button') as HTMLButtonElement
    );
}

describe('RtDynamicSelectorComponent', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
    });

    it('SC-UKV-436 — «Применить» дописывает отмеченные ключи и закрывает окно', async (): Promise<void> => {
        const fixture: THostFixture = setup();

        await openPopup(fixture);
        await pickInPopup(fixture, 'Vera');
        await pressInPopup(fixture, 'dynamic-selector-apply');

        expect(fixture.componentInstance.control.value).toEqual([1, 2, 3]);
        expect(popup()).toBeNull();
    });

    it('SC-UKV-437 — сброс возвращает записанное формой и гаснет', async (): Promise<void> => {
        const fixture: THostFixture = setup();
        const reset: () => HTMLButtonElement = (): HTMLButtonElement =>
            qa(fixture, 'dynamic-selector-reset')?.nativeElement.querySelector('button') as HTMLButtonElement;

        expect(reset().disabled).toBe(true);

        removeButtons(fixture)[1].click();
        await settle(fixture);

        expect(fixture.componentInstance.control.value).toEqual([1]);
        expect(reset().disabled).toBe(false);

        reset().click();
        await settle(fixture);

        expect(fixture.componentInstance.control.value).toEqual([1, 2]);
        expect(reset().disabled).toBe(true);
        expect(fixture.componentInstance.resets).toBe(1);
    });

    it('SC-UKV-439 — строку только для чтения убрать нельзя', (): void => {
        const fixture: THostFixture = setup((host: DynamicSelectorHostComponent): void => host.readonlyKeys.set([1]));

        expect(removeButtons(fixture).map((button: HTMLButtonElement): boolean => button.disabled)).toEqual([true, false]);
    });

    it('SC-UKV-446 — одиночный выбор заменяет список одним ключом', async (): Promise<void> => {
        const fixture: THostFixture = setup((host: DynamicSelectorHostComponent): void => {
            host.mode.set('single');
            host.control.setValue([1]);
        });

        await openPopup(fixture);

        expect(inPopup('dynamic-selector-select-all')).toHaveLength(0);

        await pickInPopup(fixture, 'Boris');
        await pressInPopup(fixture, 'dynamic-selector-apply');

        expect(fixture.componentInstance.control.value).toEqual([2]);
    });

    it('SC-UKV-447 — «Отмена» снимает отметки и не трогает значение', async (): Promise<void> => {
        const fixture: THostFixture = setup((host: DynamicSelectorHostComponent): void => host.control.setValue([1]));

        await openPopup(fixture);
        await pickInPopup(fixture, 'Boris');
        await pressInPopup(fixture, 'dynamic-selector-cancel');

        expect(popup()).toBeNull();
        expect(fixture.componentInstance.control.value).toEqual([1]);

        await openPopup(fixture);

        expect(document.querySelectorAll('rt-dynamic-selector-popup [aria-checked="true"]')).toHaveLength(0);
        expect(
            document.querySelector<HTMLInputElement>('rt-dynamic-selector-popup [qa-dataid="dynamic-selector-search"] input')?.value
        ).toBe('');
    });

    it('SC-UKV-452 — нечего выбрать: надпись и ни одной кнопки', (): void => {
        const fixture: THostFixture = setup((host: DynamicSelectorHostComponent): void => {
            host.entities.set([]);
            host.control.setValue([]);
        });

        expect(textOf(qa(fixture, 'dynamic-selector-nothing'))).toContain('There are no available items to choose');
        expect((fixture.nativeElement as HTMLElement).querySelectorAll('button')).toHaveLength(0);
    });

    it('ключ, которого нет среди записей, остаётся в значении и строки не рисует', (): void => {
        const fixture: THostFixture = setup((host: DynamicSelectorHostComponent): void => host.control.setValue([1, 99]));

        expect(qaAll(fixture, 'dynamic-selector-row')).toHaveLength(1);
        expect(fixture.componentInstance.control.value).toEqual([1, 99]);
    });

    it('пустой массив от формы опустошает список', (): void => {
        const fixture: THostFixture = setup();

        fixture.componentInstance.control.setValue([]);
        fixture.detectChanges();

        expect(qaAll(fixture, 'dynamic-selector-row')).toHaveLength(0);
    });

    it('отключённое поле не даёт убрать строку', (): void => {
        const fixture: THostFixture = setup((host: DynamicSelectorHostComponent): void => host.control.disable());

        expect(removeButtons(fixture).every((button: HTMLButtonElement): boolean => button.disabled)).toBe(true);
        expect((qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
    });
});
