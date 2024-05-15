import { HookContext, Application as FeathersApplication } from '@feathersjs/feathers';
import { MemoryService } from '@feathersjs/memory';
import { AdapterParams } from '@feathersjs/adapter-commons';
import { FromSchema } from '../src';
export declare const userDataSchema: {
    readonly $id: "UserData";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["email"];
    readonly properties: {
        readonly email: {
            readonly type: "string";
        };
        readonly password: {
            readonly type: "string";
        };
    };
};
export declare const userDataValidator: import("../src").Validator<any, any>;
export declare const userDataValidatorMap: import("../src").DataValidatorMap;
export type UserData = FromSchema<typeof userDataSchema>;
export declare const userDataResolver: import("../src").Resolver<{
    password?: string;
    email: string;
}, HookContext<Application, any>>;
export declare const userSchema: {
    readonly $id: "User";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "email"];
    readonly properties: {
        readonly id: {
            readonly type: "number";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly email: {
            readonly type: "string";
        };
        readonly password: {
            readonly type: "string";
        };
    };
};
export type User = FromSchema<typeof userSchema>;
export declare const userResolver: import("../src").Resolver<{
    password?: string;
    name?: string;
    id: number;
    email: string;
}, HookContext<Application, any>>;
export declare const userExternalResolver: import("../src").Resolver<{
    password?: string;
    name?: string;
    id: number;
    email: string;
}, HookContext<Application, any>>;
export declare const secondUserResolver: import("../src").Resolver<{
    password?: string;
    name?: string;
    id: number;
    email: string;
}, HookContext<Application, any>>;
export declare const messageDataSchema: {
    readonly $id: "MessageData";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["text", "userId"];
    readonly properties: {
        readonly text: {
            readonly type: "string";
        };
        readonly userId: {
            readonly type: "number";
        };
    };
};
export type MessageData = FromSchema<typeof messageDataSchema>;
export declare const messageSchema: {
    readonly $id: "MessageResult";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "text", "userId"];
    readonly properties: {
        readonly id: {
            readonly type: "number";
        };
        readonly user: {
            readonly $ref: "User";
        };
        readonly userList: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "User";
            };
        };
        readonly userPage: {
            readonly type: "object";
        };
        readonly text: {
            readonly type: "string";
        };
        readonly userId: {
            readonly type: "number";
        };
    };
};
export type Message = FromSchema<typeof messageSchema, {
    references: [typeof userSchema];
}>;
export declare const messageResolver: import("../src").Resolver<{
    user?: never;
    userList?: [];
    userPage?: {
        [x: string]: unknown;
    };
    id: number;
    text: string;
    userId: number;
}, HookContext<Application, any>>;
export declare const otherMessageResolver: import("../src").Resolver<{
    text: string;
}, HookContext<Application, any>>;
export declare const messageQuerySchema: {
    readonly $id: "MessageQuery";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly [];
    readonly properties: {
        readonly $select: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly $resolve: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
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
            readonly properties: {
                readonly text: {
                    readonly type: "number";
                    readonly enum: [1, -1];
                };
                readonly userId: {
                    readonly type: "number";
                    readonly enum: [1, -1];
                };
            };
        };
        readonly $or: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly text: import("../src").PropertyQuery<{
                        readonly type: "string";
                    }, {
                        [key: string]: import("json-schema-to-ts").JSONSchema;
                    }>;
                    readonly userId: import("../src").PropertyQuery<{
                        readonly type: "number";
                    }, {
                        [key: string]: import("json-schema-to-ts").JSONSchema;
                    }>;
                };
            };
        };
        readonly $and: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly text: import("../src").PropertyQuery<{
                        readonly type: "string";
                    }, {
                        [key: string]: import("json-schema-to-ts").JSONSchema;
                    }>;
                    readonly userId: import("../src").PropertyQuery<{
                        readonly type: "number";
                    }, {
                        [key: string]: import("json-schema-to-ts").JSONSchema;
                    }>;
                } & {
                    readonly $or: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly text: import("../src").PropertyQuery<{
                                    readonly type: "string";
                                }, {
                                    [key: string]: import("json-schema-to-ts").JSONSchema;
                                }>;
                                readonly userId: import("../src").PropertyQuery<{
                                    readonly type: "number";
                                }, {
                                    [key: string]: import("json-schema-to-ts").JSONSchema;
                                }>;
                            };
                        };
                    };
                };
            };
        };
        readonly text: import("../src").PropertyQuery<{
            readonly type: "string";
        }, {
            [key: string]: import("json-schema-to-ts").JSONSchema;
        }>;
        readonly userId: import("../src").PropertyQuery<{
            readonly type: "number";
        }, {
            [key: string]: import("json-schema-to-ts").JSONSchema;
        }>;
    };
};
export type MessageQuery = FromSchema<typeof messageQuerySchema>;
export declare const messageQueryValidator: import("../src").Validator<any, any>;
export declare const messageQueryResolver: import("../src").Resolver<{
    $resolve?: string[];
    $select?: string[];
    text?: string | {
        [x: string]: unknown;
        [x: number]: unknown;
    };
    userId?: number | {
        [x: string]: unknown;
        [x: number]: unknown;
    };
    $limit?: number;
    $skip?: number;
    $sort?: {
        [x: string]: unknown;
        text?: 1 | -1;
        userId?: 1 | -1;
    };
    $or?: {
        text?: string | {
            [x: string]: unknown;
            [x: number]: unknown;
        };
        userId?: number | {
            [x: string]: unknown;
            [x: number]: unknown;
        };
    }[];
    $and?: {
        text?: string | {
            [x: string]: unknown;
            [x: number]: unknown;
        };
        userId?: number | {
            [x: string]: unknown;
            [x: number]: unknown;
        };
        $or?: {
            text?: string | {
                [x: string]: unknown;
                [x: number]: unknown;
            };
            userId?: number | {
                [x: string]: unknown;
                [x: number]: unknown;
            };
        }[];
    }[];
}, HookContext<Application, any>>;
interface ServiceParams extends AdapterParams {
    user?: User;
    error?: boolean;
}
declare class MessageService extends MemoryService<Message, MessageData, ServiceParams> {
    customMethod(data: any): Promise<any>;
}
declare class CustomService {
    find(): Promise<{
        message: string;
    }[]>;
}
type ServiceTypes = {
    users: MemoryService<User, UserData, ServiceParams>;
    messages: MessageService;
    paginatedMessages: MemoryService<Message, MessageData, ServiceParams>;
    custom: CustomService;
};
type Application = FeathersApplication<ServiceTypes>;
declare const app: FeathersApplication<ServiceTypes, any>;
export { app };
