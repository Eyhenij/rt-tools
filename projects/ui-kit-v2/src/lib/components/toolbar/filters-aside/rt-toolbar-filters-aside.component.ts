import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { filter } from 'rxjs';

import { ERtAsideUnsavedOutcome, RT_ASIDE_DATA, RT_ASIDE_SHEET, RtAsideRef, RtAsideSheet } from '@rt-tools/ui-kit-v2/aside';
import { IRtControlChange, rtControlChangeOf } from '@rt-tools/ui-kit-v2/core';
import { RtToolbarFiltersPanelComponent } from '../filters-panel/rt-toolbar-filters-panel.component';
import { IRtToolbar } from '../rt-toolbar.model';

const BEM_BLOCK: string = 'rt-toolbar-filters-aside';

/** Поля отборов в панели: их значения сравниваются со значениями при открытии. */
const FIELDS_SELECTOR: string = '[qa-dataid="toolbar-filters-fields"] :is(input, select, textarea)';

/** Значение поля отбора: у флажка и переключателя — отметка, у остальных — текст значения. */
function fieldValue(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
    if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
        return String(field.checked);
    }

    return field.value;
}

/** Значения поля кита равны: у списков и диапазонов дат сравнивается содержимое, а не ссылка. */
function sameValue(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) {
        return true;
    }
    try {
        return JSON.stringify(left) === JSON.stringify(right);
    } catch {
        return false;
    }
}

/**
 * Панель отборов полосы `rt-toolbar` на узком экране.
 *
 * Её поднимает кнопка фильтров полосы службой боковых панелей кита, когда панель открывает сама
 * полоса (`filtersPanel="kit"`). Содержимое — `rt-toolbar-filters-panel` с отборами полосы: шапка
 * «Фильтры» со стрелкой, слот `rtToolbarFilters` с контекстом `panel`, подвал «Сбросить» и
 * «Применить». «Сбросить» сообщает о себе и оставляет панель открытой, «Применить» сообщает и
 * закрывает, стрелка закрывает молча.
 *
 * На телефоне панель — шторка, и шторка с изменённым и не применённым полем перед закрытием
 * спрашивает словами шторки: «Применить» применяет и закрывает, «Не применять» сообщает об отказе
 * и закрывает, «Отмена» оставляет шторку. Изменение — значение поля, отличное от значения при
 * открытии: введённое и возвращённое назад изменением не считается. Поле ввода браузера читается
 * по его значению; поле кита без него — выпадающий список, поле даты, флажок, переключатель —
 * сообщает правку событием `change` со значениями до и после.
 */
@Component({
    selector: 'rt-toolbar-filters-aside',
    templateUrl: './rt-toolbar-filters-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtToolbarFiltersPanelComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '(input)': 'onFieldChange($event)',
        '(change)': 'onFieldChange($event)',
    },
})
export class RtToolbarFiltersAsideComponent {
    readonly #asideRef: RtAsideRef = inject(RtAsideRef);
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly #sheet: RtAsideSheet | null = inject(RT_ASIDE_SHEET, { optional: true });

    /** Значения полей при открытии; `null` — панель сбоку и ни о чём не спрашивает. */
    #opening: readonly string[] | null = null;
    /** Поля кита, правленные с открытия: значение при открытии и нынешнее. */
    readonly #kitFields: Map<EventTarget, IRtControlChange> = new Map<EventTarget, IRtControlChange>();

    protected readonly data: IRtToolbar.IFiltersPanelData = inject(RT_ASIDE_DATA) as IRtToolbar.IFiltersPanelData;

    constructor() {
        const sheet: RtAsideSheet | null = this.#sheet;
        if (sheet?.active() !== true) {
            return;
        }
        sheet.question.set('apply');
        afterNextRender((): void => {
            this.#opening = this.#values();
        });
        const destroyRef: DestroyRef = inject(DestroyRef);
        this.#asideRef
            .saveRequests()
            .pipe(takeUntilDestroyed(destroyRef))
            .subscribe((): void => {
                this.data.apply();
                this.close();
            });
        sheet
            .answers()
            .pipe(
                filter((outcome: ERtAsideUnsavedOutcome): boolean => outcome === ERtAsideUnsavedOutcome.Discard),
                takeUntilDestroyed(destroyRef)
            )
            .subscribe((): void => this.data.discard?.());
    }

    protected close(): void {
        this.#asideRef.close();
    }

    /** Поле изменилось: признак несохранённого — есть ли поле со значением не как при открытии. */
    protected onFieldChange(event: Event): void {
        const opening: readonly string[] | null = this.#opening;
        if (opening === null) {
            return;
        }
        this.#noteKitField(event);
        const now: readonly string[] = this.#values();
        const kitChanged: boolean = Array.from(this.#kitFields.values()).some(
            (field: IRtControlChange): boolean => !sameValue(field.value, field.previous)
        );
        this.#asideRef.unsaved.set(
            kitChanged || now.length !== opening.length || now.some((value: string, at: number): boolean => value !== opening[at])
        );
    }

    /** Правка поля кита: значение при открытии — «до» его первой правки, нынешнее — «после» последней. */
    #noteKitField(event: Event): void {
        const change: IRtControlChange | null = rtControlChangeOf(event);
        if (change === null || event.target === null) {
            return;
        }
        const known: IRtControlChange | undefined = this.#kitFields.get(event.target);
        this.#kitFields.set(event.target, { value: change.value, previous: known === undefined ? change.previous : known.previous });
    }

    #values(): readonly string[] {
        return Array.from(this.#host.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(FIELDS_SELECTOR)).map(
            fieldValue
        );
    }
}
