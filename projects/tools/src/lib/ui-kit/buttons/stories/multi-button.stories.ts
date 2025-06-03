import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { RtuiMultiButtonComponent } from '../multi-button/rtui-multi-button.component';

interface HorecaMultiButtonArgs {
    actions: string[];
    activeAction: string;
}

const meta: Meta<RtuiMultiButtonComponent> = {
    title: 'Components/MultiButton',
    component: RtuiMultiButtonComponent,
    parameters: {
        backgrounds: {
            default: 'white',
            values: [
                { name: 'white', value: '#fff' },
                { name: 'dark', value: '#000000' },
            ],
        },
    },
    argTypes: {
        actions: {
            control: { type: 'object' },
            description: 'Array of available actions',
        },
        activeAction: {
            control: { type: 'text' },
            description: 'Currently active action',
        },
    },
    decorators: [
        moduleMetadata({
            imports: [],
        }),
    ],
};

export default meta;
type Story = StoryObj<RtuiMultiButtonComponent>;

export const FewAction: Story = {
    args: {
        actions: ['Opened', 'Closed'],
        activeAction: 'Opened',
    },
    render: (args: HorecaMultiButtonArgs) => ({
        props: {
            ...args,
            // eslint-disable-next-line
            onChangeActiveAction: (event: string) => console.info('Active action changed:', event),
        },
        template: `
      <div style="max-width: fit-content;">
        <rtui-multi-button
        [actions]="actions"
        [activeAction]="activeAction"
        (changeActiveAction)="onChangeActiveAction($event)"></rtui-multi-button>
      </div>
    `,
    }),
};

export const SeveralActions: Story = {
    args: {
        actions: ['Yesterday', 'Today', 'Week', 'Month', 'Year', 'All'],
        activeAction: 'Today',
    },
    render: (args: HorecaMultiButtonArgs) => ({
        props: {
            ...args,
            // eslint-disable-next-line
            onChangeActiveAction: (event: string) => console.info('Active action changed:', event),
        },
        template: `
      <div style="max-width: fit-content;">
        <rtui-multi-button
        [actions]="actions"
        [activeAction]="activeAction"
        (changeActiveAction)="onChangeActiveAction($event)"></rtui-multi-button>
      </div>
    `,
    }),
};
