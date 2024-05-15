"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const assert_1 = __importDefault(require("assert"));
const mongodb_1 = require("mongodb");
const json_schema_1 = require("../src/json-schema");
describe('@feathersjs/schema/json-schema', () => {
    it('querySyntax works with no properties', async () => {
        const schema = {
            type: 'object',
            properties: (0, json_schema_1.querySyntax)({})
        };
        new ajv_1.default().compile(schema);
    });
    it('querySyntax with extensions', async () => {
        const schema = {
            name: {
                type: 'string'
            },
            age: {
                type: 'number'
            }
        };
        const querySchema = {
            type: 'object',
            properties: (0, json_schema_1.querySyntax)(schema, {
                name: {
                    $ilike: {
                        type: 'string'
                    }
                },
                age: {
                    $value: {
                        type: 'null'
                    }
                }
            })
        };
        const q = {
            name: {
                $ilike: 'hello'
            },
            age: {
                $value: null,
                $gte: 42
            }
        };
        const validator = new ajv_1.default({ strict: false }).compile(querySchema);
        assert_1.default.ok(validator(q));
    });
    it('$in and $nin works with array definitions', async () => {
        const schema = {
            things: {
                type: 'array',
                items: { type: 'number' }
            }
        };
        const querySchema = {
            type: 'object',
            properties: (0, json_schema_1.querySyntax)(schema)
        };
        const q = {
            things: {
                $in: [10, 20],
                $nin: [30]
            }
        };
        const validator = new ajv_1.default({ strict: false }).compile(querySchema);
        assert_1.default.ok(validator(q));
    });
    // Test ObjectId validation
    it('ObjectId', async () => {
        const schema = {
            type: 'object',
            properties: {
                _id: (0, json_schema_1.ObjectIdSchema)()
            }
        };
        const validator = new ajv_1.default({
            strict: false
        }).compile(schema);
        const validated = await validator({
            _id: '507f191e810c19729de860ea'
        });
        assert_1.default.ok(validated);
        const validated2 = await validator({
            _id: new mongodb_1.ObjectId()
        });
        assert_1.default.ok(validated2);
    });
});
//# sourceMappingURL=json-schema.test.js.map