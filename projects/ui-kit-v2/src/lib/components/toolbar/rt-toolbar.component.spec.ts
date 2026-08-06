import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, hostClasses, qaAll } from '../../../testing/rt-kit-testing';
import { RtToolbarCenterDirective, RtToolbarComponent, RtToolbarLeftDirective, RtToolbarRightDirective } from './rt-toolbar.component';

/** Слоты объявляются директивами на `ng-template` — нужна host-обёртка. */
@Component({
    selector: 'rt-toolbar-host',
    template: `
        <rt-toolbar [dense]="dense">
            <ng-template rtToolbarLeft><button type="button" qa-dataid="slot-left">Назад</button></ng-template>
            <ng-template rtToolbarCenter><span qa-dataid="slot-center">Заголовок</span></ng-template>
            <ng-template rtToolbarRight><button type="button" qa-dataid="slot-right">Ещё</button></ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarLeftDirective, RtToolbarCenterDirective, RtToolbarRightDirective],
})
class ToolbarHostComponent {
    public dense: boolean = false;
}

/** Панель только с одним слотом. */
@Component({
    selector: 'rt-toolbar-single-host',
    template: `
        <rt-toolbar>
            <ng-template rtToolbarRight><button type="button" qa-dataid="slot-right">Ещё</button></ng-template>
        </rt-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToolbarComponent, RtToolbarRightDirective],
})
class ToolbarSingleHostComponent {}

function slots(fixture: ComponentFixture<unknown>): string[] {
    return qaAll(fixture, 'toolbar-bar').map(
        (node: DebugElement): string => (node.nativeElement as HTMLElement).getAttribute('data-slot') ?? ''
    );
}

describe('RtToolbarComponent', (): void => {
    it('рисует по полосе на каждый объявленный слот', (): void => {
        expect(slots(createRtFixture(ToolbarHostComponent))).toEqual(['left', 'center', 'right']);
    });

    it('необъявленный слот не создаёт пустой полосы', (): void => {
        // Пустая полоса занимала бы место и растягивала бы соседние.
        expect(slots(createRtFixture(ToolbarSingleHostComponent))).toEqual(['right']);
    });

    it('без единого слота панель не рисуется вовсе', (): void => {
        const fixture: ComponentFixture<RtToolbarComponent> = createRtFixture(RtToolbarComponent);

        expect((fixture.nativeElement as HTMLElement).children.length).toBe(0);
    });

    it('каждая полоса помечена своим модификатором', (): void => {
        const fixture: ComponentFixture<ToolbarHostComponent> = createRtFixture(ToolbarHostComponent);
        const bars: string[][] = qaAll(fixture, 'toolbar-bar').map((node: DebugElement): string[] => classesOf(node));

        expect(bars[0]).toContain('rt-toolbar__bar--left');
        expect(bars[1]).toContain('rt-toolbar__bar--center');
        expect(bars[2]).toContain('rt-toolbar__bar--right');
    });

    it('содержимое слота рисуется внутри своей полосы', (): void => {
        const fixture: ComponentFixture<ToolbarHostComponent> = createRtFixture(ToolbarHostComponent);

        expect((fixture.nativeElement as HTMLElement).querySelector('[data-slot="left"] [qa-dataid="slot-left"]')).not.toBeNull();
        expect((fixture.nativeElement as HTMLElement).querySelector('[data-slot="right"] [qa-dataid="slot-right"]')).not.toBeNull();
    });

    describe('плотный режим', (): void => {
        it('без входа не включён', (): void => {
            expect(hostClasses(createRtFixture(RtToolbarComponent))).not.toContain('rt-toolbar--dense');
        });

        it('включается входом', (): void => {
            expect(hostClasses(createRtFixture(RtToolbarComponent, { dense: true }))).toContain('rt-toolbar--dense');
        });

        it('принимает пустую строку как истину — так пишется голый атрибут разметки', (): void => {
            expect(hostClasses(createRtFixture(RtToolbarComponent, { dense: '' }))).toContain('rt-toolbar--dense');
        });
    });
});
