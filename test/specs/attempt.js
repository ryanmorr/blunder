import { attempt, subscribe, Exception } from '../../src/blunder';

describe('attempt', () => {
    it('should return a value if a sync function is successfully executed', () => {
        const data = attempt(() => 'foo');
    
        expect(data).to.be.an('array');
        expect(data[0]).to.equal('foo');
        expect(data[1]).to.equal(undefined);
    });
    
    it('should return an exception if a sync function throws an error', () => {
        const message = 'An error occurred';
        const error = new Error(message);
    
        const data = attempt(() => {
            throw error;
        });
    
        expect(data).to.be.an('array');
        expect(data[0]).to.equal(undefined);
        expect(data[1]).be.an.instanceof(Exception);
        expect(data[1].message).to.equal(message);
        expect(data[1].source).to.equal(error);
    });
    
    it('should dispatch an error to global error handlers for sync functions', () => {
        const message = 'An error occurred';
        const error = new Error(message);
    
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
    
        const [value, ex] = attempt(() => {
            throw error;
        });
        
        expect(value).to.equal(undefined);
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(ex);
        expect(ex).to.be.an.instanceof(Exception);
        expect(ex.message).to.equal(message);
        expect(ex.source).to.equal(error);
    
        unsubscribe();
    });

    it('should support a fulfilled promise', async () => {
        const promise = attempt(Promise.resolve('foo'));
    
        expect(promise).to.be.a('promise');
        
        const data = await promise;

        expect(data).to.be.an('array');
        expect(data[0]).to.equal('foo');
        expect(data[1]).to.equal(undefined);
    });
    
    it('should support a rejected promise', async () => {
        const message = 'An error occurred';
        const error = new Error(message);
    
        const promise = attempt(Promise.reject(error));
    
        expect(promise).to.be.a('promise');

        const data = await promise;
        
        expect(data).to.be.an('array');
        expect(data[0]).to.equal(undefined);
        expect(data[1]).be.an.instanceof(Exception);
        expect(data[1].message).to.equal(message);
        expect(data[1].source).to.equal(error);
    });

    it('should support an async function that returns a fulfilled promise', async () => {
        const promise = attempt(() => Promise.resolve('foo'));
    
        expect(promise).to.be.a('promise');

        const data = await promise;

        expect(data).to.be.an('array');
        expect(data[0]).to.equal('foo');
        expect(data[1]).to.equal(undefined);
    });
    
    it('should support an async function that returns a rejected promise', async () => {
        const message = 'An error occurred';
        const error = new Error(message);
    
        const promise = attempt(() => Promise.reject(error));
    
        expect(promise).to.be.a('promise');

        const data = await promise;
        
        expect(data).to.be.an('array');
        expect(data[0]).to.equal(undefined);
        expect(data[1]).be.an.instanceof(Exception);
        expect(data[1].message).to.equal(message);
        expect(data[1].source).to.equal(error);
    });
    
    it('should dispatch an error to global error handlers for async functions', async () => {
        const message = 'An error occurred';
        const error = new Error(message);
    
        const callback = sinon.spy();
        const unsubscribe = subscribe(callback);
    
        const [value, ex] = await attempt(Promise.reject(error));

        expect(value).to.equal(undefined);
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(ex);
        expect(ex).to.be.an.instanceof(Exception);
        expect(ex.message).to.equal(message);
        expect(ex.source).to.equal(error);

        unsubscribe();
    });
});
