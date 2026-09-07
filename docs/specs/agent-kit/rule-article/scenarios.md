# Scenarios — the applicability sign at an article of a rule

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

### SC-AK-656 — the refusal names the article by a heading

Given articles of a marked rule are covered by the edit
When the rules gate assembles the text of the refusal
Then the headings of the articles and the reason stand in the refusal: the text will arrive together
with the rule

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-657 — the body of the article is not in the refusal

Given an article whose heading is followed by text is covered by the edit
When the rules gate assembles the text of the refusal
Then the body of the article is not in the refusal: a retelling here is paying for one text twice

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-488 — at an edit of styles its own article arrives

Given an article of a rule carries an applicability sign with a sample of style files
When the parse is called with the path of an edit of a style file
Then the text of this article is printed

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-489 — a foreign article does not get into the refusal

Given the sign of a neighbouring article is named by another sample
When the parse is called with the path of an edit of a style file
Then the neighbouring article is not printed

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-490 — the sign itself does not go into the printed article

Given the article carries the line of the sign
When its text is printed
Then the line of the sign is not in it: it says nothing to a person

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-491 — another kind of edit takes another article

Given the signs of two articles are named by different samples
When the parse is called with the path of an edit of code
Then the article about code is printed

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-492 — nothing matched: nothing is printed

Given not a single sign matched the path of the edit
When the parse ends
Then nothing is printed, and whoever calls is left with the former refusal

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-493 — a rule without a single sign refuses with the former text

Given the rule has not a single marked article
When the parse is called with any path of an edit
Then nothing is printed: an article without a sign is lawful

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-494 — a sample without a directory is compared against the file name

Given the sign is named by a file name without a directory
When the edit arrives as a full path
Then the article is picked: the article says "about such files", and the path carries directories

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-495 — the working directory does not affect the choice of the article

Given a file matching the sample of the sign lies in the working directory
When the parse is called from there
Then the article is picked by the path of the edit: the expansion of names at the parse of the
samples is switched off

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-496 — there is no rule: silence, not a refusal

Given the file of the rule at the named path does not exist
When the parse is called
Then it stays silent and gives back zero

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-497 — there is no path of the edit: silence, not a refusal

Given the path of the edit is empty
When the parse is called
Then it stays silent and gives back zero

Covered: `projects/agent-kit/tests/rule-article.test.sh`.

### SC-AK-498 — the refusal at an edit of styles carries the text of the article

Given at the rule about styling an article with a sample of style files is marked
When the gate refuses an edit of a style file
Then the text of this article stands in the refusal, not the name of the rule alone

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-499 — the whole rule stays the second move

Given the refusal carries the text of the matching article
When the executor reads it to the end
Then it is named there by which call to load the whole rule: the article lifts the reading of the
rule, not the refusal itself

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-500 — an unmarked rule refuses with the former text

Given not one article of the demanded rule has a sign under this path
When the gate refuses the edit
Then the refusal stays as it was — with the name of the rule and the fallback move

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-706 — the companion of the rule is named in the refusal unconditionally

Given a companion lies next to the demanded rule
When the gate refuses the edit
Then the refusal names the path of the companion by a sentence of its own, not by the fallback move
alone: the rule says what must be true, and the companion by what that is true here and what is
named impossible here

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.
