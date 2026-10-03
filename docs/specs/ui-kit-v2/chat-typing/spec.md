# The sign of typing in a correspondence

**Status:** in force · **Revision:** 2026-10-03 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names how the correspondence tells its consumer that the person is typing a reply,
and how it shows that the other side is typing.

## Why

A consumer that builds a correspondence on the kit cannot show the other side that the person is
typing: the component sends nothing about typing outward, and it has no place for the line «the
operator is typing». Each consumer that needs it would wrap the reply field itself and draw its own
line, and two such lines diverge in place, look and timing.

## Terminology

| Term                | What it is                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------- |
| A stretch of typing | the time from the first input into the field to the moment typing is over                   |
| The typing signal   | the output of the correspondence: «started» at the start of a stretch, «stopped» at its end |
| The typing line     | the text the consumer passes in, shown while the other side types                           |
| The pause           | 3 seconds without input; after it the stretch is over                                       |

### What it is called in the interface

| In the spec     | On the screen                                              |
| --------------- | ---------------------------------------------------------- |
| The typing line | the plate «Оператор печатает…» at the bottom of the thread |

## Rules

- **One stretch of typing gives one «started» and one «stopped».** An event per key press would
  load the consumer's transport with nothing new; the correspondence holds the frequency itself.
- **The stretch is over on an emptied field, on sending and after the pause.** Any of the three
  ends it once; a stretch already over sends nothing again.
- **Typing is caught in both modes of the reply field.** The classic field and the rich composer
  raise the same native input event, and the correspondence listens to it on the reply area, not
  to one of the fields.
- **Choosing a file is not typing.** Only a text area and an editable node count as the reply
  text.
- **The text of the typing line is set by the consumer.** Only it knows who types and in which
  language; the kit has no label of its own here.
- **An empty typing line hides the plate.** A line that is not passed and an empty one behave the
  same.
- **The typing line does not shift the thread.** The plate stands over the bottom edge of the
  thread and takes no room: a correspondence without the line does not change by a pixel.
- **The typing line is announced politely by a screen reader.** The live region stays in the
  markup even when empty, otherwise the first line is not announced.
- **A destroyed correspondence sends nothing.** The pause timer is cleared with the component, and
  an output of a destroyed component is not called.

## What is out of scope

- **The transport of the signal between the two sides.** That is the application's.
- **Who exactly types.** The consumer puts it into the line text.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the
server.

### Refusal codes

Not applicable.

## Data

Not applicable: the signal is an output, the line is an input, nothing is stored.

## Screens and states

| State                      | What is visible                                          |
| -------------------------- | -------------------------------------------------------- |
| The typing line is empty   | the thread as before, no plate                           |
| The typing line has a text | a plate with the text over the bottom edge of the thread |

## Cross-cutting requirements

### Locales

The text of the line arrives from the consumer: the kit does not translate it.

### SEO

Not applicable.

### Mobile layout

The plate keeps to the width of the thread, and a long text wraps inside it rather than being cut.

### Several objects

Not applicable.

## Decisions

- **The plate stands over the thread, not in a row of its own.** The argument: a reserved row
  would take room in every correspondence, even where the sign is not used. The price: while the
  other side types, the plate may cover the bottom of the last reply.
- **The signal is one boolean output, not two outputs.** The argument: «started» and «stopped» are
  two values of one state, and the consumer sends them by one channel anyway.

## Open questions

- None.

## History of changes

- 2026-10-03 — created by the work about the sign of typing in a correspondence.
