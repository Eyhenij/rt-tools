# The embedded page of the talks — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. The text
is written before the code, so every rule carries the verdict "Not carried out" and the number of
the task that will carry it out.

- **The consumer decides who to let in, and the service checks only the signature.** — **Not carried out.** The exchange of the signature for the sign of the page is written by the task RT-2312 of the epic RT-2309.
- **The signature is made on the server of the consumer, never in the page.** — **Not carried out.** The sample of such a server is written by the task RT-2314 together with the page of the stand.
- **The signature carries the minute and lives by it.** — **Not carried out.** The spread of the allowed minutes is chosen and checked by the task RT-2312.
- **The sign of the page is given for a time and is asked for anew.** — **Not carried out.** The task RT-2312 gives the sign out, the task RT-2313 asks for it anew when it expires.
- **The sign of the page opens one site.** — **Not carried out.** The narrowing of every read to the site of the sign is written by the task RT-2312.
- **The page shows the same as the panel of the operator, for one site.** — **Not carried out.** The page itself is written by the task RT-2313 on the ready-made pieces of the kit.
- **The page carries no choice of a site.** — **Not carried out.** The page is written by the task RT-2313, and the site comes to it with the key it was embedded with.
- **An answer from the embedded page is a remark of the operator.** — **Not carried out.** The task RT-2313 calls the answer of the operator already written for the panel.

## What it is called here

The secret of the site is a field beside the site in the store of the chat, and the task RT-2312
adds it. The sign of the page is a short-lived token of the service, not the session cookie of the
intake. The ready-made pieces are the list `rt-thread-list` and the chat `rt-chat` of the second
kit — the very ones the panel of the operator is drawn by. The page itself is a build of its own
beside the widget of the visitor, and the widget is the sample of such a build.

## What is not checked here

Nothing checks that the consumer keeps its secret on the server: the service sees a signature and
cannot tell where it was made. The requirement lives in the text of the installation handed to the
consumer, and the sample page of the stand signs on its own side.
