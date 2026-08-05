/**
 * Модель `<rt-toggle-switch>`: один корневой неймспейс с префиксом `I`.
 */

export namespace IRtToggleSwitch {
    /**
     * Размерный тир трека. Маппинг на пиксели — в SCSS
     * (`--rt-toggle-track-width` / `-height` / `--rt-toggle-thumb-size`).
     * Default — `sm`: он совпадает по высоте с плотными контролами формы,
     * где тоггл стоит в ряду с текстом.
     */
    export type Size = 'sm' | 'md' | 'lg';
}
