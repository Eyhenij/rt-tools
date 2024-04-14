import { IBreakpoints } from './breakpoints.model';

export class Breakpoints implements IBreakpoints {
    public readonly xl: string = '1920px';
    public readonly lg: string = '1280px';
    public readonly md: string = '960px';
    public readonly sm: string = '720px';
    public readonly xs: string = '600px';
}
