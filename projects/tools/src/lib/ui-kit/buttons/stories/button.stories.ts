import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
    BUTTON_APPEARANCE,
    BUTTON_COLOR,
    BUTTON_SIZE,
    ButtonAppearanceType,
    ButtonColorType,
    RtuiButtonComponent,
    ButtonSizeType,
} from '../button/rtui-button.component';
import { Nullable, RtIconOutlinedDirective } from '../../../util';
import { MatIcon } from '@angular/material/icon';

interface ButtonComponentArgs {
    size: ButtonSizeType;
    color: ButtonColorType;
    appearance: Nullable<ButtonAppearanceType>;
}

const meta: Meta<RtuiButtonComponent> = {
    title: 'Components/Button',
    component: RtuiButtonComponent,
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
        size: {
            control: { type: 'select' },
            options: [BUTTON_SIZE.SMALL, BUTTON_SIZE.MEDIUM, BUTTON_SIZE.LARGE, BUTTON_SIZE.FULL],
            description: 'Button size',
        },
        color: {
            control: { type: 'select' },
            options: [BUTTON_COLOR.ACCENT, BUTTON_COLOR.SUCCESS, BUTTON_COLOR.SECONDARY, BUTTON_COLOR.ERROR, BUTTON_COLOR.WARNING],
            description: 'Button color',
        },
        appearance: {
            control: { type: 'select' },
            options: [BUTTON_APPEARANCE.OUTLINE, BUTTON_APPEARANCE.LIGHT, null],
            description: 'Button type',
        },
    },
    decorators: [
        moduleMetadata({
            imports: [MatIcon, RtIconOutlinedDirective],
        }),
    ],
};

export default meta;
type Story = StoryObj<RtuiButtonComponent>;

// Story for buttons with all sizes in one view
export const Sizes: Story = {
    args: {
        color: BUTTON_COLOR.ACCENT,
        appearance: null,
    },
    argTypes: {
        size: { table: { disable: true } },
        color: {
            control: { type: 'select' },
            options: [BUTTON_COLOR.ACCENT, BUTTON_COLOR.SUCCESS, BUTTON_COLOR.SECONDARY, BUTTON_COLOR.ERROR, BUTTON_COLOR.WARNING],
        },
        appearance: {
            control: { type: 'select' },
            options: [BUTTON_APPEARANCE.OUTLINE, BUTTON_APPEARANCE.LIGHT, null],
        },
    },
    render: (args: ButtonComponentArgs) => ({
        props: args,
        template: `
      <div style="display: flex; gap: 16px;">
       <div style="width: fit-content; display: flex; flex-direction: column; gap: 16px;">
        <button rtui-btn [size]="'sm'" [color]="color" [appearance]="appearance" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Small
        </button>
        <button rtui-btn [color]="color" [appearance]="appearance" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Medium
        </button>
        <button rtui-btn [size]="'lg'" [color]="color" [appearance]="appearance" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Large
        </button>
      </div>
      
       <div style="width: fit-content; display: flex; flex-direction: column; gap: 16px;">
        <button rtui-btn [size]="'sm'" [color]="color" [appearance]="appearance" type="button">
          Small
        </button>
        <button rtui-btn [color]="color" [appearance]="appearance" type="button">
          Medium
        </button>
        <button rtui-btn [size]="'lg'" [color]="color" [appearance]="appearance" type="button">
          Large
        </button>
      </div>
      </div>
    `,
    }),
};

// Story for buttons with all colors in one view
export const Colors: Story = {
    args: {
        size: BUTTON_SIZE.MEDIUM,
    },
    argTypes: {
        size: {
            control: { type: 'select' },
            options: [BUTTON_SIZE.SMALL, BUTTON_SIZE.MEDIUM, BUTTON_SIZE.LARGE, BUTTON_SIZE.FULL],
        },
        color: { table: { disable: true } },
        appearance: { table: { disable: true } },
    },
    render: (args: ButtonComponentArgs) => ({
        props: args,
        template: `
      <div style="display: grid; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px;">
          <button rtui-btn [size]="size" [color]="'accent'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Accent
          </button>
          <button rtui-btn [size]="size" [color]="'success'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Success
          </button>
          <button rtui-btn [size]="size" [color]="'secondary'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Secondary
            </button>
          <button rtui-btn [size]="size" [color]="'error'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Error
          </button>
          <button rtui-btn [size]="size" [color]="'warning'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Warning
          </button>
        </div>
        
        <div style="display: flex; gap: 16px;">
          <button rtui-btn [size]="size" [color]="'accent'" [appearance]="'outline'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Accent
          </button>
          <button rtui-btn [size]="size" [color]="'success'" [appearance]="'outline'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Success
          </button>
          <button rtui-btn [size]="size" [color]="'secondary'" [appearance]="'outline'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Secondary
          </button>
          <button rtui-btn [size]="size" [color]="'error'" [appearance]="'outline'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Error
          </button>
          <button rtui-btn [size]="size" [color]="'warning'" [appearance]="'outline'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Warning
          </button>
        </div>

        <div style="display: flex; gap: 16px;">
          <button rtui-btn [size]="size" [color]="'accent'" [appearance]="'light'" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Accent
        </button>
        <button rtui-btn [size]="size" [color]="'success'" [appearance]="'light'" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Success
        </button>
        <button rtui-btn [size]="size" [color]="'secondary'" [appearance]="'light'" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Secondary
        </button>
        <button rtui-btn [size]="size" [color]="'error'" [appearance]="'light'" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Error
        </button>
        <button rtui-btn [size]="size" [color]="'warning'" [appearance]="'light'" type="button">
          <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
          Warning
        </button>
        </div>
      </div>
    `,
    }),
};

// Story for buttons with all appearances in one view
export const Appearances: Story = {
    args: {
        size: BUTTON_SIZE.MEDIUM,
        color: BUTTON_COLOR.ACCENT,
    },
    argTypes: {
        size: {
            control: { type: 'select' },
            options: [BUTTON_SIZE.SMALL, BUTTON_SIZE.MEDIUM, BUTTON_SIZE.LARGE, BUTTON_SIZE.FULL],
        },
        color: {
            control: { type: 'select' },
            options: [BUTTON_COLOR.ACCENT, BUTTON_COLOR.SUCCESS, BUTTON_COLOR.SECONDARY, BUTTON_COLOR.ERROR, BUTTON_COLOR.WARNING],
        },
        appearance: { table: { disable: true } },
    },
    render: (args: ButtonComponentArgs) => ({
        props: args,
        template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px;">
          <button rtui-btn [size]="size" [color]="color" type="button">
            None
          </button>
          <button rtui-btn [size]="size" [color]="color" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            None
          </button>
        </div>

        <div style="display: flex; gap: 16px;">
          <button rtui-btn [size]="size" [color]="color" [appearance]="'outline'" type="button">
            Outline
          </button>
          <button rtui-btn [size]="size" [color]="color" [appearance]="'outline'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Outline
          </button>
        </div>
        
        <div style="display: flex; gap: 16px;">
          <button rtui-btn [size]="size" [color]="color" [appearance]="'light'" type="button">
            Light
          </button>
          <button rtui-btn [size]="size" [color]="color" [appearance]="'light'" type="button">
            <mat-icon [rtIconOutlinedDirective]="'true'">add</mat-icon>
            Light
          </button>
        </div>
      </div>
    `,
    }),
};
