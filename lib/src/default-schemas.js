"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAppConfiguration = exports.defaultAppSettings = exports.sqlSettingsSchema = exports.authenticationSettingsSchema = void 0;
exports.authenticationSettingsSchema = {
    type: 'object',
    required: ['secret', 'entity', 'authStrategies'],
    properties: {
        secret: {
            type: 'string',
            description: 'The JWT signing secret'
        },
        entity: {
            oneOf: [
                {
                    type: 'null'
                },
                {
                    type: 'string'
                }
            ],
            description: 'The name of the authentication entity (e.g. user)'
        },
        entityId: {
            type: 'string',
            description: 'The name of the authentication entity id property'
        },
        service: {
            type: 'string',
            description: 'The path of the entity service'
        },
        authStrategies: {
            type: 'array',
            items: { type: 'string' },
            description: 'A list of authentication strategy names that are allowed to create JWT access tokens'
        },
        parseStrategies: {
            type: 'array',
            items: { type: 'string' },
            description: 'A list of authentication strategy names that should parse HTTP headers for authentication information (defaults to `authStrategies`)'
        },
        jwtOptions: {
            type: 'object'
        },
        jwt: {
            type: 'object',
            properties: {
                header: {
                    type: 'string',
                    default: 'Authorization',
                    description: 'The HTTP header containing the JWT'
                },
                schemes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'An array of schemes to support'
                }
            }
        },
        local: {
            type: 'object',
            required: ['usernameField', 'passwordField'],
            properties: {
                usernameField: {
                    type: 'string',
                    description: 'Name of the username field (e.g. `email`)'
                },
                passwordField: {
                    type: 'string',
                    description: 'Name of the password field (e.g. `password`)'
                },
                hashSize: {
                    type: 'number',
                    description: 'The BCrypt salt length'
                },
                errorMessage: {
                    type: 'string',
                    default: 'Invalid login',
                    description: 'The error message to return on errors'
                },
                entityUsernameField: {
                    type: 'string',
                    description: 'Name of the username field on the entity if authentication request data and entity field names are different'
                },
                entityPasswordField: {
                    type: 'string',
                    description: 'Name of the password field on the entity if authentication request data and entity field names are different'
                }
            }
        },
        oauth: {
            type: 'object',
            properties: {
                redirect: {
                    type: 'string'
                },
                origins: {
                    type: 'array',
                    items: { type: 'string' }
                },
                defaults: {
                    type: 'object',
                    properties: {
                        key: { type: 'string' },
                        secret: { type: 'string' }
                    }
                }
            }
        }
    }
};
exports.sqlSettingsSchema = {
    type: 'object',
    properties: {
        client: { type: 'string' },
        pool: {
            type: 'object',
            properties: {
                min: { type: 'number' },
                max: { type: 'number' }
            }
        },
        connection: {
            oneOf: [
                { type: 'string' },
                {
                    type: 'object',
                    properties: {
                        host: { type: 'string' },
                        port: { type: 'number' },
                        user: { type: 'string' },
                        password: { type: 'string' },
                        database: { type: 'string' }
                    }
                }
            ]
        }
    }
};
/**
 * Schema for properties that are available in a standard Feathers application.
 */
exports.defaultAppSettings = {
    authentication: exports.authenticationSettingsSchema,
    origins: {
        type: 'array',
        items: {
            type: 'string'
        }
    },
    paginate: {
        type: 'object',
        additionalProperties: false,
        required: ['default', 'max'],
        properties: {
            default: { type: 'number' },
            max: { type: 'number' }
        }
    },
    mongodb: { type: 'string' },
    mysql: exports.sqlSettingsSchema,
    postgresql: exports.sqlSettingsSchema,
    sqlite: exports.sqlSettingsSchema,
    mssql: exports.sqlSettingsSchema
};
exports.defaultAppConfiguration = {
    type: 'object',
    additionalProperties: false,
    properties: exports.defaultAppSettings
};
//# sourceMappingURL=default-schemas.js.map