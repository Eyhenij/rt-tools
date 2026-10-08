import { signal, ChangeDetectionStrategy, Component, DebugElement, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtFieldComponent } from '../field/rt-field.component';
import { IButton } from '../button/rt-button.model';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtInputComponent } from '../input/rt-input.component';
import { IRtInput } from '../input/rt-input.model';
import { RtDynamicInputComponent } from './dynamic-input/rt-dynamic-input.component';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
];

@Component({
    selector: 'rt-dynamic-selector-look-host',
    template: `
        <rt-dynamic-selector
            keyExp="id"
            displayExp="name"
            [entities]="people"
            [invitation]="invitation()"
            [invitationGlyph]="invitationGlyph()"
            [invitationButtonIcon]="invitationButtonIcon()"
            [invitationButtonAppearance]="invitationButtonAppearance()"
            [clearIcon]="clearIcon()"
            [searchAppearance]="searchAppearance()"
            [emptyResultsText]="emptyResultsText()"
            [searchTerm]="searchTerm()"
            [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicSelectorComponent],
})
class SelectorHostComponent {
    public readonly people: IPerson[] = PEOPLE;
    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([1]);
    public readonly invitation: WritableSignal<boolean> = signal(false);
    public readonly invitationGlyph: WritableSignal<string | null> = signal<string | null>(null);
    public readonly invitationButtonIcon: WritableSignal<IRtIcon.Name | null> = signal<IRtIcon.Name | null>(null);
    public readonly invitationButtonAppearance: WritableSignal<IButton.Appearance> = signal<IButton.Appearance>('outlined');
    public readonly clearIcon: WritableSignal<IRtIcon.Name> = signal<IRtIcon.Name>('close');
    public readonly searchAppearance: WritableSignal<IRtInput.Appearance> = signal<IRtInput.Appearance>('outline');
    public readonly emptyResultsText: WritableSignal<string> = signal('');
    public readonly searchTerm: WritableSignal<string> = signal('');
}

@Component({
    selector: 'rt-dynamic-input-look-host',
    template: `
        <rt-dynamic-input
            [invitation]="invitation()"
            [invitationGlyph]="invitationGlyph()"
            [invitationButtonIcon]="invitationButtonIcon()"
            [invitationButtonAppearance]="invitationButtonAppearance()"
            [clearIcon]="clearIcon()"
            [fieldAppearance]="fieldAppearance()"
            [fieldLabel]="fieldLabel()"
            [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicInputComponent],
})
class InputHostComponent {
    public readonly control: FormControl<string[] | null> = new FormControl<string[] | null>(['a@x.com']);
    public readonly invitation: WritableSignal<boolean> = signal(false);
    public readonly invitationGlyph: WritableSignal<string | null> = signal<string | null>(null);
    public readonly invitationButtonIcon: WritableSignal<IRtIcon.Name | null> = signal<IRtIcon.Name | null>(null);
    public readonly invitationButtonAppearance: WritableSignal<IButton.Appearance> = signal<IButton.Appearance>('outlined');
    public readonly clearIcon: WritableSignal<IRtIcon.Name> = signal<IRtIcon.Name>('close');
    public readonly fieldAppearance: WritableSignal<IRtInput.Appearance> = signal<IRtInput.Appearance>('outline');
    public readonly fieldLabel: WritableSignal<string> = signal('');
}

