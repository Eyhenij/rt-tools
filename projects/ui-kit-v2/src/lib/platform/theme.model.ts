/**
 * Режим темы оформления. Применяется к `<html data-theme="...">`.
 * Persistence — через `StorageService` из `@rt-tools/core` (см. `ThemeService`).
 */
export namespace ITheme {
    export type Mode = 'light' | 'dark';
}
