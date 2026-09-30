import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtActionBarComponent } from '../action-bar/rt-action-bar.component';
import { RtAutocompleteComponent } from '../autocomplete/rt-autocomplete.component';
import { RtBottomSheetComponent } from '../bottom-sheet/rt-bottom-sheet.component';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtCalendarComponent } from '../calendar/rt-calendar.component';
import { RtCardComponent } from '../card/rt-card.component';
import { RtCheckboxComponent } from '../checkbox/rt-checkbox.component';
import { RtDatePickerComponent } from '../date-picker/rt-date-picker.component';
import { RtDialogComponent } from '../dialog/rt-dialog.component';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtFileCardComponent } from '../file-card/rt-file-card.component';
import { RtFileDropComponent } from '../file-drop/rt-file-drop.component';
import { RtHeaderComponent } from '../header/rt-header.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtInputNumberComponent } from '../input-number/rt-input-number.component';
import { RtInputComponent } from '../input/rt-input.component';
import { RtMarkdownTextComponent } from '../markdown-text/rt-markdown-text.component';
import { RtMenuItemComponent } from '../menu/rt-menu-item.component';
import { RtMessageComponent } from '../message/rt-message.component';
import { RtMoneyListComponent } from '../money-list/rt-money-list.component';
import { RtMultiselectComponent } from '../multiselect/rt-multiselect.component';
import { RtNoteComponent } from '../note/rt-note.component';
import { RtNotificationsBellComponent } from '../notifications-bell/rt-notifications-bell.component';
import { RtPaginationComponent } from '../pagination/rt-pagination.component';
import { RtRadioButtonComponent } from '../radio-button/rt-radio-button.component';
import { RtSectionNavComponent } from '../section-nav/rt-section-nav.component';
import { RtSelectComponent } from '../select/rt-select.component';
import { RtSkeletonComponent } from '../skeleton/rt-skeleton.component';
import { RtSplitButtonComponent } from '../split-button/rt-split-button.component';
import { RtStepperComponent } from '../stepper/rt-stepper.component';
import { RtTableComponent } from '../table/rt-table.component';
import { RtTagComponent } from '../tag/rt-tag.component';
import { RtTextareaComponent } from '../textarea/rt-textarea.component';
import { RtThreadListComponent } from '../thread-list/rt-thread-list.component';
import { RtToggleButtonGroupComponent } from '../toggle-button-group/rt-toggle-button-group.component';
import { RtToggleSwitchComponent } from '../toggle-switch/rt-toggle-switch.component';

/** Папка компонентов кита: от неё считаются пути к файлам стилей. */
const COMPONENTS_DIR: string = join(__dirname, '..');

/** Шаг, с которым рисуется каждая поверхность. */
const STEP: string = 'lg';

interface ISurface {
    /** Имя компонента в заголовке теста. */
    name: string;
    /** Файл стилей от папки компонентов. */
    styles: string;
    /** Рисует компонент с шагом и отдаёт узел, на котором должен стоять атрибут. */
    draw: () => HTMLElement;
}

@Component({
    selector: 'rt-radius-button-host',
    imports: [RtButtonDirective],
    template: '<button rtButton label="Кнопка" radius="lg"></button>',
})
class ButtonHostComponent {}

/** Компонент с шагом: обязательные входы у каждого свои. */
function drawn<T>(component: Type<T>, inputs: Readonly<Record<string, unknown>> = {}): HTMLElement {
    const fixture: ComponentFixture<T> = createRtFixture(component, { ...inputs, radius: STEP });
    return fixture.nativeElement as HTMLElement;
}

@Component({
    selector: 'rt-radius-table-host',
    imports: [
        RtTableComponent,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,
    ],
    template: `
        <table rt-table radius="lg" [dataSource]="rows" [columns]="columns">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
        </table>
    `,
})
class TableHostComponent {
    public readonly rows: readonly string[] = ['Тур'];
    public readonly columns: readonly string[] = ['title'];
}

/** Кнопка — директива на чужом теге: рисуется внутри своего хоста. */
function drawnButton(): HTMLElement {
    TestBed.configureTestingModule({ imports: [ButtonHostComponent], providers: provideRtKitTesting() });
    const fixture: ComponentFixture<ButtonHostComponent> = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLElement;
}

/** Таблице CDK без описаний строк рисовать нечего: она рисуется внутри своего хоста. */
function drawnTable(): HTMLElement {
    TestBed.configureTestingModule({ imports: [TableHostComponent], providers: provideRtKitTesting() });
    const fixture: ComponentFixture<TableHostComponent> = TestBed.createComponent(TableHostComponent);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('table') as HTMLElement;
}

const OPTIONS: readonly { label: string; value: string }[] = [
    { label: 'Один', value: 'one' },
    { label: 'Два', value: 'two' },
];

