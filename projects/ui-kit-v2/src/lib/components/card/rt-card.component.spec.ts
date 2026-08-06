import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, renderedText, textOf } from '../../../testing/rt-kit-testing';
import { RtCardComponent } from './rt-card.component';

/** Все три слота приходят проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-card-host',
    template: `
        <rt-card header="Тариф">
            <span rtCardHeader qa-dataid="host-header-slot">Активен</span>
            <p>Содержимое карточки</p>
            <button rtCardFooter type="button" qa-dataid="host-footer-slot">Продлить</button>
        </rt-card>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtCardComponent],
})
class CardHostComponent {}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCardComponent> {
    return createRtFixture(RtCardComponent, inputs);
}

describe('RtCardComponent', (): void => {
    it('рисуется отдельной статьёй, а не безымянным блоком', (): void => {
        expect((qa(setup(), 'card')?.nativeElement as HTMLElement).tagName).toBe('ARTICLE');
    });

    it('заголовок рисуется, когда задан', (): void => {
        expect(textOf(qa(setup({ header: 'Тариф' }), 'card-title'))).toBe('Тариф');
    });

    it('без заголовка пустой строки в шапке нет', (): void => {
        expect(qa(setup(), 'card-title')).toBeNull();
    });

    describe('кликабельность', (): void => {
        it('без входа карточка не интерактивна — ни роли, ни таб-порядка', (): void => {
            const card: HTMLElement = qa(setup(), 'card')?.nativeElement as HTMLElement;

            expect(card.getAttribute('role')).toBeNull();
            expect(card.getAttribute('tabindex')).toBeNull();
        });

        it('интерактивная карточка объявлена кнопкой и доступна с клавиатуры', (): void => {
            const card: HTMLElement = qa(setup({ clickable: true }), 'card')?.nativeElement as HTMLElement;

            expect(card.getAttribute('role')).toBe('button');
            expect(card.getAttribute('tabindex')).toBe('0');
            expect(classesOf(card)).toContain('rt-card--clickable');
        });

        it('клик по неинтерактивной карточке событий не поднимает', (): void => {
            // Иначе текст внутри карточки нельзя было бы выделить, не «нажав» её.
            const fixture: ComponentFixture<RtCardComponent> = setup();
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.cardClick.subscribe(clicks);

            qa(fixture, 'card')?.nativeElement.click();
            fixture.detectChanges();

            expect(clicks).not.toHaveBeenCalled();
        });

        it('клик по интерактивной карточке поднимает событие', (): void => {
            const fixture: ComponentFixture<RtCardComponent> = setup({ clickable: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.cardClick.subscribe(clicks);

            qa(fixture, 'card')?.nativeElement.click();
            fixture.detectChanges();

            expect(clicks).toHaveBeenCalledTimes(1);
        });

        it.each<string>(['Enter', ' '])('клавиша %s работает как клик', (key: string): void => {
            const fixture: ComponentFixture<RtCardComponent> = setup({ clickable: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.cardClick.subscribe(clicks);

            qa(fixture, 'card')?.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            fixture.detectChanges();

            expect(clicks).toHaveBeenCalledTimes(1);
        });

        it('подпись для скринридера задаётся входом — содержимое карточки именем не служит', (): void => {
            const card: HTMLElement = qa(setup({ clickable: true, ariaLabel: 'Открыть тариф' }), 'card')?.nativeElement as HTMLElement;

            expect(card.getAttribute('aria-label')).toBe('Открыть тариф');
        });
    });

    describe('проекция', (): void => {
        it('каждый слот попадает в свою часть карточки', (): void => {
            const fixture: ComponentFixture<CardHostComponent> = createRtFixture(CardHostComponent);

            expect(el(fixture, '.rt-card__header [qa-dataid="host-header-slot"]')).not.toBeNull();
            expect(el(fixture, '.rt-card__footer [qa-dataid="host-footer-slot"]')).not.toBeNull();
            expect(renderedText(fixture)).toContain('Содержимое карточки');
        });

        it('шапка вмещает и заголовок, и проекцию рядом с ним', (): void => {
            const fixture: ComponentFixture<CardHostComponent> = createRtFixture(CardHostComponent);

            expect(textOf(qa(fixture, 'card-title'))).toBe('Тариф');
            expect(el(fixture, '.rt-card__header [qa-dataid="host-header-slot"]')).not.toBeNull();
        });
    });
});
