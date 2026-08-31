import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointService } from '@rt-tools/core';

import { RtuiPaginationComponent } from './rtui-pagination.component';

/**
 * Двойник службы точек перелома: сценарий сам решает, узкий экран или нет.
 *
 * Проверяется договор, общий для всего кита: признак узкого экрана компонент берёт у службы, и
 * второго источника у него нет — вход, которым его когда-то передавало приложение, снят.
 */
class BreakpointServiceStub {
    public readonly narrow: WritableSignal<boolean> = signal(false);

    public get isMobile(): Signal<boolean> {
        return this.narrow.asReadonly();
    }
}

@Component({
    template: '<rtui-pagination [currentPageModel]="pageModel" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiPaginationComponent],
})
class HostComponent {
    public pageModel: { pageNumber: number; pageSize: number; totalCount: number; hasPrev: boolean; hasNext: boolean } = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 100,
        hasPrev: false,
        hasNext: true,
    };
}

describe('RtuiPaginationComponent — признак узкого экрана', () => {
    function setup(): { fixture: ComponentFixture<HostComponent>; breakpoints: BreakpointServiceStub } {
        const breakpoints: BreakpointServiceStub = new BreakpointServiceStub();

        TestBed.configureTestingModule({
            imports: [HostComponent],
        });
        TestBed.overrideComponent(RtuiPaginationComponent, {
            set: { providers: [{ provide: BreakpointService, useValue: breakpoints }] },
        });

        const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
        fixture.detectChanges();

        return { fixture, breakpoints };
    }

    function narrowOf(fixture: ComponentFixture<HostComponent>): boolean {
        const pagination: RtuiPaginationComponent = fixture.debugElement.children[0].componentInstance;

        return (pagination as unknown as { narrow: Signal<boolean> }).narrow();
    }

    it('признак берётся у службы', () => {
        const { fixture, breakpoints } = setup();

        expect(narrowOf(fixture)).toBe(false);

        breakpoints.narrow.set(true);
        fixture.detectChanges();
        expect(narrowOf(fixture)).toBe(true);
    });

    it('замер службы читается и обратно, без второго источника', () => {
        const { fixture, breakpoints } = setup();

        breakpoints.narrow.set(true);
        fixture.detectChanges();
        expect(narrowOf(fixture)).toBe(true);

        breakpoints.narrow.set(false);
        fixture.detectChanges();
        expect(narrowOf(fixture)).toBe(false);
    });
});