/**
 * Компоненты кита, у которых есть поверхность. Новый компонент с поверхностью встаёт сюда:
 * иначе проверка не знает, что ему положен вход.
 */
const SURFACES: readonly ISurface[] = [
    { name: 'tag', styles: 'tag/rt-tag.component.scss', draw: (): HTMLElement => drawn(RtTagComponent, { value: 'Метка' }) },
    {
        name: 'icon-button',
        styles: 'icon-button/rt-icon-button.component.scss',
        draw: (): HTMLElement => drawn(RtIconButtonComponent, { icon: 'close', ariaLabel: 'Закрыть' }),
    },
    { name: 'button', styles: 'button/rt-button.directive.scss', draw: drawnButton },
    { name: 'skeleton', styles: 'skeleton/rt-skeleton.component.scss', draw: (): HTMLElement => drawn(RtSkeletonComponent) },
    {
        name: 'split-button',
        styles: 'split-button/rt-split-button.component.scss',
        draw: (): HTMLElement => drawn(RtSplitButtonComponent, { label: 'Сохранить', menuItems: [] }),
    },
    {
        name: 'toggle-button-group',
        styles: 'toggle-button-group/rt-toggle-button-group.component.scss',
        draw: (): HTMLElement => drawn(RtToggleButtonGroupComponent, { options: OPTIONS }),
    },
    {
        name: 'toggle-switch',
        styles: 'toggle-switch/rt-toggle-switch.component.scss',
        draw: (): HTMLElement => drawn(RtToggleSwitchComponent),
    },
    { name: 'checkbox', styles: 'checkbox/rt-checkbox.component.scss', draw: (): HTMLElement => drawn(RtCheckboxComponent) },
    {
        name: 'radio-button',
        styles: 'radio-button/rt-radio-button.component.scss',
        draw: (): HTMLElement => drawn(RtRadioButtonComponent, { value: 1 }),
    },
    { name: 'input', styles: 'input/rt-input.component.scss', draw: (): HTMLElement => drawn(RtInputComponent) },
    { name: 'textarea', styles: 'textarea/rt-textarea.component.scss', draw: (): HTMLElement => drawn(RtTextareaComponent) },
    {
        name: 'input-number',
        styles: 'input-number/rt-input-number.component.scss',
        draw: (): HTMLElement => drawn(RtInputNumberComponent),
    },
    {
        name: 'select',
        styles: 'select/rt-select.component.scss',
        draw: (): HTMLElement => drawn(RtSelectComponent, { options: OPTIONS }),
    },
    {
        name: 'multiselect',
        styles: 'multiselect/rt-multiselect.component.scss',
        draw: (): HTMLElement => drawn(RtMultiselectComponent, { options: OPTIONS }),
    },
    {
        name: 'autocomplete',
        styles: 'autocomplete/rt-autocomplete.component.scss',
        draw: (): HTMLElement => drawn(RtAutocompleteComponent, { suggestions: [], displayWith: (it: unknown): string => String(it) }),
    },
    {
        name: 'date-picker',
        styles: 'date-picker/rt-date-picker.component.scss',
        draw: (): HTMLElement => drawn(RtDatePickerComponent),
    },
    {
        name: 'action-bar',
        styles: 'action-bar/rt-action-bar.component.scss',
        draw: (): HTMLElement => drawn(RtActionBarComponent, { config: { selected: 1, total: 2, actions: [] } }),
    },
    {
        name: 'bottom-sheet',
        styles: 'bottom-sheet/rt-bottom-sheet.component.scss',
        draw: (): HTMLElement => drawn(RtBottomSheetComponent, { open: true }),
    },
    {
        name: 'calendar',
        styles: 'calendar/rt-calendar.component.scss',
        draw: (): HTMLElement => drawn(RtCalendarComponent, { months: [], weekdayLabels: [] }),
    },
    { name: 'card', styles: 'card/rt-card.component.scss', draw: (): HTMLElement => drawn(RtCardComponent) },
    { name: 'dialog', styles: 'dialog/rt-dialog.component.scss', draw: (): HTMLElement => drawn(RtDialogComponent) },
    { name: 'empty-state', styles: 'empty-state/rt-empty-state.component.scss', draw: (): HTMLElement => drawn(RtEmptyStateComponent) },
    {
        name: 'file-card',
        styles: 'file-card/rt-file-card.component.scss',
        draw: (): HTMLElement => drawn(RtFileCardComponent, { name: 'Договор.pdf' }),
    },
    { name: 'file-drop', styles: 'file-drop/rt-file-drop.component.scss', draw: (): HTMLElement => drawn(RtFileDropComponent) },
    { name: 'header', styles: 'header/rt-header.component.scss', draw: (): HTMLElement => drawn(RtHeaderComponent) },
    {
        name: 'markdown-text',
        styles: 'markdown-text/rt-markdown-text.component.scss',
        draw: (): HTMLElement => drawn(RtMarkdownTextComponent, { text: 'Текст' }),
    },
    { name: 'menu-item', styles: 'menu/rt-menu-item.component.scss', draw: (): HTMLElement => drawn(RtMenuItemComponent) },
    { name: 'message', styles: 'message/rt-message.component.scss', draw: (): HTMLElement => drawn(RtMessageComponent) },
    { name: 'money-list', styles: 'money-list/rt-money-list.component.scss', draw: (): HTMLElement => drawn(RtMoneyListComponent) },
    { name: 'note', styles: 'note/rt-note.component.scss', draw: (): HTMLElement => drawn(RtNoteComponent) },
    {
        name: 'notifications-bell',
        styles: 'notifications-bell/rt-notifications-bell.component.scss',
        draw: (): HTMLElement => drawn(RtNotificationsBellComponent),
    },
    {
        name: 'pagination',
        styles: 'pagination/rt-pagination.component.scss',
        draw: (): HTMLElement => drawn(RtPaginationComponent, { pageModel: { pageNumber: 1, pageSize: 20, totalCount: 100 } }),
    },
    {
        name: 'section-nav',
        styles: 'section-nav/rt-section-nav.component.scss',
        draw: (): HTMLElement => drawn(RtSectionNavComponent, { items: [] }),
    },
    { name: 'stepper', styles: 'stepper/rt-stepper.component.scss', draw: (): HTMLElement => drawn(RtStepperComponent, { steps: [] }) },
    { name: 'thread-list', styles: 'thread-list/rt-thread-list.component.scss', draw: (): HTMLElement => drawn(RtThreadListComponent) },
    { name: 'table', styles: 'table/rt-table.component.scss', draw: drawnTable },
];

