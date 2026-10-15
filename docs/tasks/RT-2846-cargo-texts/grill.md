# Grill

Cargo records this task works on, by full keys (all foreign; the signs in the intake are what
`cargo:close` takes):

- `6d56f82a2c7d4630aca51d9f47cd5ab990f51e37fec5a2c6142aa3beda85a0aa` · sign `c7a77216-9e49-4ef1-a247-bdf7fc55a880` — a default equal to the first option
- `db8610ca6556d445611284f8513f71c4277b21836a609f107018cc565f3f5033` · sign `0459a968-4342-44c2-868b-1cf4ca0c23df` — a call the task adds to a screen
- `80f964cc8fb98691005b73d67fa3e6c60b8f27a347b3573977ec583e2accc592` · sign `eb71a0e6-cf54-4611-bb21-b4caa4e0fde0` — layout values after a width change
- `a779fe3f335a1853e93eebf11e762f27a8080283ba61d2f6283d50a9ae4fac72` · sign `cce4ad5e-240b-4522-bbc6-dce3bd93aa6c` — a copy before a migration without a reverse
- `1d8f6d6db5ff82fafd4f248e8d7d505caa6a2945746d6c3508d9acd0e426f73a` · sign `9f4aa502-5188-47d2-9464-624a7ca6041e` — a migration that erases data
- `e6fadaa41577ce9075914c3da097380208c4b9eb00c33adb29082c05d5cdc909` · sign `323abb21-123f-4127-b343-f59b7685a951` — the generated client after a schema edit
- `87275d478657f901a381d26516304231ebd40f442cf4963f5ee1749187eb45e8` · sign `d2390bca-9351-4c58-83e8-83bafa4b70ab` — the lib tag written as a literal
- `94a30f0c3e99e946e27c54e7f680aec25745aa70f3d253357f25f3a523c712e9` · sign `10f622b6-66d7-47d1-a50b-211a7a9f2bd3` — the grill leaves in the owner's language
- `083ff559d8feded4e21ec3da616cc0539068414061c7a520be72881de0b1175c` · sign `aeb7e50c-98c8-4878-bf85-9a038d8db243` — a new request inside the same task
- `41db2668dbf5cfe890ef0661f4bbd8f8d87ea5aa2c58041899dd0bd42e151983` · sign `201b81e0-e7b7-412c-aee4-9f531b2947f5` — a folder created after the work
- `ab90340b578a25e48c1bb537233a390a0b3221cd5a8c43c89037e42e82efcd51` · sign `716c276d-7caa-4c66-aee6-56d1d3702e73` — checks after a conflict-free merge
- `a213c089ee8c9dbefbbc22e09cb94bf1d2604335767e2b23892cffd2175adc81` · sign `ce7e46e5-413d-4b51-aa21-fbfcaddb82af` — a migration that writes a whole set
- `df68b487107d1c018e736f11bf3bf033008a2daf1b35fc31c2cb93696cbebb0b` · sign `22da89c8-e4f7-449a-846d-d420666209fa` — the case of the commit subject
- `60d29c07edfe5fff94a0125fbdcef07523982ce72064147664ebc63a7981dd5b` · sign `997471fc-031c-4491-9535-1deda87a470f` — the `Docs-skip` line read from the command text only
- `615f8fa5d2b8f7a4690daed30a91effed81fbacb4696484c44ae5ffa797870e5` · sign `8711d67c-c7f9-4eff-842e-1b95570b033e` — the PR base checked on the host
- `4f7b5ad45a2af5bfa2d3cdf39ebe4831da2fc1c4b65eaa805e91e44bfeff0e24` · sign `f7651947-111a-42d1-ae2e-8273400fd02c` — a component past the file limit is split
- `712732f3f01f8677821362059823f6668b3850b233dd3c8cacd289a97ab42a0b` · sign `d19bb4ce-7915-4540-ae46-29a7308beb0e` — a decision moved out of the handler
- `4fdacee647183bc7bb2e1156c330396f8d3e690abcf1c47429b40ee05adf338d` · sign `96f7292b-4e18-4899-ace1-6343742d86af` — a changed scenario is edited in the live spec

## The owner request

> разбери всё новое что есть в приёмнике

Then, at the scope menu: «Все 22 по риску: 3 задачи». Later: «я прямо поставил тебе задачу».

## What the tree already has

- The texts live in `projects/agent-kit/assets/` and reach the tree by `pnpm run agent-kit:sync`.
- Prose files are limited to 330 lines and 24000 characters; the targets here have room (the files
  at the ceiling are task RT-2847).
- Each token of the exploration (a verdict per record) is in `docs/plans/cargo-october.md`.

## What the rules already say

- Rule `doc-style`: a rule at the ceiling takes a new article only by folding an argument next to
  it; the text is edited by the edit tool, not by a shell command.
- Rule `agent-kit-source`: edit, build, lay out.

## Questions and answers

None new: the scope was settled at the menu of the epic.

## Decisions

- **Each record is one item in the nearest existing section, not a new section.** The patterns
  already carry "Common misses"; the new items join them.
- **Records that say one thing are one item.** The two migration records and the deploy rule
  article state the copy once, in the rule, and the pattern points to it.
- **Every variant of a host pair gets the edit where the text is host-independent** (the commit and
  PR patterns exist in three variants).

## What is left unclear

- Whether `typescript-conventions` holds the file limit article itself; the edit decides by reading
  it.
