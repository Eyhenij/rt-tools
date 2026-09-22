import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-chat-site-filter';

/** Признак «не сужено». Пустая строка, а не пустота: отбор уходит в запрос строкой. */
const ALL_SITES: string = '';

/**
 * Отбор переписок по сайту.
 *
 * Сайты приходят входом, а не читаются здесь: за какие сайты отвечает оператор, знает экран — он
 * видел их в непросуженном списке. Второе чтение той же принадлежности разошлось бы с первым.
 *
 * Своего состояния отбор не держит: выбранное приходит входом, а уходит наверх событием.
 */
@Component({
    selector: 'admin-chat-site-filter',
    templateUrl: './admin-chat-site-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // components
        RtSelectComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminChatSiteFilterComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly label: Signal<string> = computed((): string => this.#text.text('chatFilterSite'));

    /** Первым пунктом — «все сайты»: снятый отбор выбирается тем же движением, что и любой сайт. */
    protected readonly options: Signal<readonly IRtSelect.Option<string>[]> = computed(() => [
        { label: this.#text.text('chatFilterSiteAll'), value: ALL_SITES },
        ...this.sites().map((site: string): IRtSelect.Option<string> => ({ label: site, value: site })),
    ]);

    /** Сайты, за которые отвечает оператор: их называет экран по непросуженному списку. */
    public readonly sites: InputSignal<readonly string[]> = input<readonly string[]>([]);

    /** Выбранный сайт. Пусто — разговоры всех сайтов оператора. */
    public readonly site: InputSignal<string> = input<string>(ALL_SITES);

    public readonly siteChange: OutputEmitterRef<string> = output<string>();

    /** Снятый выбор кит отдаёт пустотой — она и означает «все сайты». */
    protected pick(site: string | null): void {
        this.siteChange.emit(site ?? ALL_SITES);
    }
}
