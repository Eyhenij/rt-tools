/**
 * Ожидание узла и общие имена замеров показов бокового меню.
 *
 * Живёт своим файлом: показы и их проверки читают одно и то же, а второй экземпляр ожидания
 * разъезжается с первым на первой же правке предела.
 */

/**
 * Предел ожидания в миллисекундах, а не в кадрах анимации.
 *
 * Кадрами ожидание меряться не может: под нагрузкой браузер отдаёт их реже, и полсотни кадров
 * укладываются в доли секунды реального времени — показ падает там, где приложение просто не
 * успело нарисовать. Ловилось это на занятой машине, где рядом шли прогон и сборка.
 */
const WAIT_LIMIT_MS: number = 5000;
const WAIT_STEP_MS: number = 50;

/** Панель подменю — то, чью ширину меряют проверки показов. */
export const PANEL_SELECTOR: string = '.rtui-sub-side-menu-content';

/** Ожидание того, что вернёт узел: по часам, шагом, до предела. */
export async function waitFor<T>(find: () => T | null): Promise<T | null> {
    const until: number = Date.now() + WAIT_LIMIT_MS;

    for (;;) {
        const found: T | null = find();

        if (found !== null) {
            return found;
        }

        if (Date.now() >= until) {
            return null;
        }

        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, WAIT_STEP_MS);
        });
    }
}
