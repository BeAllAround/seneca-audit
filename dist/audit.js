"use strict";
/* Copyright © 2024 Richard Rodger, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
// Default options.
const defaults = {
    debug: false,
    active: false,
    ignore: ['plugin: define', 'plugin: init'],
    intercept: {},
    auditCallback: () => { },
};
function preload(plugin) {
    var _a;
    var _b;
    const seneca = this;
    const root = seneca.root;
    const options = plugin.options;
    const auditCallback = options.auditCallback || defaults.auditCallback;
    const ignore = options.ignore || defaults.ignore;
    const intercept = options.intercept || defaults.intercept;
    const Patrun = seneca.util.Patrun;
    const Jsonic = seneca.util.Jsonic;
    const ignored = new Patrun({ gex: true });
    const intercepted = new Patrun({ gex: true });
    const tdata = (_a = (_b = root.context).$_sys_Audit) !== null && _a !== void 0 ? _a : (_b.$_sys_Audit = {
        active: options.active,
        msg: {},
        trace: {},
        runs: {},
    });
    /*
    // test
    async function auditCallback(this: any, msg: any) {
      // console.log('record Callback message: ', msg)
      await seneca.entity('sys/audit').save$({ msg, })
    }
    */
    for (let ig of ignore) {
        ignored.add('string' == typeof ig ? Jsonic(ig) : ig, 1);
    }
    for (let st in intercept) {
        // transform for optimization
        intercept[st].include = (intercept[st].include || [])
            .reduce((acc, v) => (acc[v] = true, acc), {});
        intercept[st].exclude = (intercept[st].exclude || [])
            .reduce((acc, v) => (acc[v] = true, acc), {});
        intercepted.add('string' == typeof st ? Jsonic(st) : st, intercept[st]);
    }
    root.order.inward.add((spec) => {
        if (!tdata.active)
            return null;
        const actdef = spec.ctx.actdef;
        const meta = spec.data.meta;
        const msg = spec.data.msg;
        if ((actdef && 'Audit' == actdef.plugin_name)
            || (msg && 0 != ignored.length && ignored.find(msg))) {
            return;
        }
        // console.log('IN: ', msg, spec.data.meta.prior)
        if (actdef) {
            const when = Date.now();
            // console.log('IN', actdef, meta)
            const pat = actdef.pattern;
            const act = actdef.id;
            let properties;
            // TODO: Do we capture prior as well?
            if ((properties = intercepted.find(msg))
                && null == meta.prior) {
                let reducedMsg = {};
                // console.log( properties, msg )
                const { include, exclude } = properties;
                reducedMsg = Object.entries(msg).reduce((acc, pair) => {
                    const [key, value] = pair;
                    if (null != include[key] && null == exclude[key]) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                // console.log(reducedMsg)
                auditCallback({ meta, msg: reducedMsg });
            }
            // console.log('IN', pat, meta.custom)
        }
    }, { after: 'announce' });
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
function Audit(_options) {
    let seneca = this;
    const root = seneca.root;
    const tdata = root.context.$_sys_Audit;
    seneca
        .fix('sys:audit');
    /*
    .message('set:record', async function setRecord(this: any, msg: any) {
      
    })
    */
    return {
        exports: {
            raw: () => tdata
        }
    };
}
Object.assign(Audit, { defaults, preload });
// Prevent name mangling
Object.defineProperty(Audit, 'name', { value: 'Audit' });
exports.default = Audit;
if ('undefined' !== typeof module) {
    module.exports = Audit;
}
//# sourceMappingURL=audit.js.map