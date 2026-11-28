import { MoonIcon, SunIcon } from '@storybook/icons'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from 'storybook/internal/components'
import { type API, addons, useParameter } from 'storybook/manager-api'
import { mergeThemeWithBrandConfig } from '../_internal/utils/merge_theme_with_brand_config'
import type { DarkModeStore } from '../_internal/utils/store'
import { prefersDark, store, toggleDarkClass, updateStore } from '../_internal/utils/store'
import { getManagerTarget } from '../manager/_utils'
import { getPreviewTarget } from '../preview/_utils'
import { DARK_MODE_EVENT_NAME, UPDATE_DARK_MODE_EVENT_NAME } from '../static/constants'
import type { Mode } from '../static/types'

interface DarkModeProps {
	/** The storybook API */
	api: API
}

/** A toolbar icon to toggle between dark and light themes in storybook */
export function DarkModeToggle({ api }: DarkModeProps) {
	const [isDark, setDark] = useState(prefersDark.matches)
	const darkModeParams = useParameter<Partial<DarkModeStore>>('darkMode', {})
	const { current: defaultMode, stylePreview, ...params } = darkModeParams
	const docs = useParameter<{ theme?: { base: 'dark' | 'light' } }>('docs')
	const channel = addons.getChannel()
	// Save custom themes on init
	const userHasExplicitlySetTheTheme = useMemo(() => store(params).userHasExplicitlySetTheTheme, [params])
	/** Set the theme in storybook, update the local state, and emit an event */
	const setMode = useCallback(
		(mode: Mode) => {
			const currentStore = store()

			api.setOptions({
				theme: mergeThemeWithBrandConfig(currentStore[mode], addons.getConfig()?.theme)
			})
			setDark(mode === 'dark')
			channel.emit(DARK_MODE_EVENT_NAME, mode === 'dark')
			const managerTarget = getManagerTarget(currentStore.classTarget)
			if (managerTarget) {
				toggleDarkClass(managerTarget, currentStore)
			}
			if (stylePreview) {
				const target = getPreviewTarget(currentStore.classTarget)
				if (target) {
					toggleDarkClass(target, currentStore)
				}
			}
		},
		[api, stylePreview]
	)

	/** Update the theme settings in localStorage, react, and storybook */
	const updateMode = useCallback(
		(mode?: Mode) => {
			const currentStore = store()
			const current = mode || (currentStore.current === 'dark' ? 'light' : 'dark')
			updateStore({ ...currentStore, current })
			setMode(current)
		},
		[setMode]
	)

	/** Update the theme based on the color preference */
	function prefersDarkUpdate(event: MediaQueryListEvent) {
		if (userHasExplicitlySetTheTheme || defaultMode) {
			return
		}

		updateMode(event.matches ? 'dark' : 'light')
	}

	/** Render the current theme */
	const renderTheme = useCallback(() => {
		const { current = 'light' } = store()
		setMode(current)
	}, [setMode])

	/** Handle the user event and side effects */
	const handleIconClick = () => {
		updateMode()
		const currentStore = store()
		updateStore({ ...currentStore, userHasExplicitlySetTheTheme: true })
	}

	/** When storybook params change update the stored themes */
	useEffect(() => {
		const currentStore = store()
		// Ensure we use the stores `current` value first to persist
		// themeing between page loads and story changes.
		updateStore({
			...currentStore,
			...darkModeParams,
			current: currentStore.current || darkModeParams.current
		})
		renderTheme()
	}, [darkModeParams, renderTheme])
	useEffect(() => {
		channel.on('storyChanged', renderTheme)
		channel.on('setStories', renderTheme)
		channel.on('docsRendered', renderTheme)
		prefersDark.addListener(prefersDarkUpdate)
		return () => {
			channel.removeListener('storyChanged', renderTheme)
			channel.removeListener('setStories', renderTheme)
			channel.removeListener('docsRendered', renderTheme)
			prefersDark.removeListener(prefersDarkUpdate)
		}
	})
	useEffect(() => {
		channel.on(UPDATE_DARK_MODE_EVENT_NAME, updateMode)
		return () => {
			channel.removeListener(UPDATE_DARK_MODE_EVENT_NAME, updateMode)
		}
	})
	// Storybook's first render doesn't have the global user params loaded so we
	// need the effect to run whenever defaultMode is updated
	useEffect(() => {
		// If a users has set the mode this is respected
		if (userHasExplicitlySetTheTheme) {
			return
		}

		if (defaultMode) {
			updateMode(defaultMode)
		} else if (prefersDark.matches) {
			updateMode('dark')
		}
	}, [defaultMode, updateMode, userHasExplicitlySetTheTheme])
	const disabledMessage = docs?.['theme']
		? 'Dark mode is disabled as `docs.theme` parameter is set'
		: params.disable
			? 'Dark mode is disabled by parameter'
			: undefined
	return (
		<Button
			ariaLabel="Toggle dark mode"
			disabled={!!disabledMessage}
			tooltip={disabledMessage ?? (isDark ? 'Change theme to light mode' : 'Change theme to dark mode')}
			onClick={handleIconClick}
		>
			{isDark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
		</Button>
	)
}
