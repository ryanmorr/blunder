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
        const err = new BlunderError();
        expect(err.stack).to.be.a('string');

        const err2 = new TestError();
        expect(err2.stack).to.be.a('string');
    });

    it('should support the toString method', () => {
        const err = new BlunderError();
        expect(err.toString()).to.equal('BlunderError');

        const err2 = new TestError();
        expect(err2.toString()).to.equal('TestError');

        const err3 = new SubTestError();
        expect(err3.toString()).to.equal('SubTestError');
    });
});
