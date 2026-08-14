/**
 * Предложения к записи месяца: копятся, а не замещаются.
 *
 * Сводка отвечает на вопрос «как дела сейчас», предложения — «что случилось за месяц». Дерево
 * при этом шлёт файл предложений целиком, и без отбора уже приехавшего каждый прогон заводил бы
 * копии всего накопленного.
 *
 * Отбор держит уникальность пары «запись месяца — текст», а не проверка чтением: два прогона
 * приезжают одновременно, и прочитанное первым устареет раньше, чем он допишет своё.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Одно предложение, каким оно ложится в хранилище. */
export interface IProposalRow {
    readonly text: string;
    readonly address: string;
    readonly resource: string;
}

/**
 * Дописать к записи месяца те предложения, которых в ней ещё не было.
 *
 * Все записи одной операции ложатся вместе: пять предложений, из которых упало третье, оставили
 * бы запись месяца в состоянии, которого не было ни до, ни после. Держится это одной командой
 * вставки — не пятью подряд.
 *
 * Возвращает, сколько записей легло: остальные приехали повторно и уже лежали.
 */
export async function addProposals(prisma: PrismaService, recordId: string, items: readonly IProposalRow[]): Promise<number> {
    if (items.length === 0) {
        return 0;
    }

    const written: { count: number } = await prisma.proposal.createMany({
        data: items.map((item: IProposalRow) => ({
            recordId,
            text: item.text,
            address: item.address,
            resource: item.resource,
        })),
        // Уже приехавшее пропускается, а не отбивает вставку: дерево шлёт файл целиком, и
        // повтор здесь — это правило, а не промах отправителя
        skipDuplicates: true,
    });

    return written.count;
}
