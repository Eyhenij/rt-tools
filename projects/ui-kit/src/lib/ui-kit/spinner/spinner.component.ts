import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    input,
    InputSignalWithTransform,
    numberAttribute,
    OnInit,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rtui-spinner';

@Component({
    selector: 'rtui-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    imports: [MatProgressSpinnerModule, BlockDirective, ElemDirective, ModDirective],
    host: { class: BEM_BLOCK },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiSpinnerComponent implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #shown: WritableSignal<boolean> = signal(false);

    public diameter: InputSignalWithTransform<number, number> = input<number, number>(32, {
        transform: numberAttribute,
    });
    public showBox: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public showBackground: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /**
     * Сколько миллисекунд спиннер ждёт, прежде чем стать видимым.
     *
     * Умолчание — ноль: спиннер, вставленный без задержки, ведёт себя как прежде. Ожидание,
     * кончившееся раньше срока, спиннера не показывает вовсе — вспышки на экране не случается.
     */
    public delay: InputSignalWithTransform<number, number> = input<number, number>(0, {
        transform: numberAttribute,
    });

    /** Спиннер виден: задержки не назначали или её срок вышел. */
    public readonly visible: Signal<boolean> = this.#shown.asReadonly();

    /**
     * Отсчёт начинается на вставке, а не в конструкторе: до первого крючка вход держит своё
     * умолчание, и задержка, названная потребителем, конструктору ещё не видна.
     */
    public ngOnInit(): void {
        const wait: number = this.delay();

        if (wait <= 0) {
            this.#shown.set(true);

            return;
        }

        const timer: ReturnType<typeof setTimeout> = setTimeout(() => this.#shown.set(true), wait);

        // Снятый до срока спиннер счётчик за собой убирает: отложенный показ иначе рисовал бы
        // кружок поверх готового экрана.
        this.#destroyRef.onDestroy(() => clearTimeout(timer));
    }
}
