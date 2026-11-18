/*
 * Вход @rt-tools/ui-kit-v2/ai-chat-chart — блок графика в ответе ассистента. Он нужен и чату из
 * входа rich-editor, и графику из входа chart, поэтому стоит отдельно: в rich-editor он сделал бы
 * d3 зависимостью каждого редактора, в chart — quill зависимостью каждого графика.
 */

export * from './lib/ai-chat-chart.enum';
export * from './lib/ai-chat-chart.model';
