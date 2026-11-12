/**
 * apps/dashboard/src/lib/canon/deepFreeze.ts
 *
 * Recursive Immutability Sealer for Canonical State Graphs.
 * Enforces runtime TypeError on property mutation across SSR and React island scopes.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

export type DeepReadonly<T> = T extends
    Function | boolean | number | string | null | undefined
    ? T
    : { readonly [P in keyof T]: DeepReadonly<T[P]> }

/**
 * Recursively applies Object.freeze to an object graph, preventing
 * accidental in-memory mutation by client UI state handlers or browser plugins.
 */
export function deepFreeze<T>(obj: T): DeepReadonly<T> {
    if (obj === null || typeof obj !== 'object') {
        return obj as DeepReadonly<T>
    }

    // Prevent redundant traversal of already frozen nodes
    if (Object.isFrozen(obj)) {
        return obj as DeepReadonly<T>
    }

    Object.freeze(obj)

    const propNames = Object.getOwnPropertyNames(obj)
    for (const name of propNames) {
        const value = (obj as Record<string, unknown>)[name]
        if (
            value !== null &&
            typeof value === 'object' &&
            !Object.isFrozen(value)
        ) {
            deepFreeze(value)
        }
    }

    return Object.freeze(obj) as DeepReadonly<T>
}
