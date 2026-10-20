import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';

import { IRtServiceLogo } from './rt-service-logo.model';

const BEM_BLOCK: string = 'rt-service-logo';

/** Высота знака — ступенью значка кита: 20 / 32 / 48, те же числа, что у знака-картинки. */
const ICON_SIZES: Readonly<Record<IRtServiceLogo.Size, IRtIcon.Size>> = Object.freeze({
    sm: 'md',
    md: 'xl',
    lg: '3xl',
});

/** Знак, готовый к отрисовке: картинка или значок, у каждого своё имя для диктора. */
interface IRtServiceLogoMark {
    readonly label: string;
    readonly src: string | null;
    readonly icon: IRtIcon.Name | null;
}

function toMark(item: IRtServiceLogo.Item): IRtServiceLogoMark {
    return 'src' in item ? { label: item.label, src: item.src, icon: null } : { label: item.label, src: null, icon: item.icon };
}

/**
 * Знак внешней службы в светлом круге с мягкой тенью. Несколько знаков ложатся внахлёст шагом
 * атома, и каждый следующий лежит поверх предыдущего. Знаки чужих компаний приложение передаёт
 * адресом картинки; знак без компании — значок кита в том же круге.
 */
@Component({
    selector: 'rt-service-logo',
    templateUrl: './rt-service-logo.component.html',
    styleUrl: './rt-service-logo.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'list',
        '[class.rt-service-logo--size-sm]': "size() === 'sm'",
        '[class.rt-service-logo--size-lg]': "size() === 'lg'",
    },
})
export class RtServiceLogoComponent {
    protected readonly marks: Signal<readonly IRtServiceLogoMark[]> = computed((): readonly IRtServiceLogoMark[] =>
        this.logos().map(toMark)
    );

    protected readonly iconSize: Signal<IRtIcon.Size> = computed((): IRtIcon.Size => ICON_SIZES[this.size()]);

    /** Знаки ряда в порядке отрисовки: следующий ложится поверх предыдущего. */
    public readonly logos: InputSignal<readonly IRtServiceLogo.Item[]> = input.required<readonly IRtServiceLogo.Item[]>();

    /** Размер круга и знака. */
    public readonly size: InputSignal<IRtServiceLogo.Size> = input<IRtServiceLogo.Size>('md');
}
