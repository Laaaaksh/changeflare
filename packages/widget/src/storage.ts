const LAST_READ_KEY = "changeflare:lastReadAt";

/**
 * localStorage can throw in private-browsing/embedded contexts (e.g. third-party
 * iframe cookie restrictions). Every call is wrapped so a storage failure degrades
 * to "always show as unread" rather than breaking the widget.
 */
export function getLocalLastReadAt(): string | null {
  try {
    return window.localStorage.getItem(LAST_READ_KEY);
  } catch {
    return null;
  }
}

export function setLocalLastReadAt(value: string): void {
  try {
    window.localStorage.setItem(LAST_READ_KEY, value);
  } catch {
    // Storage unavailable — nothing to do, badge just won't persist across reloads.
  }
}
