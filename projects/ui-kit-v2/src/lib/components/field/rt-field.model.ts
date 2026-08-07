import { RtKitLabelKey } from '../../i18n';

/** Контракт поля-обёртки common/ui. */
export namespace IRtField {
    /** Карта validatorKey → человекочитаемое сообщение. */
    export type ErrorMessages = Record<string, string>;
}

/**
 * Ключи сообщений об ошибках по имени валидатора (перекрываются input'ом
 * [errors] поштучно, уже готовым текстом).
 *
 * Здесь ключи, а не переводы: карта собирается при загрузке модуля, когда язык
 * страницы ещё неизвестен, и готовый текст остался бы на языке по умолчанию
 * даже под переведённой подписью поля. Переводит сам компонент поля.
 */
export const RT_FIELD_DEFAULT_ERROR_KEYS: Readonly<Record<string, RtKitLabelKey>> = {
    required: 'fieldErrorRequired',
    email: 'fieldErrorEmail',
    minlength: 'fieldErrorMinLength',
    maxlength: 'fieldErrorMaxLength',
    min: 'fieldErrorMin',
    max: 'fieldErrorMax',
    pattern: 'fieldErrorPattern',
};

/** Текст-плейсхолдер read-only поля без значения. */
export const RT_FIELD_EMPTY_VALUE: string = '—';
