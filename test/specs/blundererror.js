import { BlunderError } from '../../src/blunder';

class TestError extends BlunderError {}
class SubTestError extends TestError {}

describe('BlunderError', () => {
    it('should support subsclassing BlunderError', () => {
        const error1 = new BlunderError();
        expect(error1).to.be.an.instanceof(Error);
        expect(error1).to.be.an.instanceof(BlunderError);
    
        const error2 = new TestError();
        expect(error2).to.be.an.instanceof(Error);
        expect(error2).to.be.an.instanceof(BlunderError);
        expect(error2).to.be.an.instanceof(TestError);
    
        const error3 = new SubTestError();
        expect(error3).to.be.an.instanceof(Error);
        expect(error3).to.be.an.instanceof(BlunderError);
        expect(error3).to.be.an.instanceof(TestError);
        expect(error3).to.be.an.instanceof(SubTestError);
    });

    it('should support the name property', () => {
        const error1 = new BlunderError();
        expect(error1.name).to.equal('BlunderError');
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
        const error = new BlunderError(msg);
        expect(error.message).to.equal(msg);
    });

    it('should support the stack property', () => {
        const error1 = new BlunderError();
        expect(error1.stack).to.be.a('string');

        const error2 = new TestError();
        expect(error2.stack).to.be.a('string');
    });

    it('should support the stack property when captureStackTrace is not supported', () => {
        const { captureStackTrace } = Error;
        Reflect.deleteProperty(Error, 'captureStackTrace');
        expect(Error.captureStackTrace).to.not.exist;
        
        const error = new BlunderError();
        expect(error.stack).to.be.a('string');

        Error.captureStackTrace = captureStackTrace;
    });

    it('should support the toString method', () => {
        const error1 = new BlunderError();
        expect(error1.toString()).to.equal('BlunderError');

        const error2 = new TestError();
        expect(error2.toString()).to.equal('TestError');

        const error3 = new SubTestError();
        expect(error3.toString()).to.equal('SubTestError');
    });

    it('should support metadata', () => {
        const error = new BlunderError();

        expect(error.metadata).to.be.an('object');

        const metadata = error.metadata;

        expect(metadata).to.have.property('timestamp');
        expect(metadata.timestamp).to.be.a('number');

        expect(metadata).to.have.property('datetime');
        expect(metadata.datetime).to.be.a('string');

        expect(metadata).to.have.property('userAgent');
        expect(metadata.userAgent).to.equal(navigator.userAgent);

        expect(metadata).to.have.property('url');
        expect(metadata.url).to.equal(document.location.href);

        expect(metadata).to.have.property('referrer');
        expect(metadata.referrer).to.equal(document.referrer);

        expect(metadata).to.have.property('cookie');
        expect(metadata.cookie).to.equal(navigator.cookieEnabled ? document.cookie : 'disabled');

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
        const error1 = new BlunderError();
        expect(error1.details).to.be.an('object');
        expect(error1.details).to.deep.equal({});

        const error2 = new BlunderError('error message', {
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

    it('should support converting a BlunderError instance into JSON', () => {
        const error = new BlunderError('error message');

        const data = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            details: error.details,
            metadata: error.metadata
        };

        const json1 = error.toJSON();
        const json2 = JSON.stringify(error);

        expect(json1).to.equal(json2);

        expect(json1).to.be.a('string');
        expect(JSON.parse(json1)).to.deep.equal(data);

        expect(json2).to.be.a('string');
        expect(JSON.parse(json2)).to.deep.equal(data);
    });

    it('should convert a normal Error into a BlunderError', () => {
        const error = new Error('error message');

        const blunderError = BlunderError.from(error);

        expect(blunderError).to.be.an.instanceof(BlunderError);
        expect(blunderError.name).to.equal('BlunderError');
        expect(blunderError.message).to.equal(error.message);
        expect(blunderError.stack).to.equal(error.stack);
        expect(blunderError.originalError).to.equal(error);
    });

    it('should convert a string into a BlunderError', () => {
        const message = 'error message';

        const blunderError = BlunderError.from(message);

        expect(blunderError).to.be.an.instanceof(BlunderError);
        expect(blunderError.message).to.equal(message);
    });

    it('should not convert an object if it already is a BlunderError', () => {
        const error = new BlunderError('error message');

        const blunderError = BlunderError.from(error);

        expect(blunderError).to.equal(error);
    });









    it('should convert a normal Error into a BlunderError with custom details', () => {
        const error = new Error('error message');

        const details = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const blunderError = BlunderError.from(error, details);

        expect(blunderError.details).to.deep.equal(details);
    });

    it('should convert a string into a BlunderError with custom details', () => {
        const message = 'error message';
        const details = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        const blunderError = BlunderError.from(message, details);

        expect(blunderError.details).to.deep.equal(details);
    });

    it('should merge custom details into a BlunderError', () => {
        const error = new BlunderError('error message', {
            foo: 1
        });

        const blunderError = BlunderError.from(error, {
            bar: 2,
            baz: 3
        });

        expect(blunderError.details).to.deep.equal({
            foo: 1,
            bar: 2,
            baz: 3
        });
    });
});
