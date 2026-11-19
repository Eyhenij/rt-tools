# Grill

## The owner request

> Каталог внешних служб в приложении рисуется карточками rt-card. Владелец утвердил вид: тонкий бордер, тег состояния справа сверху в одной строке со знаком службы, карточки в строке одной высоты. Правка нужна в пакете ui-kit-v2 и в Figma «Design System V2». Три правки: обводка 1px цвета border/default по входу компонента, радиус не менять; слот rtCardHeaderEnd в одном ряду со слотом rtCardMedia; знак Slack в Figma по образцу Telegram, WhatsApp, LINE. Порядок: макет в Figma, код, витрина с наложением на кадр, показ владельцу. Пуш и PR после слова «одобряю».

## What the tree already has

- The slot `[rtCardMedia]` and the spec `docs/specs/ui-kit-v2/card-media/` already exist; the footer already hides by `:empty`.
- The kit carries no company logos: `rt-service-logo` takes an image address from the application. Telegram, WhatsApp and LINE marks exist only as Figma components.

## What the rules already say

- `kit-approval`: mockup, approval, code, showcase match, second approval, then push.
- `rt-tools-styling`: a step is read through the block's own property.

## Questions and answers

**Одобряете макет карточки (обводка, тег справа в одном ряду со знаком, знак Slack): кадр Figma 8348:1051 и историю Catalog в сторибуке?**
Одобряю

**Знак Slack: оставить как сейчас (Figma-компонент и знак только в истории) или положить логотип и в пакет?**
Как сейчас (Recommended)

## Decisions

- **Border is a variant `Border=none|default` in Figma and an input `bordered` in code** — the default keeps other cards unchanged. Rejected: always on.
- **Equal card height in a row is not done here** — the card does not stretch in a grid; the consumer sets it.

## What is left unclear

- The tag sits 1px lower than in the application frame: the code centres it, the frame placed it by hand.
