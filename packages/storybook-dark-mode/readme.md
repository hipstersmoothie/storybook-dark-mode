# @storybook-community/storybook-dark-mode

[![NPM version][npm_image]](https://npmjs.org/package/@storybook-community/storybook-dark-mode)
[![NPM downloads][downloads_image]](https://npmjs.org/package/@storybook-community/storybook-dark-mode)

A Storybook addon that lets your users toggle between dark and light mode.

> [!NOTE]
> This is a fork of [storybook-dark-mode](https://github.com/hipstersmoothie/storybook-dark-mode) by [@hipstersmoothie](https://github.com/hipstersmoothie) supporting Storybook 11.
>
> For Storybook 10, use version 7.x.

![Example](./assets/example.gif)

## Installation

```sh
npm i --save-dev @storybook-community/storybook-dark-mode

yarn add -D @storybook-community/storybook-dark-mode

pnpm add -D @storybook-community/storybook-dark-mode
```

## Configuration

Add the following content to `.storybook/main.ts`

```ts
// .storybook/main.ts
export default {
  addons: [
    // '@storybook/addon-docs' is required for the dark mode to work
    '@storybook/addon-docs',
    '@storybook-community/storybook-dark-mode'
  ]
};
```

Configure the dark and light mode by adding the following to your `.storybook/preview.ts` file:

### CSF 3

```ts
// .storybook/preview.ts
import { themes } from 'storybook/theming';

export const parameters = {
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark, appBg: 'black' },
    // Override the default light theme
    light: { ...themes.normal, appBg: 'red' }
  }
};
```

### CSF Next

```ts
// .storybook/preview.ts
import { definePreview } from '@storybook/your-framework'
import addonDocs from '@storybook/addon-docs'
import addonDarkMode from '@storybook-community/storybook-dark-mode'
import { themes } from 'storybook/theming'

export default definePreview({
  // Load addon annotations
  addons: [addonDocs(), addonDarkMode()],
  parameters: {
    darkMode: {
      // Override the default dark theme
      dark: { ...themes.dark, appBg: 'black' },
      // Override the default light theme
      light: { ...themes.normal, appBg: 'red' }
    }
  }
})
```

### Default Theme

Order of precedence for the initial color scheme:

1. If the user has previously set a color theme, it's used
2. The value you have configured for `current` parameter in your storybook
3. The OS color scheme preference

Once the initial color scheme has been set, subsequent reloads will use this value.
To clear the cached color scheme, you need to run `localStorage.clear()` in the browser console.

```ts
// .storybook/preview.ts
export const parameters = {
  darkMode: {
    // Set the initial theme
    current: 'light'
  }
}
```

### Dark/Light Class

This plugin will apply a dark and light class name to the manager.
This allows you to easily write dark-mode-aware theme overrides for the Storybook UI.

You can override the classNames applied when switching between light and dark mode using the `darkClass` and `lightClass` parameters.

```js
export const parameters = {
  darkMode: {
    darkClass: 'lights-out',
    lightClass: 'lights-on'
  }
};
```

You can also pass an array to apply multiple classes.

```js
export const parameters = {
  darkMode: {
    darkClass: ['lights-out', 'foo'],
    lightClass: ['lights-on', 'bar']
  }
};
```

### Preview Class Target

This plugin will apply the dark/light class to the `<body>` element of the preview iframe. This can be configured with the `classTarget` parameter.
The value will be passed to a `querySelector()` inside the iframe.

This is useful if the `<body>` is styled according to a parent element's class; in that case, it can be set to `html`.

```js
export const parameters = {
  darkMode: {
    classTarget: 'html'
  }
};
```

### Preview `ClassName`

This plugin will apply the `darkClass` and `lightClass` classes to the preview iframe if you enable the `stylePreview` option.

```js
export const parameters = {
  darkMode: {
    stylePreview: true
  }
};
```

### Support for Docs mode

```js
// .storybook/preview.ts
import { DarkModeDocsContainer } from '@storybook-community/storybook-dark-mode/docs'

export const parameters = {
  docs: {
    container: DarkModeDocsContainer
  }
}
```

### React

If your components use a custom Theme provider, you can integrate it by using the provided hook.

```js
import { useDarkMode } from '@storybook-community/storybook-dark-mode'

// your theme provider
import ThemeContext from './theme'

// create a component that uses the dark mode hook
function ThemeWrapper(props) {
  // render your custom theme provider
  return (
    <ThemeContext.Provider value={useDarkMode() ? darkTheme : defaultTheme}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export const decorators = [renderStory => <ThemeWrapper>{renderStory()}</ThemeWrapper>];
```

#### Theme Knobs

If you want to have your UI's dark mode separate from your components' dark mode, implement this global decorator:

```js
import { select } from '@storybook/addon-controls'
import { createElement } from 'react'
import { themes } from 'storybook/theming'
import ThemeProvider from './ThemeProvider'

// Add a global decorator that will render a dark background when the
// "Color Scheme" control is set to dark
const knobDecorator = storyFn => {
  // A control for color scheme added to every story
  const colorScheme = select('Color Scheme', ['light', 'dark'], 'light')

  // Hook your theme provider with some controls
  return createElement(ThemeProvider, {
    // A control for theme added to every story
    theme: select('Theme', Object.keys(themes), 'default'),
    colorScheme,
    children: [
      createElement('style', {
        dangerouslySetInnerHTML: {
          __html: `html { ${
            colorScheme === 'dark' ? 'background-color: rgb(35,35,35);' : ''
          } }`
        }
      }),
      storyFn()
    ]
  });
};

export const decorators = [knobDecorator]
```

### Events

You can also listen for the `DARK_MODE` event via the addons channel.

```js
import { DARK_MODE_EVENT_NAME } from '@storybook-community/storybook-dark-mode'
import { useState, useEffect } from 'react'
import { addons } from 'storybook/preview-api'

// your theme provider
import ThemeContext from './theme'

// get channel to listen to event emitter
const channel = addons.getChannel()

// create a component that listens for the DARK_MODE event
function ThemeWrapper(props) {
  // this example uses hooks, but you can also use a class component as well
  const [isDark, setDark] = useState(false)

  useEffect(() => {
    // listen to DARK_MODE event
    channel.on(DARK_MODE_EVENT_NAME, setDark)
    return () => channel.off(DARK_MODE_EVENT_NAME, setDark)
  }, [channel, setDark])

  // render your custom theme provider
  return (
    <ThemeContext.Provider value={isDark ? darkTheme : defaultTheme}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const decorators = [renderStory => <ThemeWrapper>{renderStory()}</ThemeWrapper>]
```

[downloads_image]: https://img.shields.io/npm/dm/@storybook-community/storybook-dark-mode.svg?style=flat
[npm_image]: https://img.shields.io/npm/v/@storybook-community/storybook-dark-mode.svg?style=flat
