const puppeteer = require('puppeteer')
const atob = require('atob')

module.exports = {
  name: 'change-project',
  run: async (toolbox) => {
    console.log = function () {}
    const { print, filesystem, prompt } = toolbox

    const configFilename = `${filesystem.homedir()}${
      filesystem.separator
    }.kvm-fea-toolbok-config`

    if (!filesystem.exists(configFilename)) {
      print.error('Config not found')
      print.error('Please run "kvm-fea configure"')
      return
    }

    const { username, password } = JSON.parse(
      atob(await filesystem.read(configFilename))
    )

    const { projectName, feaName } = await prompt.ask([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the project name?'
      },
      {
        type: 'input',
        name: 'feaName',
        message: 'What is the fea name?'
      }
    ])

    const spinner = print.spin('Changing project name...')

    const setTextInputValue = async (page, selector, value) => {
      await page.waitForTimeout(100)
      await page.evaluate(
        (data) => {
          return (document.querySelector(data.selector).value = data.value)
        },
        { selector, value }
      )
    }

    const browser = await puppeteer.launch({
      headless: true
    })

    const page = await browser.newPage()
    await page.goto(
      `http://kvm.fea.btfinanceira.com.br/frontend/web/index.php?KvmSearch%5Bproject_name%5D=${projectName}&KvmSearch%5Bproject_key%5D=&KvmSearch%5Bproject_value%5D=`
    )

    await page.type('#loginform-username', username)
    await page.type('#loginform-password', password)
    await page.click('[name=login-button]')

    await page.waitForNavigation()

    const concat = []

    const pages = await page.evaluate(() => {
      const qtd = [...document.querySelectorAll('.pagination li')].length - 2

      return qtd > 0 ? qtd : 1
    })

    for (let i = 0; i < pages; i++) {
      await page.waitForTimeout(100)

      const urls = await page.evaluate(() => {
        return [...document.querySelectorAll('a[title="Update')].map(
          (link) => link.href
        )
      })

      concat.push(...urls)

      if (pages > 1) {
        await page.click('.pagination .next')
      }
    }

    for (const link of concat) {
      await page.goto(link)
      await setTextInputValue(
        page,
        '#kvm-project_name',
        `${projectName.trim().toUpperCase()}_${feaName.trim().toUpperCase()}`
      )
      await page.click('.kvm-form button[type=submit]')
      await page.waitForNavigation()
    }

    await browser.close()
    spinner.succeed('Completed!')
  }
}
