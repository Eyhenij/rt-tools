import { AnimationTriggerMetadata, animate, state, style, transition, trigger } from '@angular/animations';

export const progressIncreaseAnimation: AnimationTriggerMetadata[] = [
    trigger('progressIncreaseAnimation', [
        state(
            'start',
            style({
                width: '100%',
            })
        ),
        state(
            'end',
            style({
                width: '0',
            })
        ),
        transition('start => end', [animate('0ms')]),
        transition('end => start', [animate('{{ time }}')]),
    ]),
];

export const progressDecreaseAnimation: AnimationTriggerMetadata[] = [
    trigger('progressDecreaseAnimation', [
        state(
            'start',
            style({
                width: '0',
            })
        ),
        state(
            'end',
            style({
                width: '100%',
            })
        ),
        transition('start => end', [animate('0ms')]),
        transition('end => start', [animate('{{ time }}')]),
    ]),
];
