import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtActionBar } from '../../action-bar-config.interface';
import { RtuiActionBarComponent } from '../../components/bar/rtui-action-bar.component';

/** Какой набор кнопок подан панели: у каждого свой вид, и меряются они порознь. */
export type TActionSet = 'plain' | 'menu' | 'styled' | 'empty';

/**
 * Обёртка показа панели действий.
 *
 * Нажатие и закрытие панель никак не показывает сама: действие зовёт переданную функцию, а
 * закрытие поднимает событие. Обёртка держит последнее случившееся и показывает его строкой —
 * иначе нажатие срабатывает молча, и читатель не знает, случилось ли что-нибудь.
 */
@Component({
    selector: 'app-action-bar',
    templateUrl: './test-action-bar.component.html',
    styleUrls: ['./test-action-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiActionBarComponent,
    ],
})
export class TestActionBarComponent {
    public selected: number = 3;
    public total: number = 128;
    public actions: TActionSet = 'plain';

    /**
     * Что случилось, по порядку: имя нажатого действия и слово о закрытии.
     *
     * Список, а не последнее событие: нажатие действия закрывает панель само, и закрытие
     * затирало бы имя действия — читателю оставалось бы гадать, вызвали его или нет.
     */
    public readonly events: WritableSignal<string[]> = signal([]);

    public get config(): IRtActionBar.Config {
        return { selected: this.selected, total: this.total, buttons: this.buttons() };
    }

    public onClose(): void {
        this.add('закрытие');
    }

    private add(event: string): void {
        this.events.update((all: string[]) => [...all, event]);
    }

    private buttons(): IRtActionBar.Button[] {
        const press: (title: string) => () => void =
            (title: string): (() => void) =>
            (): void =>
                this.add(title);

        switch (this.actions) {
            case 'empty':
                return [];
            case 'menu':
                return [
                    {
                        title: 'Переместить',
                        icon: 'drive_file_move',
                        menu: [
                            { title: 'В архив', action: press('В архив') },
                            { title: 'В корзину', action: press('В корзину') },
                        ],
                    },
                    { title: 'Удалить', icon: 'delete', action: press('Удалить') },
                ];
            case 'styled':
                return [
                    { title: 'Опасное действие', icon: 'warning', action: press('Опасное действие'), styles: { color: '#d64545' } },
                    { title: 'Обычное', action: press('Обычное') },
                ];
            default:
                return [
                    { title: 'Скачать', icon: 'download', action: press('Скачать') },
                    { title: 'Копировать', icon: 'content_copy', action: press('Копировать') },
                    { title: 'Удалить', icon: 'delete', action: press('Удалить') },
                ];
        }
    }
}
