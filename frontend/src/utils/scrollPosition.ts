/**
 * Utility to save and restore scroll positions for better UX
 */

const SCROLL_POSITION_KEY = 'escort_list_scroll_position';

export const scrollPositionUtil = {
  /**
   * Save current scroll position
   */
  saveScrollPosition: (pathname: string) => {
    if (typeof window === 'undefined') return;

    const position = window.scrollY;
    const data = {
      pathname,
      position,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save scroll position:', error);
    }
  },

  /**
   * Restore scroll position for a given pathname
   */
  restoreScrollPosition: (pathname: string) => {
    if (typeof window === 'undefined') return;

    try {
      const saved = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (!saved) return;

      const data = JSON.parse(saved);

      // Only restore if it's for the same pathname and within last 5 minutes
      const fiveMinutes = 5 * 60 * 1000;
      if (
        data.pathname === pathname &&
        Date.now() - data.timestamp < fiveMinutes
      ) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo({
            top: data.position,
            behavior: 'instant' as ScrollBehavior,
          });
        });

        // Clear after restoration
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }
    } catch (error) {
      console.error('Failed to restore scroll position:', error);
    }
  },

  /**
   * Clear saved scroll position
   */
  clearScrollPosition: () => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(SCROLL_POSITION_KEY);
    } catch (error) {
      console.error('Failed to clear scroll position:', error);
    }
  },
};
