# A ready text in the reply field of a correspondence

**Status:** in force · **Revision:** 2026-11-06 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names how a consumer puts a ready text into the reply field of a correspondence.

## Why

A consumer that offers ready answers has no way to put one into the reply field: the field lives
inside the component and is closed from outside. The person then copies the text by hand or
retypes it.

## Terminology

| Term           | What it is                                                   |
| -------------- | ------------------------------------------------------------ |
| The draft      | the text in the reply field that is not sent yet             |
| A closed field | no reply is allowed, or the thread loads, refreshes or sends |

### What it is called in the interface

The method has no words on the screen: the person sees the text appear in the field.

## Rules

- **The method replaces the draft whole.** What stood in the field is gone, and the new text stands
  in its place.
- **The cursor stands in the field after the last character.** The person goes on typing right away.
- **The method works in all three reply fields.** They are the classic field, the rich composer
  and the messenger field.
- **The chosen files stay.** The method touches the text only.
- **A closed field takes nothing.** The method does nothing there, and the draft stays as it was.
- **The method is not typing.** The correspondence sends no typing signal for it.

## Scenarios

The scenarios are in `scenarios.md`, what carries the rules out is in `implementation.md`.
