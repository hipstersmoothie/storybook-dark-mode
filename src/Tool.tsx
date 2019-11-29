import * as React from 'react';
import { themes, ThemeVars } from '@storybook/theming';
import { IconButton } from '@storybook/components';
import { API } from '@storybook/api';
import equal from 'fast-deep-equal';

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

let defaultStore: DarkModeStore = {
  current: 'light',
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
  const [isDark, setDark] = React.useState(false);

  function setDarkMode() {
    const currentStore = store();
    const current = currentStore.current === 'dark' ? 'light' : 'dark';

    update({
      ...currentStore,
      current
    });
    props.api.setOptions({ theme: currentStore[current] });
    setDark(!isDark);
    props.api.getChannel().emit('DARK_MODE', !isDark);
  }

  function renderTheme() {
    const data = props.api.getCurrentStoryData();

    if (!('parameters' in data)) {
      return;
    }

    const { parameters } = data;
    let darkTheme = themes.dark;
    let lightTheme = themes.light;

    if (parameters && parameters.darkMode) {
      darkTheme = parameters.darkMode.dark || darkTheme;
      lightTheme = parameters.darkMode.light || lightTheme;
    }

    const currentStore = store({
      light: lightTheme,
      dark: darkTheme
    });
    const { current } = currentStore;

    props.api.setOptions({ theme: currentStore[current] });
    setDark(current === 'dark');
    props.api.getChannel().emit('DARK_MODE', current === 'dark');
  }

  React.useEffect(() => {
    const channel = props.api.getChannel();
    channel.on('storyChanged', renderTheme);
    channel.on('storiesConfigured', renderTheme);
    channel.on('docsRendered', renderTheme);
    return () => {
      channel.removeListener('storyChanged', renderTheme);
      channel.removeListener('storiesConfigured', renderTheme);
      channel.removeListener('docsRendered', renderTheme);
    };
  });

  return (
    <IconButton
      key="dark-mode"
      active={isDark}
      title={
        isDark ? 'Change theme to light mode' : 'Change theme to dark mode'
      }
      onClick={setDarkMode}
    >
      {isDark ? <Sun /> : <Moon />}
    </IconButton>
  );
};

export default DarkMode;
