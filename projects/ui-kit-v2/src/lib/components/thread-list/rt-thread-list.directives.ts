import { Directive, inject, input, InputSignal, TemplateRef } from '@angular/core';

import { IRtThreadList } from './rt-thread-list.model';

/**
 * Помечает `<ng-template>` содержимого строки списка. Входом `[rtThreadListRow]`
 * потребитель передаёт свой массив строк — из него выводится тип `TRow`, поэтому
 * `let-row` в темплейте типизируется строго (context-guard ниже это подтверждает).
 */
@Directive({
    selector: 'ng-template[rtThreadListRow]',
})
export class RtThreadListRowDirective<TRow extends IRtThreadList.Row> {
    public readonly templateRef: TemplateRef<IRtThreadList.RowContext<TRow>> =
        inject<TemplateRef<IRtThreadList.RowContext<TRow>>>(TemplateRef);

    public readonly rows: InputSignal<readonly TRow[]> = input<readonly TRow[]>([], {
        alias: 'rtThreadListRow',
    });

    public static ngTemplateContextGuard<TRow extends IRtThreadList.Row>(
        _directive: RtThreadListRowDirective<TRow>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtThreadList.RowContext<TRow> {
        return true;
    }
}

/**
 * Помечает `<ng-template>` действий строки (удалить, закрепить). Действия рисуются рядом с
 * кнопкой строки, а не внутри неё: вложенная кнопка в `<button>` недопустима и крадёт клик
 * выбора строки. Видны при наведении и фокусе внутри строки.
 */
@Directive({
    selector: 'ng-template[rtThreadListRowActions]',
})
export class RtThreadListRowActionsDirective<TRow extends IRtThreadList.Row> {
    public readonly templateRef: TemplateRef<IRtThreadList.RowContext<TRow>> =
        inject<TemplateRef<IRtThreadList.RowContext<TRow>>>(TemplateRef);

    public readonly rows: InputSignal<readonly TRow[]> = input<readonly TRow[]>([], {
        alias: 'rtThreadListRowActions',
    });

    public static ngTemplateContextGuard<TRow extends IRtThreadList.Row>(
        _directive: RtThreadListRowActionsDirective<TRow>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtThreadList.RowContext<TRow> {
        return true;
    }
}

/**
 * Помечает `<ng-template>` с фильтрами — его содержимое рендерится в поповере,
 * который открывает иконка-фильтр в шапке списка.
 */
@Directive({
    selector: 'ng-template[rtThreadListFilters]',
})
export class RtThreadListFiltersDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Помечает `<ng-template>` с кастомным контролом поиска. Когда потребитель его
 * проецирует, шапка списка рендерит его содержимое вместо встроенного `rt-input`
 * — так воркспейс подставляет свой автокомплит по каталогу вместо текстового
 * поиска, не ломая generic-природу списка.
 */
@Directive({
    selector: 'ng-template[rtThreadListSearch]',
})
export class RtThreadListSearchDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Помечает `<ng-template>` своего вида пустого списка; заменяет заглушку кита целиком. */
@Directive({
    selector: 'ng-template[rtThreadListEmpty]',
})
export class RtThreadListEmptyDirective {
    public readonly templateRef: TemplateRef<IRtThreadList.EmptyContext> = inject<TemplateRef<IRtThreadList.EmptyContext>>(TemplateRef);

    public static ngTemplateContextGuard(
        _directive: RtThreadListEmptyDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате
        context: unknown
    ): context is IRtThreadList.EmptyContext {
        return true;
    }
}

/** Помечает `<ng-template>` своего вида ошибки загрузки; в контексте текст ошибки и `retry()`. */
@Directive({
    selector: 'ng-template[rtThreadListError]',
})
export class RtThreadListErrorDirective {
    public readonly templateRef: TemplateRef<IRtThreadList.ErrorContext> = inject<TemplateRef<IRtThreadList.ErrorContext>>(TemplateRef);

    public static ngTemplateContextGuard(
        _directive: RtThreadListErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате
        context: unknown
    ): context is IRtThreadList.ErrorContext {
        return true;
    }
}

@Directive({
    selector: 'ng-template[rtThreadListTabs]',
})
export class RtThreadListTabsDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
