# Findings of the epic RT-2542 — the part started by RT-2584

The findings of RT-2572 noticed after its branch had left travel by the branch of RT-2584, in a
part of their own. Nothing below is applied: the owner reads all parts when the epic is over.

## RT-2572 — `rt-tree` modes of the application

1. **A task folder assembled by hand carries the layout header into the copy.** The folder of
   RT-2584 was copied from the template by hand, because the task card existed before the folder.
   The copies kept the `rt-kit v…` line, and the rule-source guard refused every edit of them as
   an edit of a laid-out file. The creation command strips the line itself; a hand copy does not.
   Address — the rules layer, a proposal to the pattern `task-flow-start`, section «Common
   misses»:

    ```
    - A task folder copied from the template by hand keeps the layout header of every file, and
      the source guard then refuses each edit of the copy. The first line of each copy is removed
      by the same motion as the copy.
    ```

2. **The showcase serves the old story index after a branch switch.** After checking out another
   branch the running showcase on its port kept the stories of the previous branch, and the frame
   showed what the branch no longer had. A restart cured it. Address — the rules layer, a proposal
   to the pattern `ui-component-tests-visual`, item 4:

    ```
    - A showcase left running across a branch switch serves the previous branch's story index.
      The showcase is restarted after every checkout before a frame is read.
    ```

3. **A scenario number taken in an epic branch can be taken in main at the same time.** The tree
   scenarios got SC-UKV-639…643 from the number command in the epic branch, while main gave the
   same numbers to the dot field. The clash showed only at the merge of main into the epic, and the
   renumber needed a task of its own, RT-2584. Address — the names of this tree: the number
   command reads the branch it runs in, so it is run after merging main into the branch.
