import { MonoTypeOperatorFunction, debounce, timer } from 'rxjs';

/** Единый дебаунс полей поиска (мс) — одинаковый по всему киту. */
export const SEARCH_DEBOUNCE_MS: number = 300;

/**
 * Дебаунс поля поиска с мгновенным сбросом. Непустой ввод откладывается на
 * SEARCH_DEBOUNCE_MS (не бить фильтром/запросом на каждый символ), пустое
 * значение — очистка крестиком или удаление до конца — применяется сразу,
 * без задержки. Иначе сброс поиска ощущается лагающим.
 */
export function searchDebounce(): MonoTypeOperatorFunction<string> {
    return debounce((value: string): ReturnType<typeof timer> => timer(value.trim() === '' ? 0 : SEARCH_DEBOUNCE_MS));
}
