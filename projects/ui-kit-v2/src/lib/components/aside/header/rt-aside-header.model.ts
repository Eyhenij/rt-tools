import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { IRtTag } from '@rt-tools/ui-kit-v2/tag';

/**
 * Контракты `rt-aside-header`. Один корневой неймспейс с
 * префиксом `I`. `Badge` описывает один тег в ряду под заголовком — обёртка
 * над `rt-tag`-инпутами с дефолтами, чтобы потребитель задавал только нужное.
 */
export namespace IRtAsideHeader {
    /** Конфиг одного бэйджа в ряду под заголовком (проксирует инпуты `rt-tag`). */
    export interface Badge {
        /** Текст бэйджа. */
        value: string;
        /** Палитра. Дефолт потребления — `neutral`. */
        severity?: IRtTag.Severity;
        /** Вид заливки. Дефолт потребления — `solid`. */
        appearance?: IRtTag.Appearance;
        /** Шаг скругления метки. Пусто — `md`. */
        radius?: TRtRadius | null;
        /** Префикс-иконка. */
        icon?: IRtIcon.Name | null;
        /**
         * Ссылка-назначение. Если задана — бэйдж рендерится якорем и открывает
         * URL в новой вкладке (`target="_blank"`); иначе это обычный тег.
         */
        href?: string;
    }
}
