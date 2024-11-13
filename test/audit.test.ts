
import Seneca from 'seneca'
import SenecaMsgTest from 'seneca-msg-test'


import Audit from '../src/audit'
import AuditMessages from './audit.messages'



describe('audit', () => {

  test('happy', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use(Audit)
    await seneca.ready()
  })


  test('messages', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use(Audit)
    await (SenecaMsgTest(seneca, AuditMessages)())
  })


  test('basic', async () => {
    const seneca = Seneca({ legacy: false })
      .test()
      .use('promisify')
      .use(Audit)
  })

})

