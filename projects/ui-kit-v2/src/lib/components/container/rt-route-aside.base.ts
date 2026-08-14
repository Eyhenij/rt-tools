import {
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    Injector,
    isSignal,
    OnInit,
    Signal,
    signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, PristineChangeEvent } from '@angular/forms';
import { ActivatedRoute, ParamMap, Params, Router, UrlTree } from '@angular/router';

import {
    catchError,
    exhaustMap,
    filter,
    finalize,
    map,
    mergeMap,
    Observable,
    of,
    shareReplay,
    startWith,
    Subject,
    switchMap,
    take,
    tap,
} from 'rxjs';

import { NotificationBus } from '../../platform';

import { RtAsideUnsavedDialogComponent } from '../aside/unsaved-dialog/rt-aside-unsaved-dialog.component';
import {
    ERtAsideCloseIntent,
    ERtAsideUnsavedOutcome,
    IRtAsideUnsavedGuard,
    resolveCloseIntent,
} from '../aside/unsaved-dialog/rt-aside-unsaved.logic';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { RtContainerRightSidenavPanelDirective } from './rt-container.directives';
import { rootSegmentsOf } from './rt-route-aside.logic';
import { RtRouteAsideRegistry } from './rt-route-aside.registry';

/**
 * Одна мутация, запущенная через `runMutation()`: сам поток операции + готовые
 * success/error-handler'ы (замыкают `opts` вызова) — payload конструкторного стрима.
 */
interface IRtRouteAsideMutation {
    op$: Observable<unknown>;
    handleSuccess: () => void;
    handleError: (error: unknown) => void;
}

/**
 * Открытие ждёт `panel.ready()`, а не `ngAfterViewInit`: на F5 rt-container
 * создаёт overlay асинхронно, иначе `open()` гонится с ещё не готовым overlay.
 *
 * `@Directive()` без селектора — чтобы query/`inject`/lifecycle наследовались на
 * конкретный `@Component` (как `RtFormControlBase`).
 *
 * Закрытие всегда идёт через `onClose()`, куда сходятся все четыре пути: две
 * кнопки панели и — через `onCancel()` — нажатие мимо панели и Esc, которые ловит
 * `rt-container`. Панель, поставившая гард через `guardUnsavedChanges()`, на
 * тронутой форме получает вопрос о правках; панель без гарда закрывается сразу.
 */
@Directive()
export abstract class RtRouteAsideComponent<T> implements OnInit {
    readonly #entity: WritableSignal<T | null> = signal<T | null>(null);
    readonly #entityId: WritableSignal<string | null> = signal<string | null>(null);
    readonly #isCreateMode: WritableSignal<boolean> = signal(false);
    readonly #resolving: WritableSignal<boolean> = signal(false);
    readonly #submitting: WritableSignal<boolean> = signal(false);

    readonly #mutationSource: Subject<IRtRouteAsideMutation> = new Subject<IRtRouteAsideMutation>();
    readonly #refreshSource: Subject<string> = new Subject<string>();
    readonly #closeIntentSource: Subject<void> = new Subject<void>();

    readonly #unsavedGuard: WritableSignal<IRtAsideUnsavedGuard | null> = signal<IRtAsideUnsavedGuard | null>(null);

    /** Связанная запись, на которую панель уйдёт, когда пользователь решит судьбу правок */
    #relatedCommands: readonly unknown[] | null = null;

    /** Параметры адреса связанной записи: у события журнала ими задан отбор списка */
    #relatedQueryParams: Params | null = null;

    readonly #notificationBus: NotificationBus = inject(NotificationBus);
    readonly #dialog: RtDialogService = inject(RtDialogService);
    readonly #injector: Injector = inject(Injector);
    readonly #registry: RtRouteAsideRegistry = inject(RtRouteAsideRegistry);

    #opened: boolean = false;

