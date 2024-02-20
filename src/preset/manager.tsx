import { addons } from '@storybook/manager-api';
import { Addon_TypesEnum } from '@storybook/types';
import { themes } from '@storybook/theming';
import * as React from 'react';

import Tool, { prefersDark, store } from '../Tool';

const currentStore = store();
const currentTheme =
  currentStore.current || (prefersDark.matches && 'dark') || 'light';

addons.setConfig({
  theme: {
    ...themes[currentTheme],
    ...currentStore[currentTheme],
  },
});

addons.register('storybook/dark-mode', (api) => {
  addons.add('storybook/dark-mode', {
    title: 'dark mode',
    type: Addon_TypesEnum.TOOL,
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: () => <Tool api={api} />,
  });
});
