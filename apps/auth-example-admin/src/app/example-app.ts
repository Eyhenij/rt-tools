import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const BEM_BLOCK: string = 'example-root';

/** The root of the example admin: one route outlet. */
@Component({
    selector: 'example-root',
    template: '<router-outlet />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        RouterOutlet,
    ],
    host: { class: BEM_BLOCK },
})
export class ExampleApp {}
