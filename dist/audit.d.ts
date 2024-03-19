type Options = {
    debug: boolean;
    active: boolean;
    ignore: Array<any>;
    store: any;
    recordCallback: any;
};
export type AuditOptions = Partial<Options>;
declare function Audit(this: any, _options: Options): {
    exports: {
        raw: () => any;
    };
};
export default Audit;
