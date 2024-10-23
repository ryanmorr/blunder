import { report, Exception } from '../../src/blunder';

describe('report', () => {
    let stubbedSendBeacon = sinon.stub(navigator, 'sendBeacon');

    after(() => {
        stubbedSendBeacon.restore();
    });

    it('should send an error to the server', () => {
        navigator.sendBeacon.returns(true);
        
        const error = new Exception();
        const successful = report('/path/to/endpoint', error);

        expect(successful).to.equal(true);
    
        expect(navigator.sendBeacon.callCount).to.equal(1);
        expect(navigator.sendBeacon.args[0][0]).to.equal('/path/to/endpoint');
        expect(navigator.sendBeacon.args[0][1]).to.equal(JSON.stringify(error));

        navigator.sendBeacon.reset();
    });

    it('should send an array of errors to the server', () => {    
        navigator.sendBeacon.returns(true);
        
        const errors = [new Exception(), new Exception()];
        const successful = report('/path/to/endpoint', errors);

        expect(successful).to.equal(true);
    
        expect(navigator.sendBeacon.callCount).to.equal(1);
        expect(navigator.sendBeacon.args[0][0]).to.equal('/path/to/endpoint');
        expect(navigator.sendBeacon.args[0][1]).to.equal(JSON.stringify(errors));

        navigator.sendBeacon.reset();
    });

    it('should return false if the error could not be sent to the server', () => {    
        navigator.sendBeacon.returns(false);
        
        const error = new Exception();
        const successful = report('/path/to/endpoint', error);

        expect(successful).to.equal(false);

        navigator.sendBeacon.reset();
    });
});
