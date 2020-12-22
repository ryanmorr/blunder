import { report, Exception } from '../../src/blunder';

describe('report', () => {
    let stubbedFetch = sinon.stub(window, 'fetch');

    after(() => {
        stubbedFetch.restore();
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
                body: JSON.stringify(error)
            });
    
            fetch.reset();
            done();
        });
    });

    it('should send an array of errors to the server', (done) => {    
        fetch.returns(Promise.resolve(new Response('{}', {
            status: 200,
            headers: {'Content-type': 'application/json'}
        })));
        
        const error1 = new Exception();
        const error2 = new Exception();
        report('/path/to/endpoint', [error1, error2]).then(() => {
            expect(fetch.args[0][1].body).to.equal(JSON.stringify([error1, error2]));
    
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
            expect(e.source).to.equal(fetchError);
    
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
