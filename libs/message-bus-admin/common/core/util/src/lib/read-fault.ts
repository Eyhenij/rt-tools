/**
 * Чем кончилось чтение груза, если не грузом.
 *
 * Родов четыре, и каждый ведёт к своему действию человека. `Session` — «вход кончился»: экран
 * уводит на вход, а не показывает отказ. `Missing` — «этой записи нет»: панель говорит об этом
 * прямо, потому что ссылка на запись переживает её исчезновение. `Timeout` — «служба молчит
 * дольше положенного»: повторить. `Service` — всё остальное; человеку про него сказать нечего,
 * кроме номера обращения, по которому поломку находят в журнале.
 */
export enum EReadFault {
    Session = 'session',
    Missing = 'missing',
    Timeout = 'timeout',
    Service = 'service',
}

/** Отказ чтения, каким его показывает экран: род и номер обращения, если приёмник его назвал. */
export interface IReadFault {
    readonly kind: EReadFault;
    /** Номер обращения. Пусто — приёмник его не называл: у известного отказа номера нет. */
    readonly incident: string;
}

/**
 * Номер обращения в тексте отказа.
 *
 * Приёмник ставит его строкой «обращение <номер>» и отдельным полем не отдаёт: тем же текстом
 * он ложится в журнал, и разделение на два поля развело бы две редакции одного и того же.
 */
const INCIDENT: RegExp = /обращение\s+([0-9a-f]+)/i;

/** Номер обращения из тела ответа; пусто — его там нет. */
export function incidentOf(body: unknown): string {
    const message: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'message') : body;
    if (typeof message !== 'string') {
        return '';
    }

    return INCIDENT.exec(message)?.[1] ?? '';
}

/**
 * Род отказа по коду ответа.
 *
 * `401` — вход кончился или его не было: тем же кодом отбивается просроченный вход, отозванный
 * и предъявленный токеном дерева, и все три означают для человека одно — представиться заново.
 * `404` — записи нет. `0` каркас ставит обрыву связи и вышедшему сроку ожидания. Остальное —
 * отказ службы.
 */
export function readFaultKind(status: number): EReadFault {
    if (status === 401) {
        return EReadFault.Session;
    }

    if (status === 404) {
        return EReadFault.Missing;
    }

    if (status === 0) {
        return EReadFault.Timeout;
    }

    return EReadFault.Service;
}

/** Отказ целиком: род и номер обращения. Чистая функция — проверяется без поднятого экрана. */
export function readFaultOf(status: number, body: unknown): IReadFault {
    return { kind: readFaultKind(status), incident: incidentOf(body) };
}
