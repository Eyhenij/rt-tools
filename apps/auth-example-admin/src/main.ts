import { bootstrapApplication } from '@angular/platform-browser';

import { ExampleApp } from './app/example-app';
import { EXAMPLE_CONFIG } from './app/example.config';

/**
 * A failed start is not caught: caught, it becomes a line of the browser log and an empty page,
 * while uncaught it reaches the error listeners of the configuration whole.
 */
void bootstrapApplication(ExampleApp, EXAMPLE_CONFIG);
