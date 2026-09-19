import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { AdminTextService, TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import { deniedSkillRows, IUsage, IUsageChartBar, kindRows, topSkillRows, usageChartBars } from '@rt/message-bus-admin/usage/util';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { IRtBarList, RtBarListComponent, RtSpinnerComponent, TRtKitLabelParams } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-digest';

/** Столбики графика по дням и три списка: строки готовы к отрисовке, считать здесь нечего. */
interface IDigestView {
    readonly bars: readonly IUsageChartBar[];
    readonly top: readonly IRtBarList.Row[];
    readonly kinds: readonly IRtBarList.Row[];
    readonly denied: readonly IRtBarList.Row[];
    /** Сколько всего загрузок за период: стоит в заголовке карточки графика. */
    readonly loads: number;
}

const EMPTY_VIEW: IDigestView = { bars: [], top: [], kinds: [], denied: [], loads: 0 };

/**
 * Сводка периода над таблицей: широкая карточка с графиком загрузок по дням и три списка со
 * шкалой — самые загружаемые скилы, загрузки по роду, отказы гейта.
 *
 * График — столбики, высота от самого высокого дня; числа дня — в подсказке столбика. Списки —
 * готовый список кита со шкалой доли от лидера. Всё посчитано чистыми функциями раздела: вид
 * только рисует.
 *
 * Своего состояния у вида нет: сводка приходит входом, читает её стор. Пока она перечитывается,
 * прежние карточки стоят притушенными под признаком чтения — пустая сетка на каждую смену
 * периода мигала бы.
 */
@Component({
    selector: 'admin-usage-digest',
    templateUrl: './admin-usage-digest.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtBarListComponent,
        RtSpinnerComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminUsageDigestComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly chartTitle: Signal<string> = computed((): string => this.#text.text('digestLoadsByDay'));
    protected readonly topTitle: Signal<string> = computed((): string => this.#text.text('digestTopSkills'));
    protected readonly kindsTitle: Signal<string> = computed((): string => this.#text.text('digestKinds'));
    protected readonly deniedTitle: Signal<string> = computed((): string => this.#text.text('digestDenials'));
    protected readonly empty: Signal<string> = computed((): string => this.#text.text('digestEmpty'));
    protected readonly noDenials: Signal<string> = computed((): string => this.#text.text('digestNoDenials'));
    protected readonly loadsLabel: Signal<string> = computed((): string => this.#text.text('columnLoads'));

    protected readonly view: Signal<IDigestView> = computed((): IDigestView => {
        const digest: IUsage.Digest.State | null = this.digest();

        if (!digest) {
            return EMPTY_VIEW;
        }

        // Словарь передаётся доводом: подписи внутри строк собираются на выбранном языке, а сам
        // вид пересобирает их вместе со сводкой — выбор языка читается этим же производным.
        const text: TAdminText = (key: TAdminLabelKey, params?: TRtKitLabelParams): string => this.#text.text(key, params);

        return {
            bars: usageChartBars(digest.days, text),
            top: topSkillRows(digest.top, text),
            kinds: kindRows(digest.kinds, text),
            denied: deniedSkillRows(digest.denied),
            loads: digest.days.reduce((sum: number, day: IUsage.Day.State): number => sum + day.loads, 0),
        };
    });

    public readonly digest: InputSignal<IUsage.Digest.State | null> = input.required<IUsage.Digest.State | null>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
}
