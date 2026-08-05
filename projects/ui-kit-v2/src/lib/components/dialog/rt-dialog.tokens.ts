import { InjectionToken } from '@angular/core';

/**
 * Injection token для передачи данных в модалку, открытую через `RtDialogService.open()`.
 *
 * Пользовательский компонент-контент модалки инжектит токен и получает данные,
 * переданные в `DialogConfig.data`. Тип значения задаётся generic'ом — `inject(RT_DIALOG_DATA)`
 * вернёт `unknown`, прокастуй через `inject(RT_DIALOG_DATA) as MyDataType` ИЛИ
 * объяви токен с конкретным generic'ом в feature-либе.
 *
 * @example
 * \`\`\`ts
 * @Component({...})
 * export class WelcomeModalComponent {
 *   readonly data = inject(RT_DIALOG_DATA) as { userName: string };
 * }
 *
 * // parent
 * dialogService.open(WelcomeModalComponent, { data: { userName: "Иван" } });
 * \`\`\`
 */
export const RT_DIALOG_DATA: InjectionToken<unknown> = new InjectionToken<unknown>('RT_DIALOG_DATA');
