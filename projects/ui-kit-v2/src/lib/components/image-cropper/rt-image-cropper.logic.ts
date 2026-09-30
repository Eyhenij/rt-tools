import { IRtImageCropper } from './rt-image-cropper.model';

/**
 * Чистая логика обрезки: вписывание исходника в поле, рамка в пикселях
 * исходника, её движение и растяжение, перевод клавиш и выбор формата.
 * Компонент только переводит указатель в сдвиги и рисует то, что вернулось.
 */

/** Все восемь ручек по часовой стрелке от левого верхнего угла */
export const RT_IMAGE_CROPPER_HANDLES: readonly IRtImageCropper.Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/** Шаг клавиш в пикселях поля: стрелка и стрелка с Shift */
export const RT_IMAGE_CROPPER_KEY_STEP: number = 1;
export const RT_IMAGE_CROPPER_KEY_STEP_LARGE: number = 10;

/** Качество по умолчанию — то же, что у загрузчика первого кита */
export const RT_IMAGE_CROPPER_QUALITY: number = 92;

const OWN_TYPES: readonly string[] = ['image/png', 'image/jpeg', 'image/webp'];

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Вписывает исходник в поле целиком, с его пропорциями, по центру. Ни одна часть
 * картинки не срезается полем, и ни одна не растянута.
 */
export function fitSource(source: IRtImageCropper.Size, field: IRtImageCropper.Size): IRtImageCropper.Fit {
    if (source.width <= 0 || source.height <= 0 || field.width <= 0 || field.height <= 0) {
        return { scale: 0, offsetX: 0, offsetY: 0, width: 0, height: 0 };
    }
    const scale: number = Math.min(field.width / source.width, field.height / source.height);
    const width: number = source.width * scale;
    const height: number = source.height * scale;
    return { offsetX: (field.width - width) / 2, offsetY: (field.height - height) / 2, scale, width, height };
}

/**
 * Пропорция, которую держит рамка. Круглый вид держит один к одному при любой
 * заданной; заданная не числом или не больше нуля значит свободную рамку.
 */
export function frameRatio(ratio: number | null | undefined, round: boolean): number | null {
    if (round) {
        return 1;
    }
    return typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0 ? ratio : null;
}

/**
 * Начальная рамка — наибольшая, какую позволяет пропорция, по центру исходника.
 * Свободная начинается как весь исходник.
 */
export function initialFrame(source: IRtImageCropper.Size, ratio: number | null): IRtImageCropper.Rect {
    if (ratio === null) {
        return { x: 0, y: 0, width: source.width, height: source.height };
    }
    const width: number = Math.min(source.width, source.height * ratio);
    const height: number = width / ratio;
    return { x: (source.width - width) / 2, y: (source.height - height) / 2, width, height };
}

/** Сдвиг рамки целиком: размер тот же, у края исходника рамка останавливается */
export function moveFrame(frame: IRtImageCropper.Rect, delta: IRtImageCropper.Delta, source: IRtImageCropper.Size): IRtImageCropper.Rect {
    return {
        x: clamp(frame.x + delta.dx, 0, Math.max(0, source.width - frame.width)),
        y: clamp(frame.y + delta.dy, 0, Math.max(0, source.height - frame.height)),
        width: frame.width,
        height: frame.height,
    };
}

/** Знак оси по ручке: к концу оси, к началу, или ось не тянется */
function axisSign(handle: IRtImageCropper.Handle, forward: string, backward: string): number {
    if (handle.includes(forward)) {
        return 1;
    }
    return handle.includes(backward) ? -1 : 0;
}

/** По каким осям и в какую сторону тянет ручка */
export function handleDirection(handle: IRtImageCropper.Handle): IRtImageCropper.Direction {
    return { x: axisSign(handle, 'e', 'w'), y: axisSign(handle, 's', 'n') };
}

/**
 * Наибольший размер по оси: от неподвижной стороны до края исходника, а для оси,
 * которую ручка не тянет, — удвоенное расстояние от центра до ближнего края.
 */
function axisRoom(start: number, size: number, limit: number, direction: number): number {
    if (direction > 0) {
        return limit - start;
    }
    if (direction < 0) {
        return start + size;
    }
    const centre: number = start + size / 2;
    return 2 * Math.min(centre, limit - centre);
}

/** Где рамка встаёт на оси: от неподвижной стороны, или вокруг центра для оси, которую ручка не тянет */
function axisStart(start: number, size: number, next: number, direction: number): number {
    if (direction > 0) {
        return start;
    }
    if (direction < 0) {
        return start + size - next;
    }
    return start + size / 2 - next / 2;
}

/** Свободная рамка: каждая ось тянется сама, ось без ручки остаётся как была */
function resizeFree(
    frame: IRtImageCropper.Rect,
    direction: IRtImageCropper.Direction,
    delta: IRtImageCropper.Delta,
    source: IRtImageCropper.Size,
    least: number
): IRtImageCropper.Rect {
    let { x, y, width, height }: IRtImageCropper.Rect = frame;
    if (direction.x !== 0) {
        const room: number = axisRoom(frame.x, frame.width, source.width, direction.x);
        width = clamp(frame.width + direction.x * delta.dx, Math.min(least, room), room);
        x = axisStart(frame.x, frame.width, width, direction.x);
    }
    if (direction.y !== 0) {
        const room: number = axisRoom(frame.y, frame.height, source.height, direction.y);
        height = clamp(frame.height + direction.y * delta.dy, Math.min(least, room), room);
        y = axisStart(frame.y, frame.height, height, direction.y);
    }
    return { x, y, width, height };
}

