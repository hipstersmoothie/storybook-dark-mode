import * as React from 'react';
import { themes, ThemeVars } from 'storybook/theming';
import { IconButton } from 'storybook/internal/components';
import { MoonIcon, SunIcon } from '@storybook/icons';
import { STORY_CHANGED, DOCS_RENDERED } from 'storybook/internal/core-events';
import { API, useParameter } from 'storybook/manager-api';
import equal from 'fast-deep-equal';
import { DARK_MODE_EVENT_NAME, UPDATE_DARK_MODE_EVENT_NAME } from './constants';

const modes = ['light', 'dark'] as const;
type Mode = typeof modes[number];

interface DarkModeStore {
  /** The class target in the preview iframe */
  classTarget: string;
  /** The current mode the storybook is set to */
  current: Mode;
  /** The dark theme for storybook */
  dark: ThemeVars;
  /** The dark class name for the preview iframe */
  darkClass: string | string[];
  /** The light theme for storybook */
  light: ThemeVars;
  /** The light class name for the preview iframe */
  lightClass: string | string[];
  /** Apply mode to iframe */
  stylePreview: boolean;
  /** Persist if the user has set the theme */
  userHasExplicitlySetTheTheme: boolean;
}

const STORAGE_KEY = 'sb-addon-themes-3';
const win = globalThis.window;
const doc = globalThis.document;
export const prefersDark = win?.matchMedia?.('(prefers-color-scheme: dark)');

const defaultParams: Required<Omit<DarkModeStore, 'current'>> = {
  classTarget: 'body',
  dark: themes.dark,
  darkClass: ['dark'],
  light: themes.light,
  lightClass: ['light'],
  stylePreview: false,
  userHasExplicitlySetTheTheme: false,
};

/** Persist the dark mode settings in localStorage */
export const updateStore = (newStore: DarkModeStore) => {
  win?.localStorage?.setItem(STORAGE_KEY, JSON.stringify(newStore));
};

/** Add the light/dark class to an element */
const toggleDarkClass = (
  el: Element,
  {
    current,
    darkClass = defaultParams.darkClass,
    lightClass = defaultParams.lightClass,
  }: DarkModeStore
) => {
  if (current === 'dark') {
    el.classList.remove(...arrayify(lightClass));
    el.classList.add(...arrayify(darkClass));
  } else {
    el.classList.remove(...arrayify(darkClass));
    el.classList.add(...arrayify(lightClass));
  }
};

/** Coerce a string to a single item array, or return an array as-is */
const arrayify = (classes: string | string[]): string[] => {
  const arr: string[] = [];
  return arr.concat(classes).map((item) => item);
};

/** Update the preview iframe class */
const updatePreview = (store: DarkModeStore) => {
  const iframe = doc?.getElementById(
    'storybook-preview-iframe'
  ) as HTMLIFrameElement;

  if (!iframe) {
    return;
  }

  const iframeDocument =
    iframe.contentDocument || iframe.contentWindow?.document;
  const target = iframeDocument?.querySelector<HTMLElement>(store.classTarget);

  if (!target) {
    return;
  }

  toggleDarkClass(target, store);
};

/** Update the manager iframe class */
const updateManager = (store: DarkModeStore) => {
  const manager = doc?.querySelector(store.classTarget);

  if (!manager) {
    return;
  }

  toggleDarkClass(manager, store);
};

/** Update changed dark mode settings and persist to localStorage  */
export const store = (
  userTheme: Partial<DarkModeStore> = {}
): DarkModeStore => {
  const storedItem = win?.localStorage?.getItem(STORAGE_KEY);

  if (typeof storedItem === 'string') {
    try {
      const stored = JSON.parse(storedItem) as DarkModeStore;

      if (Object.keys(userTheme).length > 0) {
        if (userTheme.dark && !equal(stored.dark, userTheme.dark)) {
          stored.dark = userTheme.dark;
          updateStore(stored);
        }

        if (userTheme.light && !equal(stored.light, userTheme.light)) {
          stored.light = userTheme.light;
          updateStore(stored);
        }
      }

      return stored;
    } catch {
      // Ignore invalid localStorage payloads and fall through to defaults.
    }
  }

  return { ...defaultParams, ...userTheme } as DarkModeStore;
};

// On initial load, set the dark mode class on the manager
// This is needed if you're using mostly CSS overrides to styles the storybook
// Otherwise the default theme is set in src/preset/manager.tsx
updateManager(store());

