import { ChangeDetectionStrategy, Component, Signal, TemplateRef, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtPopoverSheetOptionsDirective } from './rt-popover-sheet-options.directive';
import { RtSheetTemplatesDirective } from './rt-sheet-templates.directive';

/** Узел панели с входами шторки; шаблоны компонента вокруг панели стоят на том же узле. */
@Component({
    selector: 'rt-popover-sheet-options-host',
    template: `
        <div
            rtPopoverSheetOptions
            rtSheetTemplates
            [sheetHeaderTemplate]="hostTpl"
            [rtPopoverSheetHeader]="own() ? ownTpl : null"
            [rtPopoverSheetFull]="full()"
            [rtPopoverSheetUnsaved]="unsaved()"></div>
        <ng-template #hostTpl>Шапка компонента</ng-template>
        <ng-template #ownTpl>Шапка панели</ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverSheetOptionsDirective, RtSheetTemplatesDirective],
})
class PopoverSheetOptionsHostComponent {
    public readonly own: WritableSignal<boolean> = signal<boolean>(false);
    public readonly full: WritableSignal<boolean> = signal<boolean>(false);
    public readonly unsaved: WritableSignal<boolean> = signal<boolean>(false);
    public readonly options: Signal<RtPopoverSheetOptionsDirective> = viewChild.required(RtPopoverSheetOptionsDirective);
    public readonly hostRef: Signal<TemplateRef<unknown>> = viewChild.required<TemplateRef<unknown>>('hostTpl');
    public readonly ownRef: Signal<TemplateRef<unknown>> = viewChild.required<TemplateRef<unknown>>('ownTpl');
}

/** Узел-якорь шаблона: Angular выдаёт на каждый запрос новый объект шаблона, а якорь у шаблона один. */
function anchorOf(template: TemplateRef<unknown> | null): unknown {
    return template?.elementRef.nativeElement ?? null;
}

function setup(): ComponentFixture<PopoverSheetOptionsHostComponent> {
    return createRtFixture(PopoverSheetOptionsHostComponent, {});
}

describe('RtPopoverSheetOptionsDirective', (): void => {
    it('без своего шаблона шапку берёт у компонента вокруг панели', (): void => {
        const host: PopoverSheetOptionsHostComponent = setup().componentInstance;

        expect(anchorOf(host.options().header())).toBe(anchorOf(host.hostRef()));
        expect(host.options().footer()).toBeNull();
    });

    it('свой шаблон шапки панели сильнее шаблона компонента', (): void => {
        const fixture: ComponentFixture<PopoverSheetOptionsHostComponent> = setup();
        const host: PopoverSheetOptionsHostComponent = fixture.componentInstance;

        host.own.set(true);
        fixture.detectChanges();

        expect(anchorOf(host.options().header())).toBe(anchorOf(host.ownRef()));
    });

    it('высота и неприменённый выбор читаются на лету', (): void => {
        const fixture: ComponentFixture<PopoverSheetOptionsHostComponent> = setup();
        const host: PopoverSheetOptionsHostComponent = fixture.componentInstance;

        expect(host.options().rtPopoverSheetFull()).toBe(false);
        expect(host.options().rtPopoverSheetUnsaved()).toBe(false);

        host.full.set(true);
        host.unsaved.set(true);
        fixture.detectChanges();

        expect(host.options().rtPopoverSheetFull()).toBe(true);
        expect(host.options().rtPopoverSheetUnsaved()).toBe(true);
    });
});
