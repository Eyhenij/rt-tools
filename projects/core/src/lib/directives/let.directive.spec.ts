import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtLetDirective } from './let.directive';

/**
 * Хост нужен потому, что структурная директива без разметки не поднимается вовсе: ей нужен
 * шаблон, который она нарисует, и контейнер, куда его положить.
 *
 * Значение держит сигнал, а не обычное поле: среда прогона обходится без Zone.js, и присваивание
 * обычному полю привязку грязной не помечает — вход директивы остаётся прежним.
 *
 * Поле ввода внутри содержимого стоит там ради сценария SC-CR-02: набранный в нём текст и есть то
 * состояние, которое теряет пересозданное представление.
 */
@Component({
    standalone: true,
    imports: [RtLetDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container *rtLet="value() as implicitName; let named = rtLet">
            <span class="implicit">{{ implicitName }}</span>
            <span class="named">{{ named }}</span>
            <input class="typed" />
        </ng-container>
    `,
})
class TestLetHostComponent {
    public readonly value: WritableSignal<string | null> = signal<string | null>('первое');
}

function setup(): ComponentFixture<TestLetHostComponent> {
    TestBed.configureTestingModule({ imports: [TestLetHostComponent] });

    const fixture: ComponentFixture<TestLetHostComponent> = TestBed.createComponent(TestLetHostComponent);
    fixture.detectChanges();

    return fixture;
}

function textOf(fixture: ComponentFixture<TestLetHostComponent>, selector: string): string {
    return (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent?.trim() ?? '';
}

describe('RtLetDirective — SC-CR-01, SC-CR-02, SC-CR-03, SC-CR-04', () => {
    describe('SC-CR-01 — пустое значение содержимого не прячет', () => {
        it('рисует содержимое и при пустоте', () => {
            const fixture: ComponentFixture<TestLetHostComponent> = setup();

            fixture.componentInstance.value.set(null);
            fixture.detectChanges();

            expect((fixture.nativeElement as HTMLElement).querySelector('.implicit')).not.toBeNull();
            expect(textOf(fixture, '.implicit')).toBe('');
        });
    });

    describe('SC-CR-02 — смена значения не пересоздаёт содержимое', () => {
        it('оставляет набранный текст на месте', () => {
            const fixture: ComponentFixture<TestLetHostComponent> = setup();
            const typed: HTMLInputElement = (fixture.nativeElement as HTMLElement).querySelector('.typed') as HTMLInputElement;

            typed.value = 'набрано рукой';

            fixture.componentInstance.value.set('второе');
            fixture.detectChanges();

            const after: HTMLInputElement = (fixture.nativeElement as HTMLElement).querySelector('.typed') as HTMLInputElement;

            expect(after).toBe(typed);
            expect(after.value).toBe('набрано рукой');
        });
    });

    describe('SC-CR-03 — значение читается двумя именами', () => {
        it('отдаёт одно значение умолчанием и именем директивы', () => {
            const fixture: ComponentFixture<TestLetHostComponent> = setup();

            expect(textOf(fixture, '.implicit')).toBe('первое');
            expect(textOf(fixture, '.named')).toBe('первое');
        });
    });

    describe('SC-CR-04 — смена значения перерисовывает содержимое по требованию', () => {
        it('показывает новое значение обоими именами', () => {
            const fixture: ComponentFixture<TestLetHostComponent> = setup();

            fixture.componentInstance.value.set('второе');
            fixture.detectChanges();

            expect(textOf(fixture, '.implicit')).toBe('второе');
            expect(textOf(fixture, '.named')).toBe('второе');
        });
    });
});