interface DarkModeProps {
  /** The storybook API */
  api: API;
}

/** A toolbar icon to toggle between dark and light themes in storybook */
export function DarkMode({ api }: DarkModeProps) {
  const [isDark, setDark] = React.useState(store().current === 'dark');
  const darkModeParams = useParameter<Partial<DarkModeStore>>('darkMode', {});
  const { current: defaultMode, stylePreview, ...params } = darkModeParams;
  const channel = api.getChannel();
  // Save custom themes on init
  const userHasExplicitlySetTheTheme = React.useMemo(
    () => store(params).userHasExplicitlySetTheTheme,
    [params]
  );
  /** Set the theme in storybook, update the local state, and emit an event */
  const setMode = React.useCallback(
    (mode: Mode) => {
      const currentStore = store();
      api.setOptions({ theme: currentStore[mode] });
      setDark(mode === 'dark');
      channel.emit(DARK_MODE_EVENT_NAME, mode === 'dark');
      updateManager(currentStore);
      if (stylePreview) {
        updatePreview(currentStore);
      }
    },
    [api, channel, stylePreview]
  );

  /** Update the theme settings in localStorage, react, and storybook */
  const updateMode = React.useCallback(
    (mode?: Mode) => {
      const currentStore = store();
      const current =
        mode || (currentStore.current === 'dark' ? 'light' : 'dark');
      updateStore({ ...currentStore, current });
      setMode(current);
    },
    [setMode]
  );

  /** Update the theme based on the color preference */
  const prefersDarkUpdate = React.useCallback(
    (event: MediaQueryListEvent) => {
      if (userHasExplicitlySetTheTheme || defaultMode) {
        return;
      }

      updateMode(event.matches ? 'dark' : 'light');
    },
    [defaultMode, updateMode, userHasExplicitlySetTheTheme]
  );

  /** Render the current theme */
  const renderTheme = React.useCallback(() => {
    const { current = 'light' } = store();
    setMode(current);
  }, [setMode]);

  /** Handle the user event and side effects */
  const handleIconClick = () => {
    updateMode();
    const currentStore = store();
    updateStore({ ...currentStore, userHasExplicitlySetTheTheme: true });
  };

  /** When storybook params change update the stored themes */
  React.useEffect(() => {
    const currentStore = store();
    // Ensure we use the stores `current` value first to persist
    // themeing between page loads and story changes.
    updateStore({
      ...currentStore,
      ...darkModeParams,
      current: currentStore.current || darkModeParams.current,
    });
    renderTheme();
  }, [darkModeParams, renderTheme]);
  React.useEffect(() => {
    channel.on(STORY_CHANGED, renderTheme);
    channel.on(DOCS_RENDERED, renderTheme);
    if (prefersDark?.addEventListener) {
      prefersDark.addEventListener('change', prefersDarkUpdate);
    }

    return () => {
      channel.off(STORY_CHANGED, renderTheme);
      channel.off(DOCS_RENDERED, renderTheme);
      if (prefersDark?.removeEventListener) {
        prefersDark.removeEventListener('change', prefersDarkUpdate);
      }
    };
  }, [channel, renderTheme, prefersDarkUpdate]);
  React.useEffect(() => {
    channel.on(UPDATE_DARK_MODE_EVENT_NAME, updateMode);
    return () => {
      channel.off(UPDATE_DARK_MODE_EVENT_NAME, updateMode);
    };
  }, [channel, updateMode]);
  // Storybook's first render doesn't have the global user params loaded so we
  // need the effect to run whenever defaultMode is updated
  React.useEffect(() => {
    // If a users has set the mode this is respected
    if (userHasExplicitlySetTheTheme) {
      return;
    }

    if (defaultMode) {
      updateMode(defaultMode);
    } else if (prefersDark?.matches) {
      updateMode('dark');
    }
  }, [defaultMode, updateMode, userHasExplicitlySetTheTheme]);
  return (
    <IconButton
      key="dark-mode"
      variant="ghost"
      padding="small"
      ariaLabel={isDark ? 'Change theme to light mode' : 'Change theme to dark mode'}
      tooltip={isDark ? 'Change theme to light mode' : 'Change theme to dark mode'}
      onClick={handleIconClick}
    >
      {isDark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
    </IconButton>
  );
}

export default DarkMode;
