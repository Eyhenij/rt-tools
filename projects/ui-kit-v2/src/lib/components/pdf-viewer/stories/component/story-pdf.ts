/**
 * Документ витрины собирается байтами на месте, а не грузится из сети: кадр снимка обязан
 * повторяться, а запрос по сети успевает завершиться не всегда.
 *
 * Страницы нарисованы фигурами без текста: шрифт без вложения рисовальщик подменяет системным, и
 * кадр на другой машине разошёлся бы с эталоном.
 */

/** Лист A4 в пунктах. */
const PAGE_WIDTH: number = 595;
const PAGE_HEIGHT: number = 842;

/** Рисунок страницы: шапка, строки «текста» разной длины и номер страницы полосками внизу. */
function pageContent(pageNumber: number): string {
    const commands: string[] = ['0.18 0.36 0.55 rg', `56 ${PAGE_HEIGHT - 120} ${PAGE_WIDTH - 112} 48 re f`, '0.75 0.75 0.75 rg'];
    for (let line: number = 0; line < 24; line++) {
        const width: number = PAGE_WIDTH - 112 - ((line * 37 + pageNumber * 53) % 160);
        commands.push(`56 ${PAGE_HEIGHT - 170 - line * 24} ${width} 10 re f`);
    }
    commands.push('0.3 0.3 0.3 rg');
    for (let mark: number = 0; mark < pageNumber; mark++) {
        commands.push(`${PAGE_WIDTH / 2 - pageNumber * 6 + mark * 12} 40 8 16 re f`);
    }

    return commands.join('\n');
}

/** Собирает документ из `pages` страниц A4 с верной таблицей смещений. */
export function storyPdf(pages: number): Uint8Array {
    const objects: string[] = [];
    const kids: string[] = [];
    for (let page: number = 0; page < pages; page++) {
        const pageId: number = 3 + page * 2;
        const contentId: number = pageId + 1;
        const content: string = pageContent(page + 1);
        kids.push(`${pageId} 0 R`);
        objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R >>`;
        objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    }
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages} >>`;

    let body: string = '%PDF-1.4\n';
    const offsets: number[] = [];
    for (let id: number = 1; id < objects.length; id++) {
        offsets[id] = body.length;
        body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xref: number = body.length;
    body += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id: number = 1; id < objects.length; id++) {
        body += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    }
    body += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

    return new TextEncoder().encode(body);
}
