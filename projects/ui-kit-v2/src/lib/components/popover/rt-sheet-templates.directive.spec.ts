import { ChangeDetectionStrategy, Component, Signal, TemplateRef, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtSheetTemplatesDirective } from './rt-sheet-templates.directive';

/** Узел с входами своих шапки и подвала шторки — как у списка выбора, берущего директиву хостом. */
@Component({
    selector: 'rt-sheet-templates-host',
    template: `
        <div rtSheetTemplates [sheetHeaderTemplate]="given() ? headerTpl : null" [sheetFooterTemplate]="given() ? footerTpl : null"></div>
        <ng-template #headerTpl>Шапка</ng-template>
        <ng-template #footerTpl>Подвал</ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSheetTemplatesDirective],
})
class SheetTemplatesHostComponent {
    public readonly given: WritableSignal<boolean> = signal<boolean>(true);
    public readonly templates: Signal<RtSheetTemplatesDirective> = viewChild.required(RtSheetTemplatesDirective);
    public readonly headerRef: Signal<TemplateRef<unknown>> = viewChild.required<TemplateRef<unknown>>('headerTpl');
    public readonly footerRef: Signal<TemplateRef<unknown>> = viewChild.required<TemplateRef<unknown>>('footerTpl');
}

/** Узел-якорь шаблона: Angular выдаёт на каждый запрос новый объект шаблона, а якорь у шаблона один. */
function anchorOf(template: TemplateRef<unknown> | null): unknown {
    return template?.elementRef.nativeElement ?? null;
}

function setup(given: boolean): SheetTemplatesHostComponent {
    const fixture: ComponentFixture<SheetTemplatesHostComponent> = createRtFixture(
        SheetTemplatesHostComponent,
        {},
        { skipInitialDetect: true }
    );

    fixture.componentInstance.given.set(given);
    fixture.detectChanges();

    return fixture.componentInstance;
}

describe('RtSheetTemplatesDirective', (): void => {
    it('несёт шаблоны шапки и подвала, заданные входами', (): void => {
        const host: SheetTemplatesHostComponent = setup(true);

        expect(anchorOf(host.templates().sheetHeaderTemplate())).toBe(anchorOf(host.headerRef()));
        expect(anchorOf(host.templates().sheetFooterTemplate())).toBe(anchorOf(host.footerRef()));
    });

    it('без входов шаблонов нет: шторка рисует свою шапку и остаётся без подвала', (): void => {
        const host: SheetTemplatesHostComponent = setup(false);

        expect(host.templates().sheetHeaderTemplate()).toBeNull();
        expect(host.templates().sheetFooterTemplate()).toBeNull();
    });
});
