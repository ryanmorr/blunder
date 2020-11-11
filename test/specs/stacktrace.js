import { stacktrace } from '../../src/blunder';

describe('stacktrace', () => {
    it('should parse a Chrome stack', () => {
        // eslint-disable-next-line quotes
        const stack = "TypeError: Cannot read property 'foo' of undefined\n" +
            '    at bar (http://path/to/file.js:13:17)\n' +
            '    at baz (http://path/to/file.js:16:5)\n' +
            '    at foo (http://path/to/file.js:20:5)\n' +
            '    at http://path/to/file.js:24:4';
        
        const trace = stacktrace(stack);

        expect(trace.length).to.equal(4);
        expect(trace[0]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'bar',
            lineNumber: 13,
            columnNumber: 17
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'baz',
            lineNumber: 16,
            columnNumber: 5
        });
        expect(trace[2]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'foo',
            lineNumber: 20,
            columnNumber: 5
        });
        expect(trace[3]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: '<unknown>',
            lineNumber: 24,
            columnNumber: 4
        });
    });

    it('should parse a Chrome stack with port numbers', () => {
        const stack = 'Error: Default error\n' +
            '    at dumpExceptionError (http://localhost:8080/file.js:41:27)\n' +
            '    at HTMLButtonElement.onclick (http://localhost:8080/file.js:107:146)\n' +
            '    at I.e.fn.(anonymous function) [as index] (http://localhost:8080/file.js:10:3651)';
        
        const trace = stacktrace(stack);

        expect(trace.length).to.equal(3);
        expect(trace[0]).to.deep.equal({
            fileName: 'http://localhost:8080/file.js',
            functionName: 'dumpExceptionError',
            lineNumber: 41,
            columnNumber: 27
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'http://localhost:8080/file.js',
            functionName: 'HTMLButtonElement.onclick',
            lineNumber: 107,
            columnNumber: 146
        });
        expect(trace[2]).to.deep.equal({
            fileName: 'http://localhost:8080/file.js',
            functionName: 'I.e.fn.(anonymous function) [as index]',
            lineNumber: 10,
            columnNumber: 3651
        });
    });

    it('should parse a Chrome stack with async support', () => {
        const stack = 'Error: BEEP BEEP\n' +
            '    at bar (<anonymous>:8:9)\n' +
            '    at async foo (<anonymous>:2:3)';

        const trace = stacktrace(stack);

        expect(trace.length).to.equal(2);
        expect(trace[0]).to.deep.equal({
            fileName: '<anonymous>',
            functionName: 'bar',
            lineNumber: 8,
            columnNumber: 9
        });
        expect(trace[1]).to.deep.equal({
            fileName: '<anonymous>',
            functionName: 'async foo',
            lineNumber: 2,
            columnNumber: 3
        });
    });

    it('should parse a Chrome stack with blob URLs', () => {
        const stack = 'Error: test\n' +
            '    at Error (native)\n' +
            '    at s (blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379:31:29146)\n' +
            '    at Object.d [as add] (blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379:31:30039)\n' +
            '    at blob:http%3A//localhost%3A8080/d4eefe0f-361a-4682-b217-76587d9f712a:15:10978\n' +
            '    at blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379:1:6911\n' +
            '    at n.fire (blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379:7:3019)\n' +
            '    at n.handle (blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379:7:2863)';

        const trace = stacktrace(stack);

        expect(trace.length).to.equal(7);
        expect(trace[0]).to.deep.equal({
            fileName: 'native',
            functionName: 'Error',
            lineNumber: null,
            columnNumber: null
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379',
            functionName: 's',
            lineNumber: 31,
            columnNumber: 29146
        });
        expect(trace[2]).to.deep.equal({
            fileName: 'blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379',
            functionName: 'Object.d [as add]',
            lineNumber: 31,
            columnNumber: 30039
        });
        expect(trace[3]).to.deep.equal({
            fileName: 'blob:http%3A//localhost%3A8080/d4eefe0f-361a-4682-b217-76587d9f712a',
            functionName: '<unknown>',
            lineNumber: 15,
            columnNumber: 10978
        });
        expect(trace[4]).to.deep.equal({
            fileName: 'blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379',
            functionName: '<unknown>',
            lineNumber: 1,
            columnNumber: 6911
        });
        expect(trace[5]).to.deep.equal({
            fileName: 'blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379',
            functionName: 'n.fire',
            lineNumber: 7,
            columnNumber: 3019
        });
        expect(trace[6]).to.deep.equal({
            fileName: 'blob:http%3A//localhost%3A8080/abfc40e9-4742-44ed-9dcd-af8f99a29379',
            functionName: 'n.handle',
            lineNumber: 7,
            columnNumber: 2863
        });
    });

    it('should parse a Chrome stack with no location', () => {
        const stack = 'error\n at Array.forEach (native)';
        
        const trace = stacktrace(stack);

        expect(trace.length).to.equal(1);
        expect(trace[0]).to.deep.equal({
            fileName: 'native',
            functionName: 'Array.forEach',
            lineNumber: null,
            columnNumber: null,
        });
    });

    it('should parse a Firefox stack', () => {
        const stack = 'foo@http://path/to/file.js:41:13\n' +
            'bar@http://path/to/file.js:1:1\n' +
            '.plugin/e.fn[c]/<@http://path/to/file.js:1:1\n' +
            '@http://path/to/file.js:603:5' +
            '';
        
        const trace = stacktrace(stack);

        expect(trace.length).to.equal(4);
        expect(trace[0]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'foo',
            lineNumber: 41,
            columnNumber: 13
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'bar',
            lineNumber: 1,
            columnNumber: 1
        });
        expect(trace[2]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: '.plugin/e.fn[c]/<',
            lineNumber: 1,
            columnNumber: 1
        });
        expect(trace[3]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: '<unknown>',
            lineNumber: 603,
            columnNumber: 5
        });
    });

    it('should parse a Firefox stack with resource URLs', () => {
        const stack = 'render@resource://path/data/content/bundle.js:5529:16\n' +
            'dispatchEvent@resource://path/data/content/vendor.bundle.js:18:23028\n' +
            'wrapped@resource://path/data/content/bundle.js:7270:25';
        
        const trace = stacktrace(stack);

        expect(trace.length).to.equal(3);
        expect(trace[0]).to.deep.equal({
            fileName: 'resource://path/data/content/bundle.js',
            functionName: 'render',
            lineNumber: 5529,
            columnNumber: 16
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'resource://path/data/content/vendor.bundle.js',
            functionName: 'dispatchEvent',
            lineNumber: 18,
            columnNumber: 23028
        });
        expect(trace[2]).to.deep.equal({
            fileName: 'resource://path/data/content/bundle.js',
            functionName: 'wrapped',
            lineNumber: 7270,
            columnNumber: 25
        });
    });

    it('should parse a Safari stack', () => {
        const stack = 'http://path/to/file.js:47:22\n' +
            'foo@http://path/to/file.js:52:15\n' +
            'bar@http://path/to/file.js:108:23';
        
        const trace = stacktrace(stack);

        expect(trace.length).to.equal(3);
        expect(trace[0]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: '<unknown>',
            lineNumber: 47,
            columnNumber: 22
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'foo',
            lineNumber: 52,
            columnNumber: 15
        });
        expect(trace[2]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'bar',
            lineNumber: 108,
            columnNumber: 23
        });
    });

    it('should parse a stack trace from an error object', () => {
        const error = new Error();
        error.stack = 'Error\n' +
            '    at foo (http://path/to/file.js:34:27)\n' +
            '    at http://path/to/file.js:9:14';
        
        const trace = stacktrace(error);

        expect(trace.length).to.equal(2);
        expect(trace[0]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: 'foo',
            lineNumber: 34,
            columnNumber: 27
        });
        expect(trace[1]).to.deep.equal({
            fileName: 'http://path/to/file.js',
            functionName: '<unknown>',
            lineNumber: 9,
            columnNumber: 14
        });
    });

    it('should generate a stack trace', () => {
        const foo = () => bar();
        const bar = () => baz();
        const baz = () => qux();
        
        const qux = () => {
            const trace = stacktrace();
            expect(trace.length > 0).to.equal(true);
            expect(trace[0].functionName).to.equal('qux');
            expect(trace[1].functionName).to.equal('baz');
            expect(trace[2].functionName).to.equal('bar');
            expect(trace[3].functionName).to.equal('foo');
        };
        
        foo();
    });
});
