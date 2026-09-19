# The code of a refusal — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The intake refuses a request of a person by a code, not by a sentence.** — `libs/message-bus-common/src/lib/refusal.ts:refusalBody` — the body of every refusal of the intake is assembled by it; the throws stand in the controllers of the sections
- **The code is named by the side that refuses.** — `libs/message-bus-common/src/lib/refusal.ts:ERefusal` — the set is declared once, and a new refusal of the intake appends a member to it
- **The set of the codes lies in the shared lib, one for both sides.** — `libs/message-bus-common/src/lib/refusal.ts:refusalOf` — both sides read the body of an answer by this one call, and neither holds a copy of the set
- **The code is the key of the dictionary.** — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS` — the texts of the refusals stand there under the members of the set; the English ones in `libs/message-bus-admin/common/core/util/src/lib/admin-labels-en.ts:ADMIN_LABELS_EN`
- **The reason is named by the code, the values go beside it by name.** — `libs/message-bus-common/src/lib/refusal.ts:TRefusalParams` — the substitutions travel beside the code and stand in the text by the places of `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:fill`
- **Every code has a text in both sets, and that is proved by a call.** — `libs/message-bus-admin/common/core/util/src/lib/admin-text.service.spec.ts:services` — the scenario `SC-MB-412` walks the whole set on both locales
- **An unknown code is visible by a sign, not by emptiness.** — `libs/message-bus-admin/common/core/util/src/lib/admin-text.service.ts:AdminTextService` — an unfound key comes back as its name in quotes. A code outside the set reaches the display by `libs/message-bus-common/src/lib/refusal.ts:refusalOf`
- **The admin application never shows the word of the intake.** — `libs/message-bus-admin/common/core/util/src/lib/spoken-fault.ts:spokenFaultText` — the field of the body with the sentence is read nowhere in the admin application
- **The answer keeps the code of HTTP it carries today.** — `libs/message-bus-admin/common/core/util/src/lib/spoken-fault.ts:spokenFaultOf` — the kind of the refusal is taken from the number of the answer, the reason from the code
- **An internal error of the intake is not a refusal and gets no code.** — `libs/message-bus-api/accounts/util/src/lib/account-context.ts:accountOf` — such a throw carries an English text and no code; the same at `libs/message-bus-api/trees/util/src/lib/tree-context.ts:treeOf`
- **The body of the answer is assembled in one place, and the code goes into it there.** — `apps/message-bus/src/app/failure.filter.ts:FailureFilter` — the parse of the refusals of the whole application; the code goes into the body next to the sentence
- **The sentence stays in the body while the trees do not know the codes.** — `libs/message-bus-common/src/lib/refusal.ts:refusalSaid` — one table of the sentences for a tree, assembled by the same code

## What the panel shows

The text of a refusal in a panel is a derived value, not a string computed once. The signal of the
kit panel serves as the sign that a refusal happened, and the word itself is read from the
dictionary on every render — `libs/message-bus-admin/common/core/util/src/lib/admin-fault-text.ts:adminFaultText`.
