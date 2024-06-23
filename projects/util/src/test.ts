// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import 'zone.js';
import 'zone.js/testing';

import './lib/form/date-picker/global';
import './lib/table/columns/columns.types';

declare const require: {
    context(
        path: string,
        deep?: boolean,
        filter?: RegExp
    ): {
        <T>(id: string): T;
        keys(): string[];
    };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment([BrowserDynamicTestingModule], platformBrowserDynamicTesting());

// Then we find all the tests.
const context: {
    <T>(id: string): T;
    keys(): string[];
} = require.context('./lib/', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
