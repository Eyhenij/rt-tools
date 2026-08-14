/**
 * Разбор отказов приёмника: один на всё приложение.
 *
 * Отказ называет причину дереву, а не подробности своего устройства: дерево печатает эту причину
 * владельцу, и «внутренняя ошибка» в ней означает потерянный прогон, разбирать который будет
 * некому. Поэтому известный отказ уходит как есть, недоступное хранилище — как «повтори прогон»,
 * а всё остальное — коротким `500` без пересказа внутренностей.
 *
 * Здесь же журнал: каждый отказ записывается с родом груза и признаком дерева. Ни токена, ни
 * текста груза в строке нет — журнал читают, чтобы понять, что сломалось, а не чтобы прочитать
 * чужое.
 *
 * Разбор один, а не по одному у каждой операции: три операции решали бы порознь, что считать
 * поломкой хранилища, и разошлись бы на первой же незнакомой ошибке.
 */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { ITreeBearingRequest, TREE_OF_REQUEST } from '@rt/message-bus-api/trees/util';

import { cargoLimit } from './cargo-limit';

/** Роды груза, которые приёмник принимает. Названы дереву, когда оно постучалось не в тот род. */
const CARGO_KINDS: readonly string[] = ['summary', 'proposals', 'postmortems'];

/** Путь, по которому приезжает груз: по нему видно, что незнакомая операция — это род, а не опечатка. */
const INTAKE_PATH: string = '/api/intake';

/**
 * Что разбор берёт от запроса и ответа.
 *
 * Объявлено здесь, а не взято из типов каркаса отдачи: своих типов он не несёт, а лежащие в
 * дереве описывают его прошлую редакцию. Нужно отсюда двое — путь, по которому виден род груза,
 * и постановка кода с телом.
 */
type TFailingRequest = ITreeBearingRequest & { path: string };

interface IFailingResponse {
    status(code: number): IFailingResponse;
    json(body: unknown): unknown;
}

/** Источник строк лога: по нему отказы приёма собираются вместе. */
const LOG_CONTEXT: string = 'Intake';

/**
 * Отказ клиента хранилища.
 *
 * Узнаётся по имени рода: генератор кладёт свои ошибки классами `PrismaClient*`, и это
 * единственное, что у них общего. Разбирать их по коду значило бы держать здесь список кодов
 * хранилища — он длиннее, чем разница, которая отсюда видна: база ответила или нет.
 */
function isStorageFailure(error: unknown): boolean {
    return error instanceof Error && error.name.startsWith('PrismaClient');
}

/** Род груза — по пути запроса: `POST /api/intake/summary` называет свой род последним отрезком. */
function cargoKindOf(request: TFailingRequest): string {
    return request.path.split('/').filter(Boolean).at(-1) ?? 'неизвестен';
}

/** Признак дерева, опознанного по токену. Пусто — токен не принят, и дерева у запроса нет. */
function treeSlugOf(request: TFailingRequest): string {
    return request[TREE_OF_REQUEST]?.slug ?? 'не опознано';
}

@Catch()
export class IntakeFailureFilter implements ExceptionFilter {
    readonly #log: Logger = new Logger(LOG_CONTEXT);

    public catch(error: unknown, host: ArgumentsHost): void {
        const request: TFailingRequest = host.switchToHttp().getRequest<TFailingRequest>();
        const response: IFailingResponse = host.switchToHttp().getResponse<IFailingResponse>();
        const status: number = this.#statusOf(error);
        const message: string = this.#messageOf(error, status, request);

        this.#log.warn(`отказ приёма: род ${cargoKindOf(request)}, дерево ${treeSlugOf(request)}, код ${status}`);

        response.status(status).json({ message });
    }

    #statusOf(error: unknown): number {
        if (error instanceof HttpException) {
            return error.getStatus();
        }

        return isStorageFailure(error) ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    /**
     * Текст для дерева. У известного отказа он свой — его написала операция; у поломки хранилища
     * один на всех, потому что дереву от него нужно одно: повторить прогон. Незнакомая ошибка не
     * пересказывается вовсе.
     *
     * Два отказа каркас пишет за приёмник, и оба он пишет непонятно дереву: ненайденная операция
     * и слишком тяжёлое тело. Первый переписывается перечнем родов — дерево, постучавшееся не в
     * тот род, иначе не узнает, какие есть; второй — пределом, иначе отправитель не знает, во
     * что упёрся. Вес приехавшего при этом не называется: обрезанное тело своего веса не знает.
     */
    #messageOf(error: unknown, status: number, request: TFailingRequest): string {
        if (status === HttpStatus.NOT_FOUND && request.path.startsWith(INTAKE_PATH)) {
            return `приёмник принимает роды: ${CARGO_KINDS.join(', ')}`;
        }
        if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
            return `груз тяжелее предела ${cargoLimit()}`;
        }
        if (error instanceof HttpException) {
            const body: string | object = error.getResponse();

            return typeof body === 'string' ? body : String(Reflect.get(body, 'message') ?? error.message);
        }

        return status === HttpStatus.SERVICE_UNAVAILABLE ? 'груз не принят, прогон следует повторить' : 'груз не принят';
    }
}