    /**
     * Уход санкционирован самой панелью, и о правках спрашивать не надо: они либо
     * записаны, либо пользователь уже решил их судьбу. Признак живёт до первого
     * же вопроса о правках и снимается вместе с ответом на него.
     */
    #leaveAllowed: boolean = false;

    /**
     * Вопрос о правках, заданный роутерному уходу и ещё не отвеченный. Второй
     * уход, пришедший пока окно открыто, ждёт того же ответа: своё окно он
     * поставил бы поверх первого, и убрать его было бы некому.
     */
    #pendingAsk$: Observable<boolean> | null = null;

    protected readonly router: Router = inject(Router);
    protected readonly route: ActivatedRoute = inject(ActivatedRoute);
    protected readonly destroyRef: DestroyRef = inject(DestroyRef);

    protected readonly panel: Signal<RtContainerRightSidenavPanelDirective | undefined> = viewChild(RtContainerRightSidenavPanelDirective);

    protected readonly entity: Signal<T | null> = this.#entity.asReadonly();

    /** id из route-параметра как есть (uuid/строка); числовые id консьюмер парсит сам. */
    protected readonly entityId: Signal<string | null> = this.#entityId.asReadonly();
    protected readonly isCreateMode: Signal<boolean> = this.#isCreateMode.asReadonly();
    protected readonly submitting: Signal<boolean> = this.#submitting.asReadonly();

    /**
     * Скелетоны биндятся на это, а не на пустоту `entity()`: та залипает после
     * первой загрузки и не ловит рефетч.
     */
    protected readonly resolving: Signal<boolean> = this.#resolving.asReadonly();

