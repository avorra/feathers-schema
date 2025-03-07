import { JSONSchema } from 'json-schema-to-ts';
import { JSONSchemaDefinition, Ajv, Validator } from './schema';
export type DataSchemaMap = {
    create: JSONSchemaDefinition;
    update?: JSONSchemaDefinition;
    patch?: JSONSchemaDefinition;
};
export type DataValidatorMap = {
    create: Validator;
    update: Validator;
    patch: Validator;
};
/**
 * Returns a compiled validation function for a schema and AJV validator instance.
 *
 * @param schema The JSON schema definition
 * @param validator The AJV validation instance
 * @returns A compiled validation function
 */
export declare const getValidator: <T = any, R = T>(schema: JSONSchemaDefinition, validator: Ajv) => Validator<T, R>;
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
export declare const getDataValidator: (def: JSONSchemaDefinition | DataSchemaMap, validator: Ajv) => DataValidatorMap;
export type PropertyQuery<D extends JSONSchema, X> = {
    anyOf: [
        D,
        {
            type: 'object';
            additionalProperties: false;
            properties: {
                $gt: D;
                $gte: D;
                $lt: D;
                $lte: D;
                $ne: D;
                $in: {
                    type: 'array';
                    items: D;
                };
                $nin: {
                    type: 'array';
                    items: D;
                };
            } & X;
        }
    ];
};
/**
 * Create a Feathers query syntax compatible JSON schema definition for a property definition.
 *
 * @param def The property definition (e.g. `{ type: 'string' }`)
 * @param extensions Additional properties to add to the query property schema
 * @returns A JSON schema definition for the Feathers query syntax for this property.
 */
export declare const queryProperty: <T extends JSONSchema, X extends {
    [key: string]: JSONSchema;
}>(def: T, extensions?: X) => {
    readonly anyOf: readonly [any, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly $gt: any;
            readonly $gte: any;
            readonly $lt: any;
            readonly $lte: any;
            readonly $ne: any;
            readonly $in: any;
            readonly $nin: any;
        } & X;
    }];
};
/**
 * Creates Feathers a query syntax compatible JSON schema for multiple properties.
 *
 * @param definitions A map of property definitions
 * @param extensions Additional properties to add to the query property schema
 * @returns The JSON schema definition for the Feathers query syntax for multiple properties
 */
export declare const queryProperties: <T extends {
    [key: string]: JSONSchema;
}, X extends { [K in keyof T]?: {
    [key: string]: JSONSchema;
}; }>(definitions: T, extensions?: X) => { [K_1 in keyof T]: PropertyQuery<T[K_1], X[K_1]>; };
/**
 * Creates a JSON schema for the complete Feathers query syntax including `$limit`, $skip`
 * and `$sort` and `$select` for the allowed properties.
 *
 * @param definition The property definitions to create the query syntax schema for
 * @param extensions Additional properties to add to the query property schema
 * @returns A JSON schema for the complete query syntax
 */
export declare const querySyntax: <T extends {
    [key: string]: JSONSchema;
}, X extends { [K in keyof T]?: {
    [key: string]: JSONSchema;
}; }>(definition: T, extensions?: X) => {
    readonly $limit: {
        readonly type: "number";
        readonly minimum: 0;
    };
    readonly $skip: {
        readonly type: "number";
        readonly minimum: 0;
    };
    readonly $sort: {
        readonly type: "object";
        readonly properties: { [K_1 in keyof T]: {
            readonly type: 'number';
            readonly enum: [1, -1];
        }; };
    };
    readonly $select: {
        readonly type: "array";
        readonly maxItems: number;
        readonly items: {
            readonly enum?: (keyof T)[];
            readonly type: "string";
        };
    };
    readonly $or: {
        readonly type: "array";
        readonly items: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: { [K_2 in keyof T]: PropertyQuery<T[K_2], X[K_2]>; };
        };
    };
    readonly $and: {
        readonly type: "array";
        readonly items: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: { [K_2 in keyof T]: PropertyQuery<T[K_2], X[K_2]>; } & {
                readonly $or: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly properties: { [K_2 in keyof T]: PropertyQuery<T[K_2], X[K_2]>; };
                    };
                };
            };
        };
    };
} & { [K_2 in keyof T]: PropertyQuery<T[K_2], X[K_2]>; };
export declare const ObjectIdSchema: () => {
    readonly anyOf: readonly [{
        readonly type: "string";
        readonly objectid: true;
    }, {
        readonly type: "object";
        readonly properties: {};
        readonly additionalProperties: true;
    }];
};
