import { ChangeDetectionStrategy, Component, signal, viewChild, Signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtExpansionPanelActionsDirective } from './rt-expansion-panel-actions.directive';
import { RtExpansionPanelContentDirective } from './rt-expansion-panel-content.directive';
import { RtExpansionPanelGroupDirective } from './rt-expansion-panel-group.directive';
import { RtExpansionPanelComponent } from './rt-expansion-panel.component';

/** Владелец: панель с действиями, группа из трёх панелей и панель, сохраняющая тело. */
@Component({
    selector: 'rt-expansion-panel-additions-host',
    template: `
        <rt-expansion-panel qa-dataid="with-actions" [(expanded)]="actionsOpen">
            <span>Номера</span>
            <ng-template rtExpansionPanelActions>
                <span>
                    <button type="button" qa-dataid="host-action" (click)="pressed.set(pressed() + 1)">Добавить</button>
                </span>
            </ng-template>
            <p rtExpansionPanelBody>Тело</p>
        </rt-expansion-panel>

        <div rtExpansionPanelGroup [multi]="multi()">
            <rt-expansion-panel qa-dataid="group-a" [(expanded)]="a"><span>A</span></rt-expansion-panel>
            <section>
                <rt-expansion-panel qa-dataid="group-b" [(expanded)]="b"><span>B</span></rt-expansion-panel>
            </section>
            <rt-expansion-panel qa-dataid="group-c" [(expanded)]="c">
                <span>C</span>
                <div rtExpansionPanelBody>
                    <rt-expansion-panel qa-dataid="nested" [(expanded)]="nested">
                        <span>Вложенная</span>
                        <ng-template rtExpansionPanelActions>
                            <span><button type="button" qa-dataid="nested-action">Ещё</button></span>
                        </ng-template>
                    </rt-expansion-panel>
                </div>
            </rt-expansion-panel>
        </div>

        <rt-expansion-panel qa-dataid="wrapped" [(expanded)]="wrapped">
            <span>Обёрнутое тело</span>
            <div>
                <ng-template rtExpansionPanelContent>
                    <p qa-dataid="wrapped-body">Тело в обёртке</p>
                    <rt-expansion-panel qa-dataid="inner" [(expanded)]="inner">
                        <span>Внутренняя</span>
                        <ng-template rtExpansionPanelContent><p qa-dataid="inner-body">Своё тело</p></ng-template>
                    </rt-expansion-panel>
                </ng-template>
            </div>
        </rt-expansion-panel>

        <rt-expansion-panel qa-dataid="two-actions">
            <span>Два действия</span>
            <ng-template rtExpansionPanelActions><button type="button" qa-dataid="first-action">Первое</button></ng-template>
            <ng-template rtExpansionPanelActions><button type="button" qa-dataid="second-action">Второе</button></ng-template>
        </rt-expansion-panel>

        <form #outer="ngForm">
            <rt-expansion-panel qa-dataid="form-panel">
                <span>Адрес</span>
                <div rtExpansionPanelBody>
                    <input name="city" qa-dataid="form-city" ngModel />
                </div>
            </rt-expansion-panel>
        </form>

        <rt-expansion-panel qa-dataid="kept" preserveContent [(expanded)]="kept">
            <span>Фильтр</span>
            <ng-template rtExpansionPanelContent>
                <input qa-dataid="kept-input" />
            </ng-template>
        </rt-expansion-panel>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtExpansionPanelComponent,
        RtExpansionPanelActionsDirective,
        RtExpansionPanelContentDirective,
        RtExpansionPanelGroupDirective,
        FormsModule,
    ],
})
class AdditionsHostComponent {
    public readonly outer: Signal<NgForm> = viewChild.required<NgForm>('outer');
    public readonly actionsOpen: WritableSignal<boolean> = signal(false);
    public readonly pressed: WritableSignal<number> = signal(0);
    public readonly multi: WritableSignal<boolean> = signal(false);
    public readonly a: WritableSignal<boolean> = signal(false);
    public readonly b: WritableSignal<boolean> = signal(false);
    public readonly c: WritableSignal<boolean> = signal(false);
    public readonly nested: WritableSignal<boolean> = signal(false);
    public readonly kept: WritableSignal<boolean> = signal(false);
    public readonly wrapped: WritableSignal<boolean> = signal(false);
    public readonly inner: WritableSignal<boolean> = signal(false);
}

const STYLES: string = readFileSync(join(__dirname, 'rt-expansion-panel.component.scss'), 'utf8');

function setup(): ComponentFixture<AdditionsHostComponent> {
    return createRtFixture(AdditionsHostComponent);
}

function within(fixture: ComponentFixture<AdditionsHostComponent>, panel: string, id: string): HTMLElement | null {
    return (qa(fixture, panel)?.nativeElement as HTMLElement).querySelector(`[qa-dataid="${id}"]`);
}

function pressHeader(fixture: ComponentFixture<AdditionsHostComponent>, panel: string): void {
    (within(fixture, panel, 'expansion-panel-header') as HTMLButtonElement).click();
    fixture.detectChanges();
}

describe('RtExpansionPanelComponent — дополнения', (): void => {
    describe('действия заголовка', (): void => {
        it('SC-UKV-927 — действие стоит вне кнопки заголовка, а шеврон — после действий', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();
            const header: HTMLElement = within(fixture, 'with-actions', 'expansion-panel-header') as HTMLElement;
            const actions: HTMLElement = within(fixture, 'with-actions', 'expansion-panel-actions') as HTMLElement;

            expect(actions.querySelector('[qa-dataid="host-action"]')).not.toBeNull();
            expect(header.contains(actions)).toBe(false);
            expect(header.querySelector('button')).toBeNull();
            expect(within(fixture, 'with-actions', 'expansion-panel-chevron')).not.toBeNull();
            expect(header.querySelector('.rt-expansion-panel__chevron')).toBeNull();
        });

        it('SC-UKV-927 — нажатие на действие делает своё и не раскрывает панель', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            (qa(fixture, 'host-action')?.nativeElement as HTMLButtonElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.pressed()).toBe(1);
            expect(fixture.componentInstance.actionsOpen()).toBe(false);
        });

        it('SC-UKV-927 — заголовок и шеврон раскрывают и сворачивают панель с действиями', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'with-actions');
            expect(fixture.componentInstance.actionsOpen()).toBe(true);

            (within(fixture, 'with-actions', 'expansion-panel-chevron') as HTMLElement).click();
            fixture.detectChanges();
            expect(fixture.componentInstance.actionsOpen()).toBe(false);
        });

        it('SC-UKV-1712 — шаблон действий стоит в строке заголовка вне кнопки, нажатие не раскрывает', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();
            const head: HTMLElement = (within(fixture, 'with-actions', 'expansion-panel-header') as HTMLElement)
                .parentElement as HTMLElement;
            const order: (string | null)[] = Array.from(head.children).map((node: Element): string | null =>
                node.getAttribute('qa-dataid')
            );

            expect(order).toEqual(['expansion-panel-header', 'expansion-panel-actions', 'expansion-panel-chevron']);

            (qa(fixture, 'host-action')?.nativeElement as HTMLButtonElement).click();
            fixture.detectChanges();
            expect(fixture.componentInstance.actionsOpen()).toBe(false);
        });

        it('SC-UKV-1713 — шаблон действий вложенной панели остаётся у неё', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'group-c');
            pressHeader(fixture, 'nested');

            const nestedActions: HTMLElement = within(fixture, 'nested', 'expansion-panel-actions') as HTMLElement;
            expect(nestedActions.querySelector('[qa-dataid="nested-action"]')).not.toBeNull();
            const outerHead: HTMLElement = (within(fixture, 'group-c', 'expansion-panel-header') as HTMLElement)
                .parentElement as HTMLElement;
            expect(outerHead.querySelector(':scope > [qa-dataid="expansion-panel-actions"]')).toBeNull();
        });

        it('SC-UKV-1737 — два шаблона действий стоят оба, в порядке записи', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();
            const actions: HTMLElement = within(fixture, 'two-actions', 'expansion-panel-actions') as HTMLElement;
            const order: (string | null)[] = Array.from(actions.querySelectorAll('button')).map((node: Element): string | null =>
                node.getAttribute('qa-dataid')
            );

            expect(order).toEqual(['first-action', 'second-action']);
        });

        it('без действий шеврон остаётся внутри кнопки, как прежде', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();
            const header: HTMLElement = within(fixture, 'group-a', 'expansion-panel-header') as HTMLElement;

            expect(header.querySelector('.rt-expansion-panel__chevron')).not.toBeNull();
            expect(within(fixture, 'group-a', 'expansion-panel-actions')).toBeNull();
        });
    });

    describe('группа', (): void => {
        it('SC-UKV-928 — раскрытие панели сворачивает соседей, и вложенную в обёртку тоже', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'group-b');
            expect(fixture.componentInstance.b()).toBe(true);

            pressHeader(fixture, 'group-a');
            expect(fixture.componentInstance.a()).toBe(true);
            expect(fixture.componentInstance.b()).toBe(false);

            pressHeader(fixture, 'group-c');
            expect(fixture.componentInstance.a()).toBe(false);
            expect(fixture.componentInstance.c()).toBe(true);
        });

        it('SC-UKV-928 — раскрытие владельцем своим значением тоже сворачивает соседей', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'group-a');
            fixture.componentInstance.c.set(true);
            fixture.detectChanges();

            expect(fixture.componentInstance.a()).toBe(false);
            expect(fixture.componentInstance.c()).toBe(true);
        });

        it('SC-UKV-928 — с multi панели раскрываются независимо', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            fixture.componentInstance.multi.set(true);
            fixture.detectChanges();
            pressHeader(fixture, 'group-a');
            pressHeader(fixture, 'group-b');

            expect(fixture.componentInstance.a()).toBe(true);
            expect(fixture.componentInstance.b()).toBe(true);
        });

        it('SC-UKV-928 — панель в теле панели группы в группу не входит и родителя не сворачивает', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'group-c');
            pressHeader(fixture, 'nested');

            expect(fixture.componentInstance.c()).toBe(true);
            expect(fixture.componentInstance.nested()).toBe(true);
        });

        it('SC-UKV-927 — действия вложенной панели не достаются родителю', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'group-c');

            expect(qa(fixture, 'group-c')?.nativeElement.classList.contains('rt-expansion-panel--with-actions')).toBe(false);
            expect(qa(fixture, 'nested')?.nativeElement.classList.contains('rt-expansion-panel--with-actions')).toBe(true);
        });
    });

    describe('сохранение тела', (): void => {
        it('SC-UKV-929 — до первого раскрытия ленивого тела нет, после сворачивания оно остаётся с набранным текстом', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            expect(qa(fixture, 'kept-input')).toBeNull();

            pressHeader(fixture, 'kept');
            const input: HTMLInputElement = qa(fixture, 'kept-input')?.nativeElement as HTMLInputElement;

            input.value = 'Москва';
            pressHeader(fixture, 'kept');

            const body: HTMLElement = within(fixture, 'kept', 'expansion-panel-body') as HTMLElement;

            expect(body.classList).toContain('rt-expansion-panel__body--collapsed');
            expect(body.hasAttribute('inert')).toBe(true);
            expect(qa(fixture, 'kept-input')?.nativeElement).toBe(input);

            pressHeader(fixture, 'kept');
            expect(body.classList).not.toContain('rt-expansion-panel__body--collapsed');
            expect(body.hasAttribute('inert')).toBe(false);
            expect((qa(fixture, 'kept-input')?.nativeElement as HTMLInputElement).value).toBe('Москва');
        });

        it('SC-UKV-929 — заголовок ссылается на сохранённое тело и в свёрнутой панели', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'kept');
            pressHeader(fixture, 'kept');
            const header: HTMLElement = within(fixture, 'kept', 'expansion-panel-header') as HTMLElement;

            expect(header.getAttribute('aria-expanded')).toBe('false');
            expect(header.getAttribute('aria-controls')).toBe((within(fixture, 'kept', 'expansion-panel-body') as HTMLElement).id);
        });

        it('без preserveContent свёрнутая панель ленивое тело убирает, как прежде', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'wrapped');
            expect(qa(fixture, 'wrapped-body')).not.toBeNull();
            pressHeader(fixture, 'wrapped');

            expect(qa(fixture, 'wrapped-body')).toBeNull();
        });

        it('SC-UKV-1738 — свёрнутая панель держит узел тела в странице скрытым и inert, поле в нём — во внешней форме', async (): Promise<void> => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();
            const body: HTMLElement = within(fixture, 'form-panel', 'expansion-panel-body') as HTMLElement;

            expect(body.contains(qa(fixture, 'form-city')?.nativeElement as HTMLElement)).toBe(true);
            expect(body.classList).toContain('rt-expansion-panel__body--collapsed');
            expect(body.hasAttribute('inert')).toBe(true);
            await fixture.whenStable();
            expect(fixture.componentInstance.outer().controls['city']).toBeDefined();
        });
    });

    describe('ленивое тело в обёртке', (): void => {
        it('шаблон тела внутри обёртки владельца находится, а шаблон вложенной панели остаётся ей', (): void => {
            const fixture: ComponentFixture<AdditionsHostComponent> = setup();

            pressHeader(fixture, 'wrapped');

            expect(qa(fixture, 'wrapped-body')).not.toBeNull();
            expect(qa(fixture, 'inner-body')).toBeNull();

            pressHeader(fixture, 'inner');

            expect(qa(fixture, 'inner-body')).not.toBeNull();
            expect(qaAll(fixture, 'wrapped-body').length).toBe(1);
        });
    });

    describe('свойства тела для набора оформления', (): void => {
        it('SC-UKV-1005 — высота строки и шрифт тела берутся из свойств без своего значения, тело наследует их, как прежде', (): void => {
            expect(STYLES).toContain('line-height: var(--rt-expansion-panel-body-line-height);');
            expect(STYLES).toContain('font-size: var(--rt-expansion-panel-body-font-size);');
            expect(STYLES).not.toMatch(/--rt-expansion-panel-body-(line-height|font-size):/);
        });

        it('SC-UKV-1005 — box-sizing панели берётся из свойства, по умолчанию border-box', (): void => {
            expect(STYLES).toContain('--rt-expansion-panel-box-sizing: border-box;');
            expect(STYLES).toContain('box-sizing: var(--rt-expansion-panel-box-sizing);');
        });

        it('SC-UKV-1006 — box-sizing тела берётся из своего свойства и без него наследуется от панели', (): void => {
            expect(STYLES).toContain('box-sizing: var(--rt-expansion-panel-body-box-sizing, inherit);');
            expect(STYLES).not.toMatch(/--rt-expansion-panel-body-box-sizing:/);
        });
    });
});
