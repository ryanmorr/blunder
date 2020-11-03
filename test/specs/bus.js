import { subscribe, dispatch, BlunderError } from '../../src/blunder';

describe('bus', () => {
    it('should support subscribers to be called when an error is dispatched', () => {
        const error = new BlunderError();
        const callback1 = sinon.spy();
        const callback2 = sinon.spy();

        const unsubscribe1 = subscribe(callback1);
        const unsubscribe2 = subscribe(callback2);
    
        expect(callback1.callCount).to.equal(0);
        expect(callback2.callCount).to.equal(0);
    
        dispatch(error);
    
        expect(callback1.callCount).to.equal(1);
        expect(callback1.args[0][0]).to.equal(error);
        expect(callback2.callCount).to.equal(1);
        expect(callback2.args[0][0]).to.equal(error);
    
        dispatch(error);
    
        expect(callback1.callCount).to.equal(2);
        expect(callback1.args[1][0]).to.equal(error);
        expect(callback2.callCount).to.equal(2);
        expect(callback2.args[1][0]).to.equal(error);

        unsubscribe1();
        unsubscribe2();
    });
    
    it('should remove a subscriber', () => {        
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
    
        dispatch('error');
        expect(callback.callCount).to.equal(1);
    
        unsubscribe();
    
        dispatch('error');
        expect(callback.callCount).to.equal(1);
    });

    it('should allow subscribers to remove themselves without disrupting others', () => {
        let unsubscribe2;
        let doUnsubscribe = false;

        const callback1 = sinon.spy();
        const callback2 = sinon.spy(() => {
            if (doUnsubscribe) {
                unsubscribe2();
            }
        });
        const callback3 = sinon.spy();

        const unsubscribe1 = subscribe(callback1);
        unsubscribe2 = subscribe(callback2);
        const unsubscribe3 = subscribe(callback3);

        expect(callback1.callCount).to.equal(0);
        expect(callback2.callCount).to.equal(0);
        expect(callback3.callCount).to.equal(0);

        dispatch('error');

        expect(callback1.callCount).to.equal(1);
        expect(callback2.callCount).to.equal(1);
        expect(callback3.callCount).to.equal(1);
        
        doUnsubscribe = true;
        dispatch('error');

        expect(callback1.callCount).to.equal(2);
        expect(callback2.callCount).to.equal(2);
        expect(callback3.callCount).to.equal(2);

        dispatch('error');

        expect(callback1.callCount).to.equal(3);
        expect(callback2.callCount).to.equal(2);
        expect(callback3.callCount).to.equal(3);

        unsubscribe1();
        unsubscribe3();
    });

    it('should convert a normal Error into a BlunderError for subscribers', () => {
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
        
        const message = 'An error occurred';
        dispatch(message);
        
        const error = callback.args[0][0];
        expect(error).to.be.an.instanceof(BlunderError);
        expect(error.message).to.equal(message);

        unsubscribe();
    });

    it('should convert a string into a BlunderError for subscribers', () => {
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
        
        const message = 'An error occurred';
        dispatch(message);
        
        const error = callback.args[0][0];
        expect(error).to.be.an.instanceof(BlunderError);
        expect(error.message).to.equal(message);

        unsubscribe();
    });

    it('should dispatch an error with custom details', () => {
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
        
        const error = new Error();
        const details = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        dispatch(error, details);
        
        expect(callback.args[0][0].details).to.deep.equal(details);

        unsubscribe();
    });
});
