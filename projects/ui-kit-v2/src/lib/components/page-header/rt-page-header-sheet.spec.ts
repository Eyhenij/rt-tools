import { ApplicationRef, ChangeDetectionStrategy, Component, Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtPageHeader } from './rt-page-header.model';
import { RtPageHeaderComponent } from './rt-page-header.component';

/** Наблюдатели пересечения и размера: в jsdom их нет, шапке хватает пустых. */
class ObserverDouble {
    public observe(): void {}

    public disconnect(): void {}
}

function windowDouble(): Window & typeof globalThis {
    return {
        IntersectionObserver: ObserverDouble,
        ResizeObserver: ObserverDouble,
        getComputedStyle: (): Partial<CSSStyleDeclaration> => ({ columnGap: '4px' }),
    } as unknown as Window & typeof globalThis;
}

/** Телефон: узкое окно и узкая шапка. */
class PhoneBreakpointsService {
    public readonly narrow: Signal<boolean> = signal(true).asReadonly();
    public readonly viewportNarrow: Signal<boolean> = signal(true).asReadonly();
    public readonly phone: Signal<boolean> = this.viewportNarrow;
}

@Component({
    selector: 'rt-page-header-sheet-host',
    template: `
        <rt-page-header [items]="[]" [user]="user" [userMenu]="menu" />
        <ng-template #menu><span qa-dataid="host-user-menu">Профиль</span></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPageHeaderComponent],
})
class PageHeaderSheetHostComponent {
    public readonly user: IRtPageHeader.User = { name: 'Иванов И.' };
}

function setup(): ComponentFixture<PageHeaderSheetHostComponent> {
    return createRtFixture(
        PageHeaderSheetHostComponent,
        {},
        {
            providers: [
                provideRouter([]),
                { provide: WINDOW, useFactory: windowDouble },
                { provide: BreakpointsService, useClass: PhoneBreakpointsService },
            ],
        }
    );
}

function settle(fixture: ComponentFixture<PageHeaderSheetHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function userButton(): HTMLElement {
    return document.querySelector('[qa-dataid="header-user-menu"]') as HTMLElement;
}

/** Приход указателя заданного типа: по нему директива отличает мышь от касания. */
function pointerEnter(target: HTMLElement, pointerType: string): void {
    const enter: MouseEvent = new MouseEvent('pointerenter');

    Object.defineProperty(enter, 'pointerType', { value: pointerType });
    target.dispatchEvent(enter);
    target.dispatchEvent(new MouseEvent('mouseenter'));
}

describe('RtPageHeaderComponent — нижняя шторка', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1444: на телефоне касание имени открывает меню профиля в нижней шторке с именем в заголовке', (): void => {
        const fixture: ComponentFixture<PageHeaderSheetHostComponent> = setup();

        pointerEnter(userButton(), 'touch');
        userButton().click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet [qa-dataid="host-user-menu"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="popover-sheet-title"]')?.textContent?.trim()).toBe('Иванов И.');
        expect(document.querySelector('.rt-popover-panel')).toBeNull();
    });

    it('SC-UKV-1445: наведение мышью шторку не открывает, а уход курсора открытую шторку не закрывает', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<PageHeaderSheetHostComponent> = setup();

        pointerEnter(userButton(), 'mouse');
        settle(fixture);
        expect(document.querySelector('.rt-popover-sheet')).toBeNull();

        userButton().click();
        settle(fixture);
        userButton().dispatchEvent(new MouseEvent('mouseleave'));
        jest.advanceTimersByTime(500);
        settle(fixture);
        jest.useRealTimers();

        expect(document.querySelector('.rt-popover-sheet [qa-dataid="host-user-menu"]')).not.toBeNull();
    });
    it('SC-UKV-1469: на телефоне бургер открывает навигацию в нижней шторке с заголовком меню', (): void => {
        const fixture: ComponentFixture<PageHeaderSheetHostComponent> = setup();
        settle(fixture);

        (document.querySelector('[qa-dataid="header-nav-burger"]') as HTMLElement).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="popover-sheet-title"]')?.textContent?.trim()).toBeTruthy();
        expect(document.querySelector('.rt-popover-panel')).toBeNull();
    });
});
