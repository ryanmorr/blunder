import { monitor, subscribe, Exception } from '../../src/blunder';

describe('monitor', () => {
    it('should add all global error event listeners by default', () => {
        const spy = sinon.spy(window, 'addEventListener');

        const stop = monitor();

        expect(spy.callCount).to.equal(3);
        expect(spy.args[0][0]).to.equal('error');
        expect(spy.args[1][0]).to.equal('unhandledrejection');
        expect(spy.args[2][0]).to.equal('rejectionhandled');

        spy.restore();
        stop();
    });

    it('should remove all global error event listeners by default', () => {
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

    it('should allow adding only the global error event listener', () => {
        const addSpy = sinon.spy(window, 'addEventListener');
        const removeSpy = sinon.spy(window, 'removeEventListener');

        const stop = monitor({error: true, unhandledrejection: false, rejectionhandled: false});

        expect(addSpy.callCount).to.equal(1);
        expect(addSpy.args[0][0]).to.equal('error');

        stop();
        expect(removeSpy.callCount).to.equal(1);
        expect(removeSpy.args[0][0]).to.equal('error');

        addSpy.restore();
        removeSpy.restore();
    });

    it('should allow adding only the global unhandledrejection event listener', () => {
        const addSpy = sinon.spy(window, 'addEventListener');
        const removeSpy = sinon.spy(window, 'removeEventListener');

        const stop = monitor({error: false, unhandledrejection: true, rejectionhandled: false});

        expect(addSpy.callCount).to.equal(1);
        expect(addSpy.args[0][0]).to.equal('unhandledrejection');

        stop();
        expect(removeSpy.callCount).to.equal(1);
        expect(removeSpy.args[0][0]).to.equal('unhandledrejection');

        addSpy.restore();
        removeSpy.restore();
    });

    it('should allow adding only the global rejectionhandled event listener', () => {
        const addSpy = sinon.spy(window, 'addEventListener');
        const removeSpy = sinon.spy(window, 'removeEventListener');

        const stop = monitor({error: false, unhandledrejection: false, rejectionhandled: true});

        expect(addSpy.callCount).to.equal(1);
        expect(addSpy.args[0][0]).to.equal('rejectionhandled');

        stop();
        expect(removeSpy.callCount).to.equal(1);
        expect(removeSpy.args[0][0]).to.equal('rejectionhandled');

        addSpy.restore();
        removeSpy.restore();
    });

    it('should not add or remove more than one event listener for each global error event type', () => {
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

    it('should dispatch an error when a global error event is dispatched', (done) => {
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
            expect(err).to.be.an.instanceof(Exception);
            expect(err.message).to.equal(message);
            expect(err.cause).to.equal(error);
            expect(err.data.event).to.equal(errorEvent);

            stop();
            unsubscribe();
            window.onerror = onerror;
            done();
        });

        stop = monitor();

        window.dispatchEvent(errorEvent);
    });

    it('should dispatch an error when a rejectionhandled event is dispatched', (done) => {
        let stop, unsubscribe;

        const message = 'An error occurred';
        const error = new Error(message);
        const promise = Promise.reject(error);
        const rejectionEvent = new PromiseRejectionEvent('rejectionhandled', {
            reason: error,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);
            expect(err.message).to.equal(message);
            expect(err.cause).to.equal(error);
            expect(err.data.event).to.equal(rejectionEvent);
            expect(err.data.event.reason).to.equal(error);
            expect(err.data.event.promise).to.equal(promise);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });

    it('should dispatch an error when an unhandledrejection event is dispatched', (done) => {
        let stop, unsubscribe;

        const message = 'An error occurred';
        const error = new Error(message);
        const promise = Promise.reject(error);
        const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
            reason: error,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);
            expect(err.message).to.equal(message);
            expect(err.cause).to.equal(error);
            expect(err.data.event).to.equal(rejectionEvent);
            expect(err.data.event.reason).to.equal(error);
            expect(err.data.event.promise).to.equal(promise);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });

    it('should dispatch an error when a promise is rejected with a string', (done) => {
        let stop, unsubscribe;

        const message = 'An error occurred';
        const promise = Promise.reject(message);
        const rejectionEvent = new PromiseRejectionEvent('rejectionhandled', {
            reason: message,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);
            expect(err.message).to.equal(message);
            expect(err.cause).to.equal(null);
            expect(err.data.event).to.equal(rejectionEvent);
            expect(err.data.event.reason).to.equal(message);
            expect(err.data.event.promise).to.equal(promise);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });

    it('should dispatch an AggregateError with a single error', (done) => {
        let stop, unsubscribe;

        const error = new Error();
        const aggregateError = new AggregateError([error]);
        const promise = Promise.reject(error);
        const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
            reason: aggregateError,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);
            expect(err.cause).to.equal(error);
            expect(err.data.event).to.be.an.instanceof(PromiseRejectionEvent);
            expect(err.data.event.reason).to.be.an.instanceof(AggregateError);
            expect(err.data.event.reason.errors[0]).to.equal(error);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });

    it('should dispatch an AggregateError with multiple errors', (done) => {
        let stop, unsubscribe;

        const error1 = new Error();
        const error2 = new Error();
        const error3 = new Error();
        const errors = [error1, error2, error3];
        const aggregateError = new AggregateError(errors);
        const promise = Promise.reject(errors);
        const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
            reason: aggregateError,
            promise
        });

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);
            expect(err.cause).to.be.an('array');
            expect(err.cause).to.have.lengthOf(3);
            expect(err.cause).to.include(error1);
            expect(err.cause).to.include(error2);
            expect(err.cause).to.include(error3);
            expect(err.data.event).to.be.an.instanceof(PromiseRejectionEvent);
            expect(err.data.event.reason).to.be.an.instanceof(AggregateError);
            expect(err.data.event.reason.errors).to.equal(err.cause);

            stop();
            unsubscribe();
            done();
        });

        stop = monitor();

        window.dispatchEvent(rejectionEvent);
    });

    it('should dispatch an error when an image fails to load', (done) => {
        const onerror = window.onerror;
        window.onerror = undefined;

        let stop, unsubscribe, img;

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);

            stop();
            unsubscribe();
            window.onerror = onerror;
            img.remove();
            done();
        });

        stop = monitor();

        img = new Image();
        img.src = '/path/to/nowhere';
        document.body.appendChild(img);
    });

    it('should dispatch an error when a script fails to load', (done) => {
        const onerror = window.onerror;
        window.onerror = undefined;

        let stop, unsubscribe, script;

        unsubscribe = subscribe((err) => {
            expect(err).to.be.an.instanceof(Exception);

            stop();
            unsubscribe();
            window.onerror = onerror;
            script.remove();
            done();
        });

        stop = monitor();

        script = document.createElement('script');
        script.src = '/path/to/nowhere';
        document.body.appendChild(script);
    });
});
