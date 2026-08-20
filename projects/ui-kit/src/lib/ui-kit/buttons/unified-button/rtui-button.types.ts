/**
 * Виды кнопки — своим файлом, а не в файле компонента.
 *
 * Настройка кита называет вид кнопки по умолчанию и берёт эти же типы: объявленные в файле
 * компонента, они замыкали круг «кнопка → настройка → кнопка». Круг из одних типов сборка
 * переживает, но живёт он ровно до первой правки, которая добавит к нему значение.
 */
export namespace IRtuiButton {
    export type Type = 'icon' | 'fab' | 'pill';
    export type Variant = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'accent';
    export type Size = 'xs' | 'sm' | 'md' | 'lg';
    export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';
    export type Appearance = 'solid' | 'outline' | 'light' | 'text';
    export type IconPosition = 'start' | 'end';
}
