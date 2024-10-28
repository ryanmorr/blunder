import { Exception } from '../../src/blunder';

class TestError extends Exception {}
class SubTestError extends TestError {}

describe('Exception', () => {
    it('should support subsclassing Exception', () => {
        const error1 = new Exception();
        expect(error1).to.be.an.instanceof(Error);
        expect(error1).to.be.an.instanceof(Exception);
    
        const error2 = new TestError();
        expect(error2).to.be.an.instanceof(Error);
        expect(error2).to.be.an.instanceof(Exception);
        expect(error2).to.be.an.instanceof(TestError);
    
        const error3 = new SubTestError();
        expect(error3).to.be.an.instanceof(Error);
        expect(error3).to.be.an.instanceof(Exception);
        expect(error3).to.be.an.instanceof(TestError);
        expect(error3).to.be.an.instanceof(SubTestError);
    });

    it('should support the name property', () => {
        const error1 = new Exception();
        expect(error1.name).to.equal('Exception');
        expect({}.propertyIsEnumerable.call(error1, 'name')).to.equal(false);

        const error2 = new TestError();
        expect(error2.name).to.equal('TestError');
        expect({}.propertyIsEnumerable.call(error2, 'name')).to.equal(false);

        const error3 = new SubTestError();
        expect(error3.name).to.equal('SubTestError');
        expect({}.propertyIsEnumerable.call(error3, 'name')).to.equal(false);
    });

    it('should support the message property', () => {
        const msg = 'an error occurred';
        const error = new Exception(msg);
        expect(error.message).to.equal(msg);
    });

    it('should support the stack property', () => {
        const error1 = new Exception();
        expect(error1.stack).to.be.a('string');

        const error2 = new TestError();
        expect(error2.stack).to.be.a('string');
    });

    it('should support the stack property when captureStackTrace is not supported', () => {
        const { captureStackTrace } = Error;
        Reflect.deleteProperty(Error, 'captureStackTrace');
        expect(Error.captureStackTrace).to.not.exist;
        
        const error = new Exception();
        expect(error.stack).to.be.a('string');

        Error.captureStackTrace = captureStackTrace;
    });

    it('should support the cause property', () => {
        const error1 = new Exception();
        expect(error1.cause).to.equal(null);

        const error2 = new Exception('error', {cause: error1});
        expect(error2.cause).to.equal(error1);
    });

    it('should support an array for the cause property', () => {
        const error1 = new Error();
        const error2 = new Error();
        const error3 = new Error();

        const error4 = new Exception('error', {cause: [error1, error2, error3]});
        expect(error4.cause).to.be.an('array');
        expect(error4.cause).to.have.lengthOf(3);
        expect(error4.cause).to.include(error1);
        expect(error4.cause).to.include(error2);
        expect(error4.cause).to.include(error3);
    });

    it('should support the toString method', () => {
        const error1 = new Exception();
        expect(error1.toString()).to.equal('Exception');

        const error2 = new TestError();
        expect(error2.toString()).to.equal('TestError');

        const error3 = new SubTestError();
        expect(error3.toString()).to.equal('SubTestError');
    });

    it('should support metadata', () => {
        const error1 = new Exception();
        expect(error1.data).to.be.an('object');
        expect(error1.data).to.deep.equal({});
        expect({}.propertyIsEnumerable.call(error1, 'data')).to.equal(false);

        const error2 = new Exception('error', {foo: 100});
        expect(error2.data).to.be.an('object');
        expect(error2.data).to.deep.equal({foo: 100});

        const error3 = new Exception('error', {cause: error1});
        expect(error3.data).to.be.an('object');
        expect(error3.data).to.deep.equal({});

        const error4 = new Exception('error', {cause: error1, foo: 1, bar: 2, baz: 3});
        expect(error4.data).to.be.an('object');
        expect(error4.data).to.deep.equal({foo: 1, bar: 2, baz: 3});
    });

    it('should serialize an Exception into JSON', () => {
        const error = new Exception('error message');

        const data = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            data: error.data
        };

        const jsonData = error.toJSON();
        expect(jsonData).to.deep.equal(data);

        const json = JSON.stringify(error);
        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.deep.equal(data);
    });

    it('should serialize dates to long form strings', () => {
        const date = new Date();
        const error = new Exception('error message', {
            date
        });

        const jsonData = JSON.parse(JSON.stringify(error));
        expect(jsonData.data.date).to.equal(date.toString());
    });

    it('should serialize functions to its string representation', () => {
        const foo = () => {};
        const error = new Exception('error message', {
            fn: foo
        });

        const jsonData = JSON.parse(JSON.stringify(error));
        expect(jsonData.data.fn).to.equal(foo.toString());
    });

    it('should convert a normal Error into an Exception', () => {
        const error = new Error('error message');

        const ex1 = Exception.from(error);
        expect(ex1).to.be.an.instanceof(Exception);
        expect(ex1.name).to.equal('Exception');
        expect(ex1.message).to.equal(error.message);
        expect(ex1.stack).to.equal(error.stack);
        expect(ex1.cause).to.equal(error);

        const ex2 = TestError.from(error);
        expect(ex2).to.be.an.instanceof(TestError);
        expect(ex2.name).to.equal('TestError');
        expect(ex2.message).to.equal(error.message);
        expect(ex2.stack).to.equal(error.stack);
        expect(ex2.cause).to.equal(error);

        const ex3 = SubTestError.from(error);
        expect(ex3).to.be.an.instanceof(SubTestError);
        expect(ex3.name).to.equal('SubTestError');
        expect(ex3.message).to.equal(error.message);
        expect(ex3.stack).to.equal(error.stack);
        expect(ex3.cause).to.equal(error);
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
        expect(ex1.cause).to.not.equal(ex1);

        const ex2 = new TestError('error message');
        expect(TestError.from(ex2)).to.equal(ex2);
        expect(Exception.from(ex2)).to.equal(ex2);
        expect(ex2.cause).to.not.equal(ex2);

        const ex3 = new SubTestError('error message');
        expect(SubTestError.from(ex3)).to.equal(ex3);
        expect(TestError.from(ex3)).to.equal(ex3);
        expect(Exception.from(ex3)).to.equal(ex3);
        expect(ex3.cause).to.not.equal(ex3);
    });

    it('should convert a thrown error string into an Exception', () => {
        try {
            throw 'error message';
        } catch(e) {
            const error = Exception.from(e);
            expect(error.message).to.equal('error message');
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
        expect(ex.cause).to.equal(error);
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
        const error = new Exception('error message', {
            foo: 1
        });

        const ex = Exception.from(error, {
            bar: 2,
            baz: 3
        });

        expect(ex.data).to.deep.equal({
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
