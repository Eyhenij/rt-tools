import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtRadiusDirective } from '../../radius/rt-radius.directive';
import { RtDynamicSelectorPopupComponent } from './rt-dynamic-selector-popup.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
];

type TPopupFixture = ComponentFixture<RtDynamicSelectorPopupComponent<IPerson>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TPopupFixture {
    return createRtFixture<RtDynamicSelectorPopupComponent<IPerson>>(
        RtDynamicSelectorPopupComponent,
        { entities: PEOPLE, keyExp: 'id', displayExp: 'name', ...inputs },
        { providers: [provideRouter([])] }
    );
}

function searchRadiusOf(fixture: TPopupFixture): string | null | undefined {
    const search: DebugElement | null = qa(fixture, 'dynamic-selector-search');

    return search?.injector.get(RtRadiusDirective).step();
}

function applyOf(fixture: TPopupFixture): readonly [string, string | null] {
    const button: HTMLElement = qa(fixture, 'dynamic-selector-apply')?.nativeElement as HTMLElement;

    return [textOf(button), button.getAttribute('aria-label')];
}

describe('RtDynamicSelectorPopupComponent — вид, который задаёт приложение', (): void => {
    it('SC-UKV-728 — поле поиска берёт шаг скругления из входа, а без него — скругление самого поля', (): void => {
        expect(searchRadiusOf(setup())).toBeNull();
        expect(searchRadiusOf(setup({ searchRadius: 'full' }))).toBe('full');
    });

    it('SC-UKV-731 — кнопка применения берёт подпись из входа, а без неё — подпись кита как есть', (): void => {
        const [kitText, kitAria]: readonly [string, string | null] = applyOf(setup());

        expect(kitText).not.toBe('');
        expect(kitAria).toBe(kitText);
        expect(applyOf(setup({ applyLabelCase: 'none' }))).toEqual([kitText, kitText]);
        expect(applyOf(setup({ applyLabel: 'Submit' }))).toEqual(['Submit', 'Submit']);
    });

    it('SC-UKV-731 — регистр подписи меняется входом и для своей подписи, и для подписи кита', (): void => {
        const [kitText]: readonly [string, string | null] = applyOf(setup());

        expect(applyOf(setup({ applyLabel: 'submit FORM', applyLabelCase: 'title' }))).toEqual(['Submit Form', 'Submit Form']);
        expect(applyOf(setup({ applyLabel: 'Submit', applyLabelCase: 'upper' }))).toEqual(['SUBMIT', 'SUBMIT']);
        expect(applyOf(setup({ applyLabelCase: 'upper' }))[0]).toBe(kitText.toLocaleUpperCase());
    });
});
