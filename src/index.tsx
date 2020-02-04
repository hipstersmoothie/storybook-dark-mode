import React from 'react';
import addons from '@storybook/addons';
import { DARK_MODE_EVENT_NAME } from './constants';

/**
 * Returns the current state of storybook's dark-mode
 */
export function useDarkMode(): boolean {
  const [isDark, setDark] = React.useState(false);

  React.useEffect(() => {
    const chan = addons.getChannel();
    chan.on(DARK_MODE_EVENT_NAME, setDark);
    return () => chan.off(DARK_MODE_EVENT_NAME, setDark);
  }, []);

  return isDark;
}

export * from './constants';
