import * as React from 'react';
import { themes, ThemeVars } from '@storybook/theming';
import { IconButton } from '@storybook/components';
import {
  STORY_CHANGED,
  STORIES_CONFIGURED,
  DOCS_RENDERED
} from '@storybook/core-events';
import { API, useParameter } from '@storybook/api';
import equal from 'fast-deep-equal';
import { DARK_MODE_EVENT_NAME } from './constants';

import Sun from './icons/Sun';
import Moon from './icons/Moon';

const modes = ['light', 'dark'] as const;
type Mode = typeof modes[number];

interface DarkModeStore {
  /** The current mode the storybook is set to */
  current: Mode;
  /** The dark theme for storybook */
  dark: ThemeVars;
  /** The dark class name for the preview iframe */
  darkClass: string;
  /** The light theme for storybook */
  light: ThemeVars;
  /** The light class name for the preview iframe */
  lightClass: string;
}

const STORAGE_KEY = 'sb-addon-themes-3';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const defaultParams: Partial<DarkModeStore> = {
  dark: themes.dark,
  light: themes.light
};

/** Persist the dark mode settings in localStorage */
const update = (newStore: DarkModeStore) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
};

/** Update the preview iframe class */
const updatePreview = (newStore: DarkModeStore) => {
  const iframe = document.getElementById('storybook-preview-iframe') as HTMLIFrameElement;
  if (!iframe) {
    return;
  }

  const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
  const body = iframeDocument?.body as HTMLBodyElement;

  const { current, darkClass, lightClass } = newStore;

  if (current === 'dark') {
    body.classList.add(darkClass || 'dark');
    body.classList.remove(lightClass || 'light');
  } else {
    body.classList.add(lightClass || 'light');
    body.classList.remove(darkClass || 'dark');
  }
};

/** Update changed dark mode settings and persist to localStorage  */
const store = (themes: Partial<DarkModeStore> = {}): DarkModeStore => {
  const storedItem = window.localStorage.getItem(STORAGE_KEY);

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

  return { ...defaultParams, ...themes } as DarkModeStore;
};

interface DarkModeProps {
  /** The storybook API */
  api: API;
}

/** A toolbar icon to toggle between dark and light themes in storybook */
export const DarkMode = ({ api }: DarkModeProps) => {
  const [isDark, setDark] = React.useState(prefersDark.matches);
  const { current: defaultMode, ...params } = useParameter<
    Partial<DarkModeStore>
  >('darkMode', {
    dark: themes.dark,
    light: themes.light
  });
  // const lastMode = React.useRef(defaultMode);

  // Save custom themes on init
  const initialMode = React.useRef(store(params).current);

  /** Set the theme in storybook, update the local state, and emit an event */
  const setMode = React.useCallback(
    (mode: Mode) => {
      const currentStore = store();
      console.log('set', mode);
      api.setOptions({ theme: currentStore[mode] });
      setDark(mode === 'dark');
      api.getChannel().emit(DARK_MODE_EVENT_NAME, mode === 'dark');
      updatePreview(currentStore);
    },
    [api]
  );

  /** Update the theme settings in localStorage, react, and storybook */
  const updateMode = React.useCallback(
    (mode?: Mode) => {
      const currentStore = store();
      const current =
        mode || (currentStore.current === 'dark' ? 'light' : 'dark');

      update({ ...currentStore, current });
      setMode(current);
    },
    [setMode]
  );

  /** Update the theme based on the color preference */
  function prefersDarkUpdate(event: MediaQueryListEvent) {
    updateMode(event.matches ? 'dark' : 'light');
  }

  /** Render the current theme */
  function renderTheme() {
    const { current } = store();
    setMode(current);
  }

  React.useEffect(() => {
    const channel = api.getChannel();

    channel.on(STORY_CHANGED, renderTheme);
    channel.on(STORIES_CONFIGURED, renderTheme);
    channel.on(DOCS_RENDERED, renderTheme);
    prefersDark.addListener(prefersDarkUpdate);

    return () => {
      channel.removeListener(STORY_CHANGED, renderTheme);
      channel.removeListener(STORIES_CONFIGURED, renderTheme);
      channel.removeListener(DOCS_RENDERED, renderTheme);
      prefersDark.removeListener(prefersDarkUpdate);
    };
  });

  // Storybook's first render doesn't have the global user params loaded so we
  // need the effect to run whenever defaultMode is updated
  React.useEffect(() => {
    // If a users has set the mode this is respected
    if (initialMode.current) {
      return;
    }

    if (defaultMode) {
      updateMode(defaultMode);
    } else if (prefersDark.matches) {
      updateMode('dark');
    }
  }, [defaultMode, updateMode]);

  return (
    <IconButton
      key="dark-mode"
      active={isDark}
      title={
        isDark ? 'Change theme to light mode' : 'Change theme to dark mode'
      }
      onClick={() => updateMode()}
    >
      {isDark ? <Sun /> : <Moon />}
    </IconButton>
  );
};

export default DarkMode;
