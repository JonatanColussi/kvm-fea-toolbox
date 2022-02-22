const { build } = require('gluegun')

async function run (argv) {
  const cli = build()
    .brand('kvm-fea')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'kvm-fea-*', hidden: true })
    .help()
    .version()
    .exclude([
      'meta',
      'strings',
      'semver',
      'system',
      'template',
      'patching',
      'package-manager'
    ])
    .create()

  const toolbox = await cli.run(argv)

  return toolbox
}

module.exports = { run }
