/**
 * `POST /api/intake/close` — закрытие записей груза издателем редакции.
 *
 * Второй путь к состоянию записи, а не замена первому. Своё состояние двигает приславшее дерево
 * токеном — это остаётся; но у записи есть второй читатель: тот, у кого предложение соседа входит
 * в редакцию пакета. Токеном соседа он не владеет, а своим двигать чужую запись нельзя, и без
 * этой операции сотня чужих записей стоит в «новом», давно лёжа в пакете.
 *
 * Закрыта входом человека, а не токеном: токен отвечает за своё дерево, и открыть им чужую запись
 * значило бы вернуть ровно то, от чего разведены два способа представиться — утёкший токен двигал
 * бы состояния всех деревьев разом.
 *
 * Запись ищется признаком из чтения, а не ключом отправителя: имя файла и признак текста
 * уникальны у своего дерева, а не в приёме, и названный ключ нашёл бы у двух деревьев две записи.
 * Признак приезжает тем же чтением, каким издатель груз и видит.
 */
import { BadRequestException, Body, Controller, Logger, Post, Req } from '@nestjs/common';

import { SessionOperation } from '@rt/message-bus-api/access/util';
import { accountOf, IAccountBearingRequest, IRequestAccount } from '@rt/message-bus-api/accounts/util';
import { ECargoStateDenial, ICargoCloseResponse } from '@rt/message-bus-api/cargo-state/api';
import { cargoStateBody, ECargoStateBodyFault, ICargoStateParsed, ICargoStateLine } from '@rt/message-bus-api/cargo-state/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { closePostmortems } from '@rt/message-bus-api/postmortems/data-access';
import { closeProposals } from '@rt/message-bus-api/proposals/data-access';
import { ECargoKind, ECargoStateMove, ICargoCloseOutcome, TCargoBody } from '@rt/message-bus-common';

import { cargoLinesAsked, cargoLinesFaultMessage, cargoLinesTally, cargoLinesValueDenials, ICargoLinesTally } from './cargo-state.lines';

/** Как род груза зовётся в отказе: пакетов у приёма два, и издатель должен знать, какой отбит. */
const CARGO_KIND: string = 'закрытия записей груза';

/**
 * Источник строк журнала. Тот же, что у правки состояния деревом: строки об одной колонке
 * собираются вместе — иначе, разбирая, кто и когда двинул запись, пришлось бы читать два места.
 */
const LOG_CONTEXT: string = 'CargoState';

/** Имя строки о закрытии: без неё правка чужих записей не видна никому, кроме самого соседа. */
const CLOSED_LINE: string = 'intake.close.applied';

/** Имя строки о неисполненной строке пакета. */
const DENIED_LINE: string = 'intake.close.denied';

@Controller('intake')
export class CargoCloseController {
    readonly #log: Logger = new Logger(LOG_CONTEXT);
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Закрыть пачку записей.
     *
     * Пакет приезжает без признака дерева, в отличие от пакета правки: издатель закрывает записи
     * нескольких деревьев разом, и одно имя в шапке солгало бы про остальные строки.
     */
    @Post('close')
    @SessionOperation()
    public async close(@Body() body: unknown, @Req() request: IAccountBearingRequest): Promise<ICargoCloseResponse> {
        const items: unknown = typeof body === 'object' && body !== null ? (body as TCargoBody)['items'] : null;
        const parsed: ICargoStateParsed = cargoStateBody(items);

        if (parsed.fault !== null || parsed.lines === null) {
            throw new BadRequestException(cargoLinesFaultMessage(parsed.fault as ECargoStateBodyFault, parsed.at, CARGO_KIND));
        }

        return this.#applied(accountOf(request), parsed.lines);
    }

    /**
     * Ответ издателю: два числа и отбитые строки.
     *
     * Оба рода закрываются своими запросами и своими сделками — таблицу правит тот домен, чья
     * она, — и строки друг от друга не зависят: закрытие одной записи верно независимо от
     * соседней.
     */
    async #applied(account: IRequestAccount, lines: readonly ICargoStateLine[]): Promise<ICargoCloseResponse> {
        const byValue: Map<number, ECargoStateDenial> = cargoLinesValueDenials(lines);
        const sound: readonly ICargoStateLine[] = lines.filter((line: ICargoStateLine): boolean => !byValue.has(line.at));
        const [postmortems, proposals]: [ICargoCloseOutcome[], ICargoCloseOutcome[]] = await Promise.all([
            closePostmortems(this.#prisma, cargoLinesAsked(sound, ECargoKind.Postmortem)),
            closeProposals(this.#prisma, cargoLinesAsked(sound, ECargoKind.Proposal)),
        ]);
        const outcomes: readonly ICargoCloseOutcome[] = [...postmortems, ...proposals];
        const moves: Map<string, ECargoStateMove | null> = new Map();

        for (const outcome of outcomes) {
            moves.set(outcome.key, outcome.move);
        }

        const tally: ICargoLinesTally = cargoLinesTally(lines, byValue, moves);

        this.#told(account, outcomes, tally);

        return tally;
    }

    /**
     * Закрытие — в журнал приёмника: кто закрыл, сколько записей и чьи это деревья.
     *
     * Деревья названы потому, что правка тут чужая: строка без них не говорит, кому закрытие
     * видно, — а видно оно как раз соседу, который о нём не просил. Ключей и текстов записей в
     * строке нет, как и у правки деревом: журнал читают, чтобы понять, что произошло, а не чтобы
     * прочитать чужое.
     */
    #told(account: IRequestAccount, outcomes: readonly ICargoCloseOutcome[], tally: ICargoLinesTally): void {
        const trees: Set<string> = new Set();

        for (const outcome of outcomes) {
            if (outcome.tree !== null && outcome.move !== null) {
                trees.add(outcome.tree);
            }
        }

        this.#log.log(CLOSED_LINE, { account: account.name, changed: tally.changed, same: tally.same, trees: [...trees] });

        for (const line of tally.denied) {
            this.#log.warn(DENIED_LINE, { account: account.name, kind: line.kind, denial: line.denial });
        }
    }
}
