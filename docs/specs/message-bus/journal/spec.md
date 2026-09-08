# What the intake writes about itself

**Status:** in force · **Revision:** 2026-08-16 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `observability`
**Procedures:** none — the taking apart of the refusals stands before all the operations at once

A subdomain of the domain "the intake of the cargo": what the intake writes about a refusal and in
which shape. What is shared — the terminology of the domain, the cross-cutting requirements and the
decisions — lies in the spec of the domain next to it.

## Why

The intake answers with a refusal and writes a row about it. While only the kind of the cargo, the
sign of the tree, the code and the number of the request stood in that row, there was nothing to take
apart by it: a five-hundredth at the intake of the proposals had to be taken apart by three one-off
proofs in a row.

Here: what the intake writes about a refusal, in which shape and what of the written does not go
outward.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what lives in the journal:

| Term                 | What it is                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| A row of the journal | One record of the output of the intake: the name, the level and the fields                                           |
| The name of a row    | The constant part of the record, by which rows of one kind are gathered together                                     |
| The fields of a row  | Everything variable the intake knows about what happened, as an object next to the name                              |
| A taken-apart reason | An error by fields: the class, the text, the code of the storage, its details, the answer of the driver, a cut stack |
| A cleaning           | The replacement of the value of a field by the name of the key before the row went into the output                   |
| A cut stack          | The first lines of the stack — further on goes the harness of the framework, one and the same at every refusal       |

### What it is called in the interface

There is no interface of its own: the rows of the journal are read by whoever has access to the node,
by the command of the output of the container.

## Rules

**What the intake writes about a refusal.**

- **A refusal is written as a taken-apart reason, not as one text.** The class, the text, the code of
  the storage, its details, the answer of the driver and the cut stack — each by a field of its own.
  A row put together by substitution is taken apart by the eyes and is picked out only by a search
  over a substring.
- **The reason is unfolded along the chain up to the limit of the depth.** The client of the storage
  hides the real answer of the database as a nested reason, and the first level names the wrapper, not
  what happened.
- **An error of the storage is recognised by the shape of the code, not by the class.** A code of the
  form `P2022` is stable, while a check by the class would pull the client of the storage into the
  layer of the journal.
- **The stack is written cut.** Past the first lines goes the harness of the framework, one and the
  same at every refusal; the whole stack makes the row unreadable and adds nothing to it.
- **A refusal by the input and by the rights is written without a stack.** This is a check that
  worked: with a stack it looks like a breakage and drowns the real ones.

**In which shape the intake writes.**

- **The row of the journal is machine-readable: the name and the fields as an object.** The fields are
  picked out and cleaned by their names; at a text put together by substitution neither of the two can
  be done.
- **The name of the row is constant, and everything variable lies as fields.** Otherwise rows of one
  kind are not gathered together: the number of the request in the name makes every record the only
  one of its kind.
- **Outside production the row is printed readable.** Taking apart one's own run otherwise turns into
  reading the machine shape by the eyes.
- **The already written calls of the journal write the same way, with nothing edited in them.** The
  journal is put on the whole application, and the rows of the framework go by the same way as one's
  own.
- **The fields are cleaned by the name of the key, not by the look of the value.** Guessing a secret by
  the shape of a string means failing to guess one day; the name of the key is known in advance and
  stands next to the value.
- **A password, a token and a hash are cut out whole.** They get into the fields together with the body
  of the request and the details of the storage, and cleaning what was written is dearer than not
  writing it.
- **The text of the error inside a taken-apart reason is not eaten by the cleaning.** A field with the
  name of a text inside a reason is the text of the error, not the text of a person, and the general
  rule about free text would eat exactly what all of this is created for.
- **The walk in depth and in length is limited.** The journal is not an unloading: an object deeper
  than a few levels costs as much as the request itself and reads worse. The same limit breaks off a
  cyclic reference in the fields — otherwise the record would fell the very request it was put
  together for the journal of.

## What is out of scope

- **A storage of the refusals.** The groups of the refusals, their occurrences, the cleaning by a term
  and the limit of the growth — separate work with a migration. What is written lives by the output of
  the container.
- **A screen of the refusals for the owner and the right to it.** There is nothing yet to look at the
  refusals with, without access to the node.
- **A number of the request at every request.** It is created per refusal: the intake has exactly one
  row about one request, and there is nothing to link.
- **The bodies of the request and of the answer in the fields of a row of the journal.** The cargo
  arrives by megabytes, and writing it into the journal would overflow the output of the node faster
  than it would come in useful.
- **The address of the sender in the logs.** The intake does not write it: behind the proxy that
  demands both trust in the header and an edit of the intake itself.

## Contract

The surface of the intake does not change by a single operation: the same operations, the same codes
of the answer, the same text of the refusal to whoever asked. What changes is what the intake writes
about itself.

| What                                    | It was                                                               | It became                                                      |
| --------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| the row of a refusal                    | a text with the kind of the cargo, the tree, the code and the number | the name and the fields, among them the taken-apart reason     |
| the details of an error of the storage  | nowhere                                                              | fields with the code, the details and the answer of the driver |
| the stack                               | nowhere                                                              | cut, at the breakages; at refusals by the input there is none  |
| the cleaning of the secrets             | nothing to do it with: there are no fields                           | by the name of the key, before the output                      |
| the shape of the row outside production | a text                                                               | a readable shape with the same fields                          |

### Refusal codes

Not applicable: the subdomain adds not a single operation and not a single refusal — the intake
answers with the same codes as before.

## Data

The subdomain creates no tables of its own: what is written lives by the output of the container —
three files of ten megabytes each, with overwriting.

## Screens and states

Not applicable: there are no screens of its own. The journal is read by a command from the node.

## Cross-cutting requirements

### Locales

Not applicable: the rows of the journal are not translated — they are read by whoever fixes the
service.

### SEO

Not applicable.

### Mobile layout

Not applicable: there are no screens of its own.

### Several objects

The service is one, and its journal is one.

## Decisions

- **An error of the storage is recognised by the shape of the code, not by the name of the class.** A
  code of the form `P2022` is stable, while a check by the class would pull the client of the storage
  into the layer of the journal.
- **The row is machine-readable on production and readable outside it.** Otherwise the work on the
  intake turns into reading the fields by the eyes.
- **A cyclic reference in the fields is broken off by the cleaning, not by the serialiser.** The walk
  ends by the limit of the depth before the row goes into the output.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-16 — the subdomain was split out of the spec of the domain, which had outgrown the length
  limit. The rules, the scenarios and the bindings of the journal moved here as they were: the
  scenario numbers were not recounted.
