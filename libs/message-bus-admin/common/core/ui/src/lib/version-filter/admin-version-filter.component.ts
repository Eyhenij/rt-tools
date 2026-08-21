import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { CARGO_VERSION_NONE } from '@rt/message-bus-common';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-version-filter';

/** Признак «не сужено». Пустая строка, а не пустота: адрес несёт отбор строкой. */
const ALL_VERSIONS: string = '';

/**
 * Отбор списка по версии выпуска.
 *
 * Версии приходят входом, а не берутся здесь: набора версий заранее не существует — их называет
 * дерево при выпуске, и приёмник собирает встретившиеся по самим записям. Порядок их тоже задан
 * приёмником — номерами частей, а не буквами строки.
 *
 * Вторым пунктом стоит «без версии»: им находят починенное, но не выпущенное — вопрос, на
 * который состояние отвечает лишь наполовину. Слово у него то же, каким его читает приёмник:
 * перевода между экраном и запросом нет ни у одного отбора.
 *
 * Своего состояния отбор не держит — тем же приёмом, что и два отбора рядом: выбранное приходит
 * входом из адреса и уходит наверх событием.
 */
@Component({
    selector: 'admin-version-filter',
    templateUrl: './admin-version-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // components
        RtSelectComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminVersionFilterComponent {
    protected readonly label: string = adminLabel('releaseVersion');

    /**
     * Первым пунктом — «все версии», вторым — «без версии», дальше сами версии.
     *
     * Первый снимает отбор тем же движением, каким выбирают версию, и отдельной кнопки сброса на
     * экране не заводится.
     */
    protected readonly options: Signal<readonly IRtSelect.Option<string>[]> = computed(() => [
        { label: adminLabel('filterVersionAll'), value: ALL_VERSIONS },
        { label: adminLabel('filterVersionNone'), value: CARGO_VERSION_NONE },
        ...this.versions().map((version: string): IRtSelect.Option<string> => ({ label: version, value: version })),
    ]);

    /** Встретившиеся версии, упорядоченные приёмником. Пусто — записей с версией ещё нет. */
    public readonly versions: InputSignal<readonly string[]> = input<readonly string[]>([]);

    /** Выбранная версия либо слово «без версии». Пусто — записи всех версий. */
    public readonly version: InputSignal<string> = input<string>(ALL_VERSIONS);

    public readonly versionChange: OutputEmitterRef<string> = output<string>();

    /** Снятый выбор кит отдаёт пустотой — она и означает «все версии». */
    protected pick(version: string | null): void {
        this.versionChange.emit(version ?? ALL_VERSIONS);
    }
}
