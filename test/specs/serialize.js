import { Exception } from '../../src/blunder';
import { serialize } from '../../src/serialize';

describe('serialize', () => {
    it('should not serialize null and undefined', () => {
        expect(serialize(null)).to.equal(null);
        expect(serialize(undefined)).to.equal(undefined);
    });

    it('should not serialize primitive values', () => {
        expect(serialize('foo')).to.equal('foo');
        expect(serialize(123)).to.equal(123);
        expect(serialize(true)).to.equal(true);
        expect(serialize(false)).to.equal(false);
    });
    
    it('should not serialize dates', () => {
        const date = new Date();
        expect(serialize(date)).to.equal(date);
    });

    it('should serialize functions', () => {
        const fn1 = function() {};
        expect(serialize(fn1)).to.equal('[Function: fn1]');

        const fn2 = new Function();
        expect(serialize(fn2)).to.equal('[Function: anonymous]');
    });

    it('should serialize arrays', () => {
        const fn = function() {};
        const date = new Date();

        const array = [
            'foo',
            true,
            fn,
            null,
            date,
            undefined
        ];

        expect(serialize(array)).to.deep.equal([
            'foo',
            true,
            '[Function: fn]',
            null,
            date,
            undefined
        ]);
    });

    it('should serialize key/value objects', () => {
        const fn = function() {};
        const date = new Date();

        const object = {
            string: 'foo',
            boolean: true,
            fn,
            nil: null,
            date,
            undefined: undefined
        };

        expect(serialize(object)).to.deep.equal({
            string: 'foo',
            boolean: true,
            fn: '[Function: fn]',
            nil: null,
            date: date,
            undefined: undefined
        });
    });

    it('should not access non-enumerable properties', () => {
        const obj = {foo: 1, bar: 2};
        Object.defineProperty(obj, 'baz', {
            enumerable: false,
            get() {
                return 3;
            },
        });

        expect(serialize(obj)).to.deep.equal({foo: 1, bar: 2});
    });

    it('should discard unwanted objects', () => {
        expect(serialize(Promise.resolve())).to.equal(undefined);
        expect(serialize(new RegExp())).to.equal(undefined);
        expect(serialize(new ArrayBuffer(8))).to.equal(undefined);
        expect(serialize(new Event('foo'))).to.equal(undefined);
        expect(serialize(Symbol())).to.equal(undefined);
        expect(serialize(new Map())).to.equal(undefined);
        expect(serialize(new WeakMap())).to.equal(undefined);
        expect(serialize(new Set())).to.equal(undefined);
        expect(serialize(new WeakSet())).to.equal(undefined);
    });

    it('should serialize nested values', () => {
        const fn = function() {};
        const date = new Date();

        const object = {
            a: {
                b: 'foo',
                promise: Promise.resolve(),
                c: {
                    d: [
                        date,
                        new Map(),
                        [
                            fn
                        ]
                    ]
                }
            }
        };

        expect(serialize(object)).to.deep.equal({
            a: {
                b: 'foo',
                promise: undefined,
                c: {
                    d: [
                        date,
                        undefined,
                        [
                            '[Function: fn]'
                        ]
                    ]
                }
            }
        });
    });

    it('should serialize an Error', () => {
        const error = new Error('error message');

        const serialized = serialize(error);

        expect(serialized).to.not.equal(error);
        expect(serialized).to.deep.equal({
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    });

    it('should serialize a DOMException', () => {
        const error = new DOMException('error message');

        const serialized = serialize(error);

        expect(serialized).to.not.equal(error);
        expect(serialized).to.deep.equal({
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    });

    it('should serialize an Exception', () => {
        const ex = new Exception('error message');

        const serialized = serialize(ex);

        expect(serialized).to.not.equal(ex);
        expect(serialized).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: null,
            data: {}
        });
    });

    it('should serialize an Exception subclass', () => {
        class TestError extends Exception {}
        const ex = new TestError('error message');

        const serialized = serialize(ex);

        expect(serialized).to.not.equal(ex);
        expect(serialized).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: null,
            data: {}
        });
    });

    it('should serialize the Error cause property', () => {
        const error1 = new Error('error message');
        const error2 = new Error('error message 2', {cause: error1});

        expect(serialize(error2)).to.deep.equal({
            name: error2.name,
            message: error2.message,
            stack: error2.stack,
            cause: {
                name: error1.name,
                message: error1.message,
                stack: error1.stack
            }
        });
    });

    it('should serialize the Exception cause property', () => {
        const error = new Error('error message');
        const ex = new Exception('error message 2', {cause: error});

        expect(serialize(ex)).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            data: {}
        });
    });

    it('should serialize the Exception cause property as an array', () => {
        const error1 = new Error();
        const error2 = new Error();
        const error3 = new Error();

        const ex = new Exception('error message', {cause: [error1, error2, error3]});

        expect(serialize(ex)).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: [
                {
                    name: error1.name,
                    message: error1.message,
                    stack: error1.stack
                },
                {
                    name: error2.name,
                    message: error2.message,
                    stack: error2.stack
                },
                {
                    name: error3.name,
                    message: error3.message,
                    stack: error3.stack
                }
            ],
            data: {}
        });
    });

    it('should serialize an Error/Exception chain via the cause property', () => {
        const error1 = new Error('error message 1');
        const ex1 = new Exception('error message 2', {cause: error1});
        const error2 = new Error('error message 3', {cause: ex1});
        const ex2 = new Exception('error message 4', {cause: error2});

        expect(serialize(ex2)).to.deep.equal({
            name: ex2.name,
            message: ex2.message,
            stack: ex2.stack,
            cause: {
                name: error2.name,
                message: error2.message,
                stack: error2.stack,
                cause: {
                    name: ex1.name,
                    message: ex1.message,
                    stack: ex1.stack,
                    cause: {
                        name: error1.name,
                        message: error1.message,
                        stack: error1.stack
                    },
                    data: {}
                }
            },
            data: {}
        });
    });

    it('should serialize Exception metadata', () => {
        const fn = function() {};
        const date = new Date();

        const ex = new Exception('error message', {
            foo: 'bar',
            num: 123,
            bool: false,
            fn,
            date,
            object: {
                array: [null, 100]
            }
        });

        expect(serialize(ex)).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: null,
            data: {
                foo: 'bar',
                num: 123,
                bool: false,
                fn: '[Function: fn]',
                date: date,
                object: {
                    array: [null, 100]
                }
            }
        });
    });
    
    it('should avoid circular references in arrays', () => {
        const array = ['foo'];
        array[1] = array;

        expect(serialize(array)).to.deep.equal([
            'foo',
            '[Circular]'
        ]);
    });

    it('should avoid circular references in key/value objects', () => {
        const object = {foo: true};
        object.bar = object;
    
        expect(serialize(object)).to.deep.equal({
            foo: true,
            bar: '[Circular]'
        });
    });

    it('should avoid nested circular references', () => {
        const object = {
            a: true,
        };
        object.b = object;
        object.c = [object, object.b];
        object.d = {
            e: object.c,
        };

        expect(serialize(object)).to.deep.equal({
            a: true,
            b: '[Circular]',
            c: ['[Circular]', '[Circular]'],
            d: {
                e: ['[Circular]', '[Circular]']
            }
        });
    });

    it('should avoid circular reference in Error cause property', () => {
        const error1 = new Error('error message 1');
        const error2 = new Error('error message 2'); 

        error1.cause = error2;
        error2.cause = error1;

        expect(serialize(error1)).to.deep.equal({
            name: error1.name,
            message: error1.message,
            stack: error1.stack,
            cause: {
                name: error2.name,
                message: error2.message,
                stack: error2.stack,
                cause: '[Circular]'
            }
        });
    });

    it('should avoid circular references in Exception cause property', () => {
        const ex1 = new Exception('error message 1');
        const ex2 = new Exception('error message 2'); 

        ex1.cause = ex2;
        ex2.cause = ex1;

        expect(serialize(ex1)).to.deep.equal({
            name: ex1.name,
            message: ex1.message,
            stack: ex1.stack,
            cause: {
                name: ex2.name,
                message: ex2.message,
                stack: ex2.stack,
                cause: '[Circular]',
                data: {}
            },
            data: {}
        });
    });

    it('should avoid circular references in Exception metadata', () => {
        const object = {a: true};
        object.b = object;
        object.c = ['foo', object, 'bar'];

        const ex = new Exception('error message', {
            foo: object
        });
    
        expect(serialize(ex)).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: null,
            data: {
                foo: {
                    a: true,
                    b: '[Circular]',
                    c: ['foo', '[Circular]', 'bar']
                }
            }
        });
    });

    it('should avoid circular references in customized serialization', () => {
        let object;

        class FooException extends Exception {
            serializable() {
                object = {};
                object.a = object;
                object.b = {
                    c: 'foo',
                    d: object
                };
                return object;
            }
        }

        const ex = new FooException();

        expect(ex.serializable()).to.equal(object);
        expect(ex.toJSON()).to.deep.equal({
            a: '[Circular]',
            b: {
                c: 'foo',
                d: '[Circular]'
            }
        });
    });

    it('should allow multiple references to same object provided it is not circular', () => {
        const error = new Error();

        const ex = new Exception('error message', {
            cause: error,
            error,
            originalError: error
        });

        expect(serialize(ex)).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            data: {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                originalError: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            }
        });
    });
});
