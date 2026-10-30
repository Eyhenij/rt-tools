# The saved settings of rt-data-table under the kit's key

**Status:** proposed · **Revision:** 2026-10-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table `rt-data-table`, the kit's storage key registry, the browser database of the core
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The product agreement written before the code. It merges by the last commit of the PR into the
subdomain `table-full-port`.

## Why

A person hides columns of a table and changes their order, and the browser keeps that. `rt-table`
keeps it under a key of the kit's registry, `rt.…`; `rt-data-table` under the string the application
passes, as the first kit did. An application cannot find or reset the settings of all tables in one
way. The owner's word: «если пользователи приложений не потеряют свои конфиги то можно делать».

## Terminology

| Term               | What it is                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| **The table key**  | the string the application passes to `rt-data-table` for its settings     |
| **The kit key**    | `rt.data-table.config.` followed by the table key                         |
| **The old record** | the settings saved under the table key alone, by this kit or by the first |

### What it is called in the interface

| In the domain  | On the screen                                     |
| -------------- | ------------------------------------------------- |
| Saved settings | the columns a person hid and the order they chose |

## Rules

- **`rt-data-table` writes its settings under the kit key.** The prefix stands in the kit's
  registry next to the one of `rt-table`; both start with `rt.`.
- **An old record is copied under the kit key on the first read and is not erased.** The person sees
  their columns as before. The old record stays because a table of the first kit in the same
  application may read it.
- **A record under the kit key wins over an old one.** Once the settings are copied, a change made
  in the table goes under the kit key only.
- **A reset of the settings removes both records.** Otherwise the old record would be copied back on
  the next read, and the reset would undo itself.

## What is out of scope

- The settings of `rt-table`: their key does not change.
- The shape of the saved value: it stays the first kit's.
- RT-3015 and the look of the tables.

## Contract

Not applicable: the inputs of `rt-data-table` stay as they are; the application passes the same
string.

### Refusal codes

Not applicable.

## Data

The browser database of the user: one more record per table under the kit key. Nothing is stored
on a server.

## Screens and states

Nothing new: the table draws the settings it read, as before.

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- **Copy, not move.** The owner's condition is that no one loses their settings, and the old record
  may still be read by the first kit's table.
- **A prefix of its own, not `rt.table.columns.`.** The value of `rt-data-table` has another shape;
  one prefix for both would let an application with one id for both tables read a foreign value.

## Open questions

None.

## History of changes

- 2026-10-30 — RT-2867, epic «#2860 Таблицы»: the settings of `rt-data-table` move under the kit key.
