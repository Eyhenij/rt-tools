import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    InputSignal,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    input,
    output,
    viewChild,
} from '@angular/core';
import { AdminLocaleSwitchComponent } from '@rt/message-bus-admin/common/core/ui';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtPageHeader, RtButtonDirective, RtPageHeaderComponent, RtThemeToggleComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-header';

/**
 * Шапка админки: название приложения, разделы верхним рядом и профиль справа.
 *
 * Разделы рисует готовый верхний ряд кита. Своей полосы здесь нет намеренно: подсветку текущего
 * раздела он отдаёт маршрутизатору, узкий экран открывает теми же пунктами через кнопку, а
 * написанная заново полоса расходилась бы с остальным приложением отступами и поведением — и
 * правилась бы здесь, а не в ките.
 *
 * Приложение называет себя словом, а не знаком: начертание знака кит не везёт, оно приходит от
 * приложения, и пока файлов нет, готовый логотип занимает место и не рисует ничего.
 *
 * Нажатие на профиль открывает попап, а не выходит: выход, случающийся от одного нажатия рядом с
 * разделами, теряется промахом мимо кнопки. Содержимое попапа шапка объявляет шаблоном, а рисует
 * его кит — в наложении у конца страницы.
 *
 * В попапе стоят тема и язык: место, где их меняют, у приложения одно, а второе — экран входа, до
 * которого попапа ещё нет. Ни тем, ни языком шапка не владеет — оба переключателя держат свой
 * выбор сами, на устройстве.
 *
 * Кто вошёл и что делать с выходом, шапка не решает: имя приходит входом, а выход уходит выходом.
 * Состояние входа живёт в одном месте, и второй ответ на вопрос «кто вошёл» разошёлся бы с первым.
 */
@Component({
    selector: 'admin-header',
    templateUrl: './admin-header.component.html',
    styleUrl: './admin-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        AdminLocaleSwitchComponent,
        RtButtonDirective,
        RtPageHeaderComponent,
        RtThemeToggleComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminHeaderComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    // Подписи шапки — производные, а не постоянные: язык меняется здесь же, в попапе профиля, и
    // взятый один раз текст остался бы на прежнем языке до перезагрузки страницы.
    protected readonly appTitle: Signal<string> = computed((): string => this.#text.text('appTitle'));

    protected readonly navLabel: Signal<string> = computed((): string => this.#text.text('navSections'));

    protected readonly signOutLabel: Signal<string> = computed((): string => this.#text.text('signOut'));

    protected readonly themeLabel: Signal<string> = computed((): string => this.#text.text('theme'));

    protected readonly languageLabel: Signal<string> = computed((): string => this.#text.text('language'));

    /**
     * Шаблон попапа профиля. Рисует попап кит, а его содержимое приходит отсюда: до первой
     * отрисовки шаблона ещё нет, и ряд получает пустое значение — своего попапа он тогда не
     * открывает вовсе.
     */
    protected readonly profileMenu: Signal<TemplateRef<unknown> | undefined> = viewChild<TemplateRef<unknown>>('profileMenuTpl');

    public readonly items: InputSignal<ReadonlyArray<IRtPageHeader.Item>> = input<ReadonlyArray<IRtPageHeader.Item>>([]);

    public readonly user: InputSignal<IRtPageHeader.User | null> = input<IRtPageHeader.User | null>(null);

    public readonly signOut: OutputEmitterRef<void> = output<void>();
}
