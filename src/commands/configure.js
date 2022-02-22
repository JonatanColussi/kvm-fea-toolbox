const btoa = require('btoa')

const command = {
  name: 'configure',
  run: async (toolbox) => {
    const { print, prompt, filesystem } = toolbox

    const configFilename = `${filesystem.homedir()}${
      filesystem.separator
    }.kvm-fea-toolbok-config`

    if (filesystem.exists(configFilename)) {
      print.info(
        'kvm-fea-toolbok is already configured on this computer with the following parameters:'
      )

      const { overwriteConfig } = await prompt.ask([
        {
          type: 'confirm',
          name: 'overwriteConfig',
          message: 'Do you want to overwrite the settings?',
          default: false
        }
      ])

      if (!overwriteConfig) {
        return
      }
    }

    const { username, password } = await prompt.ask([
      {
        type: 'input',
        name: 'username',
        message: 'What is your KVM username?'
      },
      {
        type: 'password',
        name: 'password',
        message: 'What is your KVM password?'
      }
    ])

    filesystem.write(
      configFilename,
      btoa(
        JSON.stringify({
          username,
          password
        })
      )
    )

    print.success('Config finished')
  }
}

module.exports = command
