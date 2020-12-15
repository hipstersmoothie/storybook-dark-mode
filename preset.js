module.exports = {
  managerEntries: (entry = []) => {
    return [...entry, require.resolve('storybook-dark-mode/register')];
  }
};
