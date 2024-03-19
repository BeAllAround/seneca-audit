/* Copyright © 2024 Richard Rodger, MIT License. */

// import { Open } from 'gubu'


// TODO: separate out errored messages


type Options = {
  debug: boolean
  active: boolean
  ignore: Array<any>
  store: any
  recordCallback: any
}

// Default options.
const defaults = {
  debug: false,
  active: false,
  ignore: [ 'plugin: define', 'plugin: init' ],
  store: {},
  recordCallback: () => {},
}


export type AuditOptions = Partial<Options>



function preload(this: any, plugin: any) {
  const seneca = this
  const root = seneca.root
  const options: AuditOptions = plugin.options
  const recordCallback = options.recordCallback || defaults.recordCallback
  const ignore = options.ignore || defaults.ignore
  const store = options.store || defaults.store
  
  const Patrun = seneca.util.Patrun
  const Jsonic = seneca.util.Jsonic
  const ignored = new Patrun({ gex: true })
  const stored = new Patrun({ gex: true })
  
  

  const tdata = root.context.$_sys_Audit ??= {
    active: options.active,
    msg: {},
    trace: {},
    runs: {},
  }
  
  /*
  // test
  async function recordCallback(this: any, msg: any) {
    // console.log('record Callback message: ', msg)
    await seneca.entity('sys/audit').save$({ msg, })
  }
  */
  
  
  for(let ig of ignore) {
    ignored.add('string' == typeof ig ? Jsonic(ig) : ig, 1)
  }
  
  for(let st in store) {
    // transform for optimization
    store[st].include = (store[st].include || [])
      .reduce((acc: any, v: any) => (acc[v] = true, acc), {})
      
    store[st].exclude = (store[st].exclude || [])
      .reduce((acc: any, v: any) => (acc[v] = true, acc), {})
      
    stored.add('string' == typeof st ? Jsonic(st) : st, store[st])
  }
  

  root.order.inward.add((spec: any) => {
  
    if (!tdata.active) return null

    const actdef = spec.ctx.actdef
    const meta = spec.data.meta
    const msg = spec.data.msg
    
    if((actdef && 'Audit' == actdef.plugin_name)
      || (msg && 0 != ignored.length && ignored.find(msg)) ) {
      return
    }
    
    if (actdef) {
      const when = Date.now()

      // console.log('IN', actdef, meta)
      const pat = actdef.pattern
      const act = actdef.id
      
      let properties
      
      if(properties = stored.find(msg)) {
        let reducedMsg = {}
        // console.log( properties, msg )
        
        const { include, exclude } = properties
        reducedMsg = Object.entries(msg).reduce((acc: any, pair: any) => {
          const [ key, value ] = pair
          if (null != include[key] && null == exclude[key]) {
            acc[key] = value
          }
          return acc
        }, {})
        
        // console.log(reducedMsg)
        
        recordCallback({ meta, msg: reducedMsg })
      }
      
      // console.log('IN', pat, meta.custom)
    }
  }, { after: 'announce' })


  /*
  root.order.outward.add((spec: any) => {
    if (!tdata.active) return null

    const actdef = spec.ctx.actdef
    const meta = spec.data.meta
    if (actdef) {
    
    console.log('outward actdef: ', actdef.plugin_name)
    
    
      const when = Date.now()

      // console.log('OUT', actdef.pattern)
      const pat = actdef.pattern
      const act = actdef.id
    }
  }, { before: 'make_error' })
  */
}


function Audit(this: any, _options: Options) {
  let seneca: any = this
  const root: any = seneca.root

  const tdata = root.context.$_sys_Audit

  seneca
    .fix('sys:audit')
    
    .message('set:record', async function setRecord(this: any, msg: any) {
      console.log('msg: ', msg)
      
      
      
    })

  return {
    exports: {
      raw: () => tdata
    }
  }
}

Object.assign(Audit, { defaults, preload })

// Prevent name mangling
Object.defineProperty(Audit, 'name', { value: 'Audit' })

export default Audit

if ('undefined' !== typeof module) {
  module.exports = Audit
}
