# storybook-dark-mode

A storybook addons that lets your users toggle between dark and light mode.

![Example](./example.gif)

## Installation

Install the following npm module:

```sh
npm i --save-dev storybook-dark-mode
```

or with yarn:

```sh
yarn add -D storybook-dark-mode
```

Then, add following content to .storybook/addons.js

```js
import 'storybook-dark-mode/register';
```

## Configuration

Configure the dark and light mode by adding the following to you `config.js` file:

```js
import { addParameters } from '@storybook/react'; // or any other type of storybook

addParameters({
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark, appBg: 'black' },
    // Override the default light theme
    light: { ...themes.normal, appBg: 'red' }
  }
});
```
