import { InjectionToken } from '@angular/core';

/**
 * Injection token для передачи данных в side-sheet, открытую через `RtAsideService.open()`.
 *
 * Пользовательский компонент-контент aside'а инжектит токен и получает данные,
 * переданные в `IRtAsideConfig.data`. Тип значения задаётся generic'ом — `inject(RT_ASIDE_DATA)`
 * вернёт `unknown`, прокастуй через `inject(RT_ASIDE_DATA) as MyDataType` ИЛИ
 * объяви токен с конкретным generic'ом в feature-либе.
 *
 * Намеренно отдельный токен от `RT_DIALOG_DATA`, чтобы type-checker не путал контексты
 * (rt-dialog vs rt-aside) — оба сервиса могут существовать в одном DI-дереве.
 *
 * @example
 * \`\`\`ts
 * @Component({...})
 * export class GuestProfileAsideComponent {
 *   readonly data = inject(RT_ASIDE_DATA) as { userId: number };
 * }
 *
 * // parent
 * asideService.open(GuestProfileAsideComponent, { data: { userId: 42 } });
 * \`\`\`
 */
export const RT_ASIDE_DATA: InjectionToken<unknown> = new InjectionToken<unknown>('RT_ASIDE_DATA');
