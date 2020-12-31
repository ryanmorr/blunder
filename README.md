# blunder

[![Version Badge][version-image]][project-url]
[![Build Status][build-image]][build-url]
[![License][license-image]][license-url]

> A modern client-side JavaScript error handler

## Install

Download the [CJS](https://github.com/ryanmorr/blunder/raw/master/dist/blunder.cjs.js), [ESM](https://github.com/ryanmorr/blunder/raw/master/dist/blunder.esm.js), [UMD](https://github.com/ryanmorr/blunder/raw/master/dist/blunder.umd.js) versions or install via NPM:

```sh
npm install @ryanmorr/blunder
```

## Usage

Blunder offers the ability to enhance, dispatch, capture, and report JavaScript errors in the browser.

```javascript
import { monitor, subscribe, dispatch, report } from '@ryanmorr/blunder';

// Listen for global runtime errors
monitor();

// Subscribe to be notified when an error is dispatched
subscribe((error) => {
    // Send the error to the server
    report('/path/to/error/logger', error).then((response) => {
        // Error was successfully logged to the server
    });
});

// Manually dispatch an error
dispatch('An error occurred!');
```

## API

### Exception(message?, detail?)

`Exception` is a subclass of the global `Error` class for creating errors with enhanced capabilities, including metadata, custom details, a formatted stacktrace, and easy serialization to JSON:

```javascript
import { Exception } from '@ryanmorr/blunder';

// Create an exception with an error message and an object of custom details
const ex = new Exception('error', {
    sourceModule: 'foo',
    sourceFunction: foo
});

// Standard properties
ex.name;
ex.message;
ex.stack;

// Metadata
ex.meta.datetime; // The date and time as a string
ex.meta.timestamp; // The time in milliseconds since the UNIX epoch
ex.meta.userAgent; // The user agent string
ex.meta.url; // The URL of the current page that generated the exception
ex.meta.referrer; // The URL of the page that linked to the current page
ex.meta.cookie; // The unformatted cookie string or "disabled" if cookies are disabled
ex.meta.language; // The default language of the user's browser
ex.meta.readyState; // The loading state of the current page (loading/interactive/complete)
ex.meta.viewportWidth; // The viewport width of the browser window in pixels
ex.meta.viewportHeight; // The viewport height of the browser window in pixels
ex.meta.orientation; // The orientation (landscape/portrait) of the user's device
ex.meta.connection; // The type of the user's connection (slow-2g/2g/3g/4g)
ex.meta.memory; // MB of the memory heap used
ex.meta.memoryPercent; // Percent of the allocated memory heap used

// Custom details
ex.detail.sourceModule; //=> "foo"
ex.detail.sourceFunction; //=> foo

// Formatted stacktrace
ex.stacktrace.forEach(({functionName, fileName, lineNumber, columnNumber}) => {
    console.log(`${functionName} in ${fileName}:${lineNumber}:${columnNumber}`);
});

// Includes a `toJSON` method for serialization
const json = JSON.stringify(ex);
```

Extend `Exception` to create your own custom error subclasses:

```javascript
class CustomException extends Exception {}
```

`Exception` also has a static `from` method that can be used to convert a value into an `Exception` instance:

```javascript
// Supports strings
const ex = Exception.from('error');

// Supports normal error instances (will copy message and stack properties)
const error = new Error();
const ex = Exception.from(error);

// Supports creating instances of subclasses
const ex = CustomException.from('error');
ex instanceof CustomException; //=> true
```

### dispatch(error, detail?)

Manually dispatch an error to the global error subscribers, it returns the dispatched `Exception` instance:

```javascript
import { dispatch } from '@ryanmorr/blunder';

// Supports strings
const ex = dispatch('error');

// Supports normal error instances
const error = new Error();
dispatch(error);

// Supports custom details as an optional second argument
dispatch('error', {foo: 1, bar: 2});
```

### subscribe(callback)

Subscribe a callback function to be invoked with an `Exception` instance when an error is dispatched, it returns an unsubscribe function:

```javascript
import { subscribe } from '@ryanmorr/blunder';

const unsubscribe = subscribe((ex) => {
    // An error was dispatched
});
```

### monitor(config?)

Enable global error monitoring by listening for the `error`, `unhandledrejection`, and `rejectionhandled` events. To customize which events to listen for, provide an object with the event name as the key and a boolean as the value to indicate inclusion of the event. It returns a function to disable monitoring:

```javascript
import { monitor } from '@ryanmorr/blunder';

// Listen for all error events by default
const stop = monitor();

// Optionally specify which events to listen for
monitor({
    error: true,
    unhandledrejection: true,
    rejectionhandled: false
});
```

### report(url, data)

Send errors to the server and return a promise that is fulfilled with the JSON response from the server and rejected with an `Exception` instance:

```javascript
import { report } from '@ryanmorr/blunder';

const ex = new Exception();

// Send an error to the server
report('/path/to/error/logger', ex).then((response) => {
    // Error successfully logged to server
});
```

### stacktrace(error?)

Generate a formatted stacktrace:

```javascript
import { stacktrace } from '@ryanmorr/blunder';

// Get a stacktrace from the invocation point
const trace = stacktrace();

// Get a stacktrace from an error instance
const trace = stacktrace(error);

// Get a stacktrace from a stack string
const trace = stacktrace(error.stack);
```

### attempt(fn)

A simple wrapper for a `try/catch` block that returns a promise. The promise is fulfilled with the return value of the function argument if it executed without throwing an error. The promise is rejected with an `Exception` instance when an error is thrown which is automatically dispatched to the global error subscribers:

```javascript
import { attempt } from '@ryanmorr/blunder';

attempt(() => {
    // Try something and return a value
}).then((val) => {
    // Execution was successful
}).catch((ex) => {
    // Execution failed
});
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/blunder
[version-image]: https://badge.fury.io/gh/ryanmorr%2Fblunder.svg
[build-url]: https://travis-ci.org/ryanmorr/blunder
[build-image]: https://travis-ci.org/ryanmorr/blunder.svg
[license-image]: https://img.shields.io/badge/license-Unlicense-blue.svg
[license-url]: UNLICENSE