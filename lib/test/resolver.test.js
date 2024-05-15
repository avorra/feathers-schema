"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const errors_1 = require("@feathersjs/errors");
const src_1 = require("../src");
describe('@feathersjs/schema/resolver', () => {
    const userSchema = {
        $id: 'simple-user',
        type: 'object',
        required: ['firstName', 'lastName'],
        additionalProperties: false,
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            password: { type: 'string' }
        }
    };
    const context = {
        isContext: true
    };
    it('simple resolver', async () => {
        const userResolver = (0, src_1.resolve)({
            password: async () => undefined,
            name: async (_value, user, ctx, status) => {
                assert_1.default.deepStrictEqual(ctx, context);
                assert_1.default.deepStrictEqual(status.path, ['name']);
                assert_1.default.strictEqual(typeof status.stack[0], 'function');
                return `${user.firstName} ${user.lastName}`;
            }
        });
        const u = await userResolver.resolve({
            firstName: 'Dave',
            lastName: 'L.'
        }, context);
        assert_1.default.deepStrictEqual(u, {
            firstName: 'Dave',
            lastName: 'L.',
            name: 'Dave L.'
        });
        const withProps = await userResolver.resolve({
            firstName: 'David',
            lastName: 'L'
        }, context, {
            properties: ['name', 'lastName']
        });
        assert_1.default.deepStrictEqual(withProps, {
            name: 'David L',
            lastName: 'L'
        });
    });
    it('simple resolver with virtual', async () => {
        const userResolver = (0, src_1.resolve)({
            password: async () => undefined,
            name: (0, src_1.virtual)(async (user, ctx, status) => {
                assert_1.default.deepStrictEqual(ctx, context);
                assert_1.default.deepStrictEqual(status.path, ['name']);
                assert_1.default.strictEqual(typeof status.stack[0], 'function');
                return `${user.firstName} ${user.lastName}`;
            })
        });
        const u = await userResolver.resolve({
            firstName: 'Dave',
            lastName: 'L.'
        }, context);
        assert_1.default.deepStrictEqual(u, {
            firstName: 'Dave',
            lastName: 'L.',
            name: 'Dave L.'
        });
    });
    it('simple resolver with schema and validation', async () => {
        const userFeathersSchema = (0, src_1.schema)(userSchema);
        const userBeforeResolver = (0, src_1.resolve)({
            schema: userFeathersSchema,
            validate: 'before',
            properties: {
                name: async (_name, user) => `${user.firstName} ${user.lastName}`
            }
        });
        const userAfterResolver = (0, src_1.resolve)({
            schema: userFeathersSchema,
            validate: 'after',
            properties: {
                firstName: async () => undefined
            }
        });
        await assert_1.default.rejects(() => userBeforeResolver.resolve({}, context), {
            message: 'validation failed'
        });
        await assert_1.default.rejects(() => userAfterResolver.resolve({
            firstName: 'Test',
            lastName: 'Me'
        }, context), {
            message: 'validation failed'
        });
    });
    it('simple resolver with converter', async () => {
        const userConverterResolver = (0, src_1.resolve)({
            converter: async (data) => ({
                firstName: 'Default',
                lastName: 'Name',
                ...data
            }),
            properties: {
                name: async (_name, user) => `${user.firstName} ${user.lastName}`
            }
        });
        const u = await userConverterResolver.resolve({}, context);
        assert_1.default.deepStrictEqual(u, {
            firstName: 'Default',
            lastName: 'Name',
            name: 'Default Name'
        });
    });
    it('resolving with errors', async () => {
        const dummyResolver = (0, src_1.resolve)({
            properties: {
                name: async (value) => {
                    if (value === 'Dave') {
                        throw new Error(`No ${value}s allowed`);
                    }
                    return value;
                },
                age: async (value) => {
                    if (value && value < 18) {
                        throw new errors_1.BadRequest('Invalid age');
                    }
                    return value;
                }
            }
        });
        assert_1.default.rejects(() => dummyResolver.resolve({
            name: 'Dave',
            age: 16
        }, {}), {
            name: 'BadRequest',
            message: 'Error resolving data',
            code: 400,
            className: 'bad-request',
            data: {
                name: { message: 'No Daves allowed' },
                age: {
                    name: 'BadRequest',
                    message: 'Invalid age',
                    code: 400,
                    className: 'bad-request'
                }
            }
        });
    });
    it('empty resolver returns original data', async () => {
        const resolver = (0, src_1.resolve)({
            properties: {}
        });
        const data = { message: 'Hello' };
        const resolved = await resolver.resolve(data, {});
        assert_1.default.strictEqual(data, resolved);
    });
    it('empty resolver still allows to select properties', async () => {
        const data = { message: 'Hello', name: 'David' };
        const resolver = (0, src_1.resolve)({
            properties: {}
        });
        const resolved = await resolver.resolve(data, {}, { properties: ['message'] });
        assert_1.default.deepStrictEqual(resolved, { message: 'Hello' });
    });
});
//# sourceMappingURL=resolver.test.js.map