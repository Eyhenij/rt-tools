import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtPageHeader, RtPageHeaderComponent } from '@rt-tools/ui-kit-v2';

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
 * Кто вошёл и что делать с нажатием на профиль, шапка не решает: имя приходит входом, а нажатие
 * уходит выходом. Состояние входа живёт в одном месте, и второй ответ на вопрос «кто вошёл»
 * разошёлся бы с первым.
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
        RtPageHeaderComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminHeaderComponent {
    protected readonly appTitle: string = adminLabel('appTitle');

    protected readonly navLabel: string = adminLabel('navSections');

    public readonly items: InputSignal<ReadonlyArray<IRtPageHeader.Item>> = input<ReadonlyArray<IRtPageHeader.Item>>([]);

    public readonly user: InputSignal<IRtPageHeader.User | null> = input<IRtPageHeader.User | null>(null);

    public readonly profileClick: OutputEmitterRef<void> = output<void>();
}
