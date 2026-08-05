/**
 * Чистая логика просмотрщика: переходы между кадрами и то, какие из них стоит
 * держать загруженными.
 */

/** Листание по кругу: с последнего кадра стрелка вправо ведёт на первый */
export function nextPhotoIndex(current: number, total: number, step: number): number {
    if (total <= 0) {
        return 0;
    }
    return (((current + step) % total) + total) % total;
}

/** Индекс из адреса: в URL кадры нумеруются с единицы, внутри — с нуля */
export function indexFromParam(param: string | null, total: number): number {
    const parsed: number = Number(param);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > total) {
        return -1;
    }
    return parsed - 1;
}

export function paramFromIndex(index: number): string {
    return String(index + 1);
}

/**
 * Индекс кадра по позиции прокрутки. Нужен, потому что листать можно свайпом:
 * без этого счётчик показывал бы один кадр, а на экране был бы другой.
 */
export function indexFromScroll(scrollLeft: number, slideWidth: number, total: number): number {
    if (slideWidth <= 0 || total <= 0) {
        return 0;
    }
    const index: number = Math.round(scrollLeft / slideWidth);
    return Math.min(Math.max(index, 0), total - 1);
}

/**
 * Кадры, которые держим в разметке: текущий и соседние. Полноразмерная
 * фотография весит сотни килобайт, и загружать все пятьдесят разом — значит
 * выесть трафик пользователя ради кадров, до которых он не долистает.
 */
export function shouldRenderPhoto(index: number, current: number, total: number): boolean {
    if (total <= 0) {
        return false;
    }
    const distance: number = Math.min(Math.abs(index - current), total - Math.abs(index - current));
    return distance <= 1;
}
