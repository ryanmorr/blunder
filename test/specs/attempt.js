import { attempt, subscribe, monitor, Exception } from '../../src/blunder';

describe('attempt', () => {
    it('should resolve when the provided function is successfully executed', (done) => {
        const promise = attempt(() => {
            return 'foo';
        });
        
        expect(promise).to.be.a('promise');

        promise.then((val) => {
            expect(val).to.equal('foo');
            done();
        });
    });

    it('should reject when the provided function throws an error', (done) => {
        const message = 'An error occurred';
        const error = new Error(message);

        const promise = attempt(() => {
            throw error;
        });
        
        expect(promise).to.be.a('promise');
        
        promise.catch((ex) => {
            expect(ex).to.be.an.instanceof(Exception);
            expect(ex.message).to.equal(message);
            expect(ex.source).to.equal(error);
            done();
        });
    });

    it('should allow passing details to the error object when an error is thrown', (done) => {
        const callback = () => {
            throw new Error();
        };

        const detail = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        attempt(callback, detail).catch((ex) => {
            expect(ex).to.be.an.instanceof(Exception);
            expect(ex.detail).to.deep.equal(detail);
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
            expect(ex.source).to.equal(error);

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
