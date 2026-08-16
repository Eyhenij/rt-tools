/**
 * Разбор отказов приёмника: один на всё приложение.
 *
 * Отказ называет причину тому, кто спрашивал, а не подробности своего устройства: дерево
 * печатает эту причину владельцу, и «внутренняя ошибка» в ней означает потерянный прогон,
 * разбирать который будет некому. Поэтому известный отказ уходит как есть, недоступное
 * хранилище — как «повтори», а всё остальное — коротким `500` без пересказа внутренностей.
 *
 * Сторон у приёмника две, и говорит он с ними по-разному: дерево привозит груз и слышит про
 * груз, человек читает принятое и слышит про чтение. Разбор один, а не по одному у каждой
 * стороны: две операции решали бы порознь, что считать поломкой хранилища, и разошлись бы на
 * первой же незнакомой ошибке.
 *
 * Отказ, причина которого спрашивавшему не видна, — `500` и `503` — называет номер обращения, и
 * тот же номер уходит в журнал: иначе о поломке рассказывают словами «не работает», и найти её в
 * журнале нечем.
 *
 * Здесь же журнал: отказ приёма записывается с родом груза и признаком дерева, всякий другой —
 * с путём. Ни токена, ни текста груза в строке нет — журнал читают, чтобы понять, что
 * сломалось, а не чтобы прочитать чужое.
 */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { describeError, isStorageFailure } from '@rt/message-bus-api/observability/util';
import { ITreeBearingRequest, TREE_OF_REQUEST } from '@rt/message-bus-api/trees/util';

import { cargoLimit } from './cargo-limit';
import { incidentNumber } from './incident';

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

/** Источник строк лога: по нему отказы приёмника собираются вместе. */
const LOG_CONTEXT: string = 'Failure';

/** Отказ приёма груза: остальное — чтение принятого либо стук не в ту дверь. */
function isIntake(request: TFailingRequest): boolean {
    return request.path.startsWith(INTAKE_PATH);
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
export class FailureFilter implements ExceptionFilter {
    readonly #log: Logger = new Logger(LOG_CONTEXT);

    public catch(error: unknown, host: ArgumentsHost): void {
        const request: TFailingRequest = host.switchToHttp().getRequest<TFailingRequest>();
        const response: IFailingResponse = host.switchToHttp().getResponse<IFailingResponse>();
        const status: number = this.#statusOf(error);
        // Номер заводится один раз и уходит обоими путями сразу: собранный порознь для ответа и
        // для журнала, он был бы двумя разными номерами, и связать их стало бы нечем.
        const incident: string | null = this.#incidentOf(error);

        this.#log.warn(this.#journalName(request), this.#journalFields(error, request, status, incident));

        response.status(status).json({ message: this.#messageOf(error, status, request, incident) });
    }

    #statusOf(error: unknown): number {
        if (error instanceof HttpException) {
            return error.getStatus();
        }

        return isStorageFailure(error) ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    /**
     * Номер заводится только там, где причина спрашивавшему не видна: у поломки хранилища и у
     * незнакомой ошибки. Пусто — отказ объяснил себя сам.
     *
     * Судится род ошибки, а не код ответа: `503` бывает и осознанным — проба живости отвечает им
     * про неготовую службу, и номер обращения к её тексту ничего не прибавил бы.
     */
    #incidentOf(error: unknown): string | null {
        return error instanceof HttpException ? null : incidentNumber();
    }

    /**
     * Имя строки журнала. Постоянное: у приёма своё, у всего остального своё, и по нему строки
     * одного рода собираются вместе. Всё переменное уходит полями.
     */
    #journalName(request: TFailingRequest): string {
        return isIntake(request) ? 'intake.failed' : 'request.failed';
    }

    /**
     * Поля строки журнала.
     *
     * У приёма в них род груза и признак дерева — по ним видно, чей прогон потерян; у всякого
     * другого отказа путь, потому что ни рода, ни дерева у него нет: так пишутся и чтение
     * принятого, и проба живости. Номер обращения стоит там же, где он ушёл в ответ, и только
     * тогда.
     *
     * Разобранная причина кладётся не всегда: отказ по вводу и правам — сработавшая проверка, и
     * её стек забивал бы собой настоящие поломки.
     */
    #journalFields(error: unknown, request: TFailingRequest, status: number, incident: string | null): Record<string, unknown> {
        const named: Record<string, unknown> = isIntake(request)
            ? { cargoKind: cargoKindOf(request), treeSlug: treeSlugOf(request), status }
            : { path: request.path, status };

        const withIncident: Record<string, unknown> = incident ? { ...named, incident } : named;

        return error instanceof HttpException ? withIncident : { ...withIncident, error: { ...describeError(error) } };
    }

    /**
     * Текст для того, кто спрашивал. У известного отказа он свой — его написала операция; у
     * поломки хранилища один на сторону, потому что нужно от него одно: повторить. Незнакомая
     * ошибка не пересказывается вовсе, а вместо пересказа называется номер обращения.
     *
     * Два отказа каркас пишет за приёмник, и оба он пишет непонятно дереву: ненайденная операция
     * и слишком тяжёлое тело. Первый переписывается перечнем родов — дерево, постучавшееся не в
     * тот род, иначе не узнает, какие есть; второй — пределом, иначе отправитель не знает, во
     * что упёрся. Вес приехавшего при этом не называется: обрезанное тело своего веса не знает.
     */
    #messageOf(error: unknown, status: number, request: TFailingRequest, incident: string | null): string {
        if (status === HttpStatus.NOT_FOUND && isIntake(request)) {
            return `приёмник принимает роды: ${CARGO_KINDS.join(', ')}`;
        }
        if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
            return `груз тяжелее предела ${cargoLimit()}`;
        }
        if (incident) {
            return `${this.#blindMessage(status, request)}; обращение ${incident}`;
        }
        if (error instanceof HttpException) {
            const body: string | object = error.getResponse();

            return typeof body === 'string' ? body : String(Reflect.get(body, 'message') ?? error.message);
        }

        // Сюда не приходят: отказ, не бывший отказом каркаса, номер обращения получил выше.
        return this.#blindMessage(status, request);
    }

    /** Что говорится, когда причина спрашивавшему не видна: дереву про груз, человеку про чтение. */
    #blindMessage(status: number, request: TFailingRequest): string {
        const again: boolean = status === HttpStatus.SERVICE_UNAVAILABLE;

        if (isIntake(request)) {
            return again ? 'груз не принят, прогон следует повторить' : 'груз не принят';
        }

        return again ? 'прочитать не удалось, попытку следует повторить' : 'прочитать не удалось';
    }
}
