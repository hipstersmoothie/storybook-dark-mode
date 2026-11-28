---
"@storybook-community/storybook-dark-mode": major
---

Support Storybook 11.

The `storybook` and `@storybook/addon-docs` peer dependencies are now `^11.0.0`, so Storybook 10 is no longer supported. Stay on 7.x for Storybook 10.

The toolbar toggle now passes `ariaLabel` and `tooltip` to Storybook's `Button`, which Storybook 11 requires; the label and the hover text are unchanged.
