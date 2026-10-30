import { booleanAttribute, Directive, forwardRef, input, InputSignalWithTransform } from '@angular/core';

import { IRtExpansionPanelGroupHost, IRtExpansionPanelGroupMember, RT_EXPANSION_PANEL_GROUP } from './rt-expansion-panel-group.token';

/**
 * Группа раскрывающихся панелей, положенных разметкой: раскрытие одной сворачивает остальные, как
 * аккордеон Material. С `multi` панели раскрываются независимо, и группа только собирает их.
 *
 * Ставится на любой узел-обёртку, а не рисует свою: раскладку панелей — промежутки, рамки между
 * ними — задаёт владелец. `rt-accordion` остаётся списком пунктов из входа и группой не служит.
 */
@Directive({
    selector: '[rtExpansionPanelGroup]',
    providers: [
        {
            provide: RT_EXPANSION_PANEL_GROUP,
            useExisting: forwardRef((): typeof RtExpansionPanelGroupDirective => RtExpansionPanelGroupDirective),
        },
    ],
})
export class RtExpansionPanelGroupDirective implements IRtExpansionPanelGroupHost {
    /**
     * Панели группы, и вложенные в обёртки владельца тоже. Их список ведут сами панели, а не запрос
     * по содержимому: запрос взял бы и панель из тела соседки, и раскрытие такой панели свернуло бы
     * её же родителя.
     */
    readonly #panels: Set<IRtExpansionPanelGroupMember> = new Set<IRtExpansionPanelGroupMember>();

    /** Панели раскрываются независимо: группа никого не сворачивает. */
    public readonly multi: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public register(panel: IRtExpansionPanelGroupMember): void {
        this.#panels.add(panel);
    }

    public unregister(panel: IRtExpansionPanelGroupMember): void {
        this.#panels.delete(panel);
    }

    public opened(panel: IRtExpansionPanelGroupMember): void {
        if (this.multi()) {
            return;
        }

        for (const other of this.#panels) {
            if (other !== panel && other.expanded()) {
                other.expanded.set(false);
            }
        }
    }
}
