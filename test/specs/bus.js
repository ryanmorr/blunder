import { subscribe, dispatch, Exception } from '../../src/blunder';

describe('bus', () => {
    it('should support subscribers to be called when an error is dispatched', () => {
        const callback1 = sinon.spy();
        const callback2 = sinon.spy();

        const unsubscribe1 = subscribe(callback1);
        const unsubscribe2 = subscribe(callback2);
    
        expect(callback1.callCount).to.equal(0);
        expect(callback2.callCount).to.equal(0);
        
        const error1 = new Exception();
        expect(dispatch(error1)).to.equal(error1);
    
        expect(callback1.callCount).to.equal(1);
        expect(callback1.args[0][0]).to.equal(error1);
        expect(callback2.callCount).to.equal(1);
        expect(callback2.args[0][0]).to.equal(error1);
        
        const error2 = new Exception();
        expect(dispatch(error2)).to.equal(error2);
    
        expect(callback1.callCount).to.equal(2);
        expect(callback1.args[1][0]).to.equal(error2);
        expect(callback2.callCount).to.equal(2);
        expect(callback2.args[1][0]).to.equal(error2);

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

    it('should convert a normal Error into an Exception for subscribers', () => {
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
        
        const message = 'An error occurred';
        const err = new Error(message);
        expect(dispatch(err)).to.be.an.instanceof(Exception);
        
        const error = callback.args[0][0];
        expect(error).to.be.an.instanceof(Exception);
        expect(error.message).to.equal(message);
        expect(error.cause).to.equal(err);

        unsubscribe();
    });

    it('should convert a string into an Exception for subscribers', () => {
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
        
        const message = 'An error occurred';
        expect(dispatch(message)).to.be.an.instanceof(Exception);
        
        const error = callback.args[0][0];
        expect(error).to.be.an.instanceof(Exception);
        expect(error.message).to.equal(message);

        unsubscribe();
    });

    it('should dispatch an error with custom metadata', () => {
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
        
        const error = new Error();
        const data = {
            foo: 1,
            bar: 2,
            baz: 3
        };

        expect(dispatch(error, data)).to.be.an.instanceof(Exception);
        
        expect(callback.args[0][0].data).to.deep.equal(data);

        unsubscribe();
    });

    it('should only dispatch an error instance once', () => {
        const error = new Exception();
        const callback = sinon.spy();

        const unsubscribe = subscribe(callback);
    
        expect(dispatch(error)).to.equal(error);
    
        expect(callback.callCount).to.equal(1);
    
        expect(dispatch(error)).to.equal(error);
    
        expect(callback.callCount).to.equal(1);

        unsubscribe();
    });
});
