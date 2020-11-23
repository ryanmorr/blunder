import { report, Exception, serialize } from '../../src/blunder';

describe('report', () => {
    let stubedFetch = sinon.stub(window, 'fetch');

    after(() => {
        stubedFetch.restore();
    });

    it('should send an error to the server', (done) => {
        const response = {done: true};
    
        fetch.returns(Promise.resolve(new Response(JSON.stringify(response), {
            status: 200,
            headers: {'Content-type': 'application/json'}
        })));
        
        const error = new Exception();
        const promise = report('/path/to/endpoint', error);

        expect(promise).to.be.a('promise');
        
        promise.then((data) => {
            expect(response).to.deep.equal(data);
    
            expect(fetch.callCount).to.equal(1);
            expect(fetch.args[0][0]).to.equal('/path/to/endpoint');
            expect(fetch.args[0][1]).to.deep.equal({
                method: 'POST',
                cache: 'no-cache',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: serialize(error)
            });
    
            fetch.reset();
            done();
        });
    });

    it('should fail if there is a network failure', (done) => {
        const fetchError = new Error('Could not connect');
        fetch.returns(Promise.reject(fetchError));
    
        const error = new Exception();
        report('/path/to/endpoint', error).catch((e) => {
            expect(e).to.be.an.instanceof(Exception);
            expect(e.message).to.equal('Could not connect');
            expect(e.originalError).to.equal(fetchError);
    
            fetch.reset();
            done();
        });
    });

    it('should fail if the response has an unsuccessful HTTP status', (done) => {
        fetch.returns(Promise.resolve(new Response(JSON.stringify({}), {
            status: 500,
            statusText: 'Internal Server Error'
        })));
    
        const error = new Exception();
        report('/path/to/endpoint', error).catch((e) => {
            expect(e).to.be.an.instanceof(Exception);
            expect(e.message).to.equal('Internal Server Error');
    
            fetch.reset();
            done();
        });
    });

    it('should fail if the response cannot generate a JSON object', (done) => {
        fetch.returns(Promise.resolve(new Response(null, {
            status: 200
        })));
    
        const error = new Exception();
        report('/path/to/endpoint', error).catch((e) => {
            expect(e).to.be.an.instanceof(Exception);
            expect(e.message).to.equal('Unexpected end of input');
    
            fetch.reset();
            done();
        });
    });
});