@Component({
    selector: 'rt-dynamic-input-field-host',
    template: `
        <rt-field label="Почта для копий">
            <rt-dynamic-input [formControl]="control" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicInputComponent, RtFieldComponent],
})
class FieldHostComponent {
    public readonly control: FormControl<string[] | null> = new FormControl<string[] | null>(['a@x.com']);
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

function buttonOf<T>(fixture: ComponentFixture<T>, id: string): RtButtonDirective | undefined {
    return qa(fixture, id)?.injector.get(RtButtonDirective);
}

function invitationGlyphOf<T>(fixture: ComponentFixture<T>, id: string): string | null | undefined {
    return (qa(fixture, id)?.componentInstance as RtEmptyStateComponent | undefined)?.glyph();
}

function clearIconOf<T>(fixture: ComponentFixture<T>): IRtIcon.Name | null | undefined {
    const clear: DebugElement | null = qa(fixture, 'dynamic-selector-clear');

    return (clear?.componentInstance as RtIconButtonComponent | undefined)?.icon();
}

function listOf<T>(fixture: ComponentFixture<T>): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('rt-dynamic-selector-list');
}

async function openPopup(fixture: ComponentFixture<SelectorHostComponent>): Promise<void> {
    (qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLButtonElement).click();
    await settle(fixture);
}

/** Окно выбора живёт в оверлее CDK — его части ищут в документе. */
function popupPart(id: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`rt-dynamic-selector-popup [qa-dataid="${id}"]`);
}

describe('RtDynamicSelectorComponent — вид, который задаёт приложение', (): void => {
    it('SC-UKV-702 — кнопка приглашения выбора берёт значок и вид из входов', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void => {
            it.invitation.set(true);
            it.invitationButtonIcon.set('ico-plus');
            it.invitationButtonAppearance.set('text');
        });

        expect(buttonOf(fixture, 'dynamic-selector-invitation-add')?.icon()).toBe('ico-plus');
        expect(buttonOf(fixture, 'dynamic-selector-invitation-add')?.appearance()).toBe('text');
    });

    it('SC-UKV-702 — по умолчанию кнопка приглашения выбора контурная и без значка', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void =>
            it.invitation.set(true)
        );

        expect(buttonOf(fixture, 'dynamic-selector-invitation-add')?.icon()).toBeNull();
        expect(buttonOf(fixture, 'dynamic-selector-invitation-add')?.appearance()).toBe('outlined');
    });

    it('SC-UKV-764 — под приглашением выбора пустой список не рисуется, а список с записями остаётся', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void => {
            it.control.setValue([]);
            it.invitation.set(true);
        });

        expect(listOf(fixture)).toBeNull();
        expect(qa(fixture, 'dynamic-selector-invitation')).not.toBeNull();

        fixture.componentInstance.control.setValue([1]);
        fixture.detectChanges();

        expect(listOf(fixture)).not.toBeNull();
    });

    it('SC-UKV-714 — приглашение выбора отдаёт имя Material заглушке', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void => {
            it.invitation.set(true);
            it.invitationGlyph.set('group_add');
        });

        expect(invitationGlyphOf(fixture, 'dynamic-selector-invitation')).toBe('group_add');
    });

    it('SC-UKV-703 — кнопка «Очистить список» выбора берёт значок из входа, по умолчанию крестик', (): void => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent);

        expect(clearIconOf(fixture)).toBe('close');

        fixture.componentInstance.clearIcon.set('trash-x');
        fixture.detectChanges();

        expect(clearIconOf(fixture)).toBe('trash-x');
    });

    it('SC-UKV-704 — поле поиска в окне выбора берёт вид из входа', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void =>
            it.searchAppearance.set('fill')
        );

        await openPopup(fixture);

        expect(popupPart('dynamic-selector-search')).not.toBeNull();
        expect(popupPart('dynamic-selector-search')?.classList.contains('rt-input--appearance--fill')).toBe(true);
    });

    it('SC-UKV-766 — поле поиска в окне выбора берёт вид pill', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void =>
            it.searchAppearance.set('pill')
        );

        await openPopup(fixture);

        expect(popupPart('dynamic-selector-search')).not.toBeNull();
        expect(popupPart('dynamic-selector-search')?.classList.contains('rt-input--appearance--pill')).toBe(true);
    });

    it('SC-UKV-705 — пустой результат поиска показывает подпись приложения, а без неё — подпись кита', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorHostComponent> = host(SelectorHostComponent, (it: SelectorHostComponent): void => {
            it.searchTerm.set('zzz');
            it.emptyResultsText.set('Никого не нашли');
        });

        await openPopup(fixture);

        expect(textOf(popupPart('dynamic-selector-no-results'))).toContain('Никого не нашли');

        fixture.componentInstance.emptyResultsText.set('');
        await settle(fixture);

        expect(textOf(popupPart('dynamic-selector-no-results')).length).toBeGreaterThan(0);
        expect(textOf(popupPart('dynamic-selector-no-results'))).not.toContain('Никого не нашли');
    });
});

describe('RtDynamicInputComponent — вид, который задаёт приложение', (): void => {
    it('SC-UKV-702 — кнопка приглашения ввода берёт значок и вид из входов', (): void => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void => {
            it.control.setValue([]);
            it.invitation.set(true);
            it.invitationButtonIcon.set('ico-plus');
            it.invitationButtonAppearance.set('filled');
        });

        expect(buttonOf(fixture, 'dynamic-input-invitation-add')?.icon()).toBe('ico-plus');
        expect(buttonOf(fixture, 'dynamic-input-invitation-add')?.appearance()).toBe('filled');
    });

    it('SC-UKV-764 — под приглашением ввода пустой список не рисуется', (): void => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void => {
            it.control.setValue([]);
            it.invitation.set(true);
        });

        expect(listOf(fixture)).toBeNull();
        expect(qa(fixture, 'dynamic-input-invitation')).not.toBeNull();
    });

    it('SC-UKV-714 — приглашение ввода отдаёт имя Material заглушке, а без него заглушка без имени', (): void => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void => {
            it.control.setValue([]);
            it.invitation.set(true);
        });

        expect(invitationGlyphOf(fixture, 'dynamic-input-invitation')).toBeNull();

        fixture.componentInstance.invitationGlyph.set('mail');
        fixture.detectChanges();

        expect(invitationGlyphOf(fixture, 'dynamic-input-invitation')).toBe('mail');
    });

    it('SC-UKV-715 — подпись поля кита стоит над списком и ведёт к полю новой строки', async (): Promise<void> => {
        const fixture: ComponentFixture<FieldHostComponent> = host(FieldHostComponent);
        const label: HTMLLabelElement | undefined = qa(fixture, 'field-label')?.nativeElement as HTMLLabelElement | undefined;

        expect(textOf(label ?? null)).toContain('Почта для копий');

        (qa(fixture, 'dynamic-input-add')?.nativeElement as HTMLButtonElement).click();
        await settle(fixture);
        const field: HTMLInputElement | null = (fixture.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="dynamic-input-field"] input'
        );

        expect(label?.htmlFor).toBeTruthy();
        expect(field?.id).toBe(label?.htmlFor);
    });

    it('SC-UKV-703 — кнопка «Очистить список» ввода берёт значок из входа', (): void => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void =>
            it.clearIcon.set('trash-x')
        );

        expect(clearIconOf(fixture)).toBe('trash-x');
    });

    it('SC-UKV-706 — поле новой строки ввода берёт вид из входа', async (): Promise<void> => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void =>
            it.fieldAppearance.set('fill')
        );

        (qa(fixture, 'dynamic-input-add')?.nativeElement as HTMLButtonElement).click();
        await settle(fixture);

        const field: DebugElement | null = qa(fixture, 'dynamic-input-field');

        expect(field).not.toBeNull();
        expect((field?.componentInstance as RtInputComponent | undefined)?.appearance()).toBe('fill');
    });

    it('SC-UKV-720 — подпись поля новой строки стоит над полем и ведёт к нему', async (): Promise<void> => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent, (it: InputHostComponent): void =>
            it.fieldLabel.set('Адрес для копии')
        );

        (qa(fixture, 'dynamic-input-add')?.nativeElement as HTMLButtonElement).click();
        await settle(fixture);
        const wrapper: DebugElement | null = qa(fixture, 'dynamic-input-field-label');
        const label: HTMLLabelElement | null = (wrapper?.nativeElement as HTMLElement | undefined)?.querySelector('label') ?? null;
        const field: HTMLInputElement | null = (fixture.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="dynamic-input-field"] input'
        );

        expect(textOf(label)).toContain('Адрес для копии');
        expect(label?.htmlFor).toBeTruthy();
        expect(field?.id).toBe(label?.htmlFor);
    });

    it('SC-UKV-720 — без подписи поле новой строки стоит без обёртки', async (): Promise<void> => {
        const fixture: ComponentFixture<InputHostComponent> = host(InputHostComponent);

        (qa(fixture, 'dynamic-input-add')?.nativeElement as HTMLButtonElement).click();
        await settle(fixture);

        expect(qa(fixture, 'dynamic-input-field')).not.toBeNull();
        expect(qa(fixture, 'dynamic-input-field-label')).toBeNull();
    });
});
