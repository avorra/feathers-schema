"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feathers_1 = require("@feathersjs/feathers");
const assert_1 = __importDefault(require("assert"));
const fixture_1 = require("./fixture");
describe('@feathersjs/schema/hooks', () => {
    const text = 'Hi there';
    let message;
    let messageOnPaginatedService;
    let user;
    const userProps = (user) => ({
        user,
        userList: [user],
        userPage: {
            limit: 2,
            skip: 0,
            total: 1,
            data: [user]
        }
    });
    before(async () => {
        user = (await fixture_1.app.service('users').create([
            {
                email: 'hello@feathersjs.com',
                password: 'supersecret'
            }
        ]))[0];
        message = await fixture_1.app.service('messages').create({
            text,
            userId: user.id
        });
        messageOnPaginatedService = await fixture_1.app.service('paginatedMessages').create({
            text,
            userId: user.id
        });
    });
    it('ran resolvers in sequence', async () => {
        assert_1.default.strictEqual(user.name, 'hello (hello@feathersjs.com)');
    });
    it('validates data', async () => {
        assert_1.default.rejects(() => fixture_1.app.service('users').create({ password: 'failing' }), {
            name: 'BadRequest'
        });
    });
    it('resolves results and handles resolver errors (#2534)', async () => {
        const payload = {
            userId: user.id,
            text
        };
        assert_1.default.ok(user);
        assert_1.default.strictEqual(user.password, 'hashed', 'Resolved data');
        assert_1.default.deepStrictEqual(message, {
            id: 0,
            ...userProps(user),
            ...payload
        });
        const messages = await fixture_1.app.service('messages').find({
            provider: 'external'
        });
        assert_1.default.deepStrictEqual(messages, [
            {
                id: 0,
                ...userProps(user),
                ...payload
            }
        ]);
        await assert_1.default.rejects(() => fixture_1.app.service('messages').find({
            provider: 'external',
            error: true
        }), {
            name: 'BadRequest',
            message: 'Error resolving data',
            code: 400,
            className: 'bad-request',
            data: {
                user: {
                    name: 'GeneralError',
                    message: 'This is an error',
                    code: 500,
                    className: 'general-error'
                }
            }
        });
    });
    it('resolves get result with the object on result', async () => {
        const payload = {
            userId: user.id,
            text
        };
        assert_1.default.ok(user);
        assert_1.default.strictEqual(user.password, 'hashed', 'Resolved data');
        assert_1.default.deepStrictEqual(message, {
            id: 0,
            ...userProps(user),
            ...payload
        });
        const result = await fixture_1.app.service('messages').get(0, {
            provider: 'external'
        });
        assert_1.default.deepStrictEqual(result, {
            id: 0,
            ...userProps(user),
            ...payload
        });
    });
    it('resolves with $select and virtual properties', async () => {
        const messages = await fixture_1.app.service('messages').find({
            paginate: false,
            query: {
                $select: ['user', 'text']
            }
        });
        assert_1.default.deepStrictEqual(Object.keys(messages[0]), ['text', 'user']);
    });
    it('resolves find results with paginated result object', async () => {
        const payload = {
            userId: user.id,
            text
        };
        assert_1.default.ok(user);
        assert_1.default.strictEqual(user.password, 'hashed', 'Resolved data');
        assert_1.default.deepStrictEqual(messageOnPaginatedService, {
            id: 0,
            ...userProps(user),
            ...payload
        });
        const messages = await fixture_1.app.service('paginatedMessages').find({
            provider: 'external',
            query: {
                $limit: 1,
                $skip: 0
            }
        });
        assert_1.default.deepStrictEqual(messages, {
            limit: 1,
            skip: 0,
            total: 1,
            data: [
                {
                    id: 0,
                    ...userProps(user),
                    ...payload
                }
            ]
        });
    });
    it('resolves safe dispatch data recursively and with arrays and pages', async () => {
        const service = fixture_1.app.service('messages');
        const context = await service.get(0, {}, (0, feathers_1.createContext)(service, 'get'));
        const user = {
            id: 0,
            email: '[redacted]',
            name: 'hello (hello@feathersjs.com)'
        };
        assert_1.default.strictEqual(context.result.user.password, 'hashed');
        assert_1.default.deepStrictEqual(context.dispatch, {
            text: 'Hi there',
            userId: 0,
            id: 0,
            ...userProps(user)
        });
    });
    it('resolves safe dispatch with static data', async () => {
        const service = fixture_1.app.service('custom');
        await service.find();
        assert_1.default.deepStrictEqual(await service.find(), [{ message: 'Hello' }]);
    });
    it('resolves data for custom methods', async () => {
        const result = await fixture_1.app.service('messages').customMethod({ message: 'Hello' });
        const user = {
            email: 'hello@feathersjs.com',
            password: 'hashed',
            id: 0,
            name: 'hello (hello@feathersjs.com)'
        };
        assert_1.default.deepStrictEqual(result, {
            message: 'Hello',
            userId: 0,
            additionalData: 'additional data',
            ...userProps(user)
        });
    });
    it('validates and converts the query', async () => {
        const otherUser = await fixture_1.app.service('users').create({
            email: 'helloagain@feathersjs.com',
            password: 'supersecret'
        });
        await fixture_1.app.service('messages').create({
            text,
            userId: otherUser.id
        });
        const messages = await fixture_1.app.service('messages').find({
            paginate: false,
            query: {
                userId: `${user.id}`
            }
        });
        assert_1.default.strictEqual(messages.length, 1);
        const userMessages = await fixture_1.app.service('messages').find({
            paginate: false,
            user
        });
        assert_1.default.strictEqual(userMessages.length, 1);
        assert_1.default.strictEqual(userMessages[0].userId, user.id);
        const msg = await fixture_1.app.service('messages').get(userMessages[0].id, {
            query: {
                $resolve: ['user']
            }
        });
        assert_1.default.deepStrictEqual(msg, {
            user
        });
        assert_1.default.rejects(() => fixture_1.app.service('messages').find({
            query: {
                thing: 'me'
            }
        }), {
            name: 'BadRequest',
            message: 'validation failed',
            code: 400,
            className: 'bad-request',
            data: [
                {
                    instancePath: '',
                    schemaPath: '#/additionalProperties',
                    keyword: 'additionalProperties',
                    params: { additionalProperty: 'thing' },
                    message: 'must NOT have additional properties'
                }
            ]
        });
    });
});
//# sourceMappingURL=hooks.test.js.map