# Scenarios — the boundary of the rules package

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain:
the numbers continue its numbering and are not recounted after the subdomain is merged in.

### SC-AK-508 — a package resource that started speaking of the intake is refused

Given a text naming the cargo intake or its admin panel lies in the package resources
When the boundary check is run
Then it turns red and names this resource with the reason "the subject exists only at the package
tree"

### SC-AK-509 — a resource called only in the package tree is refused

Given a package resource says of itself that it is called in the repository of the package itself
When the boundary check is run
Then it turns red and names this resource with the reason "there is nobody to call it at a consumer"

### SC-AK-510 — the sending side passes the check

Given the shape of the cargo, the sending and the proposal command lie in the package
When the boundary check is run
Then it stays silent about them: a consumer carries them out

### SC-AK-511 — the list of the cancelled does not close the boundary

Given a resource not for carrying stands in the list of the cancelled at this tree
When the boundary check is run
Then it turns red all the same: the list removes the layout here and does not remove the carrying to
everyone else

### SC-AK-505 — a rule of the tree's own is loaded on a par with a package one

Given the rule of taking the cargo apart moved into the rules of the tree's own
When an edit touches a file the rule answers for and which is in the tree
Then the rules gate demands it by its own branch of the gate map, like every package one

Coverage: partial — the scenario does not judge a removed file. The gate map loses its branch
together with the file it answered for, and a probe on the removed would turn red forever.

### SC-AK-506 — the boundary check enters the push gate

Given a resource not for carrying came back into the package by an edit
When a push of the branch goes
Then the gate refuses the push by a refusal of the boundary check

### SC-AK-507 — the known debt is held by the list, not by the silence of the check

Given a resource not for carrying still lies in the package and is named by the list of the debt
with the address of its move
When the boundary check is run
Then it prints it as a line of debt and answers with zero, and on a resource outside the list it
turns red

### SC-AK-825 — a law of the subjectness of an application is removed from the package

Given the package carries a law whose articles are derived from the subject of one application
When a consumer tree lays it out over its own, more detailed edition
Then the package edition carries away half the articles, and what comes out answers for neither of
the trees

Given such a law is removed from the package, and in the package tree it is alive
When the layout is run
Then the law stays in place as a resource of the tree's own — without a header, and the rule under
it is called by the gate as before

Not covered: the sign "the article is derived from the subject of the tree" demands an understanding
of the text. The boundary check judges something else — the mention of the intake and of the package
tree — and it measures the richness of an edition by nothing. This case is held by the articles of
the spec and by the installation step in the layout rule.
