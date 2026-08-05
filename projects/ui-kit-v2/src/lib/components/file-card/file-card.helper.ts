import { IRtIcon } from '../icon/rt-icon.model';

/** Иконка Word-семейства (несколько расширений делят один глиф). */
const ICON_WORD: IRtIcon.Name = 'attach-docx-doc';

/** Иконка растровых изображений. */
const ICON_IMAGE: IRtIcon.Name = 'attach-jpg-png';

/** Иконка презентаций. */
const ICON_PRESENTATION: IRtIcon.Name = 'attach-ppt-pptx';

/** Иконка таблиц Excel-семейства. */
const ICON_SPREADSHEET: IRtIcon.Name = 'attach-xlsx-xls';

/** Иконка архивов. */
const ICON_ARCHIVE: IRtIcon.Name = 'attach-zip-rar';

/** Иконка web-форматов изображений/видео. */
const ICON_WEB_MEDIA: IRtIcon.Name = 'attach-webp';

/**
 * Маппинг расширения файла → имя цветной иконки типа (`attach-*` в rt-icon-реестре).
 */
const FILE_TYPE_ICON: Readonly<Record<string, IRtIcon.Name>> = {
    doc: ICON_WORD,
    docx: ICON_WORD,
    odt: ICON_WORD,
    gif: ICON_IMAGE,
    jpg: ICON_IMAGE,
    jpeg: ICON_IMAGE,
    png: ICON_IMAGE,
    pdf: 'attach-pdf',
    ppt: ICON_PRESENTATION,
    pptx: ICON_PRESENTATION,
    txt: 'attach-txt',
    webp: ICON_WEB_MEDIA,
    webm: ICON_WEB_MEDIA,
    xls: ICON_SPREADSHEET,
    xlsx: ICON_SPREADSHEET,
    zip: ICON_ARCHIVE,
    rar: ICON_ARCHIVE,
    msg: 'attach-msg',
    eml: 'attach-eml',
};

/**
 * Возвращает имя иконки типа файла по его имени (берётся расширение после
 * последней точки). Неизвестное/отсутствующее расширение → нейтральный `attach-other`.
 */
export function getFileTypeIcon(fileName: string): IRtIcon.Name {
    const ext: string = fileName.split('.').pop()?.toLowerCase() ?? '';
    return FILE_TYPE_ICON[ext] ?? 'attach-other';
}

/**
 * Выводит читаемый заголовок из имени файла: отбрасывает расширение и заменяет
 * разделители `_`/`-` на пробелы (CamelCase намеренно НЕ разбивается — это давало
 * бы непредсказуемый результат на произвольных именах). Если после очистки строка
 * пустая (например имя было `.pdf`) — возвращается исходное имя.
 */
export function deriveFileTitle(fileName: string): string {
    const withoutExt: string = fileName.replace(/\.[^./\\]+$/, '');
    const cleaned: string = withoutExt.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned || fileName;
}
