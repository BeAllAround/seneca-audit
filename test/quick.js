
const Seneca = require('seneca')
const Audit = require('../dist/audit')


run()

async function run() {
  const seneca = await Seneca({ legacy:false })
    .test()
    .use('entity', { mem_store: true })
    .use('promisify')
    .use(Audit,{
      active: true,

      auditCallback: async (data) => {
        // console.log('ddd: ', data)
        await seneca.entity('sys/audit').save$({ msg: { ...data.msg } })
      },

      intercept: {
        'c:1': { include: [ 'c', 'x' ], exclude: [] },
        'b:1': { include: [ 'b', 'x' ], exclude: [] },
        'a:1': { include: '*', exclude: [ ] },
      },

      
    })

    .message('a:1', async function a1(msg) {
      if(0 === msg.extra) throw new Error('BAD')
      await new Promise(r=>setTimeout(r,100))
      return {x:1+msg.x}
    })

    .message('b:1', async function b1(msg) {
      await new Promise(r=>setTimeout(r,100))
      let out = await this.post('a:1',{x:msg.x})
      await new Promise(r=>setTimeout(r,100))
      return {x:2*msg.x}
    })

    .message('c:1', async function c1_0(msg) {
      await new Promise(r=>setTimeout(r,20))

      // console.log('msg.x: ', msg.x)
      let out = await this.post('a:1',{x:msg.x})
      await new Promise(r=>setTimeout(r,30))
      out = await this.post('b:1',{x:msg.x})

      await new Promise(r=>setTimeout(r,40))
      return {x:0.5*msg.x}
    })

    .message('c:1', async function c1_1(msg) {
      msg.x += 0.1
      return this.prior(msg)
    })

  /*
    .message('d:1', async function d1(msg) {
      if(0===msg.x) throw new Error('BAD')
      await new Promise(r=>setTimeout(r,100*msg.x))
      return {x:100+msg.x}
    })
    */


    .ready()

  console.log(seneca);



  for(let i = 0; i < 1; i++) {
    console.log( await seneca.post('c:1',{x:i}) )
  }

  try {
    console.log( await seneca.post('a:1',{ x: 2, extra: 10 }) )
  }catch(err) {}

  setTimeout(async ()=>{
    console.log(await seneca.entity('sys/audit').list$())
  }, 1111)


}



