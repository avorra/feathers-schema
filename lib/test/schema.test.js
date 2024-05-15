"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const src_1 = require("../src");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const customAjv = new ajv_1.default({
    coerceTypes: true
});
(0, ajv_formats_1.default)(customAjv);
// Utility for converting "date" and "date-time" string formats into Dates.
customAjv.addKeyword({
    keyword: 'convert',
    type: 'string',
    compile(schemaVal, parentSchema) {
        return ['date-time', 'date'].includes(parentSchema.format) && schemaVal
            ? function (value, obj) {
                const { parentData, parentDataProperty } = obj;
                // Update date-time string to Date object
                parentData[parentDataProperty] = new Date(value);
                return true;
            }
            : () => true;
    }
});
describe('@feathersjs/schema/schema', () => {
    it('type inference and validation', async () => {
        const messageSchema = (0, src_1.schema)({
            $id: 'message-test',
            type: 'object',
            required: ['text', 'read'],
            additionalProperties: false,
            properties: {
                text: {
                    type: 'string'
                },
                read: {
                    type: 'boolean'
                },
                upvotes: {
                    type: 'number'
                }
            }
        });
        const message = await messageSchema.validate({
            text: 'hi',
            read: 0,
            upvotes: '10'
        });
        assert_1.default.deepStrictEqual(messageSchema.toJSON(), messageSchema.definition);
        assert_1.default.deepStrictEqual(message, {
            text: 'hi',
            read: false,
            upvotes: 10
        });
        await assert_1.default.rejects(() => messageSchema.validate({ text: 'failing' }), {
            name: 'BadRequest',
            data: [
                {
                    instancePath: '',
                    keyword: 'required',
                    message: "must have required property 'read'",
                    params: {
                        missingProperty: 'read'
                    },
                    schemaPath: '#/required'
                }
            ]
        });
    });
    it('uses custom AJV with format validation', async () => {
        const formatsSchema = (0, src_1.schema)({
            $id: 'formats-test',
            type: 'object',
            required: [],
            additionalProperties: false,
            properties: {
                dobString: {
                    type: 'string',
                    format: 'date'
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        }, customAjv);
        await formatsSchema.validate({
            createdAt: '2021-12-22T23:59:59.999Z'
        });
        try {
            await formatsSchema.validate({
                createdAt: '2021-12-22T23:59:59.bbb'
            });
        }
        catch (error) {
            assert_1.default.equal(error.data[0].message, 'must match format "date-time"');
        }
    });
    it('custom AJV can convert dates', async () => {
        const definition = {
            $id: 'converts-formats-test',
            type: 'object',
            required: [],
            additionalProperties: false,
            properties: {
                dobString: (0, src_1.queryProperty)({
                    type: 'string',
                    format: 'date',
                    convert: true
                }),
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    convert: true
                }
            }
        };
        const formatsSchema = (0, src_1.schema)(definition, customAjv);
        const validated = await formatsSchema.validate({
            dobString: { $gt: '2025-04-25' },
            createdAt: '2021-12-22T23:59:59.999Z'
        });
        assert_1.default.ok(validated.dobString.$gt instanceof Date);
        assert_1.default.ok(validated.createdAt instanceof Date);
    });
    it('schema extension and type inference', async () => {
        const messageSchema = (0, src_1.schema)({
            $id: 'message-ext',
            type: 'object',
            required: ['text', 'read'],
            additionalProperties: false,
            properties: {
                text: {
                    type: 'string'
                },
                read: {
                    type: 'boolean'
                }
            }
        });
        const messageResultSchema = (0, src_1.schema)({
            $id: 'message-ext-vote',
            type: 'object',
            required: ['upvotes', ...messageSchema.definition.required],
            additionalProperties: false,
            properties: {
                ...messageSchema.definition.properties,
                upvotes: {
                    type: 'number'
                }
            }
        });
        const m = await messageResultSchema.validate({
            text: 'Hi',
            read: 'false',
            upvotes: '23'
        });
        assert_1.default.deepStrictEqual(m, {
            text: 'Hi',
            read: false,
            upvotes: 23
        });
    });
    it('with references', async () => {
        const userSchema = (0, src_1.schema)({
            $id: 'ref-user',
            type: 'object',
            required: ['email'],
            additionalProperties: false,
            properties: {
                email: { type: 'string' },
                age: { type: 'number' }
            }
        }, customAjv);
        const messageSchema = (0, src_1.schema)({
            $id: 'ref-message',
            type: 'object',
            required: ['text', 'user'],
            additionalProperties: false,
            properties: {
                text: {
                    type: 'string'
                },
                user: {
                    $ref: 'ref-user'
                }
            }
        }, customAjv);
        const res = await messageSchema.validate({
            text: 'Hello',
            user: {
                email: 'hello@feathersjs.com',
                age: '42'
            }
        });
        assert_1.default.ok(userSchema);
        assert_1.default.deepStrictEqual(res, {
            text: 'Hello',
            user: { email: 'hello@feathersjs.com', age: 42 }
        });
    });
    it('works with oneOf properties (#2508)', async () => {
        const oneOfSchema = (0, src_1.schema)({
            $id: 'schemaA',
            oneOf: [
                {
                    type: 'object',
                    additionalProperties: false,
                    required: ['x'],
                    properties: {
                        x: { type: 'number' }
                    }
                },
                {
                    type: 'object',
                    additionalProperties: false,
                    required: ['y'],
                    properties: {
                        y: { type: 'number' }
                    }
                }
            ]
        });
        const res = await oneOfSchema.validate({
            x: '3'
        });
        assert_1.default.deepStrictEqual(res, { x: 3 });
    });
    it('can handle compound queryProperty', async () => {
        const formatsSchema = (0, src_1.schema)({
            $id: 'compoundQueryProperty',
            type: 'object',
            required: [],
            additionalProperties: false,
            properties: {
                dobString: (0, src_1.queryProperty)({
                    oneOf: [
                        { type: 'string', format: 'date', convert: true },
                        { type: 'string', format: 'date-time', convert: true },
                        { type: 'object' }
                    ]
                })
            }
        }, customAjv);
        const validated = await formatsSchema.validate({
            dobString: { $gt: '2025-04-25', $lte: new Date('2027-04-25') }
        });
        assert_1.default.ok(validated);
    });
    it('can still fail queryProperty validation', async () => {
        var _a;
        const formatsSchema = (0, src_1.schema)({
            $id: 'compoundQueryPropertyFail',
            type: 'object',
            required: [],
            additionalProperties: false,
            properties: {
                dobString: (0, src_1.queryProperty)({ type: 'string' })
            }
        }, customAjv);
        try {
            const validated = await formatsSchema.validate({
                dobString: { $moose: 'test' }
            });
            (0, assert_1.default)(!validated, 'should not have gotten here');
        }
        catch (error) {
            assert_1.default.ok(((_a = error.data) === null || _a === void 0 ? void 0 : _a.length) > 0);
        }
    });
    it('removes default from queryProperty schemas like $gt', async () => {
        const validator = (0, src_1.schema)({
            $id: 'noDefault$gt',
            type: 'object',
            required: [],
            additionalProperties: false,
            properties: {
                someDate: (0, src_1.queryProperty)({ default: '0000-00-00', type: 'string' })
            }
        }, customAjv);
        assert_1.default.equal(validator.definition.properties.someDate.anyOf[1].properties.$gt.type, 'string', 'type is found under $gt');
        (0, assert_1.default)(!validator.definition.properties.someDate.anyOf[1].properties.$gt.default, 'no default under $gt');
    });
});
//# sourceMappingURL=schema.test.js.map