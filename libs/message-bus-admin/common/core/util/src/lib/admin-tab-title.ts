/**
 * Заголовок вкладки браузера по ключу словаря.
 *
 * Маршруты объявляются один раз при загрузке приложения: текст, взятый там, приходит на языке той
 * минуты и до перезагрузки остаётся прежним. Разрешатель зовётся на каждом переходе — и словарь
 * спрашивает тогда же.
 *
 * Общая на все разделы: написанная в каждой оболочке заново, она разошлась бы с соседней при
 * первой же правке.
 */
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { TAdminLabelKey } from './admin-labels';
import { AdminTextService } from './admin-text.service';

/** Разрешатель заголовка вкладки: ключ называет раздел, текст берёт словарь. */
export function adminTabTitle(key: TAdminLabelKey): ResolveFn<string> {
    return (): string => inject(AdminTextService).text(key);
}
