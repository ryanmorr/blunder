import { attempt, subscribe, monitor, Exception } from '../../src/blunder';

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
            expect(e).to.be.an.instanceof(Exception);
            expect(e.message).to.equal(message);
            expect(e.originalError).to.equal(error);
            done();
        });
    });

    it('should dispatch an error to global error handlers', (done) => {
        const message = 'An error occurred';
        const error = new Error(message);

        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);

        attempt(() => {
            throw error;
        }).catch((ex) => {
            expect(callback.callCount).to.equal(1);

            expect(callback.args[0][0]).to.equal(ex);
            expect(ex).to.be.an.instanceof(Exception);
            expect(ex.message).to.equal(message);
            expect(ex.originalError).to.equal(error);

            unsubscribe();
            done();
        });
    });

    it('Should dispatch an error only once to the global error handlers', (done) => {
        let stop, unsubscribe;

        const callback = sinon.spy();
        unsubscribe = subscribe(callback);

        stop = monitor({error: false, unhandledrejection: false, rejectionhandled: true});

        const promise = attempt(() => {
            throw new Error('An error occurred');
        });

        promise.catch((ex) => {
            window.dispatchEvent(new PromiseRejectionEvent('rejectionhandled', {
                reason: ex,
                promise
            }));
        });

        const onRejectionHandled = () => {
            expect(callback.callCount).to.equal(1);

            window.removeEventListener('rejectionhandled', onRejectionHandled);
            stop();
            unsubscribe();
            done();
        };
        
        window.addEventListener('rejectionhandled', onRejectionHandled);
    });
});
