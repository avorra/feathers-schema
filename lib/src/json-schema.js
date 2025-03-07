"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectIdSchema = exports.querySyntax = exports.queryProperties = exports.queryProperty = exports.getDataValidator = exports.getValidator = void 0;
const commons_1 = require("@feathersjs/commons");
/**
 * Returns a compiled validation function for a schema and AJV validator instance.
 *
 * @param schema The JSON schema definition
 * @param validator The AJV validation instance
 * @returns A compiled validation function
 */
const getValidator = (schema, validator) => validator.compile({
    $async: true,
    ...schema
});
exports.getValidator = getValidator;
/**
 * Returns compiled validation functions to validate data for the `create`, `update` and `patch`
 * service methods. If not passed explicitly, the `update` validator will be the same as the `create`
 * and `patch` will be the `create` validator with no required fields.
 *
 * @param def Either general JSON schema definition or a mapping of `create`, `update` and `patch`
 * to their respecitve JSON schema
 * @param validator The Ajv instance to use as the validator
 * @returns A map of validator functions
 */
const getDataValidator = (def, validator) => {
    const schema = (def.create ? def : { create: def });
    return {
        create: (0, exports.getValidator)(schema.create, validator),
        update: (0, exports.getValidator)(schema.update || {
            ...schema.create,
            $id: `${schema.create.$id}Update`
        }, validator),
        patch: (0, exports.getValidator)(schema.patch || {
            ...schema.create,
            $id: `${schema.create.$id}Patch`,
            required: []
        }, validator)
    };
};
exports.getDataValidator = getDataValidator;
/**
 * Create a Feathers query syntax compatible JSON schema definition for a property definition.
 *
 * @param def The property definition (e.g. `{ type: 'string' }`)
 * @param extensions Additional properties to add to the query property schema
 * @returns A JSON schema definition for the Feathers query syntax for this property.
 */
const queryProperty = (def, extensions = {}) => {
    const definition = commons_1._.omit(def, 'default');
    return {
        anyOf: [
            definition,
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    $gt: definition,
                    $gte: definition,
                    $lt: definition,
                    $lte: definition,
                    $ne: definition,
                    $in: definition.type === 'array'
                        ? definition
                        : {
                            type: 'array',
                            items: definition
                        },
                    $nin: definition.type === 'array'
                        ? definition
                        : {
                            type: 'array',
                            items: definition
                        },
                    ...extensions
                }
            }
        ]
    };
};
exports.queryProperty = queryProperty;
/**
 * Creates Feathers a query syntax compatible JSON schema for multiple properties.
 *
 * @param definitions A map of property definitions
 * @param extensions Additional properties to add to the query property schema
 * @returns The JSON schema definition for the Feathers query syntax for multiple properties
 */
const queryProperties = (definitions, extensions = {}) => Object.keys(definitions).reduce((res, key) => {
    const result = res;
    const definition = definitions[key];
    result[key] = (0, exports.queryProperty)(definition, extensions[key]);
    return result;
}, {});
exports.queryProperties = queryProperties;
/**
 * Creates a JSON schema for the complete Feathers query syntax including `$limit`, $skip`
 * and `$sort` and `$select` for the allowed properties.
 *
 * @param definition The property definitions to create the query syntax schema for
 * @param extensions Additional properties to add to the query property schema
 * @returns A JSON schema for the complete query syntax
 */
const querySyntax = (definition, extensions = {}) => {
    const keys = Object.keys(definition);
    const props = (0, exports.queryProperties)(definition, extensions);
    const $or = {
        type: 'array',
        items: {
            type: 'object',
            additionalProperties: false,
            properties: props
        }
    };
    const $and = {
        type: 'array',
        items: {
            type: 'object',
            additionalProperties: false,
            properties: {
                ...props,
                $or
            }
        }
    };
    return {
        $limit: {
            type: 'number',
            minimum: 0
        },
        $skip: {
            type: 'number',
            minimum: 0
        },
        $sort: {
            type: 'object',
            properties: keys.reduce((res, key) => {
                const result = res;
                result[key] = {
                    type: 'number',
                    enum: [1, -1]
                };
                return result;
            }, {})
        },
        $select: {
            type: 'array',
            maxItems: keys.length,
            items: {
                type: 'string',
                ...(keys.length > 0 ? { enum: keys } : {})
            }
        },
        $or,
        $and,
        ...props
    };
};
exports.querySyntax = querySyntax;
const ObjectIdSchema = () => ({
    anyOf: [
        { type: 'string', objectid: true },
        { type: 'object', properties: {}, additionalProperties: true }
    ]
});
exports.ObjectIdSchema = ObjectIdSchema;
//# sourceMappingURL=json-schema.js.map