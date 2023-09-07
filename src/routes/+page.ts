import { currentTab } from '../stores/admin';

export function _showError(message: string, returnToTab: boolean, tabIdx = -1) {
  // Show error message
  alert(message);

  // Return to navbar tab if necessary
  if (returnToTab && tabIdx > -1) currentTab.update(() => tabIdx);
}
