import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtWorkspaceDetailsErrorDirective } from './rt-workspace-details-error.directive';
import { RtWorkspaceDetailsComponent } from './rt-workspace-details.component';

/** Панель со своим шаблоном ошибки. */
@Component({
    selector: 'rt-workspace-details-own-error-host',
    template: `
        <rt-workspace-details error="Нет сети" (retry)="retryCount = retryCount + 1">
            <ng-template rtWorkspaceDetailsError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </rt-workspace-details>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWorkspaceDetailsComponent, RtWorkspaceDetailsErrorDirective],
})
class OwnErrorHostComponent {
    public retryCount: number = 0;
}

describe('RtWorkspaceDetailsComponent — свой шаблон ошибки', (): void => {
    it('SC-UKV-1278 — свой шаблон встаёт вместо ошибки по умолчанию и получает текст и повтор', (): void => {
        const fixture: ComponentFixture<OwnErrorHostComponent> = createRtFixture(OwnErrorHostComponent);

        expect(qa(fixture, 'workspace-details-error')).toBeNull();
        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });
});
