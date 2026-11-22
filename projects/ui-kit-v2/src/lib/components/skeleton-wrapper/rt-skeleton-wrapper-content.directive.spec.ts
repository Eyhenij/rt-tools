import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtSkeletonWrapperContentDirective } from './rt-skeleton-wrapper-content.directive';
import { RtSkeletonWrapperComponent } from './rt-skeleton-wrapper.component';

/** Компонент внутри шаблона содержимого: считает свои постройки. */
@Component({
    selector: 'rt-skeleton-wrapper-probe',
    template: '<span>Содержимое</span>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ContentProbeComponent {
    public static built: number = 0;

    constructor() {
        ContentProbeComponent.built += 1;
    }
}

/** Обёртка в загрузке с компонентом в шаблоне содержимого. */
@Component({
    selector: 'rt-skeleton-wrapper-probe-host',
    template: `
        <rt-skeleton-wrapper [isLoading]="isLoading()">
            <ng-template rtSkeletonWrapperContent><rt-skeleton-wrapper-probe /></ng-template>
        </rt-skeleton-wrapper>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSkeletonWrapperComponent, RtSkeletonWrapperContentDirective, ContentProbeComponent],
})
class ProbeHostComponent {
    public readonly isLoading: WritableSignal<boolean> = signal<boolean>(true);
}

describe('RtSkeletonWrapperContentDirective', (): void => {
    it('SC-UKV-1740 — обёртка в загрузке не строит содержимого', (): void => {
        ContentProbeComponent.built = 0;
        const fixture: ComponentFixture<ProbeHostComponent> = createRtFixture(ProbeHostComponent);

        expect(qa(fixture, 'skeleton-wrapper-placeholder')).not.toBeNull();
        expect(ContentProbeComponent.built).toBe(0);

        fixture.componentInstance.isLoading.set(false);
        fixture.detectChanges();
        expect(ContentProbeComponent.built).toBe(1);
    });
});
