# Approvals

- **Макет:** «Одобряю» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/Design-System-V2?node-id=7327-531

The same answer covered the fields frame
https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/Design-System-V2?node-id=7327-1317: both were
shown in one question.

- **Макет:** «Одобряю» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/Design-System-V2?node-id=7330-2735

The showcase was measured against the three frames by `node tools/kit-match.mjs numbers`: the
tabs story `Molecules/Navigation/Tabs` IconBadge against `7327-531` (128 numbers), the story
`Foundation/Design Tokens/Kit Clear Tabbable` against `7327-1317` (70), the multiselect row of
`Molecules/Forms/FieldExtras` ClearTabbable against `7330-2735` (26). Tab widths and the inline
badge position follow the label's text width, which Figma and the browser raster differently, and
are left out on both sides; the badge is measured from the tab's right edge instead. Before the
match the frame copies were brought to the kit's existing look where they drew it otherwise: the
strip centres unselected tabs, the inline badge is 34 wide, the number field has no stepper, the
date fields keep the calendar in a 32 px button. On the owner's remark «на макете нет нижнего серого бордера тонкого на табах» every strip got the kit's 1 px line under it, and its height and colour joined the match (15 numbers).

- **Совпадение:** 239 из 239 чисел

The corrected frames and the showcase were shown together in one question:

- **Макет:** «Одобряю кадр и витрину» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/Design-System-V2?node-id=7327-531
- **Витрина:** «Одобряю кадр и витрину»
