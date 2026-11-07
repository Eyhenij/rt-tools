# Grill

## The owner request

07.11.2026:

> Отложи текущую работу, переключись на kit-chat-schedule-brief.md

The brief, word for word:

> Сделай в `RtChatComponent` (`rich-editor`) три малых дополнения. Порядок обычный: сверка с макетом,
> код, сторибук с наложением на кадр, показ владельцу. Пуш, PR и выпуск только после его слова
> «одобряю». Нового состояния пузыря нет.
>
> 1. `IRtChat.Message`: необязательные `dateLabel?: string` и `dateIcon?: IRtIcon.Name`. Если
>    `dateLabel` задан, он стоит в `message-date` вместо времени `createdAt`. Если `dateIcon` задан,
>    значок стоит на месте значка статуса, размером как у статуса в этом виде. Подпись строкой:
>    «Уйдёт 8 ноября в 10:00» и значок `clock`. Цвет и размер те же, что у времени. Подвал не вылезает
>    за пузырь на 375: перенос или обрезка с подсказкой. Подписи дней считаются от `createdAt`.
> 2. Новый слот `[rtChatComposerBar]`: содержимое стоит над рамкой поля ответа во всех видах поля.
>    Пустой слот места не занимает.
> 3. Публичный метод рядом с `setDraft`: `draftText(): string` возвращает текст поля в любом из видов
>    поля. Файлы он не трогает.
>
> Кадры в Figma, файл `I3fuRHUIcEhw6WPIsd29nP`: ответ в ленте `9512:13861`, полоса правки `9514:13841`,
> там же ряды 768 и 375. Файл только читается.
>
> Готово, когда: дополнения покрыты тестами и историями сторибука, сверены с кадрами на 1440, 768 и
> 375, владелец сказал слово, правка влита и новая версия вышла. В отчёте номер версии и точные имена.

## What the tree already has

- The chat lives in `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`. The kit version on
  main is 0.40.0.
- The reply field has three kinds: `rt-ai-prompt-input`, `rt-message-composer` and a plain textarea.
  `setDraft` in `rt-chat.component.ts` already walks all three, and its subdomain is
  `docs/specs/ui-kit-v2/chat-draft/`. That is the sample for `draftText`.
- The bubble footer holds `message-date` and `message-status` in `rt-chat.component.html`.
- `rtChatComposerTools` is the nearest sample of a projection slot of the reply field.
- RT-2816 asks for a slot above the field of another component, `rt-ai-chat`. It stays outside.

## What the rules already say

The kit rule `kit-approval`: a mockup approval, then the code, then a showcase approval. The push,
the PR and the release wait for both quotes.

## Questions and answers

The six questions are closed by the brief:

- **Behaviour:** changes, in the kit only.
- **A law or a rule:** no edit.
- **One task or several:** one task: three additions to one component and one release.
- **Not part of the task:** a new bubble state, RT-2816 and any edit of the Figma file.
- **The sign:** the "Готово, когда" paragraph of the brief.
- **The sample:** `setDraft` and the slot `rtChatComposerTools`.

**Одобряете кадры?** Варианты меню: «Одобряю» и «Есть правки».
Одобряю

**Куда поставить задачу?** Варианты меню: «Отдельно вне эпика» и «Новый эпик кита».
Отдельно вне эпика

## Decisions

- **The work runs outside an epic, its branch from main and its PR into main.** The owner chose it.
  Rejected: a new epic with one task, the owner did not take it.
- **`draftText` joins the subdomain `chat-draft`.** It reads the same field `setDraft` writes.

## What is left unclear

- Nothing blocks the work.
