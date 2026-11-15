import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import {
    RtAiPromptInputComponent,
    RtButtonDirective,
    RtConfirmDirective,
    RtDeltaViewComponent,
    RtEmptyStateComponent,
    RtFileCardComponent,
    RtFileDropComponent,
    RtIconButtonComponent,
    RtIconComponent,
    RtMenuComponent,
    RtNoteComponent,
    RtServiceLogoComponent,
    RtSkeletonWrapperComponent,
    RtSpinnerComponent,
    RtToolbarComponent,
    RtToolbarLeftDirective,
    RtToolbarRightDirective,
    RtTooltipDirective,
} from '@rt-tools/ui-kit-v2';
import { RtChatMessageHasActionsPipe } from './rt-chat-message-actions.pipe';
import { RtChatStatusLabelPipe } from '../../pipes/rt-chat-status-label.pipe';
import { RtMessageComposerComponent } from '../message-composer/rt-message-composer.component';

/**
 * Что рисует шаблон `rt-chat`. Лежит отдельно от класса, чтобы файл компонента остался в пределе
 * длины: список нужен только декоратору, класс его не читает.
 */
export const RT_CHAT_IMPORTS: Type<unknown>[] = [
    // Angular
    CdkTextareaAutosize,
    DatePipe,
    NgTemplateOutlet,
    ReactiveFormsModule,

    // standalone components / directives
    RtAiPromptInputComponent,
    RtButtonDirective,
    RtChatStatusLabelPipe,
    RtConfirmDirective,
    RtDeltaViewComponent,
    RtEmptyStateComponent,
    RtFileCardComponent,
    RtFileDropComponent,
    RtIconButtonComponent,
    RtIconComponent,
    RtChatMessageHasActionsPipe,
    RtMenuComponent,
    RtMessageComposerComponent,
    RtNoteComponent,
    RtServiceLogoComponent,
    RtSkeletonWrapperComponent,
    RtSpinnerComponent,
    RtToolbarComponent,
    RtToolbarLeftDirective,
    RtToolbarRightDirective,
    RtTooltipDirective,
    BlockDirective,
    ElemDirective,
    ModDirective,
];
