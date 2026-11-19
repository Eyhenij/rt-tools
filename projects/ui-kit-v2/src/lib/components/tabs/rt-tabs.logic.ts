import { RtTabDirective } from './rt-tab.directive';
import { IRtTabs } from './rt-tabs.model';

/** Id доступных вкладок: не отключённых, в порядке списка. */
export function rtTabsEnabledIds(tabs: readonly RtTabDirective[]): readonly IRtTabs.Id[] {
    return tabs.filter((tab: RtTabDirective): boolean => !tab.disabled()).map((tab: RtTabDirective): IRtTabs.Id => tab.id());
}
