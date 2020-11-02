import { attempt, subscribe, BlunderError } from '../../src/blunder';

describe('attempt', () => {
    it('should resolve when the provided function is successfully executed', (done) => {
        attempt(() => {
            return 'foo';
        }).then((val) => {
            expect(val).to.equal('foo');
            done();
        });
    });

    it('should reject when the provided function raises an error', (done) => {
        const message = 'An error occurred';
        const error = new Error(message);

        attempt(() => {
            throw error;
        }).catch((e) => {
            expect(e).to.be.an.instanceof(BlunderError);
            expect(e.message).to.equal(message);
            expect(e.originalError).to.equal(error);
            done();
        });
    });

    it('should dispatch an error to global error handlers', () => {
        const message = 'An error occurred';
        const error = new Error(message);

        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);

        attempt(() => {
            throw error;
        });

        expect(callback.callCount).to.equal(1);

        const e = callback.args[0][0];
        expect(e).to.be.an.instanceof(BlunderError);
        expect(e.message).to.equal(message);
        expect(e.originalError).to.equal(error);

        unsubscribe();
    });
});
