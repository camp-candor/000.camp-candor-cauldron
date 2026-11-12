/**
 * Mock for astro:middleware during unit test execution
 */
export function defineMiddleware<T>(fn: T): T {
    return fn
}
