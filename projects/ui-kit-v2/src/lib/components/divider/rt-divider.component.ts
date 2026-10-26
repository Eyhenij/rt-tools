import { booleanAttribute, ChangeDetectionStrategy, Component, input, InputSignalWithTransform, ViewEncapsulation } from '@angular/core';

const BEM_BLOCK: string = 'rt-divider';

/**
 * Разделитель: тонкая линия между группами пунктов списка, разделами окна, кнопками панели.
 * Горизонтальный идёт во всю ширину родителя, вертикальный — во всю высоту строки, в которой стоит.
 * `inset` отступает от начала строки, чтобы линия начиналась под текстом, а не под значком;
 * вертикальная с `inset` короче строки сверху и снизу.
 *
 * Линия — граница самого хоста: своей разметки у разделителя нет.
 */
@Component({
    selector: 'rt-divider',
    templateUrl: './rt-divider.component.html',
    styleUrl: './rt-divider.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        role: 'separator',
        'qa-dataid': 'divider',
        '[attr.aria-orientation]': 'vertical() ? "vertical" : "horizontal"',
        '[class.rt-divider--vertical]': 'vertical()',
        '[class.rt-divider--inset]': 'inset()',
    },
})
export class RtDividerComponent {
    /** Линия стоит вертикально, во всю высоту строки. */
    public readonly vertical: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    /** Отступ: горизонтальная начинается под текстом строки, вертикальная короче сверху и снизу. */
    public readonly inset: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });
}
