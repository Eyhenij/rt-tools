/**
 * The base address Keycloakify mocks build their asset paths from. Its own module reads
 * `import.meta`, which a CommonJS test run cannot load; the page code never imports it.
 */
export const BASE_URL: string = '/';
