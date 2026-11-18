/** Сохраняет картинку по адресу данных как файл: ссылка со скачиванием живёт ровно один щелчок. */
export function rtAiChatChartSave(doc: Document, url: string, fileName: string): void {
    const anchor: HTMLAnchorElement = doc.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    doc.body.append(anchor);
    anchor.click();
    anchor.remove();
}
