import addons, { types } from '@storybook/addons';
import * as React from 'react';

import Tool from './Tool';

addons.register('storybook/dark-mode', api => {
  addons.add('storybook/dark-mode', {
    title: 'dark mode',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <Tool api={api} channel={addons.getChannel()} />
  });
});
