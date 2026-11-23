import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtBreadcrumbsContentDirective } from './rt-breadcrumbs-content.directive';
import { RtBreadcrumbsComponent } from './rt-breadcrumbs.component';
import { IRtBreadcrumbs } from './rt-breadcrumbs.model';

@Component({
    selector: 'rt-content-slot-host',
    template: `
        <rt-breadcrumbs [crumbs]="crumbs" [look]="on() ? 'inline' : 'heading'">
            <ng-template rtBreadcrumbsContent><span qa-dataid="slot-probe">содержимое</span></ng-template>
        </rt-breadcrumbs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBreadcrumbsComponent, RtBreadcrumbsContentDirective],
})
class ContentSlotHostComponent {
    protected readonly crumbs: IRtBreadcrumbs.Crumb[] = [{ label: 'Брони', link: '/bookings' }, { label: 'Бронь 42' }];
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
}

/** Сколько узлов содержимого построено: шаблон, который не создан, узла не даёт. */
function probes(): number {
    return document.querySelectorAll('[qa-dataid="slot-probe"]').length;
}

describe('RtBreadcrumbsComponent — содержимое после заголовка шаблоном', (): void => {
    it('SC-UKV-1729: строчный вид не строит содержимое, вид заголовка строит его', (): void => {
        createRtFixture(ContentSlotHostComponent, {}, { providers: [provideRouter([])] });

        expect(probes()).toBe(0);
    });

    it('SC-UKV-1729: без этого состояния содержимое строится один раз', (): void => {
        const fixture: ComponentFixture<ContentSlotHostComponent> = createRtFixture(
            ContentSlotHostComponent,
            {},
            { providers: [provideRouter([])] }
        );

        fixture.componentInstance.on.set(false);
        fixture.detectChanges();

        expect(probes()).toBe(1);
    });
});