    protected readonly busy: Signal<boolean> = computed((): boolean => this.#submitting() || this.#resolving());

    /**
     * Форма не тронута. Панель, которая не поставила гард закрытия, считается
     * нетронутой всегда — и закрывается без вопроса, как раньше.
     */
    protected readonly pristine: Signal<boolean> = computed((): boolean => this.#unsavedGuard()?.pristine() ?? true);

    protected readonly submitError: WritableSignal<string | null> = signal<string | null>(null);

    protected readonly idParamName: string = 'id';

    /** id-only режим: нужен только id (например, смена пароля по userId), сущность не грузится. */
    protected readonly idOnly: boolean = false;

    constructor() {
        effect((): void => {
            const panel: RtContainerRightSidenavPanelDirective | undefined = this.panel();
            if (panel === undefined || !panel.ready() || this.#opened) {
                return;
            }
            this.#opened = true;
            panel.open();
            // Панель встала в аутлет — с этого мгновения о правках спрашивают её,
            // а не тот компонент, который роутер подставит гарду.
            this.#registry.register(this.route.snapshot, this);
        });

        // Снятие с учёта идёт по уничтожению, а не по уходу с экрана: уход может и
        // не состояться — роутер отклоняет навигацию молча, — и панель, снятая с
        // учёта раньше времени, осталась бы на экране, не отвечая о своих правках.
        this.destroyRef.onDestroy((): void => this.#registry.unregister(this.route.snapshot, this));

        // Мутации из runMutation(): mergeMap подписывает каждый op$ независимо
        // (как раньше — по подписке на вызов, без отмены предыдущей in-flight
        // мутации); handler'ы замыкают opts вызова, catchError гасит ошибку
        // конкретной мутации, не убивая общий стрим.
        this.#mutationSource
            .pipe(
                mergeMap((mutation: IRtRouteAsideMutation): Observable<() => void> =>
                    mutation.op$.pipe(
                        map((): (() => void) => mutation.handleSuccess),
                        catchError((error: unknown): Observable<() => void> => of((): void => mutation.handleError(error)))
                    )
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((handleResult: () => void): void => handleResult());

        // Рефетч сущности из #refreshEntity(): mergeMap — каждый запуск resolve
        // живёт независимо (как раньше — отдельная подписка на вызов).
        this.#refreshSource
            .pipe(
                mergeMap((id: string): Observable<T | null> => this.resolve(id)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((entity: T | null): void => {
                this.#resolving.set(false);
                if (entity === null) {
                    this.#navigateAway();
                    return;
                }
                this.#entity.set(entity);
                this.onResolved();
            });

        // Вопрос о несохранённых правках: exhaustMap, а не switchMap — пока окно
        // открыто, повторное намерение закрыться игнорируется. switchMap отписался
        // бы от первого окна, не убрав его overlay, и на экране осталось бы два.
        this.#closeIntentSource
            .pipe(
                exhaustMap((): Observable<ERtAsideUnsavedOutcome | undefined> =>
                    this.#dialog
                        .open<RtAsideUnsavedDialogComponent, undefined, ERtAsideUnsavedOutcome>(RtAsideUnsavedDialogComponent)
                        .afterClosed()
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((outcome: ERtAsideUnsavedOutcome | undefined): void => this.#applyUnsavedOutcome(outcome));
    }

    public ngOnInit(): void {
        this.route.paramMap
            .pipe(
                switchMap((params: ParamMap): Observable<T | null> => {
                    const idParam: string | null = params.get(this.idParamName);
                    if (idParam === null || idParam === '') {
                        this.#isCreateMode.set(true);
                        this.#entityId.set(null);
                        return of(null);
                    }
                    this.#isCreateMode.set(false);
                    this.#entityId.set(idParam);
                    if (this.idOnly) {
                        return of(null);
                    }
                    this.#resolving.set(true);
                    return this.resolve(idParam);
                }),
                tap((entity: T | null): void => {
                    this.#resolving.set(false);
                    if (entity === null) {
                        if (!this.#isCreateMode() && !this.idOnly) {
                            this.#navigateAway();
                        }
                        return;
                    }
                    this.#entity.set(entity);
                    this.onResolved();
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    /**
     * Панель уходит с экрана не сама: её место в аутлете занимает другая — лента
     * событий из шапки или соседняя запись. Тронутая форма спрашивает о правках
     * так же, как при закрытии; окно кнопок этот путь не ловит, потому что панель
     * закрывает роутер.
     *
     * Гард ставится на ro-маршрут панели (`rtAsideUnsavedGuard`).
     */
    public canDeactivate(): Observable<boolean> {
        const intent: ERtAsideCloseIntent = this.#closeIntent();

        // Признак идущей записи старше разрешения на уход: панель, выдавшая себе
        // разрешение и не дождавшаяся ответа сервера, уходить не должна — исход
        // записи решит её судьбу сам.
        if (intent === ERtAsideCloseIntent.Ignore) {
            return of(false);
        }

        // Уход начала сама панель: правки либо записаны секунду назад, либо их
        // судьбу пользователь уже решил. Вопрос был бы задан про то, чего нет.
        if (this.#consumeLeaveAllowance()) {
            return of(true);
        }

        if (intent === ERtAsideCloseIntent.Close) {
            return of(true);
        }

        return this.#askUnsaved();
    }

    protected setEntity(entity: T | null): void {
        this.#entity.set(entity);
    }

    /**
     * Признак нетронутой формы. Контрол принимается и сигналом: форма панели
     * собрана директивой `ngForm` и до отрисовки шаблона её ещё нет, поэтому
     * `viewChild(NgForm)` отдаёт её только сигналом.
     */
    protected pristineSignal(control: AbstractControl | Signal<AbstractControl | undefined>): Signal<boolean> {
        const control$: Observable<AbstractControl | undefined> = isSignal(control) ? toObservable(control) : of(control);

        return toSignal(
            control$.pipe(
                switchMap((current: AbstractControl | undefined): Observable<boolean> => {
                    if (current === undefined) {
                        return of(true);
                    }

                    return current.events.pipe(
                        filter((event: unknown): event is PristineChangeEvent => event instanceof PristineChangeEvent),
                        map((event: PristineChangeEvent): boolean => event.pristine),
                        // Форма могла испачкаться до того, как сигнал отдал её: события
                        // прошлого подписка не получит, и без нынешнего состояния
                        // кнопка записи осталась бы недоступной
                        startWith(current.pristine)
                    );
                })
            ),
            { initialValue: true }
        );
    }

    /**
     * Ставит гард закрытия: пока форма тронута, любой из четырёх путей закрытия
     * спрашивает, что сделать с правками, и исход «закрыть с сохранением» зовёт
     * `save`. Признак нетронутости даёт `pristineSignal(control)` — тот же, что
     * гейтит кнопку записи.
     */
    protected guardUnsavedChanges(guard: IRtAsideUnsavedGuard): void {
        this.#unsavedGuard.set(guard);
    }

    /**
     * Адрес связанной записи для атрибута `href`. Ссылка остаётся настоящей
     * ссылкой: её открывают в новой вкладке и копируют, а обычное нажатие панель
     * перехватывает и уводит сама.
     */
    protected relatedUrl(commands: readonly unknown[]): string {
        return this.router.serializeUrl(this.#relatedTree(commands));
    }

    /**
     * Уход на связанную запись. Он уводит с адреса панели так же, как её
     * закрытие, поэтому идёт тем же путём: тронутая форма спрашивает, что
     * сделать с правками, и на исходе «закрыть с сохранением» запись открывается
     * после удачной записи.
     */
    protected openRelated(commands: readonly unknown[], queryParams: Params | null = null): void {
        const intent: ERtAsideCloseIntent = this.#closeIntent();

        if (intent === ERtAsideCloseIntent.Ignore) {
            return;
        }

        if (intent === ERtAsideCloseIntent.Close) {
            this.#navigateRelated(commands, queryParams);

            return;
        }

        this.#relatedQueryParams = queryParams;

        this.#relatedCommands = commands;
        // Подписка объявлена один раз в конструкторе (см. #closeIntentSource-стрим).
        this.#closeIntentSource.next();
    }

    protected onResolved(): void {
        // Хук для наследника: базовый асайд после разрешения данных ничего не делает.
    }

    protected closeOutlets(): Record<string, Array<string> | null> {
        return { ro: null };
    }

    /**
     * `successText` — готовый текст тоста об успехе. Он принадлежит конкретной
     * мутации, а не панели: у снятия промокода и опроса подписки свой текст
     * успеха, и один на панель показал бы не тот.
     *
     * Именно текст, а не ключ словаря: ключ принадлежал бы словарю приложения, а
     * кит чужих словарей не знает — переводит приложение и передаёт готовое.
     *
     * `errorText` принимается и функцией: причина отказа известна только после
     * него — стор кладёт её в свой сигнал, а панель без стора выводит из ответа
     * сервера, — и готовой строкой на момент запуска мутации её не передать.
     */
    protected runMutation(
        op$: Observable<unknown>,
        opts?: {
            onSuccess?: () => void;
            successText?: string;
            errorText?: string | ((error: unknown) => string);
            closeOnSuccess?: boolean;
            refreshOnSuccess?: boolean;
        }
    ): void {
        this.#submitting.set(true);
        this.submitError.set(null);
        // Подписка объявлена один раз в конструкторе (см. #mutationSource-стрим) —
        // здесь только эмит операции с handler'ами, замыкающими opts.
        this.#mutationSource.next({
            op$,
            handleSuccess: (): void => {
                this.#submitting.set(false);
                if (opts?.successText) {
                    this.#notificationBus.success(opts.successText);
                }
                // Пользователь шёл на связанную запись и по дороге согласился
                // сохранить: панель уходит туда, куда он нажал.
                const related: readonly unknown[] | null = this.#relatedCommands;
                if (related !== null) {
                    this.#navigateRelated(related);
                    return;
                }
                if (opts?.onSuccess) {
                    opts.onSuccess();
                    return;
                }
                // Закрытие после успеха идёт мимо обоих гардов — и кнопочного, и
                // роутерного. Форма к этому моменту ещё тронута, и вопрос о
                // несохранённых правках был бы задан ровно про то, что только что
                // сохранилось; роутерный гард закрывает разрешение на уход,
                // которое панель выдаёт себе перед вызовом роутера.
                if (opts?.closeOnSuccess === true || this.#isCreateMode()) {
                    this.#closePanel();
                    return;
                }
                if (opts?.refreshOnSuccess === true) {
                    this.#refreshEntity();
                }
            },
            handleError: (error: unknown): void => {
                this.#submitting.set(false);
                // Отказ оставляет пользователю� в панели с его правками, поэтому
                // намерение уйти на связанную запись снимается.
                this.#relatedCommands = null;
                const text: string | undefined = typeof opts?.errorText === 'function' ? opts.errorText(error) : opts?.errorText;
                if (text) {
                    this.submitError.set(text);
                }
            },
        });
    }

    /**
     * Единственная точка закрытия панели. Через неё идут все четыре пути: кнопка
     * в шапке, кнопка в футере и — через `onCancel()` — нажатие мимо панели и
     * клавиша Esc, которые ловит `rt-container` и отдаёт панели одним выходом
     * `cancelled`.
     */
    protected onClose(): void {
        const intent: ERtAsideCloseIntent = this.#closeIntent();

        if (intent === ERtAsideCloseIntent.Ignore) {
            return;
        }

        if (intent === ERtAsideCloseIntent.Close) {
            this.#closePanel();
            return;
        }

        // Подписка объявлена один раз в конструкторе (см. #closeIntentSource-стрим).
        this.#closeIntentSource.next();
    }

    protected onCancel(): void {
        this.onClose();
    }

    protected onClosed(): void {
        this.#navigateAway();
    }

    protected abstract resolve(id: string): Observable<T | null>;

    #refreshEntity(): void {
        const id: string | null = this.#entityId();
        if (id === null || this.idOnly) {
            return;
        }
        this.#resolving.set(true);
        // Подписка объявлена один раз в конструкторе (см. #refreshSource-стрим).
        this.#refreshSource.next(id);
    }

    /** Решение по намерению уйти с панели — одно на закрытие и на переход по связанной записи */
    #closeIntent(): ERtAsideCloseIntent {
        return resolveCloseIntent({
            submitting: this.#submitting(),
            guarded: this.#unsavedGuard() !== null,
            pristine: this.pristine(),
        });
    }

    /**
     * Что делать с уходом панели после ответа пользователю�. «Закрыть с сохранением»
     * ждёт конца записи: панель уступает место только удачной — иначе правки
     * пропали бы вместе с отказом, о котором пользователь ещё не знает.
     */
    #deactivateAfter(outcome: ERtAsideUnsavedOutcome | undefined): Observable<boolean> {
        if (outcome === ERtAsideUnsavedOutcome.Discard) {
            return of(true);
        }

        if (outcome !== ERtAsideUnsavedOutcome.Save) {
            return of(false);
        }

        this.#unsavedGuard()?.save();
        // Запись могла и не начаться — например, черновик не годится
        if (!this.#submitting()) {
            return of(false);
        }

        return toObservable(this.#submitting, { injector: this.#injector }).pipe(
            filter((submitting: boolean): boolean => !submitting),
            take(1),
            map((): boolean => this.submitError() === null)
        );
    }

    /**
     * Вопрос о правках роутерному уходу. Окно открывается одно на все уходы,
     * пришедшие пока оно висит: второе поставило бы поверх первого оверлей,
     * убрать который было бы некому — от того же и `exhaustMap` на пути кнопок.
     */
    #askUnsaved(): Observable<boolean> {
        const pending: Observable<boolean> | null = this.#pendingAsk$;

        if (pending !== null) {
            return pending;
        }

        const ask$: Observable<boolean> = this.#dialog
            .open<RtAsideUnsavedDialogComponent, undefined, ERtAsideUnsavedOutcome>(RtAsideUnsavedDialogComponent)
            .afterClosed()
            .pipe(
                switchMap((outcome: ERtAsideUnsavedOutcome | undefined): Observable<boolean> => this.#deactivateAfter(outcome)),
                finalize((): void => {
                    this.#pendingAsk$ = null;
                }),
                shareReplay({ bufferSize: 1, refCount: false })
            );

        this.#pendingAsk$ = ask$;

        return ask$;
    }

    /**
     * Разрешение на уход читается один раз: иначе первое же закрытие после записи
     * сняло бы вопрос о правках со всех следующих уходов, и тронутая форма
     * уезжала бы молча.
     */
    #consumeLeaveAllowance(): boolean {
        const allowed: boolean = this.#leaveAllowed;

        this.#leaveAllowed = false;

        return allowed;
    }

    /**
     * Уход, начатый самой панелью. Разрешение выдаётся здесь, вплотную к вызову
     * роутера, а не при закрытии панели: между закрытием и навигацией оверлей
     * доигрывает уход, и разрешение, выданное раньше, достаётся чужому уходу,
     * пришедшему в это окно, — тронутая форма уехала бы без вопроса.
     *
     * Невостребованное разрешение снимается итогом навигации: роутер отклоняет
     * навигацию молча, её может отменить другой гард, и оставшееся разрешение
     * сняло бы вопрос о правках со следующего ухода, которого панель не начинала.
     */
    #navigateAllowed(navigate: () => Promise<boolean>): void {
        this.#leaveAllowed = true;

        void navigate()
            .catch((): boolean => false)
            .then((): void => {
                this.#leaveAllowed = false;
            });
    }

    #closePanel(): void {
        this.panel()?.close();
    }

    #navigateRelated(commands: readonly unknown[], queryParams: Params | null = null): void {
        const params: Params | null = queryParams ?? this.#relatedQueryParams;

        this.#relatedCommands = null;
        this.#relatedQueryParams = null;
        this.#navigateAllowed((): Promise<boolean> => this.router.navigateByUrl(this.#relatedTree(commands, params)));
    }

    /**
     * Адрес, на который уходит панель. Свой аутлет она снимает здесь же, тем же
     * деревом: абсолютные команды меняют только первичную ветку, поэтому панель,
     * открытая в корне приложения, переход переживает. Маршрута под неё в корне
     * нет, и роутер отклоняет такую навигацию молча — адрес остаётся прежним, а
     * приложение застревает на панели, которой на экране уже нет.
     */
    #relatedTree(commands: readonly unknown[], queryParams: Params | null = null): UrlTree {
        const outlets: Record<string, unknown[] | null> = { ...this.closeOutlets(), primary: rootSegmentsOf(commands) };

        return this.router.createUrlTree([{ outlets }], { queryParams });
    }

    #applyUnsavedOutcome(outcome: ERtAsideUnsavedOutcome | undefined): void {
        const related: readonly unknown[] | null = this.#relatedCommands;

        if (outcome === ERtAsideUnsavedOutcome.Discard) {
            if (related !== null) {
                this.#navigateRelated(related);
                return;
            }
            this.#closePanel();
            return;
        }

        // Запись закрывает панель сама на успехе — иначе панель ушла бы с экрана
        // раньше ответа, и отказ пользователю� было бы негде показать. Уход на
        // связанную запись ждёт того же успеха.
        if (outcome === ERtAsideUnsavedOutcome.Save) {
            this.#unsavedGuard()?.save();
            // Запись могла и не начаться — например, черновик не годится. Тогда
            // намерение уйти снимается вместе с ней, иначе панель ушла бы на
            // связанную запись после следующей удачной записи.
            if (!this.#submitting()) {
                this.#relatedCommands = null;
            }
            return;
        }

        this.#relatedCommands = null;
    }

    #navigateAway(): void {
        this.#navigateAllowed((): Promise<boolean> =>
            this.router.navigate([{ outlets: this.closeOutlets() }], {
                relativeTo: this.route.parent,
            })
        );
    }
}
