import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtContainerComponent } from './rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerRightSidenavDirective,
    RtContainerToolbarCenterDirective,
    RtContainerToolbarLeftDirective,
    RtContainerToolbarRightDirective,
} from './rt-container.directives';

/** Все зоны объявляются директивами на `ng-template` — нужна host-обёртка. */
@Component({
    selector: 'rt-container-host',
    template: `
        <rt-container [mobileLeftNav]="mobileLeftNav" [height]="height">
            <ng-template rtContainerHeader><span qa-dataid="slot-header">Шапка</span></ng-template>
            <ng-template rtContainerLeftSidenav><span qa-dataid="slot-left">Меню</span></ng-template>
            <ng-template rtContainerToolbarLeft><span qa-dataid="slot-tl">Фильтры</span></ng-template>
            <ng-template rtContainerToolbarRight><span qa-dataid="slot-tr">Действия</span></ng-template>
            <ng-template rtContainerContent><span qa-dataid="slot-content">Содержимое</span></ng-template>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtContainerComponent,
        RtContainerHeaderDirective,
        RtContainerLeftSidenavDirective,
        RtContainerToolbarLeftDirective,
        RtContainerToolbarCenterDirective,
        RtContainerToolbarRightDirective,
        RtContainerContentDirective,
    ],
})
class ContainerHostComponent {
    public mobileLeftNav: 'keep' | 'bottom' = 'keep';
    public height: 'auto' | 'viewport' = 'auto';
}

/** Правая панель существует, только когда её зона объявлена. */
@Component({
    selector: 'rt-container-right-host',
    template: `
        <rt-container>
            <ng-template rtContainerRightSidenav><span qa-dataid="slot-right-panel">Карточка</span></ng-template>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtContainerComponent, RtContainerRightSidenavDirective],
})
class ContainerRightHostComponent {}

function containerOf(fixture: ComponentFixture<ContainerRightHostComponent>): RtContainerComponent {
    return el(fixture, 'rt-container')?.componentInstance as RtContainerComponent;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtContainerComponent> {
    return createRtFixture(RtContainerComponent, inputs);
}

describe('RtContainerComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-container');
    });

    describe('зоны', (): void => {
        it('объявленные зоны рисуются своими тегами', (): void => {
            // Каркас страницы размечен смысловыми тегами, а не набором дивов:
            // так шапку, меню и содержимое различает и скринридер, и стили.
            const fixture: ComponentFixture<ContainerHostComponent> = createRtFixture(ContainerHostComponent);

            expect((qa(fixture, 'container-header')?.nativeElement as HTMLElement).tagName).toBe('HEADER');
            expect((qa(fixture, 'container-left-sidenav')?.nativeElement as HTMLElement).tagName).toBe('ASIDE');
            expect((qa(fixture, 'container-content')?.nativeElement as HTMLElement).tagName).toBe('MAIN');
        });

        it('содержимое зоны рисуется внутри неё', (): void => {
            const fixture: ComponentFixture<ContainerHostComponent> = createRtFixture(ContainerHostComponent);

            expect(textOf(qa(fixture, 'container-content'))).toBe('Содержимое');
            expect(textOf(qa(fixture, 'container-header'))).toBe('Шапка');
        });

        it('необъявленная зона не создаёт пустого узла', (): void => {
            const fixture: ComponentFixture<RtContainerComponent> = setup();

            expect(qa(fixture, 'container-header')).toBeNull();
            expect(qa(fixture, 'container-content')).toBeNull();
            expect(qa(fixture, 'container-left-sidenav')).toBeNull();
        });

        it('полосы панели инструментов рисуются по объявленным слотам', (): void => {
            const fixture: ComponentFixture<ContainerHostComponent> = createRtFixture(ContainerHostComponent);

            expect(
                qaAll(fixture, 'container-toolbar').map((node: DebugElement): string | null =>
                    (node.nativeElement as HTMLElement).getAttribute('data-slot')
                )
            ).toEqual(['left', 'right']);
        });
    });

    it('стопка уведомлений встроена в каркас — заводить её отдельно не нужно', (): void => {
        expect(el(setup(), 'rt-toaster')).not.toBeNull();
    });

    describe('раскладка', (): void => {
        it('без входов ни один модификатор не выводится', (): void => {
            expect(hostClasses(setup())).toEqual(['rt-container']);
        });

        it('нижняя навигация на узком экране помечает host', (): void => {
            expect(hostClasses(setup({ mobileLeftNav: 'bottom' }))).toContain('rt-container--mobile-left-bottom');
        });

        it('высота во весь экран помечает host', (): void => {
            expect(hostClasses(setup({ height: 'viewport' }))).toContain('rt-container--viewport');
        });
    });

    describe('правая панель', (): void => {
        it('без объявленной зоны оверлея не существует, и открывать нечего', (): void => {
            // Оверлей создаётся только под объявленную зону: иначе каждая
            // страница держала бы пустую панель наготове.
            const fixture: ComponentFixture<RtContainerComponent> = setup();

            fixture.componentInstance.openRight();
            fixture.detectChanges();

            expect(fixture.componentInstance.rightOverlayReady()).toBe(false);
            expect(fixture.componentInstance.rightOpen()).toBe(false);
        });

        it('с объявленной зоной оверлей готов заранее', (): void => {
            const fixture: ComponentFixture<ContainerRightHostComponent> = createRtFixture(ContainerRightHostComponent);

            expect(containerOf(fixture).rightOverlayReady()).toBe(true);
            expect(containerOf(fixture).rightOpen()).toBe(false);
        });

        it('открывается вызовом', (): void => {
            const fixture: ComponentFixture<ContainerRightHostComponent> = createRtFixture(ContainerRightHostComponent);

            containerOf(fixture).openRight();
            fixture.detectChanges();

            expect(containerOf(fixture).rightOpen()).toBe(true);
        });

        it('содержимое зоны рисуется в оверлее, а не в потоке страницы', (): void => {
            const fixture: ComponentFixture<ContainerRightHostComponent> = createRtFixture(ContainerRightHostComponent);

            containerOf(fixture).openRight();
            fixture.detectChanges();

            expect(document.querySelector('[qa-dataid="slot-right-panel"]')).not.toBeNull();
            expect((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="slot-right-panel"]')).toBeNull();
        });

        it('события открытия и закрытия привязаны к концу анимации — без неё они не приходят', (): void => {
            // `rightOpened`/`rightClosed` ждут `transitionend` панели. В среде
            // без анимаций (тест, отключённая анимация) их не будет, а состояние
            // `rightOpen()` при этом уже верное — на него и надо смотреть.
            const fixture: ComponentFixture<ContainerRightHostComponent> = createRtFixture(ContainerRightHostComponent);
            const opened: jest.Mock = jest.fn();
            containerOf(fixture).rightOpened.subscribe(opened);

            containerOf(fixture).openRight();
            fixture.detectChanges();

            expect(containerOf(fixture).rightOpen()).toBe(true);
            expect(opened).not.toHaveBeenCalled();
        });
    });
});
