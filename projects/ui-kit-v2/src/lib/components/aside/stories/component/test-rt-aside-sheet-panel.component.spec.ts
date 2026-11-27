import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll, textOf } from '../../../../../testing/rt-kit-testing';
import { RT_ASIDE_DATA } from '../../rt-aside.tokens';
import { TAsideSheetPanel, TestRtAsideSheetPanelComponent } from './test-rt-aside-sheet-panel.component';

/** Панель кадра, какой её отдаёт служба кита: вид кадра приходит данными открытия. */
function panel(kind: TAsideSheetPanel): ComponentFixture<TestRtAsideSheetPanelComponent> {
    return createRtFixture(TestRtAsideSheetPanelComponent, {}, { providers: [{ provide: RT_ASIDE_DATA, useValue: kind }] });
}

/** Подписи вкладок ряда и подпись выбранной. */
function tabs(fixture: ComponentFixture<TestRtAsideSheetPanelComponent>): { labels: string[]; selected: string } {
    const all: HTMLElement[] = qaAll(fixture, 'tabs-tab').map((tab: { nativeElement: HTMLElement }): HTMLElement => tab.nativeElement);

    return {
        labels: all.map((tab: HTMLElement): string => textOf(tab)),
        selected: textOf(all.find((tab: HTMLElement): boolean => tab.getAttribute('aria-selected') === 'true') ?? null),
    };
}

describe('Панель витрины асайда-шторки', (): void => {
    it('SC-UKV-1811 — запись брони: заголовок и надзаголовок шапки, два бэйджа, значок меню и две кнопки подвала', (): void => {
        const fixture: ComponentFixture<TestRtAsideSheetPanelComponent> = panel('record');

        expect(textOf(qa(fixture, 'aside-title'))).toBe('Анна Смирнова');
        expect(textOf(qa(fixture, 'aside-overline'))).toBe('Бронь №1042');
        expect(fixture.nativeElement.querySelectorAll('.rt-aside-header__badges rt-tag').length).toBe(2);
        expect(qa(fixture, 'story-record-menu')).not.toBeNull();
        expect(qa(fixture, 'story-record-close')?.nativeElement.closest('[asideDismiss]')).not.toBeNull();
        expect(qa(fixture, 'story-record-save')?.nativeElement.closest('[asidePrimary]')).not.toBeNull();
    });

    it('SC-UKV-1863 — панель приложения: опасная «Удалить» в слоте выхода красная, «Сохранить» в главном слоте', (): void => {
        const fixture: ComponentFixture<TestRtAsideSheetPanelComponent> = panel('app');

        expect(textOf(qa(fixture, 'aside-title'))).toBe('Новый тур');
        expect(classesOf(qa(fixture, 'story-app-delete'))).toContain('rt-button--danger');
        expect(qa(fixture, 'story-app-save')?.nativeElement.closest('[asidePrimary]')).not.toBeNull();
        expect(fixture.nativeElement.querySelectorAll('rt-field').length).toBe(3);
    });

    it('SC-UKV-1832 — запись во вкладках: четыре вкладки, выбрана «Бронирования»', (): void => {
        const fixture: ComponentFixture<TestRtAsideSheetPanelComponent> = panel('tabs');

        expect(tabs(fixture)).toEqual({ labels: ['Общее', 'Бронирования', 'Документы', 'Архив'], selected: 'Бронирования' });
        expect(classesOf(qa(fixture, 'aside'))).toContain('rt-aside--content--tabs');
    });

    it('SC-UKV-1832 — длинный ряд: семь вкладок, выбрана «Оплаты» в середине ряда', (): void => {
        const fixture: ComponentFixture<TestRtAsideSheetPanelComponent> = panel('long-tabs');

        expect(tabs(fixture).labels).toHaveLength(7);
        expect(tabs(fixture).selected).toBe('Оплаты');
        expect(qa(fixture, 'story-long-tabs-save')).not.toBeNull();
    });

    it('SC-UKV-1837 — подвал: «Удалить» в слоте выхода и две кнопки главного слота, «Сохранить» последней', (): void => {
        const fixture: ComponentFixture<TestRtAsideSheetPanelComponent> = panel('footer');
        const primaries: string[] = Array.from(fixture.nativeElement.querySelectorAll('[asidePrimary]')).map(
            (node: unknown): string => (node as HTMLElement).getAttribute('qa-dataid') ?? ''
        );

        expect(qa(fixture, 'story-footer-delete')?.nativeElement.closest('[asideDismiss]')).not.toBeNull();
        expect(primaries).toEqual(['story-footer-copy', 'story-footer-save']);
    });
});
