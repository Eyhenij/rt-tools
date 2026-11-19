import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

/** Две вкладки: вторая пуста, когда хозяин так сказал; заголовок и пояснение — его сигналами. */
@Component({
    selector: 'rt-tabs-empty-host',
    template: `
        <rt-tabs [activeId]="active()" [animationDuration]="0">
            <ng-template rtTab="list" label="Список"><p qa-dataid="list-body">Запись</p></ng-template>
            <ng-template
                rtTab="events"
                label="События"
                [empty]="empty()"
                [emptyTitle]="emptyTitle()"
                [emptyDescription]="emptyDescription()"
                [emptyTemplate]="ownTemplate() ? own : null">
                <p qa-dataid="events-body">Событие</p>
            </ng-template>
            <ng-template #own><p qa-dataid="own-empty">Событий нет</p></ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsEmptyHostComponent {
    public readonly active: WritableSignal<IRtTabs.Id> = signal<IRtTabs.Id>('events');
    public readonly empty: WritableSignal<boolean> = signal<boolean>(true);
    public readonly emptyTitle: WritableSignal<string | null> = signal<string | null>(null);
    public readonly emptyDescription: WritableSignal<string | null> = signal<string | null>(null);
    public readonly ownTemplate: WritableSignal<boolean> = signal<boolean>(false);
}

type THostFixture = ComponentFixture<TabsEmptyHostComponent>;

function setup(patch: (host: TabsEmptyHostComponent) => void = (): void => undefined): THostFixture {
    const fixture: THostFixture = createRtFixture(TabsEmptyHostComponent, {}, { skipInitialDetect: true });
    patch(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

describe('RtTabsComponent — пустая вкладка', (): void => {
    it('SC-UKV-1387 — пустая вкладка показывает заглушку вместо тела, полоса вкладок на месте', (): void => {
        const fixture: THostFixture = setup();

        expect(qaAll(fixture, 'tabs-tab')).toHaveLength(2);
        expect(qa(fixture, 'events-body')).toBeNull();
        expect(qa(fixture, 'empty-state-icon')).not.toBeNull();
        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('No data');
        expect(
            (qa(fixture, 'tabs-panel')?.nativeElement as HTMLElement).contains(qa(fixture, 'tabs-empty')?.nativeElement as HTMLElement)
        ).toBe(true);
    });

    it('SC-UKV-1387 — соседняя непустая вкладка рисует своё тело', (): void => {
        const fixture: THostFixture = setup((host: TabsEmptyHostComponent): void => host.active.set('list'));

        expect(qa(fixture, 'list-body')).not.toBeNull();
        expect(qa(fixture, 'tabs-empty')).toBeNull();
    });

    it('SC-UKV-1387 — вкладка без пустоты рисует своё тело', (): void => {
        const fixture: THostFixture = setup((host: TabsEmptyHostComponent): void => host.empty.set(false));

        expect(qa(fixture, 'events-body')).not.toBeNull();
        expect(qa(fixture, 'tabs-empty')).toBeNull();
    });

    it('SC-UKV-1388 — входы вкладки меняют заголовок и пояснение заглушки', (): void => {
        const fixture: THostFixture = setup((host: TabsEmptyHostComponent): void => {
            host.emptyTitle.set('Событий пока нет');
            host.emptyDescription.set('Они появятся после первой брони');
        });

        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Событий пока нет');
        expect(textOf(qa(fixture, 'empty-state-description'))).toBe('Они появятся после первой брони');
    });

    it('SC-UKV-1388 — заголовок из одних пробелов оставляет подпись кита', (): void => {
        const fixture: THostFixture = setup((host: TabsEmptyHostComponent): void => host.emptyTitle.set('   '));

        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('No data');
    });

    it('SC-UKV-1389 — свой шаблон вкладки заменяет её заглушку целиком', (): void => {
        const fixture: THostFixture = setup((host: TabsEmptyHostComponent): void => host.ownTemplate.set(true));

        expect(textOf(qa(fixture, 'own-empty'))).toBe('Событий нет');
        expect(qa(fixture, 'empty-state-title')).toBeNull();
        expect(qa(fixture, 'events-body')).toBeNull();
        expect(qa(fixture, 'tabs-empty')).not.toBeNull();
    });
});
