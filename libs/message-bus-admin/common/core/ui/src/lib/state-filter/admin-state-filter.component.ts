import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { adminLabel, cargoStateLabel } from '@rt/message-bus-admin/common/core/util';
import { ECargoState } from '@rt/message-bus-common';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-state-filter';

/** Признак «не сужено». Пустая строка, а не пустота: адрес несёт отбор строкой. */
const ALL_STATES: string = '';

/**
 * Отбор списка по состоянию записи.
 *
 * Состояния названы теми же словами, что и столбец состояния: слово берётся общей функцией
 * семейства, а не пишется здесь второй раз — написанное дважды, оно разошлось бы между отбором и
 * столбцом молча, и первым это увидел бы человек.
 *
 * Своего состояния отбор не держит — тем же приёмом, что и отбор по дереву рядом: выбранное
 * приходит входом из адреса и уходит наверх событием. Иначе отбор, показанный на экране, и
 * отбор, которым читали, — два разных ответа на один вопрос.
 */
@Component({
    selector: 'admin-state-filter',
    templateUrl: './admin-state-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // components
        RtSelectComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminStateFilterComponent {
    protected readonly label: string = adminLabel('filterState');

    /**
     * Первым пунктом — «все состояния»: снятый отбор выбирается тем же движением, что и любое
     * состояние, и отдельной кнопки сброса на экране не заводится.
     *
     * Набор берётся перечислением, а не переписывается списком: дописанное деревом состояние
     * иначе появилось бы в столбце и не появилось бы в отборе.
     */
    protected readonly options: Signal<readonly IRtSelect.Option<string>[]> = computed(() => [
        { label: adminLabel('filterStateAll'), value: ALL_STATES },
        ...Object.values(ECargoState).map((state: ECargoState): IRtSelect.Option<string> => ({
            label: cargoStateLabel(state),
            value: state,
        })),
    ]);

    /** Выбранное состояние. Пусто — записи всех состояний. */
    public readonly state: InputSignal<string> = input<string>(ALL_STATES);

    public readonly stateChange: OutputEmitterRef<string> = output<string>();

    /** Снятый выбор кит отдаёт пустотой — она и означает «все состояния». */
    protected pick(state: string | null): void {
        this.stateChange.emit(state ?? ALL_STATES);
    }
}
