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

### Default Theme

Order of precedence for the initial color scheme:

1. If the user has previously set a color theme it's used
2. The value you have configured for `current` parameter in your storybook
3. The OS color scheme preference

Once the initial color scheme has been set, subsequent reloads will use this value.
To clear the cached color scheme you have to `localStorage.clear()` in the chrome console.

```js
import { addParameters } from '@storybook/react';

addParameters({
  darkMode: {
    // Set the initial theme
    current: 'light'
  }
});
```

## Story integration

If your components use a custom Theme provider, you can integrate it by using the provided hook.

```js
import { useDarkMode } from 'storybook-dark-mode';
import { addDecorator } from '@storybook/react';

// your theme provider
import ThemeContext from './theme';

// create a component that uses the dark mode hook
function ThemeWrapper(props) {
  // render your custom theme provider
  return (
    <ThemeContext.Provider value={useDarkMode() ? darkTheme : defaultTheme}>
      {props.children}
    </ThemeContext.Provider>
  );
}

addDecorator(renderStory => <ThemeWrapper>{renderStory()}</ThemeWrapper>);
```

You can also listen for the `DARK_MODE` event via the addons channel.

```js
import addons from '@storybook/addons';
import { addDecorator } from '@storybook/react';

// your theme provider
import ThemeContext from './theme';

// get channel to listen to event emitter
const channel = addons.getChannel();

// create a component that listens for the DARK_MODE event
function ThemeWrapper(props) {
  // this example uses hook but you can also use class component as well
  const [isDark, setDark] = useState(false);

  useEffect(() => {
    // listen to DARK_MODE event
    channel.on('DARK_MODE', setDark);
    return () => channel.off('DARK_MODE', setDark);
  }, [channel, setDark]);

  // render your custom theme provider
  return (
    <ThemeContext.Provider value={isDark ? darkTheme : defaultTheme}>
      {props.children}
    </ThemeContext.Provider>
  );
}

addDecorator(renderStory => <ThemeWrapper>{renderStory()}</ThemeWrapper>);
```

Or if you want to have you UI's dark mode seperate from you components' dark mode, implement this global decorator:

```js
// Add a global decorator that will render a dark background when the
// "Color Scheme" knob is set to dark
addDecorator(function(storyFn) {
  // A knob for color scheme added to every story
  const colorScheme = select('Color Scheme', ['light', 'dark'], 'light');

  // Hook your theme provider with some knobs
  return React.createElement(ThemeProvider, {
    // A knob for theme added to every story
    theme: select('Theme', Object.keys(themes), 'default'),
    colorScheme,
    children: [
      React.createElement('style', {
        dangerouslySetInnerHTML: {
          __html: `html { ${
            colorScheme === 'dark' ? 'background-color: rgb(35,35,35);' : ''
          } }`
        }
      }),
      storyFn()
    ]
  });
});
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://hipstersmoothie.com"><img src="https://avatars3.githubusercontent.com/u/1192452?v=4" width="100px;" alt=""/><br /><sub><b>Andrew Lisowski</b></sub></a><br /><a href="#question-hipstersmoothie" title="Answering Questions">💬</a> <a href="https://github.com/hipstersmoothie/storybook-dark-mode/commits?author=hipstersmoothie" title="Code">💻</a> <a href="#design-hipstersmoothie" title="Design">🎨</a> <a href="https://github.com/hipstersmoothie/storybook-dark-mode/commits?author=hipstersmoothie" title="Documentation">📖</a> <a href="#ideas-hipstersmoothie" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-hipstersmoothie" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-hipstersmoothie" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://trutoo.com/people/erik-hughes"><img src="https://avatars3.githubusercontent.com/u/455178?v=4" width="100px;" alt=""/><br /><sub><b>Erik Hughes</b></sub></a><br /><a href="https://github.com/hipstersmoothie/storybook-dark-mode/commits?author=Swiftwork" title="Code">💻</a></td>
    <td align="center"><a href="https://adamyonk.com"><img src="https://avatars3.githubusercontent.com/u/33258?v=4" width="100px;" alt=""/><br /><sub><b>Adam Jahnke</b></sub></a><br /><a href="https://github.com/hipstersmoothie/storybook-dark-mode/commits?author=adamyonk" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/carlesnunez"><img src="https://avatars3.githubusercontent.com/u/5639972?v=4" width="100px;" alt=""/><br /><sub><b>Carles Núñez</b></sub></a><br /><a href="https://github.com/hipstersmoothie/storybook-dark-mode/commits?author=carlesnunez" title="Code">💻</a></td>
    <td align="center"><a href="https://adamdierkens.com"><img src="https://avatars1.githubusercontent.com/u/13004162?v=4" width="100px;" alt=""/><br /><sub><b>Adam Dierkens</b></sub></a><br /><a href="https://github.com/hipstersmoothie/storybook-dark-mode/commits?author=adierkens" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
