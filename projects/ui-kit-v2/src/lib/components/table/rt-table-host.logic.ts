/**
 * Роль хоста: у native `<table rt-table>` она есть от самого тега, а элементному
 * `<rt-table>` её ставим сами. Без неё скрин-ридер читает список строками текста: роли
 * строк и ячеек CDK проставляет сам, а роли самой таблицы у него нет, и проставленные
 * остаются висеть вне таблицы.
 */
export function rtTableHostRoleOf(host: HTMLElement): 'table' | null {
    return host.tagName === 'RT-TABLE' ? 'table' : null;
}
