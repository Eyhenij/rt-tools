/**
 * Подписи демонстрационного экрана витрины — раздел заявок целого шаблона страницы.
 *
 * Это не подписи кита: те живут в `showcase-labels.ru.ts` и приходят к нему функцией-переводчиком
 * через `provideRtKitLabels`. Здесь лежит словарь приложения — того самого, которым витрина
 * притворяется, показывая целый экран. Разделены они намеренно: кит своего языка не знает вовсе,
 * а экран знает и берёт подписи так же, как их берёт настоящее приложение, — ключом через
 * `| transloco`.
 *
 * Ключи именуются по предмету, а не по месту на экране: одна и та же подпись стоит и колонкой
 * таблицы, и полем панели, и заголовком в подтверждении.
 *
 * Обвязка витрины: `.storybook/` в пакет не уезжает вовсе.
 */
export const SHOWCASE_MESSAGES_RU: Readonly<Record<string, string>> = {
    // Раздел
    navBookingsTitle: 'Заявки',
    bookingsHint: 'Брони объектов: заезд, гости и состояние обработки.',
    bookingsAdd: 'Завести заявку',
    bookingsEmpty: 'Заявок пока нет',
    bookingsTableAria: 'Таблица заявок',

    // Колонки и поля
    bookingNumber: 'Номер',
    bookingDates: 'Даты',
    bookingCheckIn: 'Заезд',
    bookingCheckOut: 'Выезд',
    bookingProperty: 'Объект',
    bookingGuest: 'Гость',
    bookingName: 'Имя гостя',
    bookingContact: 'Контакты',
    bookingEmail: 'Почта',
    bookingMessenger: 'Мессенджер',
    bookingParty: 'Состав',
    bookingGuests: 'Гости',
    bookingAdults: 'Взрослых',
    bookingChildren: 'Детей',
    bookingSource: 'Источник',
    bookingStatus: 'Состояние',
    bookingTotalThb: 'Сумма, ฿',
    bookingComment: 'Комментарий',

    // Состояния заявки
    bookingStatusPending: 'Ждёт ответа',
    bookingStatusConfirmed: 'Подтверждена',
    bookingStatusRejected: 'Отклонена',
    bookingStatusCancelled: 'Отменена',

    // Откуда пришла заявка
    bookingSourceSite: 'Сайт',
    bookingSourceAirbnb: 'Airbnb',
    bookingSourceBooking: 'Booking',
    bookingSourceAgoda: 'Agoda',
    bookingSourceVrbo: 'Vrbo',
    bookingSourceDirect: 'Напрямую',

    // Отбор списка
    bookingFilterAll: 'Все',
    bookingFilterPending: 'Ждут ответа',
    bookingFilterConfirmed: 'Подтверждённые',
    bookingFilterRejected: 'Отклонённые',
    bookingFilterCancelled: 'Отменённые',

    // Исход писем гостю
    bookingMailNone: 'Писем не было',
    bookingMailOk: 'Письмо ушло',
    bookingMailFailed: 'Письмо не ушло',
    bookingMailPending: 'Письмо отправляется',

    // Действия над строкой
    bookingReject: 'Отклонить',
    bookingRejectConfirm: 'Гостю уйдёт письмо об отказе. Отклонить заявку?',
    bookingCancelShort: 'Отменить',
    bookingCancelConfirm: 'Гостю уйдёт письмо об отмене. Отменить бронь?',

    // Полоса подтверждения над таблицей
    bookingConfirmTitle: 'Подтверждение заявки',
    bookingConfirmTotal: 'Сумма брони, ฿',
    bookingConfirmTotalHint: 'Уйдёт гостю в письме о подтверждении.',
    bookingConfirmZeroWarning: 'Сумма не заполнена: гость получит подтверждение без цены.',

    // Панель заведения и правки
    bookingCreateTitle: 'Новая заявка',
    bookingEditTitle: 'Заявка',
    bookingStaySection: 'Проживание',
    bookingGuestSection: 'Гость',
    bookingMoneySection: 'Деньги и состояние',
    bookingPropertyHint: 'Объект, на который заводится бронь.',
    bookingPeriodHint: 'Ночь выезда в бронь не входит.',
    bookingTotalHint: 'Полная сумма за проживание.',
    bookingCommentHint: 'Виден только владельцу, гостю не уходит.',
    bookingDelete: 'Снять заявку',
    bookingDeleteConfirm: 'Заявка исчезнет из списка. Снять?',
    bookingSaved: 'Заявка записана',
    bookingDeleted: 'Заявка снята',
    bookingSaveFailed: 'Заявку записать не удалось',
    bookingProblemDates: 'Дата выезда должна быть позже даты заезда',
    bookingProblemGuest: 'Имя гостя не заполнено',
    bookingProblemParty: 'В брони должен быть хотя бы один взрослый',
    propertyOpenLink: 'Открыть объект',

    // Общее
    commonRefresh: 'Обновить',
    commonSave: 'Записать',
    uiColumnSettings: 'Настроить столбцы',
    uiCancel: 'Отмена',
    uiConfirm: 'Подтвердить',
    uiRemove: 'Убрать',
    uiCloseWithoutSaving: 'Закрыть без записи',
};
