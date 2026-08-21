/**
 * `POST /api/intake/states` — правка состояния записей груза деревом.
 *
 * Дерево берётся из токена, а не из тела запроса: иначе оно двигало бы состояния соседа,
 * назвавшись им в грузе. Записи чужого дерева поэтому отвечают так же, как ненайденные, —
 * разница в ответах говорила бы, что у соседей есть.
 *
 * Пакет везёт оба рода записей разом: дерево разбирает груз пачкой, и запрос на каждую запись
 * стоил бы столько же, сколько сам разбор. Форма запроса судится до похода в базу и отбивает
 * его целиком; запись, которой у дерева нет, и переход, которого порядок не разрешает,
 * отбиваются построчно — их видно только в хранилище.
 */
import { BadRequestException, Body, Controller, Logger, Post, Req } from '@nestjs/common';

import { TreeOperation } from '@rt/message-bus-api/access/util';
import { ECargoStateDenial, ICargoStateResponse, ICargoStateDeniedLine } from '@rt/message-bus-api/cargo-state/api';
import {
    cargoStateBody,
    ECargoStateBodyFault,
    ECargoStateKind,
    ICargoStateParsed,
    ICargoStateLine,
} from '@rt/message-bus-api/cargo-state/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { movePostmortemStates } from '@rt/message-bus-api/postmortems/data-access';
import { moveProposalStates } from '@rt/message-bus-api/proposals/data-access';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import {
    CARGO_ITEMS_FIELDS,
    cargoFault,
    cargoFaultMessage,
    ECargoStateMove,
    ICargoFault,
    ICargoStateAsk,
    ICargoStateOutcome,
    TCargoBody,
} from '@rt/message-bus-common';

/** Как род груза зовётся в отказе: дерево шлёт правку по двум родам и должно знать, какой отбит. */
const CARGO_KIND: string = 'состояния записей груза';

/**
 * Источник строк журнала этого домена. Задаётся константой, а не литералом в вызове: по нему
 * строки домена собираются вместе, и соседний класс писал бы под тем же именем.
 */
const LOG_CONTEXT: string = 'CargoState';

/**
 * Имя строки о неисполненной строке пакета.
 *
 * Постоянное: значения идут полями. Ответ с отбитыми строками виден одному дереву, и без этой
 * строки правка, не легшая ни разу, не видна никому — ни владельцу, ни разбору происшествия.
 */
const DENIED_LINE: string = 'intake.state.denied';

/** Текст отказа по форме пакета: причина и место строки, если промах у неё. */
function bodyFaultMessage(fault: ECargoStateBodyFault, at: number | null): string {
    const where: string = at === null ? '' : ` в строке ${at}`;

    switch (fault) {
        case ECargoStateBodyFault.NotAList:
            return `в грузе рода «${CARGO_KIND}» поле items ожидается списком строк правки`;
        case ECargoStateBodyFault.Empty:
            return `в грузе рода «${CARGO_KIND}» список строк правки пуст: правке нечего делать`;
        case ECargoStateBodyFault.BadLine:
            return `в грузе рода «${CARGO_KIND}»${where} ожидаются поля kind, key и state строками`;
        case ECargoStateBodyFault.UnknownKind:
            return `в грузе рода «${CARGO_KIND}»${where} род записи назван значением вне набора`;
        default:
            return `в грузе рода «${CARGO_KIND}»${where} состояние названо значением вне набора`;
    }
}

@Controller('intake')
export class CargoStateController {
    readonly #log: Logger = new Logger(LOG_CONTEXT);
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    @Post('states')
    @TreeOperation()
    public async move(@Body() body: unknown, @Req() request: ITreeBearingRequest): Promise<ICargoStateResponse> {
        const tree: IRequestTree = treeOf(request);
        const fault: ICargoFault | null = cargoFault(body, tree.slug, CARGO_ITEMS_FIELDS);

        if (fault) {
            throw new BadRequestException(cargoFaultMessage(fault, CARGO_KIND));
        }

        const parsed: ICargoStateParsed = cargoStateBody((body as TCargoBody)['items']);

        if (parsed.fault !== null || parsed.lines === null) {
            throw new BadRequestException(bodyFaultMessage(parsed.fault as ECargoStateBodyFault, parsed.at));
        }

        return this.#applied(tree, parsed.lines);
    }

    /** Строки одного рода, каким их ждёт запись состояния этого домена. */
    #asked(lines: readonly ICargoStateLine[], kind: ECargoStateKind): ICargoStateAsk[] {
        return lines
            .filter((line: ICargoStateLine): boolean => line.kind === kind)
            .map((line: ICargoStateLine): ICargoStateAsk => ({ key: line.key, state: line.state }));
    }

    /**
     * Ответ дереву: два числа и отбитые строки.
     *
     * Оба рода правятся своими запросами и своими сделками: таблицу правит тот домен, чья она.
     * Одной сделкой на оба рода это не сводится — и не должно: строки правки друг от друга не
     * зависят, отметка по одной записи верна независимо от соседней.
     */
    async #applied(tree: IRequestTree, lines: readonly ICargoStateLine[]): Promise<ICargoStateResponse> {
        const [postmortems, proposals]: [ICargoStateOutcome[], ICargoStateOutcome[]] = await Promise.all([
            movePostmortemStates(this.#prisma, tree.id, this.#asked(lines, ECargoStateKind.Postmortem)),
            moveProposalStates(this.#prisma, tree.id, this.#asked(lines, ECargoStateKind.Proposal)),
        ]);
        const moves: Map<string, ECargoStateMove | null> = new Map();

        for (const outcome of [...postmortems, ...proposals]) {
            moves.set(outcome.key, outcome.move);
        }

        const denied: ICargoStateDeniedLine[] = [];
        let changed: number = 0;
        let same: number = 0;

        for (const line of lines) {
            const move: ECargoStateMove | null | undefined = moves.get(line.key);

            if (move === ECargoStateMove.Allowed) {
                changed += 1;
            } else if (move === ECargoStateMove.Same) {
                same += 1;
            } else {
                denied.push({
                    at: line.at,
                    kind: line.kind,
                    key: line.key,
                    denial: move === ECargoStateMove.Denied ? ECargoStateDenial.Forbidden : ECargoStateDenial.Missing,
                });
            }
        }

        this.#told(tree, denied);

        return { tree: tree.slug, changed, same, denied };
    }

    /**
     * Отбитые строки — в журнал приёмника, по строке на каждую.
     *
     * Уровень ниже отказа: приложение работает, а отбой — это сработавшая проверка. В полях род
     * записи, признак дерева и причина; ни токена, ни текста записи в них нет — журнал читают,
     * чтобы понять, что сломалось, а не чтобы прочитать чужое. Ключ записи туда тоже не идёт:
     * у предложения им служит признак его текста, и по нему текст находится у самого дерева.
     */
    #told(tree: IRequestTree, denied: readonly ICargoStateDeniedLine[]): void {
        for (const line of denied) {
            this.#log.warn(DENIED_LINE, { tree: tree.slug, kind: line.kind, denial: line.denial });
        }
    }
}
