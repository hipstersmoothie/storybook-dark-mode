import * as React from 'react';
import { themes, ThemeVars } from '@storybook/theming';
import { IconButton } from '@storybook/components';
import { API, useParameter } from '@storybook/api';
import equal from 'fast-deep-equal';
import { DARK_MODE_EVENT_NAME } from './constants';

import Sun from './icons/Sun';
import Moon from './icons/Moon';

interface DarkModeProps {
  api: API;
}

interface DarkModeStore {
  current: 'dark' | 'light';
  dark: ThemeVars;
  light: ThemeVars;
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const defaultStore: DarkModeStore = {
  current: prefersDark.matches ? 'dark' : 'light',
  dark: themes.dark,
  light: themes.light
};

const update = (newStore: DarkModeStore) => {
  window.localStorage.setItem('sb-addon-themes-3', JSON.stringify(newStore));
};

const store = (themes: Partial<DarkModeStore> = {}): DarkModeStore => {
  const storedItem = window.localStorage.getItem('sb-addon-themes-3');
  if (typeof storedItem === 'string') {
    const stored: DarkModeStore = JSON.parse(storedItem);

    if (themes) {
      if (themes.dark && !equal(stored.dark, themes.dark)) {
        stored.dark = themes.dark;
        update(stored);
      }

      if (themes.light && !equal(stored.light, themes.light)) {
        stored.light = themes.light;
        update(stored);
      }
    }

    return stored;
  }

  return { ...defaultStore, ...themes };
};

export const DarkMode: React.FunctionComponent<DarkModeProps> = props => {
  const [isDark, setDark] = React.useState(prefersDark.matches);
  const params = useParameter('darkMode', {
    dark: themes.dark,
    light: themes.light
  });

  // Save custom themes on init
  store(params);
  function setMode(mode?: 'dark' | 'light') {
    const currentStore = store(params);
    const current =
      mode || (currentStore.current === 'dark' ? 'light' : 'dark');

    update({
      ...currentStore,
      current
    });
    props.api.setOptions({ theme: currentStore[current] });
    setDark(!isDark);
    props.api.getChannel().emit(DARK_MODE_EVENT_NAME, !isDark);
  }

  function prefersDarkUpdate(event: MediaQueryListEvent) {
    setMode(event.matches ? 'dark' : 'light');
  }

  function renderTheme() {
    const currentStore = store(params);
    const { current } = currentStore;

    props.api.setOptions({ theme: currentStore[current] });
    setDark(current === 'dark');
    props.api.getChannel().emit(DARK_MODE_EVENT_NAME, current === 'dark');
  }

  React.useEffect(() => {
    const channel = props.api.getChannel();
    channel.on('storyChanged', renderTheme);
    channel.on('storiesConfigured', renderTheme);
    channel.on('docsRendered', renderTheme);
    prefersDark.addListener(prefersDarkUpdate);
    return () => {
      channel.removeListener('storyChanged', renderTheme);
      channel.removeListener('storiesConfigured', renderTheme);
      channel.removeListener('docsRendered', renderTheme);
      prefersDark.removeListener(prefersDarkUpdate);
    };
  });

  return (
    <IconButton
      key="dark-mode"
      active={isDark}
      title={
        isDark ? 'Change theme to light mode' : 'Change theme to dark mode'
      }
      onClick={() => setMode()}
    >
      {isDark ? <Sun /> : <Moon />}
    </IconButton>
  );
};

export default DarkMode;
