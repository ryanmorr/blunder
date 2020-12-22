import { Exception, stacktrace } from '../../src/blunder';

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
        expect(error1.propertyIsEnumerable('name')).to.equal(false);

        const error2 = new TestError();
        expect(error2.name).to.equal('TestError');
        expect(error2.propertyIsEnumerable('name')).to.equal(false);

        const error3 = new SubTestError();
        expect(error3.name).to.equal('SubTestError');
        expect(error3.propertyIsEnumerable('name')).to.equal(false);
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

    it('should support the toString method', () => {
        const error1 = new Exception();
        expect(error1.toString()).to.equal('Exception');

        const error2 = new TestError();
        expect(error2.toString()).to.equal('TestError');

        const error3 = new SubTestError();
        expect(error3.toString()).to.equal('SubTestError');
    });

    it('should support metadata', () => {
        const cookie = 'foo=bar';
        document.cookie = cookie;
        
        const error = new Exception();

        expect(error.meta).to.be.an('object');

        const meta = error.meta;

        expect(meta).to.have.property('timestamp');
        expect(meta.timestamp).to.be.a('number');

        expect(meta).to.have.property('datetime');
        expect(meta.datetime).to.be.a('string');

        expect(meta).to.have.property('userAgent');
        expect(meta.userAgent).to.equal(navigator.userAgent);

        expect(meta).to.have.property('url');
        expect(meta.url).to.equal(document.location.href);

        expect(meta).to.have.property('referrer');
        expect(meta.referrer).to.equal(document.referrer);

        expect(meta).to.have.property('cookie');
        expect(meta.cookie).to.equal(navigator.cookieEnabled ? cookie : 'disabled');

        expect(meta).to.have.property('language');
        expect(meta.language).to.equal(navigator.language || navigator.userLanguage);

        expect(meta).to.have.property('readyState');
        expect(meta.readyState).to.equal(document.readyState);

        expect(meta).to.have.property('viewportWidth');
        expect(meta.viewportWidth).to.equal(window.innerWidth);

        expect(meta).to.have.property('viewportHeight');
        expect(meta.viewportHeight).to.equal(window.innerHeight);

        expect(meta).to.have.property('orientation');
        if (screen && screen.orientation && screen.orientation.type) {
            expect(meta.orientation).to.equal(screen.orientation.type);
        } else {
            expect(meta.orientation).to.equal(document.documentElement.clientWidth > document.documentElement.clientHeight ? 'landscape' : 'portrait');
        }

        if (navigator.connection && navigator.connection.effectiveType) {
            expect(meta).to.have.property('connection');
            expect(meta.connection).to.equal(navigator.connection.effectiveType);
        }

        if (window.performance && window.performance.memory) {
            expect(meta).to.have.property('heap');
            expect(meta).to.have.property('heapPercent');
        }
    });

    it('should support custom details', () => {
        const error1 = new Exception();
        expect(error1.detail).to.be.an('object');
        expect(error1.detail).to.deep.equal({});

        const error2 = new Exception('error message', {
            foo: 1,
            bar: 2,
            baz: 3
        });
        expect(error2.detail).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });

    it('should serialize an Exception into JSON', () => {
        const error = new Exception('error message');

        const data = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            detail: error.detail,
            meta: error.meta,
            stacktrace: error.stacktrace
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

        const data = JSON.parse(JSON.stringify(error));
        expect(data.detail.date).to.equal(date.toString());
    });

    it('should serialize functions to its string representation', () => {
        const foo = () => {};
        const error = new Exception('error message', {
            fn: foo
        });

        const data = JSON.parse(JSON.stringify(error));
        expect(data.detail.fn).to.equal(foo.toString());
    });

    it('should convert a normal Error into an Exception', () => {
        const error = new Error('error message');
        const stack = stacktrace(error.stack);

        const ex1 = Exception.from(error);
        expect(ex1).to.be.an.instanceof(Exception);
        expect(ex1.name).to.equal('Exception');
        expect(ex1.message).to.equal(error.message);
        expect(ex1.stack).to.equal(error.stack);
        expect(ex1.stacktrace).to.deep.equal(stack);
        expect(ex1.source).to.equal(error);

        const ex2 = TestError.from(error);
        expect(ex2).to.be.an.instanceof(TestError);
        expect(ex2.name).to.equal('TestError');
        expect(ex2.message).to.equal(error.message);
        expect(ex2.stack).to.equal(error.stack);
        expect(ex2.stacktrace).to.deep.equal(stack);
        expect(ex2.source).to.equal(error);

        const ex3 = SubTestError.from(error);
        expect(ex3).to.be.an.instanceof(SubTestError);
        expect(ex3.name).to.equal('SubTestError');
        expect(ex3.message).to.equal(error.message);
        expect(ex3.stack).to.equal(error.stack);
        expect(ex3.stacktrace).to.deep.equal(stack);
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

        const ex2 = new TestError('error message');
        expect(TestError.from(ex2)).to.equal(ex2);

        const ex3 = new SubTestError('error message');
        expect(SubTestError.from(ex3)).to.equal(ex3);
    });

    it('should convert a normal Error into an Exception with custom details', () => {
        const error = new Error('error message');

        const detail = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const ex = Exception.from(error, detail);

        expect(ex.detail).to.deep.equal(detail);
    });

    it('should convert a string into an Exception with custom details', () => {
        const message = 'error message';
        const detail = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const ex = Exception.from(message, detail);

        expect(ex.detail).to.deep.equal(detail);
    });

    it('should merge custom details into an Exception', () => {
        const error = new Exception('error message', {
            foo: 1
        });

        const ex = Exception.from(error, {
            bar: 2,
            baz: 3
        });

        expect(ex.detail).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });

    it('should support a parsed stacktrace property', () => {
        const foo = () => bar();
        const bar = () => baz();
        const baz = () => qux();
        
        const qux = () => {
            const error = new Exception();
            expect(error.stacktrace).to.be.an('array');
            expect(error.stacktrace.length > 0).to.equal(true);
            expect(error.stacktrace[0].functionName).to.equal('qux');
            expect(error.stacktrace[1].functionName).to.equal('baz');
            expect(error.stacktrace[2].functionName).to.equal('bar');
            expect(error.stacktrace[3].functionName).to.equal('foo');
        };
        
        foo();
    });
});
