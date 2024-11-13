type Options = {
    debug: boolean;
    active: boolean;
    ignore: Array<any>;
    intercept: any;
    auditCallback: any;
};
export type AuditOptions = Partial<Options>;
declare function Audit(this: any, _options: Options): {
    exports: {
        raw: () => any;
    };
};
export default Audit;
