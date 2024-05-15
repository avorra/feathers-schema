"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.messageQueryResolver = exports.messageQueryValidator = exports.messageQuerySchema = exports.otherMessageResolver = exports.messageResolver = exports.messageSchema = exports.messageDataSchema = exports.secondUserResolver = exports.userExternalResolver = exports.userResolver = exports.userSchema = exports.userDataResolver = exports.userDataValidatorMap = exports.userDataValidator = exports.userDataSchema = void 0;
const feathers_1 = require("@feathersjs/feathers");
const memory_1 = require("@feathersjs/memory");
const errors_1 = require("@feathersjs/errors");
const src_1 = require("../src");
const fixtureAjv = new src_1.Ajv({
    coerceTypes: true,
    addUsedSchema: false
});
exports.userDataSchema = {
    $id: 'UserData',
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    properties: {
        email: { type: 'string' },
        password: { type: 'string' }
    }
};
exports.userDataValidator = (0, src_1.getValidator)(exports.userDataSchema, fixtureAjv);
exports.userDataValidatorMap = (0, src_1.getDataValidator)(exports.userDataSchema, fixtureAjv);
exports.userDataResolver = (0, src_1.resolve)({
    properties: {
        password: () => 'hashed'
    }
});
exports.userSchema = {
    $id: 'User',
    type: 'object',
    additionalProperties: false,
    required: ['id', ...exports.userDataSchema.required],
    properties: {
        ...exports.userDataSchema.properties,
        id: { type: 'number' },
        name: { type: 'string' }
    }
};
exports.userResolver = (0, src_1.resolve)({
    name: (_value, user) => user.email.split('@')[0]
});
exports.userExternalResolver = (0, src_1.resolve)({
    properties: {
        password: async () => undefined,
        email: () => '[redacted]'
    }
});
exports.secondUserResolver = (0, src_1.resolve)({
    name: (value, user) => `${value} (${user.email})`
});
exports.messageDataSchema = {
    $id: 'MessageData',
    type: 'object',
    additionalProperties: false,
    required: ['text', 'userId'],
    properties: {
        text: { type: 'string' },
        userId: { type: 'number' }
    }
};
exports.messageSchema = {
    $id: 'MessageResult',
    type: 'object',
    additionalProperties: false,
    required: ['id', ...exports.messageDataSchema.required],
    properties: {
        ...exports.messageDataSchema.properties,
        id: { type: 'number' },
        user: { $ref: 'User' },
        userList: { type: 'array', items: { $ref: 'User' } },
        userPage: { type: 'object' }
    }
};
exports.messageResolver = (0, src_1.resolve)({
    user: (0, src_1.virtual)(async (message, context) => {
        const { userId } = message;
        if (context.params.error === true) {
            throw new errors_1.GeneralError('This is an error');
        }
        const { data: [user] } = (await context.app.service('users').find({
            ...context.params,
            paginate: { default: 2 },
            query: {
                id: userId
            }
        }));
        return user;
    }),
    userList: (0, src_1.virtual)(async (_message, context) => {
        const users = await context.app.service('users').find({
            paginate: false
        });
        return users.map((user) => user);
    }),
    userPage: (0, src_1.virtual)(async (_message, context) => {
        const users = await context.app.service('users').find({
            adapter: {
                paginate: {
                    default: 2
                }
            }
        });
        return users;
    })
});
exports.otherMessageResolver = (0, src_1.resolve)({});
exports.messageQuerySchema = {
    $id: 'MessageQuery',
    type: 'object',
    additionalProperties: false,
    required: [],
    properties: {
        ...(0, src_1.querySyntax)(exports.messageDataSchema.properties),
        $select: {
            type: 'array',
            items: { type: 'string' }
        },
        $resolve: {
            type: 'array',
            items: { type: 'string' }
        }
    }
};
exports.messageQueryValidator = (0, src_1.getValidator)(exports.messageQuerySchema, fixtureAjv);
exports.messageQueryResolver = (0, src_1.resolve)({
    userId(value, _query, context) {
        var _a;
        if ((_a = context.params) === null || _a === void 0 ? void 0 : _a.user) {
            return context.params.user.id;
        }
        return value;
    }
});
class MessageService extends memory_1.MemoryService {
    async customMethod(data) {
        return data;
    }
}
const findResult = { message: 'Hello' };
class CustomService {
    async find() {
        return [findResult];
    }
}
const customMethodDataResolver = (0, src_1.resolve)({
    properties: {
        userId: () => 0,
        additionalData: () => 'additional data'
    }
});
const app = (0, feathers_1.feathers)();
exports.app = app;
app.use('users', (0, memory_1.memory)({
    multi: ['create']
}));
app.use('messages', new MessageService(), {
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'customMethod']
});
app.use('custom', new CustomService());
app.service('custom').hooks({
    around: {
        all: [(0, src_1.resolveExternal)((0, src_1.resolve)({}))]
    }
});
app.use('paginatedMessages', (0, memory_1.memory)({ paginate: { default: 10 } }));
app.service('messages').hooks({
    around: {
        all: [
            (0, src_1.resolveAll)({
                result: exports.messageResolver,
                query: exports.messageQueryResolver
            }),
            (0, src_1.validateQuery)(exports.messageQueryValidator)
        ],
        customMethod: [(0, src_1.resolveData)(customMethodDataResolver)],
        find: [
            async (context, next) => {
                var _a, _b, _c, _d;
                // A hook that makes sure that virtual properties are not passed to the adapter as `$select`
                // An SQL adapter would throw an error if it received a query like this
                if (((_b = (_a = context.params) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.$select) && ((_d = (_c = context.params) === null || _c === void 0 ? void 0 : _c.query) === null || _d === void 0 ? void 0 : _d.$select.includes('user'))) {
                    throw new Error('Invalid $select');
                }
                await next();
            }
        ]
    }
});
app
    .service('paginatedMessages')
    .hooks([
    (0, src_1.resolveDispatch)(),
    (0, src_1.resolveResult)(exports.messageResolver, exports.otherMessageResolver),
    (0, src_1.validateQuery)(exports.messageQueryValidator),
    (0, src_1.resolveQuery)(exports.messageQueryResolver)
]);
app
    .service('users')
    .hooks([(0, src_1.resolveDispatch)(exports.userExternalResolver), (0, src_1.resolveResult)(exports.userResolver, exports.secondUserResolver)]);
app.service('users').hooks({
    create: [(0, src_1.validateData)(exports.userDataValidator), (0, src_1.validateData)(exports.userDataValidatorMap), (0, src_1.resolveData)(exports.userDataResolver)]
});
//# sourceMappingURL=fixture.js.map