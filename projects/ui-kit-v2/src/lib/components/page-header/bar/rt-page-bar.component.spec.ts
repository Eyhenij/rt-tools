import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { RtPageBarFilterDirective, RtPageBarSearchDirective } from './rt-page-bar-slots.directive';
import { RtPageBarComponent } from './rt-page-bar.component';
import { IRtPageBar } from './rt-page-bar.model';

let resize: (() => void) | null = null;
let hostWidth: number = 1390;

class ResizeDouble {
    constructor(callback: () => void) {
        resize = callback;
    }

    public observe(): void {}

    public disconnect(): void {}
}

function windowDouble(): Window & typeof globalThis {
    return { ResizeObserver: ResizeDouble } as unknown as Window & typeof globalThis;
}

@Component({
    selector: 'rt-page-bar-host',
    template: `
        <rt-page-bar pageTitle="Все брони" [actions]="actions" [filtersActive]="active()" (actionClick)="clicked = $event">
            <ng-template rtPageBarSearch><input qa-dataid="demo-search" /></ng-template>
            <ng-template rtPageBarFilter><span qa-dataid="demo-filter"></span></ng-template>
            <ng-template rtPageBarFilter><span qa-dataid="demo-filter"></span></ng-template>
        </rt-page-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPageBarComponent, RtPageBarFilterDirective, RtPageBarSearchDirective],
})
class PageBarHostComponent {
    public actions: ReadonlyArray<IRtPageBar.Action> = [{ id: 'new', label: 'Новая', icon: 'plus-circle' }];
    public active: WritableSignal<boolean> = signal<boolean>(false);
    public clicked: string = '';
}

function setup(width: number): ComponentFixture<PageBarHostComponent> {
    hostWidth = width;
    const fixture: ComponentFixture<PageBarHostComponent> = createRtFixture(
        PageBarHostComponent,
        {},
        { providers: [{ provide: WINDOW, useFactory: windowDouble }] }
    );
    const host: HTMLElement = fixture.nativeElement.querySelector('rt-page-bar');
    jest.spyOn(host, 'getBoundingClientRect').mockImplementation((): DOMRect => ({ width: hostWidth }) as DOMRect);
    resize?.();
    fixture.detectChanges();
    return fixture;
}

describe('rt-page-bar', (): void => {
    it('SC-UKV-1194 — a wide bar draws filters and actions in a row', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(1390);

        expect(qaAll(fixture, 'demo-filter')).toHaveLength(2);
        expect(qaAll(fixture, 'page-bar-action')).toHaveLength(1);
        expect(qa(fixture, 'page-bar-filters')).toBeNull();
    });

    it('SC-UKV-1194 — a bar of 768 hides filters and actions behind buttons', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(768);

        expect(qaAll(fixture, 'demo-filter')).toHaveLength(0);
        expect(qaAll(fixture, 'page-bar-action')).toHaveLength(0);
        expect(qa(fixture, 'page-bar-filters')).not.toBeNull();
        expect(qa(fixture, 'page-bar-actions-menu')).not.toBeNull();
    });

    it('SC-UKV-1197 — the filters button opens the bottom sheet with search and all filters', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-sheet')).not.toBeNull();
        expect(qaAll(fixture, 'demo-filter')).toHaveLength(2);
        expect(qa(fixture, 'demo-search')).not.toBeNull();
    });

    it('SC-UKV-1200 — the apply button closes the bottom sheet', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);

        (qa(fixture, 'page-bar-filters')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();
        (qa(fixture, 'page-bar-apply')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-sheet')).toBeNull();
    });

    it('SC-UKV-1197 — applied filters light the dot on the button', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(375);
        expect(qa(fixture, 'page-bar-filters-dot')).toBeNull();

        fixture.componentInstance.active.set(true);
        fixture.detectChanges();

        expect(qa(fixture, 'page-bar-filters-dot')).not.toBeNull();
    });

    it('a pressed action reports its id', (): void => {
        const fixture: ComponentFixture<PageBarHostComponent> = setup(1390);

        (qa(fixture, 'page-bar-action')?.nativeElement as HTMLElement).click();

        expect(fixture.componentInstance.clicked).toBe('new');
    });
});
