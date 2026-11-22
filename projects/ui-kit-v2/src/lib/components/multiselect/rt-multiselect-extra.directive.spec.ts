import { ChangeDetectionStrategy, Component, viewChildren, Signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtMultiselectExtraDirective } from './rt-multiselect-extra.directive';

@Component({
    selector: 'rt-multiselect-extra-host',
    template: `
        <ng-template rtMultiselectExtra>Скрыть пустые</ng-template>
        <div rtMultiselectExtra>Прежняя форма</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMultiselectExtraDirective],
})
class MultiselectExtraHostComponent {
    public readonly slots: Signal<readonly RtMultiselectExtraDirective[]> = viewChildren(RtMultiselectExtraDirective);
}

describe('RtMultiselectExtraDirective', (): void => {
    it('SC-UKV-1745: шаблон слота даёт шаблон, а прежняя форма — нет и предупреждает в режиме разработки', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);

        const fixture: ComponentFixture<MultiselectExtraHostComponent> = createRtFixture(MultiselectExtraHostComponent);

        const [given, former]: readonly RtMultiselectExtraDirective[] = fixture.componentInstance.slots();
        expect(given.template).not.toBeNull();
        expect(former.template).toBeNull();
        const message: string = warn.mock.calls.map((call: unknown[]): string => String(call[0])).join('\n');
        expect(message).toContain('rt-multiselect');
        expect(message).toContain('<ng-template rtMultiselectExtra>');
        warn.mockRestore();
    });
});
