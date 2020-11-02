import { monitor, subscribe, BlunderError } from '../../src/blunder';

describe('monitor', () => {
    it('Should add all global error event listeners by default', () => {
        const spy = sinon.spy(window, 'addEventListener');

        const stop = monitor();

        expect(spy.callCount).to.equal(3);
        expect(spy.args[0][0]).to.equal('error');
        expect(spy.args[1][0]).to.equal('unhandledrejection');
        expect(spy.args[2][0]).to.equal('rejectionhandled');

        spy.restore();
        stop();
    });

    it('Should remove all global error event listeners by default', () => {
        const spy = sinon.spy(window, 'removeEventListener');

        const stop = monitor();

        expect(spy.callCount).to.equal(0);

        stop();

        expect(spy.callCount).to.equal(3);
        expect(spy.args[0][0]).to.equal('error');
        expect(spy.args[1][0]).to.equal('unhandledrejection');
        expect(spy.args[2][0]).to.equal('rejectionhandled');

        spy.restore();
    });

    it('Should allow adding only the global error event listener', () => {
        const spy = sinon.spy(window, 'addEventListener');

        const stop = monitor({error: true, unhandledrejection: false, rejectionhandled: false});

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('error');

        spy.restore();
        stop();
    });

    it('Should allow adding only the global unhandledrejection event listener', () => {
        const spy = sinon.spy(window, 'addEventListener');

        const stop = monitor({error: false, unhandledrejection: true, rejectionhandled: false});

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('unhandledrejection');

        spy.restore();
        stop();
    });

    it('Should allow adding only the global rejectionhandled event listener', () => {
        const spy = sinon.spy(window, 'addEventListener');

        const stop = monitor({error: false, unhandledrejection: false, rejectionhandled: true});

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('rejectionhandled');

        spy.restore();
        stop();
    });

    it('Should not add or remove more than one event listener for each global error event type', () => {
        const addSpy = sinon.spy(window, 'addEventListener');
        const removeSpy = sinon.spy(window, 'removeEventListener');

        const stop1 = monitor();
        const stop2 = monitor();

        expect(addSpy.callCount).to.equal(3);
        expect(addSpy.args[0][0]).to.equal('error');
        expect(addSpy.args[1][0]).to.equal('unhandledrejection');
        expect(addSpy.args[2][0]).to.equal('rejectionhandled');

        stop1();
        stop2();

        expect(removeSpy.callCount).to.equal(3);
        expect(removeSpy.args[0][0]).to.equal('error');
        expect(removeSpy.args[1][0]).to.equal('unhandledrejection');
        expect(removeSpy.args[2][0]).to.equal('rejectionhandled');

        addSpy.restore();
        removeSpy.restore();
    });

    it('Should dispatch an error when a global error event is dispatched', (done) => {
        const onerror = window.onerror;
        window.onerror = undefined;

        let stop, unsubscribe;

        const message = 'An error occurred';
        const error = new Error(message);
        const errorEvent = new ErrorEvent('error', {
            error,
            message
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(BlunderError);
            expect(err.message).to.equal(message);
            expect(err.originalError).to.equal(error);

            stop();
            unsubscribe();
            window.onerror = onerror;
            done();
        });

        stop = monitor();

        window.dispatchEvent(errorEvent);
    });

    it('Should dispatch an error when a rejectionhandled event is dispatched', (done) => {
        let stop, unsubscribe;

        const message = 'An error occurred';
        const error = new Error(message);
        const promise = Promise.reject(error);
        const rejectionEvent = new PromiseRejectionEvent('rejectionhandled', {
            reason: error,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(BlunderError);
            expect(err.message).to.equal(message);
            expect(err.originalError).to.equal(error);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });

    it('Should dispatch an error when an unhandledrejection event is dispatched', (done) => {
        let stop, unsubscribe;

        const message = 'An error occurred';
        const error = new Error(message);
        const promise = Promise.reject(error);
        const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
            reason: error,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(BlunderError);
            expect(err.message).to.equal(message);
            expect(err.originalError).to.equal(error);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });
});
