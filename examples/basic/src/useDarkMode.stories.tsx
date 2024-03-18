import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useDarkMode } from '../../../src';

function TestComponent() {
  const isDark = useDarkMode() ;
  return <div>Dark mode: {isDark ? 'on' : 'off'}</div>;
}

export default {
  title: 'useDarkMode',
  component: TestComponent,
} satisfies Meta;

export const Default = {} satisfies StoryObj;
