import * as React from 'react';
import { themes, ThemeVars } from '@storybook/theming';
import { IconButton } from '@storybook/components';
import equal from 'fast-deep-equal';

import Sun from './icons/Sun';
import Moon from './icons/Moon';

interface StorybookAPI {
  getChannel(): { on(event: string, cb: () => void): void };
  setOptions(options: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  getCurrentStoryData(): any;
}

interface DarkModeProps {
  api: StorybookAPI;
  channel: {
    emit(event: string, value: any): void;
  };
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
  if (window.localStorage.getItem('sb-addon-themes-3')) {
    const stored = JSON.parse(window.localStorage.getItem(
      'sb-addon-themes-3'
    ) as string) as DarkModeStore;

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

  defaultStore = { ...defaultStore, ...themes };
  return defaultStore;
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
    props.channel.emit('DARK_MODE', !isDark);
  }

  function renderTheme() {
    const { parameters } = props.api.getCurrentStoryData();

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
    props.channel.emit('DARK_MODE', current === 'dark');
  }

  React.useEffect(() => {
    const channel = props.api.getChannel();
    channel.on('storyChanged', renderTheme);
    channel.on('storiesConfigured', renderTheme);
  }, []);

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
