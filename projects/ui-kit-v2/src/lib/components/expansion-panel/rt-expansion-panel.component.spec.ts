import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtExpansionPanelContentDirective } from './rt-expansion-panel-content.directive';
import { RtExpansionPanelComponent } from './rt-expansion-panel.component';

/** Владелец панели: держит раскрытие в своём сигнале и кладёт заголовок и оба вида тела. */
@Component({
    selector: 'rt-expansion-panel-test-host',
    template: `
        <rt-expansion-panel [disabled]="disabled()" [hideToggle]="hideToggle()" [headerId]="headerId()" [(expanded)]="expanded">
            <span qa-dataid="host-title">Доставка</span>
            <p rtExpansionPanelBody qa-dataid="host-eager">Сразу созданное тело.</p>
            <ng-template rtExpansionPanelContent>
                <p qa-dataid="host-lazy">Тело, созданное при раскрытии.</p>
            </ng-template>
        </rt-expansion-panel>
        <rt-expansion-panel [expanded]="true"><span>Вторая</span></rt-expansion-panel>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtExpansionPanelComponent, RtExpansionPanelContentDirective],
})
class ExpansionPanelHostComponent {
    public readonly expanded: WritableSignal<boolean> = signal(false);
    public readonly disabled: WritableSignal<boolean> = signal(false);
    public readonly hideToggle: WritableSignal<boolean> = signal(false);
    public readonly headerId: WritableSignal<string | null> = signal<string | null>(null);
}

function setup(): ComponentFixture<ExpansionPanelHostComponent> {
    return createRtFixture(ExpansionPanelHostComponent);
}

function header(fixture: ComponentFixture<ExpansionPanelHostComponent>, index: number = 0): HTMLButtonElement {
    return qaAll(fixture, 'expansion-panel-header')[index].nativeElement as HTMLButtonElement;
}

function bodies(fixture: ComponentFixture<ExpansionPanelHostComponent>): HTMLElement[] {
    return qaAll(fixture, 'expansion-panel-body').map((node: { nativeElement: HTMLElement }): HTMLElement => node.nativeElement);
}

function press(fixture: ComponentFixture<ExpansionPanelHostComponent>): void {
    header(fixture).click();
    fixture.detectChanges();
}

describe('RtExpansionPanelComponent', (): void => {
    it('SC-UKV-472 — рисует заголовок из содержимого и шеврон, тело свёрнутой панели не рисует', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        expect(textOf(header(fixture))).toBe('Доставка');
        expect(header(fixture).querySelector('.rt-expansion-panel__chevron')).not.toBeNull();
        expect(qa(fixture, 'host-eager')).toBeNull();
        expect(qa(fixture, 'host-lazy')).toBeNull();
    });

    it('SC-UKV-473 — нажатие раскрывает свёрнутую панель, повторное сворачивает, владелец слышит оба', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        press(fixture);
        expect(fixture.componentInstance.expanded()).toBe(true);
        expect(textOf(qa(fixture, 'host-lazy'))).toBe('Тело, созданное при раскрытии.');

        press(fixture);
        expect(fixture.componentInstance.expanded()).toBe(false);
        expect(qa(fixture, 'host-lazy')).toBeNull();
    });

    it('SC-UKV-474 — владелец раскрывает и сворачивает панель своим значением', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        fixture.componentInstance.expanded.set(true);
        fixture.detectChanges();
        expect(textOf(qa(fixture, 'host-eager'))).toBe('Сразу созданное тело.');

        fixture.componentInstance.expanded.set(false);
        fixture.detectChanges();
        expect(qa(fixture, 'host-eager')).toBeNull();
    });

    it('SC-UKV-475 — недоступная панель не раскрывается нажатием', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();
        press(fixture);

        expect(header(fixture).disabled).toBe(true);
        expect(fixture.componentInstance.expanded()).toBe(false);
    });

    it('SC-UKV-476 — hideToggle убирает шеврон, заголовок нажимается как прежде', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        fixture.componentInstance.hideToggle.set(true);
        fixture.detectChanges();
        expect(header(fixture).querySelector('.rt-expansion-panel__chevron')).toBeNull();

        press(fixture);
        expect(fixture.componentInstance.expanded()).toBe(true);
    });

    it('SC-UKV-477 — заголовок называет раскрытие и тело, тело — регион с подписью по заголовку', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        expect(header(fixture).getAttribute('aria-expanded')).toBe('false');
        expect(header(fixture).getAttribute('aria-controls')).toBeNull();

        press(fixture);
        const body: HTMLElement = bodies(fixture)[0];

        expect(header(fixture).getAttribute('aria-expanded')).toBe('true');
        expect(header(fixture).getAttribute('aria-controls')).toBe(body.id);
        expect(body.getAttribute('role')).toBe('region');
        expect(body.getAttribute('aria-labelledby')).toBe(header(fixture).id);
    });

    it('SC-UKV-478 — id заголовка берётся из входа, а без него свой и у двух панелей разный', (): void => {
        const fixture: ComponentFixture<ExpansionPanelHostComponent> = setup();

        expect(header(fixture, 0).id).not.toBe('');
        expect(header(fixture, 0).id).not.toBe(header(fixture, 1).id);
        expect(bodies(fixture)[0].id).not.toBe('');

        fixture.componentInstance.headerId.set('folder-7');
        fixture.detectChanges();
        expect(header(fixture, 0).id).toBe('folder-7');
    });
});
