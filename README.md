# blunder

[![Version Badge][version-image]][project-url]
[![License][license-image]][license-url]
[![Build Status][build-image]][build-url]

> A modern client-side JavaScript error handler

## Install

Download the [CJS](https://github.com/ryanmorr/blunder/raw/master/dist/cjs/blunder.js), [ESM](https://github.com/ryanmorr/blunder/raw/master/dist/esm/blunder.js), [UMD](https://github.com/ryanmorr/blunder/raw/master/dist/umd/blunder.js) versions or install via NPM:

```sh
npm install @ryanmorr/blunder
```

## Usage

Blunder offers the ability to normalize, enhance, capture, and report JavaScript errors in the browser:

```javascript
import { monitor, subscribe, dispatch } from '@ryanmorr/blunder';

// Listen for global runtime errors
monitor();

// Subscribe to be notified when an exception is dispatched
subscribe((exception) => {
    // Log the exception to the server
    navigator.sendBeacon('/path/to/error/logger', JSON.stringify(exception));
});

// Manually dispatch an exception
dispatch('An error occurred!');
```

## API

### `Exception(message?, options?)`

`Exception` is a subclass of `Error` to help normalize and enhance error instances:

```javascript
import { Exception } from '@ryanmorr/blunder';

// Create an exception just like a regular error
const exception = new Exception('error message');

// Normalizes the standard properties
exception.name;
exception.message;
exception.stack;
```

Add custom metadata as an optional second argument to help identify the error:

```javascript
const exception = new Exception('error message', {
    timestamp: Date.now(),
    url: document.location.href,
    userAgent: navigator.userAgent
});

// The metadata is stored within the `data` property
exception.data.timestamp;
exception.data.url;
exception.data.userAgent;
```

Supports the `cause` property to facilitate error chaining:

```javascript
try {
    connect();
} catch(error) {
    throw new Exception('Connection failed', {cause: error});
}
```

Extend `Exception` to create your own custom subclasses:

```javascript
class APIException extends Exception {
    constructor(code, options){
        super('error code: ' + code, options);
        this.code = code;
    }
}
```

Includes a `toJSON` method that returns a key/value object representing all the properties of the exception. It will convert some non-JSON friendly values to friendly ones (such as functions) and will detect and avoid circular references:

```javascript
function trySomething() {
    try {
        throw new Exception('error message', {source: trySomething});
    } catch(exception) {
        const serialized = exception.toJSON();
        serialized.data.source; //=> "[Function: trySomething]"
    }
}
```

You can override the `serializable` method in subclasses to customize how an instance is serialized:

```javascript
class MyException extends Exception {
    serializable() {
        return `${this.name}: ${this.message}`;
    }
}

const exception = new MyException('An error occurred');
JSON.stringify(exception); //=> "MyException: An error occurred"
```

`Exception` also has a static `from` method that can be used to convert a value into an `Exception` instance:

```javascript
// Supports error messages as strings
const exception = Exception.from('error message');

// Supports normal error instances (will copy standard properties)
const error = new Error();
const exception = Exception.from(error);

// Supports creating instances of subclasses
const exception = CustomException.from('error message');
exception instanceof CustomException; //=> true
```

------

### `subscribe(callback)`

Subscribe a callback function to be invoked with an `Exception` instance when an error is dispatched, it returns an unsubscribe function:

```javascript
import { subscribe } from '@ryanmorr/blunder';

const unsubscribe = subscribe((exception) => {
    // An exception was dispatched
});

// Unsubscribe from future error notifications
unsubscribe();
```

------

### `dispatch(error, options?)`

Manually dispatch an `Exception` to the error subscribers and return the `Exception` instance:

```javascript
import { dispatch } from '@ryanmorr/blunder';

// Supports strings
const exception = dispatch('error message');

// Supports normal error instances
dispatch(new Error());

// Supports custom metadata as an optional second argument
dispatch('error message', {foo: 1, bar: 2});

// Supports `cause` property
try {
    trySomething();
} catch(error) {
    dispatch('error message', {cause: error});
}
```

------

### `monitor(config?)`

Enable global error monitoring by listening for the `error`, `unhandledrejection`, and `rejectionhandled` events. You can customize which events to listen for by providing a configuration object. It returns a function to disable monitoring:

```javascript
import { monitor } from '@ryanmorr/blunder';

// Listen for all error events by default
const stop = monitor();

// Disable error monitoring
stop();

// Optionally specify which events to listen for
monitor({
    error: true,
    unhandledrejection: true,
    rejectionhandled: false
});
```

------

### `attempt(fn, options?)`

Internally wraps a function in a try/catch block for easy error handling. If an error is raised, it is automatically converted to an `Exception` instance, dispatched to error subscribers, and then returned:

```javascript
import { attempt } from '@ryanmorr/blunder';

const [result, exception] = attempt(() => {
    throw new Error();
});

// If `exception` is defined, the attempt failed
if (exception) {
    console.error(exception);
}

// If `result` is defined, the attempt was successful
if (result) {
    console.log(result);
}
```

Supports custom metadata as an optional second argument that will be added to the `Exception` instance if an error should arise:

```javascript
const [result, exception] = attempt(callback, {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
});
```

Supports async functionality via promises by utilizing async/await syntax:

```javascript
// Use promises directly
const [result, exception] = await attempt(fetch('/path/to/resource'));

// Use a function that returns a promise
const [result, exception] = await attempt(() => fetch('/path/to/resource'));
```


## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/blunder
[version-image]: https://img.shields.io/github/package-json/v/ryanmorr/blunder?color=blue&style=flat-square
[build-url]: https://github.com/ryanmorr/blunder/actions
[build-image]: https://img.shields.io/github/actions/workflow/status/ryanmorr/blunder/node.js.yml?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/blunder?color=blue&style=flat-square
[license-url]: UNLICENSE