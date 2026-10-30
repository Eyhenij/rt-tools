import { ChangeDetectionStrategy, Component, Signal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
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

/** Узкий экран: меню профиля стоит на затемнении. */
class NarrowBreakpointsService {
    public readonly narrow: Signal<boolean> = signal(true).asReadonly();
}

@Component({
    selector: 'rt-page-header-touch-host',
    template: `
        <rt-page-header [items]="[]" [user]="user" [userMenu]="menu" />
        <ng-template #menu><span qa-dataid="host-user-menu">Профиль</span></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPageHeaderComponent],
})
class PageHeaderTouchHostComponent {
    public readonly user: IRtPageHeader.User = { name: 'Иванов И.' };
}

/** Касание: браузер шлёт приход указателя, а за ним наведение, нажатие и уход курсора. */
function tap(target: HTMLElement): void {
    const enter: MouseEvent = new MouseEvent('pointerenter');

    Object.defineProperty(enter, 'pointerType', { value: 'touch' });
    target.dispatchEvent(enter);
    target.dispatchEvent(new MouseEvent('mouseenter'));
    target.click();
    target.dispatchEvent(new MouseEvent('mouseleave'));
}

describe('RtPageHeaderComponent — касание', (): void => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-1084: касание имени открывает меню профиля один раз, а касание затемнения не оставляет ни меню, ни затемнения', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<PageHeaderTouchHostComponent> = createRtFixture(
            PageHeaderTouchHostComponent,
            {},
            {
                providers: [
                    provideRouter([]),
                    { provide: WINDOW, useFactory: windowDouble },
                    { provide: BreakpointsService, useClass: NarrowBreakpointsService },
                ],
            }
        );
        const name: HTMLElement = document.querySelector('[qa-dataid="header-user-menu"]') as HTMLElement;

        tap(name);
        jest.advanceTimersByTime(200);
        fixture.detectChanges();
        expect(document.querySelectorAll('.cdk-overlay-backdrop').length).toBe(1);
        expect(document.querySelector('[qa-dataid="host-user-menu"]')).not.toBeNull();

        // После снятия подложки курсор снова над именем, и браузер повторяет наведение
        (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
        name.dispatchEvent(new MouseEvent('mouseenter'));
        jest.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(document.querySelector('[qa-dataid="host-user-menu"]')).toBeNull();
        expect(document.querySelectorAll('.cdk-overlay-backdrop').length).toBe(0);
    });

    it('SC-UKV-1085: меню профиля подгоняется под окно, и на низком экране его пункты прокручиваются', (): void => {
        const fixture: ComponentFixture<PageHeaderTouchHostComponent> = createRtFixture(
            PageHeaderTouchHostComponent,
            {},
            { providers: [provideRouter([]), { provide: WINDOW, useFactory: windowDouble }] }
        );
        const popover: RtPopoverDirective = fixture.debugElement
            .query(By.css('[qa-dataid="header-user-menu"]'))
            .injector.get(RtPopoverDirective);

        expect(popover.fitViewport()).toBe(true);
    });
});
