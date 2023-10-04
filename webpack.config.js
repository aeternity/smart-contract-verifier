function getApplicationVersion() {
  try {
    return process.env.GIT_SHA || require('child_process')
      .execSync("git config --global --add safe.directory '*' && git rev-parse --short HEAD")
      .toString()
      .trim();
  } catch (e) {
    console.warn('Could not get application version from git. Reason:', e)
    return 'unspecified';
  }
}

module.exports = function (options, webpack) {
  return {
    ...options,
    plugins: [
      ...options.plugins,
      new webpack.DefinePlugin(
        {
          APPLICATION_VERSION: `'${getApplicationVersion()}'`,
        }
      ),
    ],
  };
};