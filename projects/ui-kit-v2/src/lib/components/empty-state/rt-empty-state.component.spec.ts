import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtEmptyStateComponent } from './rt-empty-state.component';

/** Действие и иллюстрация приходят проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-empty-state-host',
    template: `
        <rt-empty-state title="Файлов нет">
            <img rtEmptyIllustration src="empty.svg" alt="" />
            <button type="button" qa-dataid="host-action">Прикрепить</button>
        </rt-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtEmptyStateComponent],
})
class EmptyStateHostComponent {}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtEmptyStateComponent> {
    return createRtFixture(RtEmptyStateComponent, inputs);
}

describe('RtEmptyStateComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-empty-state');
    });

    it('без единого входа не рисует ни иконки, ни заголовка, ни описания', (): void => {
        const fixture: ComponentFixture<RtEmptyStateComponent> = setup();

        expect(qa(fixture, 'empty-state-icon')).toBeNull();
        expect(qa(fixture, 'empty-state-title')).toBeNull();
        expect(qa(fixture, 'empty-state-description')).toBeNull();
    });

    describe('заголовок и описание', (): void => {
        it('заголовок рисуется, когда он задан', (): void => {
            expect(textOf(qa(setup({ title: 'Файлов нет' }), 'empty-state-title'))).toBe('Файлов нет');
        });

        it('пустой заголовок не создаёт пустой строки в раскладке', (): void => {
            expect(qa(setup({ title: '' }), 'empty-state-title')).toBeNull();
        });

        it('описание рисуется отдельным абзацем', (): void => {
            const fixture: ComponentFixture<RtEmptyStateComponent> = setup({
                title: 'Файлов нет',
                description: 'Прикрепите первый документ',
            });

            expect(textOf(qa(fixture, 'empty-state-description'))).toBe('Прикрепите первый документ');
        });

        it('описание без заголовка допустимо', (): void => {
            const fixture: ComponentFixture<RtEmptyStateComponent> = setup({ description: 'Пока пусто' });

            expect(qa(fixture, 'empty-state-title')).toBeNull();
            expect(textOf(qa(fixture, 'empty-state-description'))).toBe('Пока пусто');
        });
    });

    describe('иконка', (): void => {
        it('рисуется приглушённой и крупной — это заглушка, а не аффорданс', (): void => {
            const fixture: ComponentFixture<RtEmptyStateComponent> = setup({ icon: 'folder' });

            expect(el(fixture, '[qa-dataid="empty-state-icon"] use')?.attributes['href']).toBe('#rt-icon-folder');
            expect((el(fixture, '[qa-dataid="empty-state-icon"] rt-icon')?.nativeElement as HTMLElement).style.width).toBe('32px');
        });
    });

    describe('проекция', (): void => {
        it('действие попадает в свой слот', (): void => {
            const fixture: ComponentFixture<EmptyStateHostComponent> = createRtFixture(EmptyStateHostComponent);

            expect(el(fixture, '[qa-dataid="empty-state-action"] [qa-dataid="host-action"]')).not.toBeNull();
        });

        it('иллюстрация уходит в свой слот, а не к действию', (): void => {
            const fixture: ComponentFixture<EmptyStateHostComponent> = createRtFixture(EmptyStateHostComponent);

            expect(el(fixture, '.rt-empty-state__illustration img')).not.toBeNull();
            expect(el(fixture, '[qa-dataid="empty-state-action"] img')).toBeNull();
        });

        it('слот действия существует и пустым — прятать его дело стилей', (): void => {
            expect(qa(setup(), 'empty-state-action')).not.toBeNull();
        });
    });
});
