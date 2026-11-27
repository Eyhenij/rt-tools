import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestRtThemeScopeDarkSetComponent } from './test-rt-theme-scope-dark-set.component';

/**
 * Показ меняет `<html>`, общий для всей витрины, и обязан отдать его обратно: соседняя история с
 * оставшимся классом тёмной темы показалась бы тёмной при любом переключателе. Кадр этого не
 * видит — он снят, пока показ открыт.
 */
describe('показ тёмного узла набора', (): void => {
    const root: HTMLElement = document.documentElement;

    function open(): ComponentFixture<TestRtThemeScopeDarkSetComponent> {
        return TestBed.createComponent(TestRtThemeScopeDarkSetComponent);
    }

    beforeEach((): void => {
        root.className = '';
        root.setAttribute('data-theme', 'light');
    });

    it('на время показа ставит класс тёмной темы и снимает метку, а уходя возвращает прежнее', (): void => {
        const fixture: ComponentFixture<TestRtThemeScopeDarkSetComponent> = open();

        expect(root.classList.contains('rt-theme-dark')).toBe(true);
        expect(root.hasAttribute('data-theme')).toBe(false);

        fixture.destroy();

        expect(root.classList.contains('rt-theme-dark')).toBe(false);
        expect(root.getAttribute('data-theme')).toBe('light');
    });

    it('метку, поставленную соседней историей до ухода, прежней не заменяет', (): void => {
        const fixture: ComponentFixture<TestRtThemeScopeDarkSetComponent> = open();
        root.setAttribute('data-theme', 'dark');

        fixture.destroy();

        expect(root.getAttribute('data-theme')).toBe('dark');
    });
});
