import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from './scrollable-container.component';

/** Части подаются шаблонами, как у приложения, и включаются условием вокруг каждой. */
@Component({
    template: `
        <rtui-scrollable>
            @if (hasHeader) {
                <ng-container *rtuiScrollableHeader><span>шапка</span></ng-container>
            }
            @if (hasContent) {
                <ng-container *rtuiScrollableContent><span>тело</span></ng-container>
            }
            @if (hasFooter) {
                <ng-container *rtuiScrollableFooter><span>подвал</span></ng-container>
            }
        </rtui-scrollable>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtuiScrollableContainerComponent,
        RtuiScrollableContainerHeaderDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerFooterDirective,
    ],
})
class HostComponent {
    public hasHeader: boolean = true;
    public hasContent: boolean = true;
    public hasFooter: boolean = true;
}

describe('RtuiScrollableContainerComponent — сборка частей', () => {
    function setup(patch: Partial<HostComponent> = {}): ComponentFixture<HostComponent> {
        TestBed.configureTestingModule({ imports: [HostComponent] });

        const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

        Object.assign(fixture.componentInstance, patch);
        fixture.detectChanges();

        return fixture;
    }

    function parts(fixture: ComponentFixture<HostComponent>): string[] {
        return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[class^="rtui-scrollable__"]')).map(
            (one: Element) => one.className
        );
    }

    it('три поданные части идут сверху вниз: шапка, тело, подвал', () => {
        expect(parts(setup())).toEqual(['rtui-scrollable__header', 'rtui-scrollable__content', 'rtui-scrollable__footer']);
    });

    it('подано одно тело — ни шапки, ни подвала нет вовсе', () => {
        expect(parts(setup({ hasHeader: false, hasFooter: false }))).toEqual(['rtui-scrollable__content']);
    });

    it('шапка с телом без подвала', () => {
        expect(parts(setup({ hasFooter: false }))).toEqual(['rtui-scrollable__header', 'rtui-scrollable__content']);
    });

    it('содержимое частей доезжает до разметки в том же порядке', () => {
        const texts: string[] = Array.from(
            (setup().nativeElement as HTMLElement).querySelectorAll('[class^="rtui-scrollable__"] span')
        ).map((one: Element) => one.textContent ?? '');

        expect(texts).toEqual(['шапка', 'тело', 'подвал']);
    });
});
