import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
    { id: 3, name: 'Clara' },
];

@Component({
    selector: 'rt-dynamic-selector-invitation-host',
    template: `
        <rt-dynamic-selector keyExp="id" displayExp="name" [invitation]="invitation()" [entities]="people" [chosenEntities]="chosen" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicSelectorComponent],
})
class InvitationHostComponent {
    public readonly people: IPerson[] = PEOPLE;
    public readonly chosen: IPerson[] = PEOPLE.slice(0, 2);
    public readonly invitation: WritableSignal<boolean> = signal<boolean>(true);
}

function setup(invitation: boolean): ComponentFixture<InvitationHostComponent> {
    const fixture: ComponentFixture<InvitationHostComponent> = createRtFixture(
        InvitationHostComponent,
        {},
        { providers: [provideRouter([])], skipInitialDetect: true }
    );
    fixture.componentInstance.invitation.set(invitation);
    fixture.detectChanges();
    return fixture;
}

describe('RtDynamicSelectorComponent — кнопка добавления шаблоном списка', (): void => {
    it('SC-UKV-1730: под приглашением список рисует две строки и не строит кнопку добавления', (): void => {
        const fixture: ComponentFixture<InvitationHostComponent> = setup(true);

        expect([qaAll(fixture, 'dynamic-selector-row').length, qa(fixture, 'dynamic-selector-add')]).toEqual([2, null]);
    });

    it('SC-UKV-1730: без приглашения кнопку добавления список строит', (): void => {
        const fixture: ComponentFixture<InvitationHostComponent> = setup(false);

        expect([qaAll(fixture, 'dynamic-selector-row').length, qa(fixture, 'dynamic-selector-add') !== null]).toEqual([2, true]);
    });
});
