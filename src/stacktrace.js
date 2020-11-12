const UNKNOWN_FUNCTION = '<unknown>';
const CHROME_RE = /^\s*at\s(?:(.*?)(?=(?:\s\())\s)?\(?(?:((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/|[a-z]:\\|\\\\).*?))(?::(\d+))?(?::(\d+))?\)?\s*$/i;
const GECKO_RE = /^\s*(.*?)?(?:^|@)(?:((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle))(?::(\d+))?(?::(\d+))?\s*$/i;

function parseStack(stack) {
    return stack.split('\n').reduce((stacktrace, line) => {
        let match = line.match(CHROME_RE) || line.match(GECKO_RE);
        if (match) {
            const [, functionName, fileName, lineNumber, columnNumber] = match;
            stacktrace.push({
                functionName: functionName || UNKNOWN_FUNCTION,
                fileName,
                lineNumber: lineNumber ? +lineNumber : null,
                columnNumber: columnNumber ? +columnNumber : null
            });
        }
        return stacktrace;
    }, []);
}

function generateStack(fn) {
    const error = new Error();
    if (Error.captureStackTrace) {
        Error.captureStackTrace(error, fn);
    }
    return error.stack;
}

export function stacktrace(stack) {
    if (stack === undefined) {
        stack = generateStack(stacktrace);
    } else if (stack instanceof Error) {
        stack = stack.stack;
    }
    return parseStack(stack);
}
