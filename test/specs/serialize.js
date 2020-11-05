import { serialize, BlunderError } from '../../src/blunder';

describe('serialize', () => {
    it('should serialize a BlunderError into JSON', () => {
        const error = new BlunderError('error message');

        const data = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            details: error.details,
            metadata: error.metadata
        };
        data.metadata.datetime = data.metadata.datetime.toString();

        const json = serialize(error);

        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.deep.equal(data);
    });

    it('should serialize a normal Error into JSON', () => {
        const error = new Error('error message');

        const data = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };

        const json = serialize(error);

        expect(json).to.be.a('string');
        expect(JSON.parse(json)).to.deep.equal(data);
    });

    it('should serialize dates to long form strings', () => {
        const date = new Date();
        const error = new BlunderError('error message', {
            date
        });

        const data = JSON.parse(serialize(error));

        expect(data.details.date).to.equal(date.toString());
    });

    it('should serialize functions to its string representation', () => {
        const foo = () => {};

        const error = new BlunderError('error message', {
            fn: foo
        });

        const data = JSON.parse(serialize(error));

        expect(data.details.fn).to.equal(foo.toString());
    });
});