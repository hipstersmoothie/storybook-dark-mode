import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} />;
}

export default {
  title: 'Button',
  component: Button,
} satisfies Meta;

export const Basic: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
  }
};
