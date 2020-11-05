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

        expect(error.metadata).to.be.an('object');

        const metadata = error.metadata;

        expect(metadata).to.have.property('timestamp');
        expect(metadata.timestamp).to.be.a('number');

        expect(metadata).to.have.property('datetime');
        expect(metadata.datetime).to.be.a('date');

        expect(metadata).to.have.property('userAgent');
        expect(metadata.userAgent).to.equal(navigator.userAgent);

        expect(metadata).to.have.property('url');
        expect(metadata.url).to.equal(document.location.href);

        expect(metadata).to.have.property('referrer');
        expect(metadata.referrer).to.equal(document.referrer);

        expect(metadata).to.have.property('cookie');
        expect(metadata.cookie).to.equal(navigator.cookieEnabled ? cookie : 'disabled');

        expect(metadata).to.have.property('language');
        expect(metadata.language).to.equal(navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || navigator.language);

        expect(metadata).to.have.property('readyState');
        expect(metadata.readyState).to.equal(document.readyState);

        expect(metadata).to.have.property('viewportWidth');
        expect(metadata.viewportWidth).to.equal(window.innerWidth);

        expect(metadata).to.have.property('viewportHeight');
        expect(metadata.viewportHeight).to.equal(window.innerHeight);

        expect(metadata).to.have.property('orientation');
        if (screen && screen.orientation && screen.orientation.type) {
            expect(metadata.orientation).to.equal(screen.orientation.type);
        } else {
            expect(metadata.orientation).to.equal(document.documentElement.clientWidth > document.documentElement.clientHeight ? 'landscape' : 'portrait');
        }

        if (navigator.connection && navigator.connection.effectiveType) {
            expect(metadata).to.have.property('connection');
            expect(metadata.connection).to.equal(navigator.connection.effectiveType);
        }

        if (window.performance && window.performance.memory) {
            expect(metadata).to.have.property('heap');
            expect(metadata).to.have.property('heapPercent');
        }
    });

    it('should support custom details', () => {
        const error1 = new Exception();
        expect(error1.details).to.be.an('object');
        expect(error1.details).to.deep.equal({});

        const error2 = new Exception('error message', {
            foo: 1,
            bar: 2,
            baz: 3
        });
        expect(error2.details).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });

    it('should convert a normal Error into an Exception', () => {
        const error = new Error('error message');

        const ex1 = Exception.from(error);
        expect(ex1).to.be.an.instanceof(Exception);
        expect(ex1.name).to.equal('Exception');
        expect(ex1.message).to.equal(error.message);
        expect(ex1.stack).to.equal(error.stack);
        expect(ex1.originalError).to.equal(error);

        const ex2 = TestError.from(error);
        expect(ex2).to.be.an.instanceof(TestError);
        expect(ex2.name).to.equal('TestError');
        expect(ex2.message).to.equal(error.message);
        expect(ex2.stack).to.equal(error.stack);
        expect(ex2.originalError).to.equal(error);

        const ex3 = SubTestError.from(error);
        expect(ex3).to.be.an.instanceof(SubTestError);
        expect(ex3.name).to.equal('SubTestError');
        expect(ex3.message).to.equal(error.message);
        expect(ex3.stack).to.equal(error.stack);
        expect(ex3.originalError).to.equal(error)
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

        const details = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const ex = Exception.from(error, details);

        expect(ex.details).to.deep.equal(details);
    });

    it('should convert a string into an Exception with custom details', () => {
        const message = 'error message';
        const details = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const ex = Exception.from(message, details);

        expect(ex.details).to.deep.equal(details);
    });

    it('should merge custom details into an Exception', () => {
        const error = new Exception('error message', {
            foo: 1
        });

        const ex = Exception.from(error, {
            bar: 2,
            baz: 3
        });

        expect(ex.details).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });
});
