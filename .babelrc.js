module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    '@babel/preset-react'
  ],
  env: {
    esm: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false
          }
        ]
      ]
    }
  }
};
