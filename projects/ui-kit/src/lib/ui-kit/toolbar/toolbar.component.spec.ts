import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from './toolbar.component';

/**
 * Хост подаёт слоты так же, как приложение, — шаблонами со структурной директивой. Признаки
 * подачи полями, а не входами: слот объявляется в разметке того, кто им владеет, и включается
 * только условием вокруг него.
 */
@Component({
    template: `
        <rtui-toolbar [sticky]="sticky">
            @if (hasLeft) {
                <ng-container *rtuiToolbarLeft><span qa-dataid="left">слева</span></ng-container>
            }
            @if (hasCenter) {
                <ng-container *rtuiToolbarCenter><span qa-dataid="center">посередине</span></ng-container>
            }
            @if (hasRight) {
                <ng-container *rtuiToolbarRight><span qa-dataid="right">справа</span></ng-container>
            }
        </rtui-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarCenterDirective, RtuiToolbarRightDirective],
})
class HostComponent {
    public hasLeft: boolean = true;
    public hasCenter: boolean = true;
    public hasRight: boolean = true;
    public sticky: boolean = false;
}

describe('RtuiToolbarComponent — слоты и закрепление', () => {
    function setup(patch: Partial<HostComponent> = {}): ComponentFixture<HostComponent> {
        TestBed.configureTestingModule({ imports: [HostComponent] });

        const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

        Object.assign(fixture.componentInstance, patch);
        fixture.detectChanges();

        return fixture;
    }

    function bars(fixture: ComponentFixture<HostComponent>): string[] {
        return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.bars__bar')).flatMap((one: Element) =>
            Array.from(one.classList).filter((name: string) => name.startsWith('bars__bar--'))
        );
    }

    it('три поданных слота дают три полосы в порядке слева направо', () => {
        const fixture: ComponentFixture<HostComponent> = setup();

        expect(bars(fixture)).toEqual(['bars__bar--left', 'bars__bar--center', 'bars__bar--right']);
    });

    it('подан один левый — середина остаётся на месте, правой полосы нет', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ hasCenter: false, hasRight: false });

        expect(bars(fixture)).toEqual(['bars__bar--left', 'bars__bar--center']);
    });

    it('подан один правый — середина остаётся на месте, левой полосы нет', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ hasLeft: false, hasCenter: false });

        expect(bars(fixture)).toEqual(['bars__bar--center', 'bars__bar--right']);
    });

    it('без единого слота панели нет вовсе', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ hasLeft: false, hasCenter: false, hasRight: false });

        expect((fixture.nativeElement as HTMLElement).querySelector('mat-toolbar')).toBeNull();
    });

    it('закрепление ставит модификатор на панель, а не на хост', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ sticky: true });
        const toolbar: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('mat-toolbar') as HTMLElement;

        expect(toolbar.classList.contains('toolbar--sticky')).toBe(true);
    });

    it('без закрепления модификатора нет', () => {
        const fixture: ComponentFixture<HostComponent> = setup();
        const toolbar: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('mat-toolbar') as HTMLElement;

        expect(toolbar.classList.contains('toolbar--sticky')).toBe(false);
    });
});
