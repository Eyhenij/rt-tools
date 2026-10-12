import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtCarouselComponent } from './rt-carousel.component';
import { IRtCarousel } from './rt-carousel.model';

function setup(cards: readonly IRtCarousel.Card[] | null): ComponentFixture<RtCarouselComponent> {
    return createRtFixture(RtCarouselComponent, { cards });
}

function cardsOf(fixture: ComponentFixture<RtCarouselComponent>): HTMLElement[] {
    return qaAll(fixture, 'carousel-card').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

describe('RtCarouselComponent', (): void => {
    it('SC-UKV-825 — стопка рисует карточки входа в его порядке', (): void => {
        const fixture: ComponentFixture<RtCarouselComponent> = setup([{ label: 'Admin' }, { label: 'Editor' }, { label: 'Reader' }]);

        expect(qaAll(fixture, 'carousel-card-label').map((node: DebugElement): string => textOf(node))).toEqual([
            'Admin',
            'Editor',
            'Reader',
        ]);
    });

    it('SC-UKV-825 — пустой вход и null не рисуют ни одной карточки', (): void => {
        const empty: ComponentFixture<RtCarouselComponent> = setup([]);
        const nothing: ComponentFixture<RtCarouselComponent> = setup(null);

        // Сперва видно, что стопка на месте, и только потом — что карточек в ней нет
        expect(classesOf(empty.nativeElement as HTMLElement)).toContain('rt-carousel');
        expect(cardsOf(empty)).toHaveLength(0);
        expect(cardsOf(nothing)).toHaveLength(0);
    });

    it('SC-UKV-826 — карточка заливается своим цветом, а без цвета остаётся на фоне кита', (): void => {
        const cards: HTMLElement[] = cardsOf(
            setup([{ label: 'A', color: '#1E88E5' }, { label: 'B', color: '#fc0' }, { label: 'C' }, { label: 'D', color: 'red' }])
        );

        expect(cards.map((card: HTMLElement): string => card.style.getPropertyValue('--rt-carousel-card-fill'))).toEqual([
            '#1e88e5',
            '#ffcc00',
            '',
            '',
        ]);
    });

    it('SC-UKV-827 — тон подписи идёт модификатором карточки', (): void => {
        const cards: HTMLElement[] = cardsOf(setup([{ label: 'A', color: '#ffcc00' }, { label: 'B', color: '#1e88e5' }, { label: 'C' }]));

        expect(classesOf(cards[0])).toContain('rt-carousel__card--tone--dark');
        expect(classesOf(cards[1])).toContain('rt-carousel__card--tone--light');
        expect(classesOf(cards[2])).toContain('rt-carousel__card');
        expect(classesOf(cards[2]).filter((name: string): boolean => name.includes('--tone--'))).toEqual([]);
    });

    it('SC-UKV-828 — каждая карточка стоит в порядке Tab, и стопка объявлена списком', (): void => {
        const fixture: ComponentFixture<RtCarouselComponent> = setup([{ label: 'Admin' }, { label: 'Editor' }]);

        expect((fixture.nativeElement as HTMLElement).getAttribute('role')).toBe('list');
        expect(cardsOf(fixture).map((card: HTMLElement): string | null => card.getAttribute('tabindex'))).toEqual(['0', '0']);
        expect(cardsOf(fixture).map((card: HTMLElement): string | null => card.getAttribute('role'))).toEqual(['listitem', 'listitem']);
    });

    it('SC-UKV-846 — хост несёт число карточек, по которому стили считают ширину свёрнутой стопки', (): void => {
        const three: ComponentFixture<RtCarouselComponent> = setup([{ label: 'Admin' }, { label: 'Editor' }, { label: 'Reader' }]);
        const nothing: ComponentFixture<RtCarouselComponent> = setup(null);

        expect((three.nativeElement as HTMLElement).style.getPropertyValue('--rt-carousel-count')).toBe('3');
        expect((nothing.nativeElement as HTMLElement).style.getPropertyValue('--rt-carousel-count')).toBe('0');
    });
});