/** Все файлы стилей в папке компонентов кита, со вложенными. */
function styleFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry: string): string[] => {
        const path: string = join(dir, entry);
        if (statSync(path).isDirectory()) {
            return styleFiles(path);
        }
        return path.endsWith('.scss') ? [path] : [];
    });
}

/**
 * Значения скругления вне шкалы. Ссылки на свойства вырезаются, и от значения должны остаться
 * только нули — либо значение целиком наследуется.
 */
function offScale(css: string): string[] {
    const text: string = css.replace(/\/\*[\s\S]*?\*\//g, '');
    return [...text.matchAll(/([\w-]*radius[\w-]*)\s*:\s*([^;{}]+);/g)]
        .filter((m: RegExpMatchArray): boolean => {
            const value: string = m[2].trim();
            if (value === 'inherit') {
                return false;
            }
            return !/^[0\s]*$/.test(value.replace(/var\([^()]*\)/g, ''));
        })
        .map((m: RegExpMatchArray): string => `${m[1]}: ${m[2].trim()}`);
}

const SURFACE_ROWS: [string, ISurface][] = SURFACES.map((s: ISurface): [string, ISurface] => [s.name, s]);

describe('контракт входа radius', (): void => {
    it.each(SURFACE_ROWS)('SC-UKV-388 — %s с названным шагом несёт атрибут на хосте', (_name: string, surface: ISurface): void => {
        expect(surface.draw().getAttribute('data-rt-radius')).toBe(STEP);
    });

    it.each(SURFACE_ROWS)('SC-UKV-389 — стили %s отвечают на каждый шаг', (_name: string, surface: ISurface): void => {
        const css: string = readFileSync(join(COMPONENTS_DIR, surface.styles), 'utf8');

        expect(css).toMatch(/@include kv\.radius-steps\('--rt-[\w-]+-radius'/);
    });

    it('SC-UKV-390 — off-scale: ни одно скругление компонента не стоит литералом, кроме нуля', (): void => {
        const files: string[] = styleFiles(COMPONENTS_DIR);
        const found: string[] = files.flatMap((file: string): string[] =>
            offScale(readFileSync(file, 'utf8')).map((it: string): string => `${relative(COMPONENTS_DIR, file)} — ${it}`)
        );

        // Положительная половина: проверка вообще видит объявления скругления.
        expect(files.some((file: string): boolean => /border-radius\s*:/.test(readFileSync(file, 'utf8')))).toBe(true);
        expect(found).toEqual([]);
    });

    it('SC-UKV-390 — литерал вне шкалы проверкой замечен, ссылки и нули — нет', (): void => {
        expect(offScale('.x { border-radius: 12px; --rt-x-radius: 999px; }')).toHaveLength(2);
        expect(offScale('.x { border-radius: var(--rt-a) var(--rt-a) 0 0; border-radius: inherit; }')).toEqual([]);
    });
});
