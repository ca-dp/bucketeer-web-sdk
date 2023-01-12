export default {
  babel: {
    testOptions: {
      babelrc: false,
      configFile: false,
    },
  },
  require: ['./tools/ava/setupWindow'],
  files: ['__e2e/__test__/*.js'],
  environmentVariables: {
    HOST: '<HOST>', // replace this. e.g. https://example.com:443
    TOKEN: '<TOKEN>', // replace this.
  },
};
