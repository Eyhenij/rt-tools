import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtWorkspace } from './rt-workspace.model';

@Directive({
    selector: '[rtWorkspaceDesktopOnly]',
    host: {
        class: 'rt-workspace__desktop-only',
    },
})
export class RtWorkspaceDesktopOnlyDirective {}

@Directive({
    selector: '[rtWorkspaceList]',
})
export class RtWorkspaceListDirective {
    public readonly templateRef: TemplateRef<IRtWorkspace.SlotContext> = inject<TemplateRef<IRtWorkspace.SlotContext>>(TemplateRef);

    public static ngTemplateContextGuard(_directive: RtWorkspaceListDirective, context: unknown): context is IRtWorkspace.SlotContext {
        return true;
    }
}

@Directive({
    selector: '[rtWorkspaceCenter]',
})
export class RtWorkspaceCenterDirective {
    public readonly templateRef: TemplateRef<IRtWorkspace.SlotContext> = inject<TemplateRef<IRtWorkspace.SlotContext>>(TemplateRef);

    public static ngTemplateContextGuard(_directive: RtWorkspaceCenterDirective, context: unknown): context is IRtWorkspace.SlotContext {
        return true;
    }
}

@Directive({
    selector: '[rtWorkspaceAside]',
})
export class RtWorkspaceAsideDirective {
    public readonly templateRef: TemplateRef<IRtWorkspace.SlotContext> = inject<TemplateRef<IRtWorkspace.SlotContext>>(TemplateRef);

    public static ngTemplateContextGuard(_directive: RtWorkspaceAsideDirective, context: unknown): context is IRtWorkspace.SlotContext {
        return true;
    }
}
