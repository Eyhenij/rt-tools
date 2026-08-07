import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../../i18n';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtSkeletonWrapperComponent } from '../../skeleton-wrapper/rt-skeleton-wrapper.component';
import { RtTagComponent } from '../../tag/rt-tag.component';
import { RtAsideRef } from '../rt-aside-ref';
import { IRtAsideHeader } from './rt-aside-header.model';

const BEM_BLOCK: string = 'rt-aside-header';

/**
 * Заголовок side-sheet'а; работает в двух modes:
 *
 * 1. **Programmatic** (через `RtAsideService.open()`) — `RtAsideRef` провайдится
 *    оверлей-инжектором; стрелка «назад» дёргает `asideRef.close()` напрямую,
 *    consumer подписан на `afterClosed()`.
 * 2. **Route-driven** (через `[rtContainerRightSidenavPanel]` driver в
 *    rt-container'е) — `RtAsideRef` НЕ провайдится (overlay принадлежит
 *    rt-container'у, не RtAsideService). Consumer слушает `(dismiss)` output и
 *    сам зовёт `panel.close()`.
 *
 * Оба пути живут одновременно: `onDismiss()` сперва эмитит output, затем (если
 * есть) дёргает optional `asideRef.close()`.
 *
 * Доменные действия (отклонить / удалить / снять с публикации и т.п.)
 * проецируются в слот `[asideActions]` как ряд `rt-icon-button` справа от title.
 *
 * `ViewEncapsulation.None` — для единообразия с rt-dialog-header (стили
 * префиксованы `.rt-aside-header`).
 *
 * @example
 * ```html
 * <rt-aside-header title="Профиль пользователя" />
 * <rt-aside-header title="Создание записи" [closable]="false" />
 * <rt-aside-header title="Детали" (dismiss)="onClose()">
 *     <rt-icon-button asideActions icon="ico-error" variant="danger"
 *                     ariaLabel="Отклонить" (clicked)="reject()" />
 * </rt-aside-header>
 * ```
 */
@Component({
    selector: 'rt-aside-header',
    templateUrl: './rt-aside-header.component.html',
    styleUrl: './rt-aside-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        RtSkeletonWrapperComponent,
        RtTagComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideHeaderComponent {
    readonly #asideRef: RtAsideRef | null = inject(RtAsideRef, { optional: true });

    /** Текст заголовка — рендерится в `<h2>`. Null/пустая строка вместе с
     *  `[loading]=true` показывают skeleton вместо title. */
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    public readonly title: InputSignal<string | null> = input<string | null>(null);

    /**
     * Мелкий приглушённый надзаголовок НАД основным title (контекст действия:
     * «Создание записи», «Запись № 6»). Null (дефолт) — обычный
     * однострочный хедер. Overline не участвует в skeleton-режиме — это
     * статичный текст, известный до загрузки данных.
     */
    public readonly overline: InputSignal<string | null> = input<string | null>(null);

    /**
     * Ряд бэйджей (`rt-tag`) под заголовком — контекст сущности (статус, метка
     * записи и т.п.). Пустой массив (дефолт) — ряд не рендерится. Async-данные:
     * потребитель отдаёт `[]` пока сущность не зарезолвилась.
     */
    public readonly badges: InputSignal<readonly IRtAsideHeader.Badge[]> = input<readonly IRtAsideHeader.Badge[]>([]);

    /** Показывать кнопку закрытия в углу заголовка. Дефолт `true`. */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Показывать skeleton вместо title (loading-state aside'а пока данные
     *  резолвятся через async fasade). Дефолт `false`. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Эмитится при клике по стрелке «назад» — намерение пользователя закрыть
     * aside (intent, не «закрыто»). Route-driven consumer слушает этот output и
     * дёргает `panel.close()` сам. Имя `dismiss` вместо `close` — ESLint
     * `@angular-eslint/no-output-native` блокирует output с именем стандартного
     * DOM-события (`close`).
     */
    public readonly dismiss: OutputEmitterRef<void> = output<void>();

    protected onDismiss(): void {
        // Сначала output — route-driven consumer обработает intent.
        this.dismiss.emit();
        // Затем (если есть) AsideRef — programmatic mode через RtAsideService.
        this.#asideRef?.close();
    }
}
