<!-- rt-kit v0.28.0 · laws/observability.md · 8f35460cce83 · правится надстройкой, не здесь -->
# Law on observability

What the owner knows about how their application runs. If a breakage can be learned about only
through access to the server, the owner learns of it from a guest, and late.

**Revision:** 2026-08-13

## Articles

- **An application failure is visible to the owner without access to the server.** The owner
  does not log in to the server, so anything visible only from there is out of their reach.
- **A failure is kept after the application restarts, and months later.** A breakage is
  investigated after it has happened, and by then the application output is overwritten.
- **All failures of one request are found by one marker.** At a dozen requests per second they
  cannot be told apart by time.
- **Whoever ran into a failure receives the request number and can name it.** Otherwise a
  complaint gives nothing to search by.
- **The request number and a generic error text go outside. The details stay inside.** The
  details show how the application is built.
- **Failure details are closed by a right.** They show who was in the system and what exactly
  broke the application.
- **The owner learns of a new failure by themselves, without opening the screen.** Otherwise the
  breakage is noticed only when someone gets around to the screen.
- **A call to a foreign service has a wait limit.** A silent service differs from a failed one
  only by time: without a limit the call hangs until the environment default, the failure never
  comes, and there is nothing to record. All that time the owner sees healthy work.
- **A call to a foreign service leaves a record, and the record is created before the call.** A
  record after the reply says only what got through: an attempt cut off midway cannot be told
  from one never started, and the owner sees only the successful outcomes.
- **A failure is not recorded at the expense of the application's work.** The reply does not
  wait for the record, and the request does not fall because of it. If the record failed, that
  is visible.
- **The application does not write failures about its own recording of failures.** Otherwise a
  broken store spawns a stream that feeds itself.
- **A failure is what did not work, not every served request.** Otherwise the stream of foreign
  requests decides how much the application keeps about itself.
- **The failure store has a limit, and it is checked before space runs out.** Otherwise the
  failure store brings down the application it watches.
- **Secrets and personal data are scrubbed before the record is written.** After the record they
  are removed by editing data, and that is costlier and not always possible.

## Open questions

- **Q-O-1.** Where to put a failure that happened before the application came up. There is no
  store yet at that moment. Now such a failure stays only in the application output.
- **Q-O-2.** Whether to keep failures of the wrapper — what stands in front of the application
  and serves pages. Its output does not reach the application, and it has to be read separately.
