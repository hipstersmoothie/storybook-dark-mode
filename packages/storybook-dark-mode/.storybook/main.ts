import type { StorybookConfig } from '@storybook/react-vite'

export default {
	stories: ['../src/**/*.@(mdx|stories.tsx)'],
	addons: [
		'@storybook/addon-docs',
		'@storybook/addon-vitest',
		'storybook-addon-tag-badges',
		import.meta.resolve('./local-preset.ts')
	],
	framework: '@storybook/react-vite',
	staticDirs: [{ from: '../assets', to: '/assets' }],
	tags: {
		unit: {
			hideFromSidebar: process.env.NODE_ENV === 'production'
		}
	}
} satisfies StorybookConfig
