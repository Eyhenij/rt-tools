import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtuiPopoverContainerComponent } from './rtui-popover-container.component';

/** Шаблон и класс приходят слою так же, как от потребителя, — привязками входов. */
@Component({
    template: `
        <ng-template #body><span qa-dataid="popover-body">содержимое</span></ng-template>
        <rtui-popover-container [popoverClass]="popoverClass" [popoverTemplate]="withTemplate ? body : null" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiPopoverContainerComponent],
})
class HostComponent {
    public withTemplate: boolean = true;
    public popoverClass: string | undefined = undefined;
}

describe('RtuiPopoverContainerComponent — содержимое и класс от потребителя', () => {
    function setup(patch: Partial<HostComponent> = {}): ComponentFixture<HostComponent> {
        TestBed.configureTestingModule({ imports: [HostComponent] });

        const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

        Object.assign(fixture.componentInstance, patch);
        fixture.detectChanges();

        return fixture;
    }

    function host(fixture: ComponentFixture<HostComponent>): HTMLElement {
        return (fixture.nativeElement as HTMLElement).querySelector('rtui-popover-container') as HTMLElement;
    }

    it('поданный шаблон рисуется внутри слоя', () => {
        const fixture: ComponentFixture<HostComponent> = setup();

        expect(host(fixture).querySelector('[qa-dataid="popover-body"]')?.textContent).toBe('содержимое');
    });

    it('без шаблона слой есть, а содержимого у него нет', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ withTemplate: false });

        expect(host(fixture)).not.toBeNull();
        expect(host(fixture).querySelector('[qa-dataid="popover-body"]')).toBeNull();
    });

    it('класс от потребителя доезжает до хоста слоя', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ popoverClass: 'popover-accent' });

        expect(host(fixture).classList.contains('popover-accent')).toBe(true);
    });

    it('не строка классом не становится: вход её отбрасывает', () => {
        const fixture: ComponentFixture<HostComponent> = setup({ popoverClass: undefined });

        expect(Array.from(host(fixture).classList)).toEqual(['rtui-popover-container']);
    });
});
