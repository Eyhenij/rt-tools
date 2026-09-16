import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import type { Page } from 'playwright';

/**
 * Улика о разошедшемся кадре второго кита: условия съёмки и сам кадр расхождения.
 *
 * Отдельный файл, а не кусок обвязки: обвязка уже на пределе длины, а укладка улики — своя работа
 * со своими двумя выходами наружу. Общего с первым китом файла здесь нет намеренно: киты разведены,
 * и правка ради второго роняла бы эталоны первого.
 */

/**
 * Куда складывается улика.
 *
 * Вне дерева намеренно: следующий прогон её не трогает, и в ветку она не уезжает.
 */
const EVIDENCE_DIR: string = `${process.cwd()}/.rt-snapshot-evidence`;

/**
 * Условия страницы на минуту разошедшегося кадра.
 *
 * Сюда взято знакоместо цифры, а не ширина видимой подписи: браузер считает собственную ширину
 * поля именно по нему, а подпись кита кириллическая и рисуется запасным начертанием — она
 * одинакова и тогда, когда объявленное начертание нашлось, и тогда, когда нет. Сессия, искавшая
 * причину разъезда поля переписки, потратила час ровно на то, что мерила подпись.
 */
export async function conditionsOfPage(page: Page): Promise<Record<string, unknown>> {
    try {
        return await page.evaluate((): Record<string, unknown> => {
            const probe: HTMLSpanElement = document.createElement('span');
            probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-size:14px';
            probe.textContent = '0'.repeat(20);
            document.body.appendChild(probe);

            const advanceOf: (family: string) => number = (family: string): number => {
                probe.style.fontFamily = family;

                return Math.round((probe.getBoundingClientRect().width / 20) * 1000) / 1000;
            };

            const kit: string = getComputedStyle(document.body).fontFamily;
            const measured: Record<string, number> = {
                'набором кита': advanceOf(kit),
                'system-ui': advanceOf('system-ui'),
                'sans-serif': advanceOf('sans-serif'),
                monospace: advanceOf('monospace'),
            };
            probe.remove();

            return {
                'набор начертаний': kit,
                'знакоместо цифры': measured,
                'плотность точек': window.devicePixelRatio,
                'страница целиком': `${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`,
            };
        });
    } catch {
        return { условия: 'страница не отвечает' };
    }
}

/**
 * Складывает улику рядом с отказом.
 *
 * Расхождение, выпадающее редко, иначе нечем разбирать: прогон говорит «стало другим» и молчит о
 * том, при каких условиях. Отказ самой укладки проглатывается — сверка всё равно провалена, и её
 * отказ важнее.
 *
 * Путь кадра расхождения приходит снаружи: где лежат снимки, знает обвязка, и второе объявление
 * того же каталога разошлось бы с первым молча.
 */
export function keepEvidence(id: string, facts: Record<string, unknown>, diff: string): void {
    try {
        const stamp: string = new Date().toISOString().replace(/[:.]/g, '-');
        const dir: string = `${EVIDENCE_DIR}/${id}--${stamp}`;
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}/условия.json`, JSON.stringify(facts, null, 4), 'utf8');

        if (existsSync(diff)) {
            copyFileSync(diff, `${dir}/${id}-diff.png`);
        }
    } catch {
        // Улику не сложили — сравнение всё равно провалено, и его отказ важнее.
    }
}
