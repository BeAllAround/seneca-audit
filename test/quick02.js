
const Seneca = require('seneca')
const Audit = require('../dist/audit')


run()

async function auditCallback(data) {
  const seneca = this
  let ent_data = data.msg.ent?.data$(false)
  let canon = data.msg.ent?.canon$({ object: true })
  // let ent_data =  { 'entity$': '-/sys/item', t_c: 1711556374047, modified_by: 'Alice' }

  ent_data = {
    kind: 'ent',
    zone: canon?.zone,
    base: canon?.base,
    name: canon?.name,
    data: ent_data,
  }

  // console.log('ent_data: ', ent_data )

  await seneca.entity('sys/audit').save$({ data: ent_data })
}

async function mockup_data(seneca) {

  await seneca.entity('sys/item').save$({ t_c: Date.now(), modified_by: 'Alex'})
  await seneca.entity('sys/item').data$({ t_c: Date.now(), modified_by: 'Alice'}).save$()
  await seneca.entity('sys/item').data$({ t_c: Date.now(), modified_by: 'John'}).save$()

}

async function run() {

  const seneca = await Seneca({ legacy:false })
    .test()
    .use('entity', { mem_store: true })
    .use('promisify')
    .use(Audit,{
      active: true,

      auditCallback,

      intercept: {
        'sys:entity,base:sys,name:item,cmd:save': { include: '*', exclude: [] },
      },


    })
    .ready()

  console.log(seneca)

  await mockup_data(seneca)

  setTimeout(async ()=>{
    console.dir(await seneca.entity('sys/audit').list$(), { depth: null })
  }, 1111)


}



