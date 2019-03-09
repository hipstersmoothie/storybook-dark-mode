import * as React from 'react';
import { themes } from '@storybook/theming';
import { IconButton } from '@storybook/components';

import Sun from './icons/Sun';
import Moon from './icons/Moon';

interface DarkModeProps {
  api: {
    setOptions(options: any): void;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    getCurrentStoryData(): any;
  };
}

export const DarkModeHooks: React.FunctionComponent<DarkModeProps> = props => {
  const [isDark, setDark] = React.useState(false);

  function setDarkMode() {
    const { parameters } = props.api.getCurrentStoryData();

    let darkTheme = themes.dark;
    let lightTheme = themes.light;

    if (parameters && parameters.darkMode) {
      darkTheme = parameters.darkMode.dark || darkTheme;
      lightTheme = parameters.darkMode.light || lightTheme;
    }

    props.api.setOptions({
      isDark,
      theme: isDark ? darkTheme : lightTheme
    });

    setDark(!isDark);
  }

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
