import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
} from '@angular/core';

import { IRtCarousel } from '../../rt-carousel.model';
import { RtCarouselComponent } from '../../rt-carousel.component';

/** Роли записи — короткие подписи разного цвета, каким их передаёт приложение. */
const ROLES: readonly IRtCarousel.Card[] = [
    { label: 'Administrator', color: '#1e88e5' },
    { label: 'Editor', color: '#43a047' },
    { label: 'Billing', color: '#fdd835' },
    { label: 'Support live chat', color: '#8e24aa' },
    { label: 'Reports', color: '#fb8c00' },
    { label: 'Viewer' },
];

/**
 * Демонстрационная обёртка для витрины: собирает карточки по входам, на которые Storybook вешает
 * контролы. В пакет не уезжает.
 */
@Component({
    selector: 'app-carousel',
    templateUrl: './test-carousel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCarouselComponent,
    ],
})
export class TestRtCarouselComponent {
    protected readonly cards: Signal<readonly IRtCarousel.Card[]> = computed((): readonly IRtCarousel.Card[] =>
        ROLES.slice(0, this.count()).map((card: IRtCarousel.Card): IRtCarousel.Card => (this.colored() ? card : { label: card.label }))
    );

    public readonly count: InputSignal<number> = input<number>(4);
    public readonly colored: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
}