/**
 * Ширина, которую просит сдвиг при заданной пропорции. Угол берёт ту ось, по
 * которой сдвиг больше; сторона — свою ось.
 */
function wantedRatioWidth(
    frame: IRtImageCropper.Rect,
    direction: IRtImageCropper.Direction,
    delta: IRtImageCropper.Delta,
    ratio: number
): number {
    const byWidth: number = frame.width + direction.x * delta.dx;
    const byHeight: number = (frame.height + direction.y * delta.dy) * ratio;
    if (direction.x === 0) {
        return byHeight;
    }
    if (direction.y === 0) {
        return byWidth;
    }
    return Math.abs(delta.dx) >= Math.abs(delta.dy * ratio) ? byWidth : byHeight;
}

/**
 * Растяжение рамки за ручку. Сторона или угол напротив ручки стоит на месте;
 * рамка не выходит за исходник и не становится меньше наименьшего размера; рамка
 * с пропорцией держит её, а боковая ручка тянет её вокруг центра второй оси.
 */
export function resizeFrame(
    frame: IRtImageCropper.Rect,
    handle: IRtImageCropper.Handle,
    delta: IRtImageCropper.Delta,
    source: IRtImageCropper.Size,
    ratio: number | null,
    minSize: number
): IRtImageCropper.Rect {
    const direction: IRtImageCropper.Direction = handleDirection(handle);
    const least: number = Math.max(0, minSize);
    if (ratio === null) {
        return resizeFree(frame, direction, delta, source, least);
    }
    const roomWidth: number = Math.min(
        axisRoom(frame.x, frame.width, source.width, direction.x),
        axisRoom(frame.y, frame.height, source.height, direction.y) * ratio
    );
    const leastWidth: number = Math.min(Math.max(least, least * ratio), roomWidth);
    const width: number = clamp(wantedRatioWidth(frame, direction, delta, ratio), leastWidth, roomWidth);
    const height: number = width / ratio;
    return {
        x: axisStart(frame.x, frame.width, width, direction.x),
        y: axisStart(frame.y, frame.height, height, direction.y),
        width,
        height,
    };
}

/**
 * Сдвиг от стрелки клавиатуры в пикселях исходника. Одно нажатие — пиксель поля,
 * с Shift десять; не стрелка даёт `null`.
 */
export function keyDelta(key: string, isLarge: boolean, scale: number): IRtImageCropper.Delta | null {
    if (scale <= 0) {
        return null;
    }
    const step: number = (isLarge ? RT_IMAGE_CROPPER_KEY_STEP_LARGE : RT_IMAGE_CROPPER_KEY_STEP) / scale;
    switch (key) {
        case 'ArrowLeft':
            return { dx: -step, dy: 0 };
        case 'ArrowRight':
            return { dx: step, dy: 0 };
        case 'ArrowUp':
            return { dx: 0, dy: -step };
        case 'ArrowDown':
            return { dx: 0, dy: step };
        default:
            return null;
    }
}

/** Сдвиг указателя в пикселях поля переводится в пиксели исходника */
export function fieldDelta(dx: number, dy: number, scale: number): IRtImageCropper.Delta {
    return scale > 0 ? { dx: dx / scale, dy: dy / scale } : { dx: 0, dy: 0 };
}

/** Рамка в пикселях поля — для рисования поверх вписанной картинки */
export function frameInField(frame: IRtImageCropper.Rect, fit: IRtImageCropper.Fit): IRtImageCropper.Rect {
    return {
        x: fit.offsetX + frame.x * fit.scale,
        y: fit.offsetY + frame.y * fit.scale,
        width: frame.width * fit.scale,
        height: frame.height * fit.scale,
    };
}

/** Рамка в целых пикселях исходника — то, что вырезает холст; не меньше пикселя */
export function cropArea(frame: IRtImageCropper.Rect, source: IRtImageCropper.Size): IRtImageCropper.Rect {
    const x: number = clamp(Math.round(frame.x), 0, Math.max(0, source.width - 1));
    const y: number = clamp(Math.round(frame.y), 0, Math.max(0, source.height - 1));
    return {
        x,
        y,
        width: clamp(Math.round(frame.width), 1, Math.max(1, source.width - x)),
        height: clamp(Math.round(frame.height), 1, Math.max(1, source.height - y)),
    };
}

/**
 * Тип результата. Без выбранного формата берётся формат исходника, и png, когда
 * он не из трёх.
 */
export function resultType(format: IRtImageCropper.Format | null | undefined, sourceType: string): string {
    if (format) {
        return `image/${format}`;
    }
    return OWN_TYPES.includes(sourceType) ? sourceType : 'image/png';
}

/** Качество холста — доля единицы; вход берёт проценты */
export function resultQuality(quality: number): number {
    return Number.isFinite(quality) ? clamp(quality, 0, 100) / 100 : RT_IMAGE_CROPPER_QUALITY / 100;
}

/** Имя файла результата: основа имени исходника и расширение по типу результата */
export function resultFileName(sourceName: string, type: string): string {
    const extension: string = type === 'image/jpeg' ? 'jpg' : type.replace('image/', '');
    const dot: number = sourceName.lastIndexOf('.');
    let base: string = sourceName || 'image';
    if (dot > 0) {
        base = sourceName.slice(0, dot);
    }
    return `${base}.${extension}`;
}
