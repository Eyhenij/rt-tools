import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { ITreeChoice } from '@rt/message-bus-common';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-tree-filter';

/** Признак «не сужено». Пустая строка, а не пустота: адрес несёт отбор строкой. */
const ALL_TREES: string = '';

/**
 * Отбор списка по дереву.
 *
 * Деревья названы именами, а сужается список признаком: признак — хеш адреса репозитория, и
 * своё дерево человек по нему не узнаёт.
 *
 * Своего состояния отбор не держит: выбранное приходит входом из адреса и уходит наверх
 * событием. Иначе отбор, показанный на экране, и отбор, которым читали, — два разных ответа на
 * один вопрос, и расходятся они на переходе по страницам.
 */
@Component({
    selector: 'admin-tree-filter',
    templateUrl: './admin-tree-filter.component.html',
    styleUrl: './admin-tree-filter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // components
        RtSelectComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminTreeFilterComponent {
    protected readonly label: string = adminLabel('filterTree');

    /** Первым пунктом — «все деревья»: снятый отбор выбирается тем же способом, что и любой другой. */
    protected readonly options: Signal<readonly IRtSelect.Option<string>[]> = computed(() => [
        { label: adminLabel('filterTreeAll'), value: ALL_TREES },
        ...this.choices().map((choice: ITreeChoice): IRtSelect.Option<string> => ({ label: choice.name, value: choice.slug })),
    ]);

    public readonly choices: InputSignal<readonly ITreeChoice[]> = input<readonly ITreeChoice[]>([]);
    /** Признак выбранного дерева. Пусто — груз всех деревьев. */
    public readonly tree: InputSignal<string> = input<string>(ALL_TREES);

    public readonly treeChange: OutputEmitterRef<string> = output<string>();

    /** Снятый выбор кит отдаёт пустотой — она и означает «все деревья». */
    protected pick(slug: string | null): void {
        this.treeChange.emit(slug ?? ALL_TREES);
    }
}
