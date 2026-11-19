import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtMarkdownTextComponent } from './rt-markdown-text.component';

/**
 * Спека проверяет, какими узлами показан текст, а не как эти узлы выглядят: вид держат снимок
 * истории и кадр экрана.
 *
 * Каждое утверждение об отсутствии узла идёт в паре с утверждением о том, что показанное место
 * найдено: тест, который ищет не то, зелен и при пустой странице.
 */

function setup(text: string | null): ComponentFixture<RtMarkdownTextComponent> {
    return createRtFixture(RtMarkdownTextComponent, { text });
}

/** Весь видимый текст показанного. */
function shownText(fixture: ComponentFixture<RtMarkdownTextComponent>): string {
    return textOf(fixture.nativeElement as HTMLElement);
}

describe('RtMarkdownTextComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup('текст'))).toContain('rt-markdown-text');
    });

    it('пустой текст не рисует ни одного блока', (): void => {
        const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('   ');

        expect(qa(fixture, 'markdown-paragraph')).toBeNull();
        expect(shownText(fixture)).toBe('');
    });

    it('отсутствие текста не рисует ни одного блока', (): void => {
        expect(shownText(setup(null))).toBe('');
    });

    describe('перечень разметки', (): void => {
        it('заголовок рисуется своим узлом и несёт уровень', (): void => {
            const heading: DebugElement | null = qa(setup('## Разбор'), 'markdown-heading');

            expect(textOf(heading)).toBe('Разбор');
            expect(heading?.attributes['aria-level']).toBe('2');
        });

        it('список рисуется пунктами', (): void => {
            const items: DebugElement[] = qaAll(setup('- первое\n- второе'), 'markdown-item');

            expect(items.map((item: DebugElement): string => textOf(item))).toEqual(['первое', 'второе']);
        });

        it('простой список рисуется маркированным узлом, нумерованный — нумерованным', (): void => {
            expect(qa(setup('- первое'), 'markdown-list')?.name).toBe('ul');
            expect(qa(setup('1. первое'), 'markdown-list')?.name).toBe('ol');
        });

        it('уровень заголовка и вложенность пункта видны модификатором со значением', (): void => {
            expect(classesOf(qa(setup('### Третий'), 'markdown-heading'))).toContain('rt-markdown-text__heading--level--3');
            expect(classesOf(qaAll(setup('- первое\n  - вложенное'), 'markdown-item')[1])).toContain('rt-markdown-text__item--level--1');
        });

        it('таблица рисуется шапкой и ячейками', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('| Что | Где |\n| --- | --- |\n| груз | приём |');

            expect(qaAll(fixture, 'markdown-head-cell').map((cell: DebugElement): string => textOf(cell))).toEqual(['Что', 'Где']);
            expect(qaAll(fixture, 'markdown-cell').map((cell: DebugElement): string => textOf(cell))).toEqual(['груз', 'приём']);
        });

        it('блок кода рисуется своим узлом и несёт содержимое как есть', (): void => {
            expect(textOf(qa(setup('```bash\nnpm run check:all\n```'), 'markdown-code'))).toBe('npm run check:all');
        });

        it('цитата рисуется своим узлом', (): void => {
            expect(textOf(qa(setup('> слово владельца'), 'markdown-quote'))).toBe('слово владельца');
        });

        it('жирный, курсив и зачёркнутый рисуются своими узлами', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('**жирно** *косо* ~~вон~~');

            expect(textOf(el(fixture, 'strong'))).toBe('жирно');
            expect(textOf(el(fixture, 'em'))).toBe('косо');
            expect(textOf(el(fixture, 's'))).toBe('вон');
        });

        it('ссылка ведёт наружу и открывается отдельной вкладкой', (): void => {
            const link: DebugElement | null = qa(setup('[разбор](https://example.test/one)'), 'markdown-link');

            expect(link?.attributes['href']).toBe('https://example.test/one');
            expect(link?.attributes['target']).toBe('_blank');
            expect(link?.attributes['rel']).toBe('noopener noreferrer');
        });
    });

    describe('то, чего в перечне нет', (): void => {
        it('строка скрипта показана текстом, и узла скрипта на странице нет', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('<script>window.ran = true;</script>');

            expect(textOf(qa(fixture, 'markdown-paragraph'))).toBe('<script>window.ran = true;</script>');
            expect(el(fixture, 'script')).toBeNull();
        });

        it('парный тег показан текстом, и узла начертания на странице нет', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('<b>жирным не становится</b>');

            expect(textOf(qa(fixture, 'markdown-paragraph'))).toBe('<b>жирным не становится</b>');
            expect(el(fixture, 'b')).toBeNull();
        });

        it('картинка показана текстом, и узла картинки на странице нет', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('![вид](https://example.test/one.png)');

            expect(textOf(qa(fixture, 'markdown-paragraph'))).toBe('![вид](https://example.test/one.png)');
            expect(el(fixture, 'img')).toBeNull();
        });

        it('ссылка чужой схемы показана текстом, и узла ссылки на странице нет', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('[нажми](javascript:alert)');

            expect(textOf(qa(fixture, 'markdown-paragraph'))).toBe('[нажми](javascript:alert)');
            expect(qa(fixture, 'markdown-link')).toBeNull();
        });
    });

    describe('строки', (): void => {
        it('одиночный перенос строки рисуется переносом', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup('первая\nвторая');
            const paragraph: HTMLElement = qa(fixture, 'markdown-paragraph')?.nativeElement as HTMLElement;

            expect(paragraph.querySelectorAll('br').length).toBe(1);
        });

        it('пустая строка делит текст на два абзаца', (): void => {
            expect(qaAll(setup('первый\n\nвторой'), 'markdown-paragraph').length).toBe(2);
        });
    });
    describe('таблица в виде блока таблицы ответа', (): void => {
        const TABLE: string = '| Объект | Сумма | Знак |\n| :-- | --: | :-: |\n| Вилла | -10 | + |\n| Дом |';

        it('SC-UKV-1416 — столбцы выровнены по строке-разделителю', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup(TABLE);
            const head: DebugElement[] = qaAll(fixture, 'markdown-head-cell');

            expect(
                head.map((cell: DebugElement): string[] => classesOf(cell).filter((name: string): boolean => name.includes('--')))
            ).toEqual([[], ['rt-markdown-text__head-cell--end'], ['rt-markdown-text__head-cell--center']]);
            expect(classesOf(qaAll(fixture, 'markdown-cell')[1])).toContain('rt-markdown-text__cell--end');
        });

        it('SC-UKV-1417 — число не форматируется и не красится, «Copy CSV» нет; шапка и окно прокрутки читаются', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup(TABLE);
            const scroll: HTMLElement = qa(fixture, 'markdown-table-scroll')?.nativeElement as HTMLElement;

            expect(textOf(qaAll(fixture, 'markdown-cell')[1])).toBe('-10');
            expect(classesOf(qaAll(fixture, 'markdown-cell')[1]).some((name: string): boolean => name.includes('negative'))).toBe(false);
            expect(qa(fixture, 'ai-chat-table-copy')).toBeNull();
            expect(qaAll(fixture, 'markdown-head-cell').every((cell: DebugElement): boolean => cell.attributes['scope'] === 'col')).toBe(
                true
            );
            expect(scroll.getAttribute('tabindex')).toBe('0');
            expect(scroll.getAttribute('aria-label')).toBe('Table');
        });

        it('SC-UKV-1418 — строка короче шапки добирается пустыми ячейками', (): void => {
            const fixture: ComponentFixture<RtMarkdownTextComponent> = setup(TABLE);

            expect(qaAll(fixture, 'markdown-cell').map((cell: DebugElement): string => textOf(cell))).toEqual([
                'Вилла',
                '-10',
                '+',
                'Дом',
                '',
                '',
            ]);
        });
    });
});
