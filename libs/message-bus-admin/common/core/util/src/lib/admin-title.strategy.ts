import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { AdminTextService } from './admin-text.service';

/** Чем разделены раздел и приложение в заголовке вкладки: узкая полоса читается и в узкой вкладке. */
const SEPARATOR: string = ' · ';

/**
 * Заголовок вкладки: название приложения и, если раздел его объявил, название раздела перед ним.
 *
 * Раздел один на вкладку, а вкладок у человека десяток: имя приложения отвечает на вопрос, что
 * открыто, а имя проекта сборки — на вопрос, чем это собрано, и в списке вкладок оно не значит
 * ничего. Раздел, не объявивший своего названия, оставляет вкладке одно имя приложения.
 *
 * Имя приложения спрашивается у словаря на каждой постановке заголовка, а не берётся один раз:
 * взятое один раз, оно осталось бы на языке первой загрузки страницы.
 */
@Injectable({ providedIn: 'root' })
export class AdminTitleStrategy extends TitleStrategy {
    readonly #title: Title = inject(Title);

    readonly #text: AdminTextService = inject(AdminTextService);

    public override updateTitle(snapshot: RouterStateSnapshot): void {
        const section: string | undefined = this.buildTitle(snapshot);
        const appTitle: string = this.#text.text('appTitle');

        this.#title.setTitle(section === undefined ? appTitle : `${section}${SEPARATOR}${appTitle}`);
    }
}
