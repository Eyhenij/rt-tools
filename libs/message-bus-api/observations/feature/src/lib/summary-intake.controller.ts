/**
 * `POST /api/intake/summary` — сводка последнего прогона дерева.
 *
 * Заводит запись месяца или обновляет её: одна на пару «дерево — месяц». Сводка замещает
 * прежнюю целиком — окна прогонов перекрываются, и сложение завышало бы числа молча.
 *
 * Месяц берётся по часам приёмника во всемирном времени: деревья стоят в разных поясах, и
 * граница месяца, взятая у отправителя, положила бы две записи на один месяц. Наблюдения
 * прошлого месяца, приехавшие первым прогоном нового, ложатся в новый — резать сводку приёмник
 * не может, он видит числа, а не строки, из которых те собраны.
 */
import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { IMonthRecordWritten, writeMonthSummary } from '@rt/message-bus-api/observations/data-access';
import { SUMMARY_FIELDS } from '@rt/message-bus-api/observations/util';
import { IIntakeAccepted } from '@rt-tools/agent-kit/cargo';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import { cargoFault, cargoFaultMessage, cargoSchemaOf, ICargoFault, IIntakeResponse, monthOf, TCargoBody } from '@rt/message-bus-common';

/** Как род груза зовётся в отказе: дерево шлёт три рода и должно знать, какой из них отбит. */
const CARGO_KIND: string = 'сводка';

@Controller('intake')
export class SummaryIntakeController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('summary')
    public async accept(
        @Body() body: unknown,
        @Req() request: ITreeBearingRequest,
        @Res({ passthrough: true }) response: IIntakeResponse
    ): Promise<IIntakeAccepted> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, SUMMARY_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        // Проверка формы уже прошла, и тело здесь — набор полей: `cargoFault` отбил бы всё
        // остальное первой же веткой
        const cargo: TCargoBody = body as TCargoBody;
        const ranAt: Date = new Date();
        const written: IMonthRecordWritten = await this.#write(cargo, tree.id, ranAt);

        // Заведена — `201`, обновлена — `200`. Дерево печатает это владельцу вместе с месяцем:
        // по коду видно, первый ли это прогон месяца
        response.status(written.created ? HttpStatus.CREATED : HttpStatus.OK);

        return { tree: tree.slug, month: written.month, created: written.created };
    }

    /**
     * Запись месяца сводкой последнего прогона.
     *
     * Отказ хранилища здесь не ловится: недоступную базу разбирает один разбор отказов на всё
     * приложение. Поймай его операция — каждая решала бы сама, что считать поломкой хранилища, и
     * три решения разошлись бы на первой же незнакомой ошибке.
     */
    async #write(cargo: TCargoBody, treeId: string, ranAt: Date): Promise<IMonthRecordWritten> {
        return writeMonthSummary(this.#prisma, {
            treeId,
            month: monthOf(ranAt),
            // Сводка ложится целиком, как приехала: незнакомое поле остаётся в записи, а
            // незнакомая версия схемы помечает её собой — отказ терял бы отрезок целиком, а
            // дерево о новой редакции пакета узнаёт не сразу и не всегда
            summary: cargo,
            schema: cargoSchemaOf(cargo),
            ranAt,
        });
    }
}
