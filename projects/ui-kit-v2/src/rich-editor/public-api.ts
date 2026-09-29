/*
 * Вход @rt-tools/ui-kit-v2/rich-editor — компоненты, которые работают на библиотеке quill: редактор
 * текста, поле ввода сообщения и чат. Они стоят отдельным входом, чтобы приложение без них
 * собиралось без quill: из основного входа сборщик разрешал бы import('quill') всегда.
 */

export * from './lib/components/rich-editor';
export * from './lib/components/message-composer';
export * from './lib/components/chat';
export * from './lib/pipes';
