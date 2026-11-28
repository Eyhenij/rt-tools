# Разбор

## Просьба владельца

Просьба пришла заданием из соседней сессии с припиской «The owner asked for this fix». Задание дословно:

> Fix a bug in `＠rt-tools/ui-kit-v2` 0.55.0, component `bottom-sheet` (its docs: `bottom-sheet/CONTEXT.md`). The owner
> asked for this fix.
>
> Symptom, measured in a consumer app at 375×812 with touch emulation: an `rt-aside` opens as a full-height bottom sheet
> and holds two `rt-date-picker` fields, whose panels are nested bottom sheets.
>
> 1. Right after the aside opens, the closed nested sheets are visible: a nested sheet header peeks at the bottom edge
>    and the panel looks dimmed.
> 2. After picking a day, or after pressing `bottom-sheet-back`, an empty grey sheet with classes
>    `rt-bottom-sheet rt-bottom-sheet--nested` (no `--open`) covers the whole aside. The value is written into the field
>    and taps pass through, but the form cannot be seen.
>
> Cause: the state selectors `.rt-bottom-sheet--open .rt-bottom-sheet__panel { transform: translateY(0) }` and
> `.rt-bottom-sheet--open .rt-bottom-sheet__backdrop { opacity: 1 }` use the descendant combinator, so an open outer
> sheet styles every closed sheet inside it. A browser probe that replaced exactly these two selectors with the child
> combinator `>` removed both symptoms.
>
> Done means:
>
> - both selectors fixed, and the other state selectors of the component checked for the same leak into nested sheets
>   (fixed if they leak);
> - a test that renders a closed sheet inside an open one and fails without the fix;
> - the nested flow checked on a phone-width viewport (open, pick a value, back) with what you saw;
> - the kit checks green;
> - a pull request into the kit's `main` by the delivery rules of the kit repository;
> - no release and no publish: the release is run separately after the owner merges.
>
> Only this bug is in scope. In your report put the pull request link first, then what was verified and how.

## Что уже есть в дереве

- Два правила стоят в `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.scss`, блок
  `&--open`: `.rt-bottom-sheet__backdrop` и `.rt-bottom-sheet__panel` берутся любым потомком. Соседние правила
  `--covered` и `--nested` уже берут только прямого потомка.
- Из остальных правил состояния того же файла потомка берёт ещё `&--keyboard &__panel--typing`: он даёт `max-height`
  панели вложенной шторки, на которой стоит `--typing`. `&--keyboard` правит только свой узел.
- Свойства `--rt-bottom-sheet-*` объявлены на самом `.rt-bottom-sheet`, поэтому вложенная шторка берёт свои значения.
  Шаг входа `radius` пишет свойство только на узел с атрибутом, а вложенная шторка перекрывает его своим объявлением.
- `rt-date-picker` и `rt-date-range` рисуют свою `rt-bottom-sheet` в разметке поля. Поле внутри шторки асайда
  оказывается её потомком. Списки выбора живут в перекрытии и потомками не становятся.
- Витрина асайда-шторки не держит панели с полем даты, поэтому кадры этого не поймали.
- Договорённость о втором экране: `docs/specs/ui-kit-v2/sheet-stack/`.
- Открыт эпик RT-3746 о расположении действий шторки. Веток его задач на сервере нет.

## Что уже говорят правила

- Видимая правка кита идёт с согласия владельца, правило `kit-approval`. Файл стилей считается видимой правкой.
  Правка без смены вида несёт строку «Без вида» со словами владельца об одобрении плана.
- Путь изменения называет `tools/review-path.mjs`: файл стилей даёт полный путь.

**Задач в разборе:** 1

## Вопросы и ответы

Вопросы разбора не задавались, ответы взяты из задания:

- поведение меняется: уходит дефект, одобренный вид шторки остаётся прежним;
- законы и правила не правятся;
- задача одна;
- не входят выпуск, публикация и всё, кроме этого дефекта;
- признак готовности — список «Done means»;
- образец — правила `--covered` и `--nested` того же файла.

## Решения разбора

- **Задача идёт вне эпика, одиночной.** Копия `rt-tools` по таблице назначений ведёт RT-3694, его карточка закрыта.
  Эпик RT-3746 о другом и ждёт своего выпуска, а правка нужна патчем раньше. Отброшено: задача в эпике RT-3746.
- **Новой истории витрины нет.** Задание просит тест и живую проверку. Отброшено: история с полем даты внутри асайда —
  это новый кадр и одобрение витрины.

## Что остаётся неясным

- Нужен ли макет: одобренный вид не меняется, пропадает только сломанное состояние. Спрашивается вместе с одобрением
  плана.
