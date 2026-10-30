import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtDynamicSelectorPopupComponent } from './rt-dynamic-selector-popup.component';

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

function setup(inputs: Readonly<Record<string, unknown>>): TPopupFixture {
    return createRtFixture<RtDynamicSelectorPopupComponent<IPerson>>(RtDynamicSelectorPopupComponent, inputs, {
        providers: [provideRouter([])],
    });
}

/** Нажатие строки по подписи; флажок пишет отметку микрозадачей. */
async function clickRow(fixture: TPopupFixture, label: string): Promise<void> {
    const row: HTMLElement | undefined = qaAll(fixture, 'dynamic-selector-option')
        .map((option: { nativeElement: HTMLElement }): HTMLElement => option.nativeElement)
        .find((option: HTMLElement): boolean => textOf(option).includes(label));

    row?.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

function press(fixture: TPopupFixture, qaId: string): void {
    (qa(fixture, qaId)?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

describe('RtDynamicSelectorPopupComponent само по себе', (): void => {
    it('SC-UKV-1013 — окно вне корня берёт свои входы и сообщает о действиях своими событиями', async (): Promise<void> => {
        const fixture: TPopupFixture = setup({ entities: PEOPLE, keyExp: 'id', displayExp: 'name', selectAllShown: false });
        const applied: unknown[][] = [];
        let cancelled: number = 0;
        fixture.componentInstance.applied.subscribe((keys: unknown[]): number => applied.push(keys));
        fixture.componentInstance.cancelled.subscribe((): number => (cancelled += 1));

        const labels: string[] = qaAll(fixture, 'dynamic-selector-option').map((option: { nativeElement: HTMLElement }): string =>
            textOf(option.nativeElement)
        );
        expect(labels).toEqual(['Anna', 'Boris', 'Vera']);
        expect(qa(fixture, 'dynamic-selector-select-all')).toBeNull();

        await clickRow(fixture, 'Boris');
        press(fixture, 'dynamic-selector-apply');
        press(fixture, 'dynamic-selector-cancel');

        expect(applied).toEqual([[2]]);
        expect(cancelled).toBe(1);
    });

    it('SC-UKV-1013 — без полей ключа и подписи окно вне корня падает с их названием', (): void => {
        expect((): TPopupFixture => setup({ entities: PEOPLE })).toThrow(/keyExp и displayExp/);
    });
});
