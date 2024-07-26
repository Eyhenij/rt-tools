import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { AsidePositions } from '../../../util';
import { RtAsideService } from '../aside.service';
import { TestAsideComponent } from './aside-component/test-aside.component';

@Component({
    standalone: true,
    selector: 'rtui-open-aside-button',
    template: '<button mat-flat-button type="button" (click)="onClick()">Open Aside</button>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatButton, MatIcon],
    providers: [RtAsideService],
})
export class OpenAsideButtonComponent {
    readonly #asideService: RtAsideService = inject(RtAsideService);

    public onClick(): void {
        this.#asideService.Open<TestAsideComponent, { statuses: string[] }, AsidePositions>(TestAsideComponent, 'right', {
            statuses: ['Administrator', 'User'],
        });
    }
}
