"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAll = exports.resolveDispatch = exports.resolveExternal = exports.setDispatch = exports.getDispatch = exports.getDispatchValue = exports.DISPATCH = exports.resolveResult = exports.resolveData = exports.resolveQuery = void 0;
const hooks_1 = require("@feathersjs/hooks");
const getResult = (context) => {
    const isPaginated = context.method === 'find' && context.result.data;
    const data = isPaginated ? context.result.data : context.result;
    return { isPaginated, data };
};
const runResolvers = async (resolvers, data, ctx, status) => {
    let current = data;
    for (const resolver of resolvers) {
        if (resolver && typeof resolver.resolve === 'function') {
            current = await resolver.resolve(current, ctx, status);
        }
    }
    return current;
};
const resolveQuery = (...resolvers) => async (context, next) => {
    var _a;
    const data = ((_a = context === null || context === void 0 ? void 0 : context.params) === null || _a === void 0 ? void 0 : _a.query) || {};
    const query = await runResolvers(resolvers, data, context);
    context.params = {
        ...context.params,
        query
    };
    if (typeof next === 'function') {
        return next();
    }
};
exports.resolveQuery = resolveQuery;
const resolveData = (...resolvers) => async (context, next) => {
    if (context.data !== undefined) {
        const data = context.data;
        const status = {
            originalContext: context
        };
        if (Array.isArray(data)) {
            context.data = await Promise.all(data.map((current) => runResolvers(resolvers, current, context, status)));
        }
        else {
            context.data = await runResolvers(resolvers, data, context, status);
        }
    }
    if (typeof next === 'function') {
        return next();
    }
};
exports.resolveData = resolveData;
const resolveResult = (...resolvers) => {
    const virtualProperties = new Set(resolvers.reduce((acc, current) => acc.concat(current.virtualNames), []));
    return async (context, next) => {
        var _a;
        if (typeof next !== 'function') {
            throw new Error('The resolveResult hook must be used as an around hook');
        }
        const { $resolve, $select, ...query } = ((_a = context.params) === null || _a === void 0 ? void 0 : _a.query) || {};
        const hasVirtualSelects = Array.isArray($select) && $select.some((name) => virtualProperties.has(name));
        const resolve = {
            originalContext: context,
            ...context.params.resolve,
            properties: $resolve || $select
        };
        context.params = {
            ...context.params,
            resolve,
            query: {
                ...query,
                ...(!!$select && !hasVirtualSelects ? { $select } : {})
            }
        };
        await next();
        const status = context.params.resolve;
        const { isPaginated, data } = getResult(context);
        const result = Array.isArray(data)
            ? await Promise.all(data.map(async (current) => runResolvers(resolvers, current, context, status)))
            : await runResolvers(resolvers, data, context, status);
        if (isPaginated) {
            context.result.data = result;
        }
        else {
            context.result = result;
        }
    };
};
exports.resolveResult = resolveResult;
exports.DISPATCH = Symbol.for('@feathersjs/schema/dispatch');
const getDispatchValue = (value) => {
    if (typeof value === 'object' && value !== null) {
        if (value[exports.DISPATCH] !== undefined) {
            return value[exports.DISPATCH];
        }
        if (Array.isArray(value)) {
            return value.map((item) => (0, exports.getDispatchValue)(item));
        }
    }
    return value;
};
exports.getDispatchValue = getDispatchValue;
const getDispatch = (value) => typeof value === 'object' && value !== null && value[exports.DISPATCH] ? value[exports.DISPATCH] : null;
exports.getDispatch = getDispatch;
const setDispatch = (current, dispatch) => {
    Object.defineProperty(current, exports.DISPATCH, {
        value: dispatch,
        enumerable: false,
        configurable: false
    });
    return dispatch;
};
exports.setDispatch = setDispatch;
const resolveExternal = (...resolvers) => async (context, next) => {
    if (typeof next !== 'function') {
        throw new Error('The resolveExternal hook must be used as an around hook');
    }
    await next();
    const existingDispatch = (0, exports.getDispatch)(context.result);
    if (existingDispatch !== null) {
        context.dispatch = existingDispatch;
    }
    else {
        const status = context.params.resolve;
        const { isPaginated, data } = getResult(context);
        const resolveAndGetDispatch = async (current) => {
            const currentExistingDispatch = (0, exports.getDispatch)(current);
            if (currentExistingDispatch !== null) {
                return currentExistingDispatch;
            }
            const resolved = await runResolvers(resolvers, current, context, status);
            const currentDispatch = Object.keys(resolved).reduce((res, key) => {
                res[key] = (0, exports.getDispatchValue)(resolved[key]);
                return res;
            }, {});
            return (0, exports.setDispatch)(current, currentDispatch);
        };
        const result = await (Array.isArray(data)
            ? Promise.all(data.map(resolveAndGetDispatch))
            : resolveAndGetDispatch(data));
        const dispatch = isPaginated
            ? {
                ...context.result,
                data: result
            }
            : result;
        context.dispatch = (0, exports.setDispatch)(context.result, dispatch);
    }
};
exports.resolveExternal = resolveExternal;
exports.resolveDispatch = exports.resolveExternal;
const dataMethods = ['create', 'update', 'patch'];
/**
 * Resolve all resolvers at once.
 *
 * @param map The individual resolvers
 * @returns A combined resolver middleware
 * @deprecated Use individual data, query and external resolvers and hooks instead.
 * @see https://dove.feathersjs.com/guides/cli/service.schemas.html
 */
const resolveAll = (map) => {
    const middleware = [];
    middleware.push((0, exports.resolveDispatch)(map.dispatch));
    if (map.result) {
        middleware.push((0, exports.resolveResult)(map.result));
    }
    if (map.query) {
        middleware.push((0, exports.resolveQuery)(map.query));
    }
    if (map.data) {
        dataMethods.forEach((name) => {
            if (map.data[name]) {
                const resolver = (0, exports.resolveData)(map.data[name]);
                middleware.push(async (context, next) => context.method === name ? resolver(context, next) : next());
            }
        });
    }
    return (0, hooks_1.compose)(middleware);
};
exports.resolveAll = resolveAll;
//# sourceMappingURL=resolve.js.map