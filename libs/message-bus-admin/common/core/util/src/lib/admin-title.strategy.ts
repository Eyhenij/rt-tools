import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { adminLabel } from './admin-labels';

/** Чем разделены раздел и приложение в заголовке вкладки: узкая полоса читается и в узкой вкладке. */
const SEPARATOR: string = ' · ';

/**
 * Заголовок вкладки: название приложения и, если раздел его объявил, название раздела перед ним.
 *
 * Раздел один на вкладку, а вкладок у человека десяток: имя приложения отвечает на вопрос, что
 * открыто, а имя проекта сборки — на вопрос, чем это собрано, и в списке вкладок оно не значит
 * ничего. Раздел, не объявивший своего названия, оставляет вкладке одно имя приложения.
 */
@Injectable({ providedIn: 'root' })
export class AdminTitleStrategy extends TitleStrategy {
    readonly #title: Title = inject(Title);

    readonly #appTitle: string = adminLabel('appTitle');

    public override updateTitle(snapshot: RouterStateSnapshot): void {
        const section: string | undefined = this.buildTitle(snapshot);

        this.#title.setTitle(section === undefined ? this.#appTitle : `${section}${SEPARATOR}${this.#appTitle}`);
    }
}
