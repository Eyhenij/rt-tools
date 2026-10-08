import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa } from '../../../../testing/rt-kit-testing';
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

describe('RtDynamicSelectorPopupComponent — вид, который задаёт приложение', (): void => {
    it('SC-UKV-728 — поле поиска берёт шаг скругления из входа, а без него — скругление самого поля', (): void => {
        expect(searchRadiusOf(setup())).toBeNull();
        expect(searchRadiusOf(setup({ searchRadius: 'full' }))).toBe('full');
    });
});
