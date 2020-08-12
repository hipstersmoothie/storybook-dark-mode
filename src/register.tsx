import addons, { types } from '@storybook/addons';
import * as React from 'react';

import Tool, { prefersDark, store } from './Tool';

const currentStore = store();

addons.setConfig({
  theme:
    currentStore[
      currentStore.current || (prefersDark.matches && 'dark') || 'light'
    ]
});

addons.register('storybook/dark-mode', api => {
  addons.add('storybook/dark-mode', {
    title: 'dark mode',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: () => <Tool api={api} />
  });
});
