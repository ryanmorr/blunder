import { Exception } from '../../src/blunder';

/* global AggregateError */

class TestError extends Exception {}
class SubTestError extends TestError {}

describe('Exception', () => {
    it('should support subsclassing Exception', () => {
        const ex1 = new Exception();
        expect(ex1).to.be.an.instanceof(Error);
        expect(ex1).to.be.an.instanceof(Exception);
    
        const ex2 = new TestError();
        expect(ex2).to.be.an.instanceof(Error);
        expect(ex2).to.be.an.instanceof(Exception);
        expect(ex2).to.be.an.instanceof(TestError);
    
        const ex3 = new SubTestError();
        expect(ex3).to.be.an.instanceof(Error);
        expect(ex3).to.be.an.instanceof(Exception);
        expect(ex3).to.be.an.instanceof(TestError);
        expect(ex3).to.be.an.instanceof(SubTestError);
    });

    it('should support the name property', () => {
        const ex1 = new Exception();
        expect(ex1.name).to.equal('Exception');
        expect({}.propertyIsEnumerable.call(ex1, 'name')).to.equal(false);

        const ex2 = new TestError();
        expect(ex2.name).to.equal('TestError');
        expect({}.propertyIsEnumerable.call(ex2, 'name')).to.equal(false);

        const ex3 = new SubTestError();
        expect(ex3.name).to.equal('SubTestError');
        expect({}.propertyIsEnumerable.call(ex3, 'name')).to.equal(false);
    });

    it('should support the message property', () => {
        const msg = 'an error occurred';
        const ex = new Exception(msg);
        expect(ex.message).to.equal(msg);
    });

    it('should support the stack property', () => {
        const ex1 = new Exception();
        expect(ex1.stack).to.be.a('string');

        const ex2 = new TestError();
        expect(ex2.stack).to.be.a('string');
    });

    it('should support the stack property when captureStackTrace is not supported', () => {
        const { captureStackTrace } = Error;
        Reflect.deleteProperty(Error, 'captureStackTrace');
        expect(Error.captureStackTrace).to.not.exist;
        
        const ex = new Exception();
        expect(ex.stack).to.be.a('string');

        Error.captureStackTrace = captureStackTrace;
    });

    it('should support the cause property', () => {
        const ex1 = new Exception();
        expect(ex1.cause).to.equal(null);

        const ex2 = new Exception('ex', {cause: ex1});
        expect(ex2.cause).to.equal(ex1);
    });

    it('should support an array for the cause property', () => {
        const error1 = new Error();
        const error2 = new Error();
        const error3 = new Error();

        const ex = new Exception('error message', {cause: [error1, error2, error3]});
        expect(ex.cause).to.be.an('array');
        expect(ex.cause).to.have.lengthOf(3);
        expect(ex.cause).to.include(error1);
        expect(ex.cause).to.include(error2);
        expect(ex.cause).to.include(error3);
    });

    it('should return the name and message in the toString method', () => {
        const ex1 = new Exception('error message');
        expect(ex1.toString()).to.equal('Exception: error message');

        const ex2 = new TestError('something went wrong');
        expect(ex2.toString()).to.equal('TestError: something went wrong');

        const ex3 = new SubTestError('unknown error');
        expect(ex3.toString()).to.equal('SubTestError: unknown error');
    });

    it('should support metadata', () => {
        const ex1 = new Exception();
        expect(ex1.data).to.be.an('object');
        expect(ex1.data).to.deep.equal({});
        expect({}.propertyIsEnumerable.call(ex1, 'data')).to.equal(false);

        const ex2 = new Exception('error message', {foo: 100});
        expect(ex2.data).to.be.an('object');
        expect(ex2.data).to.deep.equal({foo: 100});

        const ex3 = new Exception('error message', {cause: ex1});
        expect(ex3.data).to.be.an('object');
        expect(ex3.data).to.deep.equal({});

        const ex4 = new Exception('erro message', {cause: ex1, foo: 1, bar: 2, baz: 3});
        expect(ex4.data).to.be.an('object');
        expect(ex4.data).to.deep.equal({foo: 1, bar: 2, baz: 3});
    });

    it('should serialize an Exception', () => {
        const error = new Error();
        const fn = function() {};
        const date = new Date();

        const ex = new Exception('error message', {
            cause: error,
            fn,
            date
        });

        expect(ex.toJSON()).to.deep.equal({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            cause: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            data: {
                fn: '[Function: fn]',
                date: date.toISOString()
            }
        });
    });

    it('should convert a normal Error into an Exception', () => {
        const error = new Error('error message');

        const ex1 = Exception.from(error);
        expect(ex1).to.be.an.instanceof(Exception);
        expect(ex1.name).to.equal('Exception');
        expect(ex1.message).to.equal(error.message);
        expect(ex1.stack).to.equal(error.stack);
        expect(ex1.cause).to.equal(null);
        expect(ex1.source).to.equal(error);

        const ex2 = TestError.from(error);
        expect(ex2).to.be.an.instanceof(TestError);
        expect(ex2.name).to.equal('TestError');
        expect(ex2.message).to.equal(error.message);
        expect(ex2.stack).to.equal(error.stack);
        expect(ex2.cause).to.equal(null);
        expect(ex2.source).to.equal(error);

        const ex3 = SubTestError.from(error);
        expect(ex3).to.be.an.instanceof(SubTestError);
        expect(ex3.name).to.equal('SubTestError');
        expect(ex3.message).to.equal(error.message);
        expect(ex3.stack).to.equal(error.stack);
        expect(ex3.cause).to.equal(null);
        expect(ex3.source).to.equal(error);
    });

    it('should convert a string into an Exception', () => {
        const message = 'error message';

        const ex1 = Exception.from(message);
        expect(ex1).to.be.an.instanceof(Exception);
        expect(ex1.message).to.equal(message);

        const ex2 = TestError.from(message);
        expect(ex2).to.be.an.instanceof(TestError);
        expect(ex2.message).to.equal(message);

        const ex3 = SubTestError.from(message);
        expect(ex3).to.be.an.instanceof(SubTestError);
        expect(ex3.message).to.equal(message);
    });

    it('should not convert an object if it already is an Exception', () => {
        const ex1 = new Exception('error message');
        expect(Exception.from(ex1)).to.equal(ex1);
        expect(ex1.cause).to.equal(null);

        const ex2 = new TestError('error message');
        expect(TestError.from(ex2)).to.equal(ex2);
        expect(Exception.from(ex2)).to.equal(ex2);
        expect(ex2.cause).to.equal(null);

        const ex3 = new SubTestError('error message');
        expect(SubTestError.from(ex3)).to.equal(ex3);
        expect(TestError.from(ex3)).to.equal(ex3);
        expect(Exception.from(ex3)).to.equal(ex3);
        expect(ex3.cause).to.equal(null);
    });

    it('should convert a thrown error string into an Exception', () => {
        try {
            throw 'error message';
        } catch(e) {
            const ex = Exception.from(e);
            expect(ex.message).to.equal('error message');
        }
    });

    it('should convert an AggregateError into an Exception', () => {
        const error1 = new Error();
        const error2 = new Error();
        const error3 = new Error();
        const aggregateError = new AggregateError([error1, error2, error3]);

        const ex = Exception.from(aggregateError);

        expect(ex.cause).to.be.an('array');
        expect(ex.cause).to.have.lengthOf(3);
        expect(ex.cause).to.include(error1);
        expect(ex.cause).to.include(error2);
        expect(ex.cause).to.include(error3);
    });

    it('should convert a DOMException into an Exception', () => {
        const error = new DOMException('error message');

        const ex = Exception.from(error);

        expect(ex).to.be.an.instanceof(Exception);
        expect(ex.name).to.equal('Exception');
        expect(ex.message).to.equal(error.message);
        expect(ex.stack).to.equal(error.stack);
        expect(ex.cause).to.equal(null);
        expect(ex.source).to.equal(error);
    });

    it('should convert a normal Error into an Exception with custom metadata', () => {
        const error = new Error('error message');

        const data = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const ex = Exception.from(error, data);

        expect(ex.data).to.deep.equal(data);
    });

    it('should convert a string into an Exception with custom metadata', () => {
        const message = 'error message';
        const data = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const ex = Exception.from(message, data);

        expect(ex.data).to.deep.equal(data);
    });

    it('should merge custom metadata into an Exception', () => {
        const ex1 = new Exception('error message', {
            foo: 1
        });

        const ex2 = Exception.from(ex1, {
            bar: 2,
            baz: 3
        });

        expect(ex2).to.equal(ex1);
        expect(ex2.data).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });

    it('should merge cause and custom metadata into an Exception', () => {
        const error = new Error();

        const ex1 = new Exception('error message', {
            foo: 1
        });

        const ex2 = Exception.from(ex1, {
            cause: error,
            bar: 2,
            baz: 3
        });

        expect(ex2.cause).to.equal(error);
        expect(ex2.data).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });
});
