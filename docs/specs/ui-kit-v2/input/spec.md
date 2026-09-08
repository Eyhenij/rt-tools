# The field of input

**Status:** in force · **Revision:** 2026-08-20 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names what a field of input declares the kind of the value being entered to the
browser by and where the boundary runs between that declaration and the check of what was entered.

## Why

The field of input has four types, and there is no address among them. An application asking for the
full address of a page puts ordinary text: there is no hint by the keyboard on a telephone, no taking
apart of a pasted address either, and what was entered has to be checked against a sample in the
application itself.

## Terminology

| Term                | What it is                                                                              |
| ------------------- | --------------------------------------------------------------------------------------- |
| The type of a field | What the field is declared to the browser by: text, password, mail, time                |
| The type of address | The type of a field declaring to the browser that an address of a page is being entered |

### What it is called in the interface

| In the spec         | On the screen                              |
| ------------------- | ------------------------------------------ |
| The type of address | the keyboard for an address on a telephone |

## Rules

- **The field of input has the type of address, and it goes away onto the native field.** By it the
  browser gives a hint by the keyboard and takes apart what was pasted; a field declared as text
  gives neither the one nor the other.
- **The former four types work as before.** The fifth member of the enumeration touches none of the
  former ones.
- **The check of what was entered stays with the application.** The type declares the kind of the
  value to the browser, not a requirement of it: the field has a check of the form of its own and it
  does not depend on the type.

## What is out of scope

- A check of the address against a sample inside the kit: the kind of a value and a requirement of it
  are different questions.
- The field of input of the first kit: it has a set of types of its own.

## Contract

Not applicable: the surface is the inputs of a component of the kit, the subdomain serves no
procedures.

### Refusal codes

Not applicable.

## Data

The subdomain has no records of the storage of its own.

## Screens and states

| The type of a field | What is visible                                         |
| ------------------- | ------------------------------------------------------- |
| text                | the ordinary keyboard                                   |
| address             | the keyboard for an address on a telephone              |
| password            | dots instead of the characters and a switch of the show |

## Cross-cutting requirements

### Locales

Not applicable: the subdomain creates no labels.

### SEO

Not applicable.

### Mobile layout

The type of address was created for its sake: the hint by the keyboard is visible only on a telephone.

### Several objects

Not applicable.

## Decisions

- **The type is added as a member of the enumeration, not as an input of its own.** The argument: the
  four former types are arranged exactly so, and a second input about the same would give birth to two
  answers to one question. Rejected: an input "this is an address" next to the type.

## Open questions

- **`Q-9` — whether the field needs the rest of the native types: a number, a telephone, a search.**
  The assumption accepted is that they are created as the need arises, not by a bundle in advance.

## History of changes

- 2026-08-20 — created by merging the agreement about the type of address. The first subdomain that
  describes the surface of a component, not a check of the look.
