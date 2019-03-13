import * as React from 'react';
import { themes, ThemeVars } from '@storybook/theming';
import { IconButton } from '@storybook/components';

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
    return JSON.parse(window.localStorage.getItem(
      'sb-addon-themes-3'
    ) as string);
  }

  defaultStore = { ...defaultStore, ...themes };
  return defaultStore;
};

function setTheme({
  api,
  toggle,
  themes
}: {
  api: StorybookAPI;
  toggle?: boolean;
  themes?: { dark?: ThemeVars; light?: ThemeVars };
}) {
  const currentStore = store(themes);
  let { current } = currentStore;

  if (toggle) {
    current = currentStore.current === 'dark' ? 'light' : 'dark';
    update({
      ...currentStore,
      current
    });
  }

  api.setOptions({ theme: currentStore[current] });

  return current;
}

export const DarkModeHooks: React.FunctionComponent<DarkModeProps> = props => {
  const [isDark, setDark] = React.useState(false);

  function setDarkMode() {
    setTheme({ api: props.api, toggle: true });
    setDark(!isDark);
    props.channel.emit('DARK_MODE', !isDark);
  }

  React.useEffect(() => {
    const channel = props.api.getChannel();

    channel.on('storiesConfigured', () => {
      const { parameters } = props.api.getCurrentStoryData();

      let darkTheme = themes.dark;
      let lightTheme = themes.light;

      if (parameters && parameters.darkMode) {
        darkTheme = parameters.darkMode.dark || darkTheme;
        lightTheme = parameters.darkMode.light || lightTheme;
      }

      const current = setTheme({
        api: props.api,
        themes: {
          light: lightTheme,
          dark: darkTheme
        }
      });

      setDark(current === 'dark');
      props.channel.emit('DARK_MODE', current === 'dark');
    });
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

export default DarkModeHooks;
