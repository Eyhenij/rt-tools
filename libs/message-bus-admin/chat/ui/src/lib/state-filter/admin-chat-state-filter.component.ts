import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EChatTalkState } from '@rt/message-bus-common';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-chat-state-filter';

/** Признак «не сужено». Пустая строка, а не пустота: адрес несёт отбор строкой. */
const ALL_STATES: string = '';

/**
 * Отбор переписок по состоянию разговора.
 *
 * Состояния названы теми же словами, что и строка списка: слово берётся из словаря, а не пишется
 * здесь второй раз — написанное дважды, оно разошлось бы между отбором и строкой молча.
 *
 * Своего состояния отбор не держит: выбранное приходит входом, а уходит наверх событием.
 */
@Component({
    selector: 'admin-chat-state-filter',
    templateUrl: './admin-chat-state-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // components
        RtSelectComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminChatStateFilterComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly label: Signal<string> = computed((): string => this.#text.text('filterState'));

    /** Первым пунктом — «все состояния»: снятый отбор выбирается тем же движением, что и любое. */
    protected readonly options: Signal<readonly IRtSelect.Option<string>[]> = computed(() => [
        { label: this.#text.text('filterStateAll'), value: ALL_STATES },
        { label: this.#text.text('chatStateLive'), value: EChatTalkState.Live },
        { label: this.#text.text('chatStateClosed'), value: EChatTalkState.Closed },
    ]);

    /** Выбранное состояние. Пусто — разговоры обоих состояний. */
    public readonly state: InputSignal<string> = input<string>(ALL_STATES);

    public readonly stateChange: OutputEmitterRef<string> = output<string>();

    /** Снятый выбор кит отдаёт пустотой — она и означает «все состояния». */
    protected pick(state: string | null): void {
        this.stateChange.emit(state ?? ALL_STATES);
    }
}
