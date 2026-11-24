import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../../testing/rt-kit-testing';
import { RtChipCarouselDirective } from './rt-chip-carousel.directive';

const CHIP_PX: number = 100;
const ROW_PX: number = 250;

/** Ряд из трёх повторов по три чипа шириной 100 в окне шириной 250. */
@Component({
    selector: 'rt-chip-carousel-host',
    template: `
        <div [rtChipCarousel]="on()" [rtChipCarouselLoop]="3" [rtChipCarouselIndex]="chosen()">
            @for (chip of chips; track $index) {
                <button type="button">{{ chip }}</button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtChipCarouselDirective],
})
class ChipCarouselHostComponent {
    public readonly chips: readonly string[] = ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'];
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
    public readonly chosen: WritableSignal<number> = signal<number>(-1);
    public readonly carousel: Signal<RtChipCarouselDirective> = viewChild.required(RtChipCarouselDirective);
}

/** Раскладки в окружении тестов нет: чипы стоят через 100, окно ряда — 250. */
function layOut(row: HTMLElement): void {
    Object.defineProperty(row, 'clientWidth', { configurable: true, value: ROW_PX });
    [...row.children].forEach((chip: Element, at: number): void => {
        Object.defineProperty(chip, 'offsetLeft', { configurable: true, value: at * CHIP_PX });
        Object.defineProperty(chip, 'offsetWidth', { configurable: true, value: CHIP_PX });
    });
}

function setup(chosen: number, on: boolean = true): { fixture: ComponentFixture<ChipCarouselHostComponent>; row: HTMLElement } {
    const fixture: ComponentFixture<ChipCarouselHostComponent> = createRtFixture(
        ChipCarouselHostComponent,
        {},
        { skipInitialDetect: true }
    );
    fixture.componentInstance.on.set(on);
    fixture.detectChanges();
    // Раскладка подставляется после первой отрисовки; выбор, заданный следом, ставит ряд по ней.
    const row: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('div') as HTMLElement;
    layOut(row);
    row.scrollLeft = 0;
    fixture.componentInstance.chosen.set(chosen);
    fixture.detectChanges();

    return { fixture, row };
}

describe('RtChipCarouselDirective', (): void => {
    it('ставит выбранный чип среднего повтора по центру ряда', (): void => {
        const { row }: { row: HTMLElement } = setup(1);

        // Чип «b» среднего повтора стоит с 400 по 500: его центр 450 в середине окна 250.
        expect(row.scrollLeft).toBe(450 - ROW_PX / 2);
    });

    it('прокрутка в крайний повтор переносится на тот же чип среднего', (): void => {
        const { row }: { row: HTMLElement } = setup(1);

        row.scrollLeft = 30;
        row.dispatchEvent(new Event('scroll'));

        expect(row.scrollLeft).toBe(330);
    });

    it('выключенная, ряд не трогает', (): void => {
        const { row }: { row: HTMLElement } = setup(1, false);

        expect(row.scrollLeft).toBe(0);
        row.scrollLeft = 30;
        row.dispatchEvent(new Event('scroll'));
        expect(row.scrollLeft).toBe(30);
    });
});
