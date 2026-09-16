# Plan

**Task:** RT-2162 · **Branch:** RT-2162-no-sections-screen
**Epic:** RT-2161 · **Epic branch:** `RT-2161-no-rights-screen` · **Plan:** `docs/plans/no-rights-screen.md`
**Draft:** `docs/specs/message-bus/proposed/no-sections-screen/`

## Task footprint

| What  | Where                                                                                  |
| ----- | -------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/proposed/no-sections-screen/`, `docs/specs/message-bus/admin/` |
| Laws  | `docs/constitution/application/access.md`, `docs/constitution/navigation.md`           |
| Rules | `.claude/skills/permissions/`, `.claude/skills/ui-component-tests/`                    |
| Code  | `libs/message-bus-admin/auth/`, `apps/message-bus-admin/src/app/app.routes.ts`         |
| Tests | `apps/message-bus-admin-e2e/src/`, спеки либ входа                                     |

## What counts as done

Вошедший без единого права видит экран: вход состоялся, разделов нет, к кому идти, кнопка «Выйти».
Экран живёт по своему адресу и переживает перезагрузку; сквозной сценарий проходит на стенде.

## Stages

### 1. Договорённость о экране

Спека в `docs/specs/message-bus/proposed/no-sections-screen/`: что видит человек, по какому адресу,
что делает выход, что происходит при появлении права без перезагрузки, и что бывает с этим адресом
у того, у кого право есть.

**Сделано, когда:** `npm run check:specs` не называет расхождений у новой спеки, а сценарии
пронумерованы её префиксом.

### 2. Экран и его адрес

Компонент экрана на примитивах второго кита, адрес рядом с адресами входа, увод на него оттуда, где
сегодня пустой адрес: корень закрытой ветки и отказ `sectionRightGuard`.

**Сделано, когда:** спеки либ входа зелёные, `pnpm exec nx run message-bus-admin:build` проходит, и
экран открыт глазами на стенде записью без прав.

### 3. Сквозной сценарий и кадр

Сценарий на стенде: запись без прав входит, видит экран, выходит. Кадр экрана снимается тем же
образом, что и остальные.

**Сделано, когда:** `pnpm exec nx run message-bus-admin-e2e:e2e` зелёный дважды подряд, и новый
сценарий назван в спеке раздела.

## What the work does not do

- Не заводит связь «кто завёл запись»: на экране названа роль, а не имя.
- Не меняет чтение прав и не трогает эпик о правах.
