import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtActionBar } from './rt-action-bar.model';
import { RtActionBarComponent } from './rt-action-bar.component';

function config(patch: Partial<IRtActionBar.Config> = {}): IRtActionBar.Config {
    return { selected: 3, total: 128, actions: [], ...patch };
}

function setup(value: IRtActionBar.Config = config()): ComponentFixture<RtActionBarComponent> {
    return createRtFixture(RtActionBarComponent, { config: value });
}

/** Пункты вложенного списка рисуются во всплывающем слое — он лежит в теле страницы. */
function menuItems(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="action-bar-menu-item"]'));
}

describe('RtActionBarComponent', (): void => {
    it('SC-UKV-201 — ноль выбранного показан числом, а счётчик не спрятан', (): void => {
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ selected: 0 }));

        expect(textOf(qa(fixture, 'action-bar-counter'))).toBe('Selected: 0 of 128');
    });

    it('SC-UKV-209 — счёт собирает словарь кита, а не склейка слов в шаблоне', (): void => {
        // Подпись целиком приходит из набора: в шаблоне нет ни одного её слова, и подстановки
        // делает словарь.
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ selected: 7, total: 9 }));

        expect(textOf(qa(fixture, 'action-bar-counter'))).toBe('Selected: 7 of 9');
    });

    it('SC-UKV-202 — обычное действие делает своё дело и закрывает полосу', (): void => {
        const run: jest.Mock = jest.fn();
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ actions: [{ label: 'Скачать', run }] }));
        const closed: jest.Mock = jest.fn();

        fixture.componentInstance.closed.subscribe(closed);
        qa(fixture, 'action-bar-action')?.nativeElement.click();

        expect(run).toHaveBeenCalledTimes(1);
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it('SC-UKV-205 — крестик сообщает наружу и настройку не трогает', (): void => {
        const value: IRtActionBar.Config = config();
        const fixture: ComponentFixture<RtActionBarComponent> = setup(value);
        const closed: jest.Mock = jest.fn();

        fixture.componentInstance.closed.subscribe(closed);
        qa(fixture, 'action-bar-close')?.nativeElement.querySelector('button').click();

        expect(closed).toHaveBeenCalledTimes(1);
        expect(value.selected).toBe(3);
    });

    it('SC-UKV-203 — действие с вложенным списком раскрывает его и само не срабатывает', (): void => {
        const run: jest.Mock = jest.fn();
        const fixture: ComponentFixture<RtActionBarComponent> = setup(
            config({ actions: [{ label: 'Отправить', run, menu: [{ label: 'Письмом' }, { label: 'В чат' }] }] })
        );

        qa(fixture, 'action-bar-action')?.nativeElement.click();
        fixture.detectChanges();

        expect(menuItems().length).toBe(2);
        expect(run).not.toHaveBeenCalled();
    });

    it('SC-UKV-204 — пункт вложенного списка закрывает полосу так же, как обычное действие', (): void => {
        const run: jest.Mock = jest.fn();
        const fixture: ComponentFixture<RtActionBarComponent> = setup(
            config({ actions: [{ label: 'Отправить', menu: [{ label: 'Письмом', run }] }] })
        );
        const closed: jest.Mock = jest.fn();

        fixture.componentInstance.closed.subscribe(closed);
        qa(fixture, 'action-bar-action')?.nativeElement.click();
        fixture.detectChanges();
        menuItems()[0]?.click();

        expect(run).toHaveBeenCalledTimes(1);
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it('SC-UKV-207 — действие со значком говорит о нём модификатором', (): void => {
        // Подпись снимает правило стиля по грубому указателю, и добирается оно до неё именно этим
        // модификатором: раскладки у пробы нет, а модификатор виден.
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ actions: [{ label: 'Удалить', icon: 'trash' }] }));

        expect(classesOf(qa(fixture, 'action-bar-action'))).toContain('rt-action-bar__action--with-icon');
    });

    it('SC-UKV-375 — действие со значком названо подписью и там, где подпись снята', (): void => {
        // На грубом указателе подпись снимается правилом стиля целиком, а значок немой: имя кнопке
        // даёт атрибут. Действию без значка он не нужен — его подпись видна всегда.
        const fixture: ComponentFixture<RtActionBarComponent> = setup(
            config({
                actions: [
                    { label: 'Удалить', icon: 'trash' },
                    { label: 'Архив', icon: 'trash', menu: [{ label: 'В архив' }] },
                    { label: 'Скачать' },
                ],
            })
        );

        expect(
            qaAll(fixture, 'action-bar-action').map((node: DebugElement): string | null => node.attributes['aria-label'] ?? null)
        ).toEqual(['Удалить', 'Архив', null]);
    });

    it('SC-UKV-208 — у действия без значка такого модификатора нет', (): void => {
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ actions: [{ label: 'Удалить' }] }));

        expect(classesOf(qa(fixture, 'action-bar-action'))).not.toContain('rt-action-bar__action--with-icon');
    });

    it('опасное действие красится своим модификатором', (): void => {
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ actions: [{ label: 'Удалить', look: 'danger' }] }));

        expect(classesOf(qa(fixture, 'action-bar-action'))).toContain('rt-action-bar__action--danger');
    });

    it('пустой список действий не рисует ряда вовсе', (): void => {
        const fixture: ComponentFixture<RtActionBarComponent> = setup();

        expect(qa(fixture, 'action-bar-actions')).toBeNull();
        expect(qaAll(fixture, 'action-bar-action').length).toBe(0);
    });

    it('каждое действие списка попадает в ряд отдельной кнопкой', (): void => {
        const fixture: ComponentFixture<RtActionBarComponent> = setup(config({ actions: [{ label: 'Скачать' }, { label: 'Удалить' }] }));

        expect(qaAll(fixture, 'action-bar-action').map((node: DebugElement): string => textOf(node))).toEqual(['Скачать', 'Удалить']);
    });

    it('SC-UKV-707 — имя Material у действия рисуется значком в полосе и в пункте вложенного списка', (): void => {
        // Перечень кита ведёт `delete_forever` на свой рисунок `trash-x`: стратегия по умолчанию
        // берёт пару раньше шрифта, и значок ссылается на рисунок набора.
        const fixture: ComponentFixture<RtActionBarComponent> = setup(
            config({
                actions: [
                    { label: 'Удалить', glyph: 'delete_forever' },
                    { label: 'Ещё', menu: [{ label: 'Стереть', glyph: 'delete_forever' }] },
                ],
            })
        );
        const [plain, group]: DebugElement[] = qaAll(fixture, 'action-bar-action');

        expect(plain?.nativeElement.querySelector('use')?.getAttribute('href')).toContain('trash-x');
        expect(classesOf(plain ?? null)).toContain('rt-action-bar__action--with-icon');
        expect(plain?.attributes['aria-label']).toBe('Удалить');

        group?.nativeElement.click();
        fixture.detectChanges();

        expect(menuItems()[0]?.querySelector('use')?.getAttribute('href')).toContain('trash-x');
    });

    it('SC-UKV-708 — крестик полосы берёт значок из входа, по умолчанию крестик', (): void => {
        const fixture: ComponentFixture<RtActionBarComponent> = setup();
        const closeIcon: () => unknown = (): unknown =>
            (qa(fixture, 'action-bar-close')?.componentInstance as { icon: () => unknown }).icon();

        expect(closeIcon()).toBe('close');

        fixture.componentRef.setInput('closeIcon', 'times-circle');
        fixture.detectChanges();

        expect(closeIcon()).toBe('times-circle');
    });
});
