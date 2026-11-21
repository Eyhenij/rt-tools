# Grill

## The owner request

> исправь в первую очередь вот это: Добавь событие смены значения `selectionChange` трём полям `@rt-tools/ui-kit-v2`: `RtDateRangeComponent` (`rt-date-range`), `RtMultiselectComponent` (`rt-multiselect`) и `RtDatePickerComponent` (`rt-date-picker`).
>
> Образец — `selectionChange` у `RtSelectComponent` (`rt-select`). Прочитай его реализацию целиком и повтори тот же приём.
>
> Требования:
> - Тип события у `rt-date-range` равен `IRtDateRange.Value | null`. У `rt-multiselect` тип `ReadonlyArray<TValue>`, у `rt-date-picker` тип `string`.
> - Событие срабатывает только на изменение значения человеком: выбор в панели, очистка крестиком, снятие чипа, ввод с клавиатуры. На `writeValue` и на привязку модели формы снаружи событие не испускается, как у `rt-select`.
> - Событие несёт то же новое значение, что уходит в `onChange` формы.
> - Юнит-тесты на каждое поле: событие есть на выбор человека и нет на `writeValue`.
> - Внешний вид полей не меняется, макетов не нужно. Истории сторибука сделай как у `rt-select`.
> - Версия пакета minor. Ветка, PR в main репозитория кита, гейт и проверки делай как принято в этом репозитории. Слияние и выпуск в npm сделает заказчик после отчёта.
>
> Зачем: приложение-потребитель переводит формы с `[ngModel]`/`(ngModelChange)` на signal forms Angular. Фильтр берёт модель через `linkedSignal` от значения хранилища. Изменение должно уходить в хранилище собственным событием поля: эффект над моделью сработал бы и на обновление из хранилища. В версиях 0.49.1 и 0.50.0 у трёх полей в объявлениях `outputs: {}`.
>
> Готово, когда: PR открыт, его проверки зелёные, в собранных объявлениях `types/*.d.ts` у трёх полей стоит `selectionChange`. В отчёте назови номер PR и ветку.

> затем выпусти кит - это блокирует другие сессии, сделай это прямо сейчас, другие задачи отложи

**Spec:** `docs/specs/ui-kit-v2/select/spec.md`

## What the tree already has

- `RtSelectComponent` declares `selectionChange = output<TValue | null>()` and emits it in two
  places only, next to the form change: `select()` after `emitChange`, and an override of
  `clear()` after `super.clear()` with `null`. `writeValue` of the shared base
  `RtFormControlBase` only sets the value signal, so nothing emits on it.
- The base `clear()` sends `this.value()` to the form after `clearValue()` and emits `cleared`.
- `rt-date-range` and `rt-date-picker` route every human change through one private `#commit`:
  the panel pick (`onPicked`) and keyboard typing (`onTyped`, an empty text commits the empty
  value). `#commit` sets the value and calls `emitChange`. Their `writeValue` overrides do not call
  `#commit`.
- `rt-multiselect` calls `emitChange` in `toggleOption` (panel pick, also by keyboard through the
  option list) and in `removeChip`; the cross goes through the base `clear()`.
- The kit shows `selectionChange` of `rt-select` in no story: it is described in the «Выходы»
  table of `Overview.mdx` and in `CONTEXT.md`. The three fields have their own «Выходы» sections.
- The kit version is 0.50.0; a minor bump makes 0.51.0. Releasing is a manual run of the publish
  pipeline from `main` — rule `package-release`.

## What the rules already say

- Rule `kit-approval`: an edit of a visible kit file with no change of look goes by the owner's
  word that nothing visible changed. The owner said: «Внешний вид полей не меняется, макетов не
  нужно».
- Rule `git-workflow`: work outside an epic exists only by the owner's word about that work; the
  owner named a PR into `main`.

## Questions and answers

No question went to the owner: the request names the types, the triggers, the tests, the look,
the version and where the PR goes. The order of work came with it: «исправь в первую очередь», then
«затем выпусти кит», and on 21.11.2026 «сначала закончи RT-3492 и потом делай что я попросил».

## Decisions

- **The event goes where the form change goes.** In `#commit` of both date fields and in
  `toggleOption` and `removeChip` of the multiselect, plus an override of `clear()` in all three,
  as `rt-select` does. One place per field carries both, so the value cannot differ.
- **The describing text follows `rt-select`.** A row in the «Выходы» table of `Overview.mdx` and
  `CONTEXT.md` of each field; no new story, as `rt-select` has none for the event.
