import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { ADMIN_MENU, IAdminMenuItem } from '@rt/message-bus-admin/common/container/util';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-no-sections';

/**
 * Экран того, кому не открыт ни один раздел.
 *
 * Стоит своим адресом внутри оболочки, а не состоянием её зоны содержимого: состояние, видимое
 * только как «в зону ничего не нарисовали», не переживает перезагрузку и не достаётся тому, кто
 * пришёл прямой ссылкой в закрытый раздел. Имя и выход даёт шапка оболочки, и второй копии у
 * экрана нет — выход один на всю админку.
 */
@Component({
    selector: 'admin-no-sections',
    templateUrl: './admin-no-sections.component.html',
    styleUrl: './admin-no-sections.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtEmptyStateComponent],
    host: { class: BEM_BLOCK },
})
export class AdminNoSectionsComponent {
    readonly #router: Router = inject(Router);
    readonly #store: AuthStore = inject(AuthStore);
    readonly #text: AdminTextService = inject(AdminTextService);

    // Язык меняют в попапе шапки, а шапка стоит над этим экраном: подписи производные, иначе
    // экран остался бы на прежнем языке рядом с переведённой шапкой.
    protected readonly title: Signal<string> = computed((): string => this.#text.text('noSectionsTitle'));
    protected readonly from: Signal<string> = computed((): string => this.#text.text('noSectionsFrom'));

    /**
     * Первый раздел, открытый вошедшему. Пока такого нет, экран и есть его состояние.
     *
     * Ответа о вошедшем ещё нет — здесь пусто: до ответа права неизвестны, а не выданы, и увод по
     * ним унёс бы человека с экрана в раздел, которого ему не открывали.
     */
    readonly #opened: Signal<IAdminMenuItem | undefined> = computed(() =>
        this.#store.rightsKnown() ? ADMIN_MENU.find((item: IAdminMenuItem): boolean => this.#store.allows(item.right)) : undefined
    );

    constructor() {
        // Право приехало посреди работы: экран перестал быть состоянием этого человека, и уходить
        // с него руками ему не надо. Уводом, а не производным значением: производное описывает,
        // что показать, а здесь меняется адрес страницы.
        effect((): void => {
            const opened: IAdminMenuItem | undefined = this.#opened();

            if (opened !== undefined) {
                void this.#router.navigate([opened.path]);
            }
        });
    }
}
