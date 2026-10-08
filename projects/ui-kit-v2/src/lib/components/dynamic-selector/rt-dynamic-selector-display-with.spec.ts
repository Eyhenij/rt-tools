import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IRole {
    readonly id: number;
    readonly name: string;
}

const ROLES: IRole[] = [
    { id: 1, name: 'BasicReports' },
    { id: 2, name: 'UserAdmin' },
    { id: 3, name: 'AuditLog' },
];

/** Слитное имя делится на слова по заглавным — так подпись правит приложение. */
function spaced(role: IRole): string {
    return role.name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

@Component({
    selector: 'rt-dynamic-selector-display-with-host',
    template: `
        <rt-dynamic-selector keyExp="id" displayExp="name" [entities]="roles" [displayWith]="displayWith()" [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicSelectorComponent],
})
class HostComponent {
    public readonly roles: IRole[] = ROLES;
    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([1]);
    public readonly displayWith: WritableSignal<((role: IRole) => string) | null> = signal<((role: IRole) => string) | null>(spaced);
}

function host(displayWith: ((role: IRole) => string) | null): ComponentFixture<HostComponent> {
    const fixture: ComponentFixture<HostComponent> = createRtFixture(
        HostComponent,
        {},
        { providers: [provideRouter([])], skipInitialDetect: true }
    );

    fixture.componentInstance.displayWith.set(displayWith);
    fixture.detectChanges();

    return fixture;
}

async function openPopup(fixture: ComponentFixture<HostComponent>): Promise<void> {
    (qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

/** Окно выбора живёт в оверлее CDK — его пункты ищут в документе. */
function optionLabels(): string[] {
    return Array.from(document.querySelectorAll<HTMLElement>('rt-dynamic-selector-popup [qa-dataid="dynamic-selector-option"]')).map(
        (option: HTMLElement): string => textOf(option)
    );
}

function search(fixture: ComponentFixture<HostComponent>, text: string): void {
    const field: HTMLInputElement | null = document.querySelector<HTMLInputElement>(
        'rt-dynamic-selector-popup [qa-dataid="dynamic-selector-search"] input'
    );

    if (field === null) {
        throw new Error('поле поиска не нарисовано');
    }

    field.value = text;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtDynamicSelectorComponent — displayWith', (): void => {
    it('SC-UKV-762 — подпись строки, подпись пункта окна и поиск берут строку из displayWith', async (): Promise<void> => {
        const fixture: ComponentFixture<HostComponent> = host(spaced);

        expect(
            qaAll(fixture, 'dynamic-selector-row').map((row: { nativeElement: HTMLElement }): string => textOf(row.nativeElement))
        ).toEqual(['Basic Reports']);

        await openPopup(fixture);

        expect(optionLabels()).toEqual(['Audit Log', 'User Admin']);

        search(fixture, 'user ad');

        expect(optionLabels()).toEqual(['User Admin']);
    });

    it('SC-UKV-762 — без displayWith подпись берётся из поля displayExp, как раньше', async (): Promise<void> => {
        const fixture: ComponentFixture<HostComponent> = host(null);

        expect(
            qaAll(fixture, 'dynamic-selector-row').map((row: { nativeElement: HTMLElement }): string => textOf(row.nativeElement))
        ).toEqual(['BasicReports']);

        await openPopup(fixture);

        expect(optionLabels()).toEqual(['AuditLog', 'UserAdmin']);
    });
});
