import { Pipe, PipeTransform } from '@angular/core';

/** Многоточие, вставляемое в середину строки при усечении. */
const ELLIPSIS: string = '...';

/** Длина строки по умолчанию, при которой включается усечение. */
const DEFAULT_MAX_LENGTH: number = 32;

/**
 * Усекает длинное имя файла по середине, сохраняя расширение видимым:
 * `10588-1_EvaluationSearchReport.pdf` → `10588-1_EvaluationSearchRe...pdf`.
 *
 * Обычный CSS `text-overflow: ellipsis` режет хвост и теряет расширение —
 * поэтому усечение по середине делается здесь, а не в стилях. Усечение
 * посимвольное (не по ширине контейнера): предсказуемо и без измерений DOM.
 *
 * Pure-pipe: пересчитывается только при смене входа.
 */
@Pipe({ name: 'rtTruncateMiddle' })
export class RtTruncateMiddlePipe implements PipeTransform {
    public transform(value: string | null | undefined, maxLength: number = DEFAULT_MAX_LENGTH): string {
        if (!value) {
            return '';
        }
        if (value.length <= maxLength) {
            return value;
        }

        const lastDot: number = value.lastIndexOf('.');
        const hasExt: boolean = lastDot > 0 && lastDot < value.length - 1;
        const ext: string = hasExt ? value.slice(lastDot + 1) : '';
        const base: string = hasExt ? value.slice(0, lastDot) : value;

        const headLength: number = maxLength - ext.length - ELLIPSIS.length;
        if (headLength <= 0) {
            // Расширение длиннее лимита — деградируем до простого усечения хвоста.
            return value.slice(0, Math.max(0, maxLength - ELLIPSIS.length)) + ELLIPSIS;
        }

        return base.slice(0, headLength) + ELLIPSIS + ext;
    }
}
