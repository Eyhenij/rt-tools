import { join } from 'node:path';

import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import * as sass from 'sass';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';
import { RtSheetFooterDirective } from './rt-sheet-footer.directive';

/** Шторка с местами подвала: каждый узел включается своим переключателем. */
@Component({
    selector: 'rt-bottom-sheet-footer-action-host',
    template: `
        <rt-bottom-sheet [open]="true">
            <h2 sheetHeader>Период</h2>
            @if (icons()) {
                <button sheetAction type="button" qa-dataid="icon-reset">Сбросить</button>
            }
            @if (icons()) {
                <button sheetAction type="button" qa-dataid="icon-copy">Дублировать</button>
            }
            <p>Содержимое листа</p>
            @if (info()) {
                <span sheetInfo qa-dataid="info-line">7 дней</span>
            }
            @if (slot()) {
                <button sheetFooter type="button" qa-dataid="slot-footer">Из слота</button>
            }
            @if (primary()) {
                <button sheetPrimary type="button" qa-dataid="primary-apply">Применить</button>
            }
            @if (ownFooter()) {
                <ng-template rtSheetFooter>
                    <button type="button" qa-dataid="own-footer">Свой подвал</button>
                </ng-template>
            }
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetFooterDirective],
})
class BottomSheetFooterActionHostComponent {
    public readonly icons: WritableSignal<boolean> = signal<boolean>(false);
    public readonly info: WritableSignal<boolean> = signal<boolean>(false);
    public readonly slot: WritableSignal<boolean> = signal<boolean>(false);
    public readonly primary: WritableSignal<boolean> = signal<boolean>(false);
    public readonly ownFooter: WritableSignal<boolean> = signal<boolean>(false);
}

type TFixture = ComponentFixture<BottomSheetFooterActionHostComponent>;

interface IParts {
    icons?: boolean;
    info?: boolean;
    slot?: boolean;
    primary?: boolean;
    ownFooter?: boolean;
}

function setup(parts: IParts): TFixture {
    const fixture: TFixture = createRtFixture(BottomSheetFooterActionHostComponent, {}, { skipInitialDetect: true });
    const host: BottomSheetFooterActionHostComponent = fixture.componentInstance;
    host.icons.set(parts.icons ?? false);
    host.info.set(parts.info ?? false);
    host.slot.set(parts.slot ?? false);
    host.primary.set(parts.primary ?? false);
    host.ownFooter.set(parts.ownFooter ?? false);
    fixture.detectChanges();

    return fixture;
}

function el(fixture: TFixture, id: string): HTMLElement {
    return qa(fixture, id)?.nativeElement as HTMLElement;
}

const PLACES: readonly string[] = ['bottom-sheet-info', 'bottom-sheet-primary'];

/**
 * Узлы подвала по порядку: места справки и главной кнопки — когда в них есть элемент, остальные
 * узлы — всегда. Комментарий-якорь блока `@if` хозяина в месте остаётся и без узла: правило `:empty`
 * его не считает, и здесь он не считается тоже.
 */
function filledParts(fixture: TFixture): string[] {
    return Array.from(el(fixture, 'bottom-sheet-footer').children)
        .filter((node: Element): boolean => !PLACES.includes(node.getAttribute('qa-dataid') ?? '') || node.children.length > 0)
        .map((node: Element): string => node.getAttribute('qa-dataid') ?? '');
}

/** В месте нет ни элемента, ни текста: правило `:empty` его прячет. */
function blank(node: HTMLElement): boolean {
    return Array.from(node.childNodes).every((child: ChildNode): boolean => child.nodeType === Node.COMMENT_NODE);
}

/**
 * Раскладка подвала живёт в стилях: jsdom не раскладывает страницу, и ширину, порядок и прятание
 * видно только по правилам. Правила собираются из исходников, как их собирает сборка кита.
 */
const css: string = sass.compile(join(__dirname, 'rt-bottom-sheet.component.scss')).css;

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }
    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

describe('RtBottomSheetComponent — места подвала и кнопки шапки', (): void => {
    it('SC-UKV-1923 — главное действие стоит в подвале своей строкой на всю ширину', (): void => {
        const fixture: TFixture = setup({ primary: true });

        const place: HTMLElement = el(fixture, 'bottom-sheet-primary');

        expect(place.contains(el(fixture, 'primary-apply'))).toBe(true);
        expect(el(fixture, 'bottom-sheet-footer').contains(place)).toBe(true);
        expect(ruleBody('.rt-bottom-sheet__primary')).toContain('flex: 1 1 100%');
        expect(ruleBody('.rt-bottom-sheet__primary > *')).toContain('flex: 1 1 auto');
    });

    it('SC-UKV-1923 — главное действие стоит последним: после узлов подвала и после узлов асайда', (): void => {
        const fixture: TFixture = setup({ primary: true, slot: true });

        // Асайд кладёт свой подвал узлом в конец подвала шторки: место кнопки держит её ниже порядком.
        const asideFooter: HTMLElement = document.createElement('div');
        el(fixture, 'bottom-sheet-footer').appendChild(asideFooter);

        expect(filledParts(fixture)).toEqual(['slot-footer', 'bottom-sheet-primary', '']);
        expect(ruleBody('.rt-bottom-sheet__primary')).toContain('order: 1');
    });

    it('SC-UKV-1924 — справка стоит над главным действием, по центру и приглушённо', (): void => {
        const fixture: TFixture = setup({ info: true, primary: true });

        expect(textOf(qa(fixture, 'bottom-sheet-info'))).toBe('7 дней');
        expect(filledParts(fixture)).toEqual(['bottom-sheet-info', 'bottom-sheet-primary']);

        const body: string = ruleBody('.rt-bottom-sheet__info');

        expect(body).toContain('flex: 1 1 100%');
        expect(body).toContain('text-align: center');
        expect(body).toContain('color: var(--rt-color-text-muted)');
    });

    it('SC-UKV-1925 — справка и главное действие стоят и рядом со своим шаблоном подвала', (): void => {
        const fixture: TFixture = setup({ info: true, primary: true, ownFooter: true });

        const footer: HTMLElement = el(fixture, 'bottom-sheet-footer');

        expect(footer.contains(el(fixture, 'own-footer'))).toBe(true);
        expect(footer.contains(el(fixture, 'info-line'))).toBe(true);
        expect(footer.contains(el(fixture, 'primary-apply'))).toBe(true);
    });

    it('SC-UKV-1925 — пустые места подвала пусты, и подвал без узлов места не занимает', (): void => {
        const fixture: TFixture = setup({});

        expect(blank(el(fixture, 'bottom-sheet-info'))).toBe(true);
        expect(blank(el(fixture, 'bottom-sheet-primary'))).toBe(true);
        expect(css).toMatch(/\.rt-bottom-sheet__info:empty,\s*\.rt-bottom-sheet__primary:empty\s*\{\s*display: none/);
        expect(css).toContain(':not(:has(> :not(.rt-bottom-sheet__info:empty, .rt-bottom-sheet__primary:empty)))');
    });

    it('SC-UKV-1926 — справа в шапке стоят несколько кнопок-значков с зазором 8', (): void => {
        const fixture: TFixture = setup({ icons: true });

        const action: HTMLElement = el(fixture, 'bottom-sheet-action');

        expect(action.contains(el(fixture, 'icon-reset'))).toBe(true);
        expect(action.contains(el(fixture, 'icon-copy'))).toBe(true);
        expect(ruleBody('.rt-bottom-sheet__action')).toContain('gap: var(--rt-space-2)');
    });
});
