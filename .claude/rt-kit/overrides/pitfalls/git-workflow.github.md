## Traps of this machine

- **The runner on this machine is not alone: the queue of another tree stands next to it.** Its
  run takes the processor whole, and this tree's job queues up or loses the connection during
  preparation — before its first own step, with a single line in the journal. This reads as a
  runner failure and is cured by a restart: there is nothing to analyse by the run's code, the
  code is not there yet.
