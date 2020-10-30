import { BlunderError } from '../../src/blunder';

class TestError extends BlunderError {}
class SubTestError extends TestError {}

describe('blunder', () => {
    it('should support subsclassing BlunderError', () => {
        const err1 = new BlunderError();
        expect(err1).to.be.an.instanceof(Error);
        expect(err1).to.be.an.instanceof(BlunderError);
    
        const err2 = new TestError();
        expect(err2).to.be.an.instanceof(Error);
        expect(err2).to.be.an.instanceof(BlunderError);
        expect(err2).to.be.an.instanceof(TestError);
    
        const err3 = new SubTestError();
        expect(err3).to.be.an.instanceof(Error);
        expect(err3).to.be.an.instanceof(BlunderError);
        expect(err3).to.be.an.instanceof(TestError);
        expect(err3).to.be.an.instanceof(SubTestError);
    });

    it('should support the name property', () => {
        const err1 = new BlunderError();
        expect(err1.name).to.equal('BlunderError');
        expect(err1.propertyIsEnumerable('name')).to.equal(false);

        const err2 = new TestError();
        expect(err2.name).to.equal('TestError');
        expect(err2.propertyIsEnumerable('name')).to.equal(false);

        const err3 = new SubTestError();
        expect(err3.name).to.equal('SubTestError');
        expect(err3.propertyIsEnumerable('name')).to.equal(false);
    });

    it('should support the message property', () => {
        const msg = 'an error occurred';
        const err = new BlunderError(msg);
        expect(err.message).to.equal(msg);
    });

    it('should support the stack property', () => {
        const err1 = new BlunderError();
        expect(err1.stack).to.be.a('string');

        const err2 = new TestError();
        expect(err2.stack).to.be.a('string');
    });

    it('should support the stack property when captureStackTrace is not supported', () => {
        const { captureStackTrace } = Error;
        Reflect.deleteProperty(Error, 'captureStackTrace');
        expect(Error.captureStackTrace).to.not.exist;
        
        const err = new BlunderError();
        expect(err.stack).to.be.a('string');

        Error.captureStackTrace = captureStackTrace;
    });

    it('should support the toString method', () => {
        const err1 = new BlunderError();
        expect(err1.toString()).to.equal('BlunderError');

        const err2 = new TestError();
        expect(err2.toString()).to.equal('TestError');

        const err3 = new SubTestError();
        expect(err3.toString()).to.equal('SubTestError');
    });

    it('should support metadata', () => {
        const err = new BlunderError();

        expect(err.metadata).to.be.an('object');

        const metadata = err.metadata;

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
});
