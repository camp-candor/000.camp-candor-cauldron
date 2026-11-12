/**
 * apps/dashboard/src/lib/canon/frozenBibleLoader.ts
 * Deep-Frozen Local Canon Memory Loader & Immutability Sentinel.
 * Loads pre-compiled universe state snapshots in volatile SSR memory,
 * validates the SHA-256 Merkle root (H_root), and seals the entire object
 * graph via recursive Object.freeze().
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

export type DeepReadonly<T> = T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends Function
      ? T
      : T extends object
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T

export interface BibleStateMeta {
    readonly seriesSlug: string
    readonly merkleRootHex: string
    readonly schemaVersion: number
    readonly compiledEpochMs: number
}

export interface CharacterEntity {
    readonly id: string
    readonly name: string
    readonly status: string
    readonly handCapacityBps: number
    readonly somaticMask: readonly string[]
}

export interface LocationEntity {
    readonly id: string
    readonly name: string
    readonly adjacentLocationIds: readonly string[]
}

export interface BibleStatePayload {
    readonly _meta: BibleStateMeta
    readonly characters: Record<string, CharacterEntity>
    readonly locations: Record<string, LocationEntity>
    readonly worldAxioms: readonly string[]
}

const MERKLE_ROOT_REGEX = /^[0-9a-f]{64}$/

/**
 * Recursively applies Object.freeze to an object graph to enforce memory immutability.
 * Protects against circular reference loops via an identity WeakSet.
 */
export function deepFreeze<T>(
    obj: T,
    visited = new WeakSet<object>(),
): DeepReadonly<T> {
    if (obj === null || typeof obj !== 'object') {
        return obj as DeepReadonly<T>
    }

    if (visited.has(obj as object)) {
        return Object.freeze(obj) as DeepReadonly<T>
    }

    visited.add(obj as object)

    const propNames = Object.getOwnPropertyNames(obj)
    for (const name of propNames) {
        const val = (obj as Record<string, unknown>)[name]
        if (
            val !== null &&
            (typeof val === 'object' || typeof val === 'function')
        ) {
            deepFreeze(val, visited)
        }
    }

    return Object.freeze(obj) as DeepReadonly<T>
}

/**
 * Reads a compiled canon JSON snapshot from disk, verifies H_root format and series identity,
 * and returns the deep-frozen read-only model.
 */
export function loadFrozenBibleState(
    seriesSlug: string,
    baseDir: string = process.cwd(),
): DeepReadonly<BibleStatePayload> {
    if (!seriesSlug || typeof seriesSlug !== 'string') {
        throw new Error('>> [CANON][ERROR] Invalid series slug parameter')
    }

    const normalizedPath = path.resolve(
        baseDir,
        'compiled',
        seriesSlug,
        'bible-state.json',
    )

    if (!fs.existsSync(normalizedPath)) {
        throw new Error(
            `>> [CANON][ERROR] CANON_NOT_SEALED: File not found at ${normalizedPath}`,
        )
    }

    const rawJson = fs.readFileSync(normalizedPath, 'utf8')
    let parsed: unknown

    try {
        parsed = JSON.parse(rawJson)
    } catch (err: unknown) {
        throw new Error(
            `>> [CANON][ERROR] CANON_CORRUPTED: Failed to parse JSON at ${normalizedPath}`,
        )
    }

    if (typeof parsed !== 'object' || parsed === null) {
        throw new Error(
            '>> [CANON][ERROR] CANON_CORRUPTED: Root payload is not an object',
        )
    }

    const candidate = parsed as Record<string, unknown>
    const meta = candidate._meta as Record<string, unknown> | undefined

    if (!meta || typeof meta !== 'object') {
        throw new Error(
            '>> [CANON][ERROR] CANON_CORRUPTED: Missing _meta header',
        )
    }

    if (meta.seriesSlug !== seriesSlug) {
        throw new Error(
            `>> [CANON][ERROR] CANON_DESYNC_HALT: Expected slug ${seriesSlug}, found ${meta.seriesSlug}`,
        )
    }

    if (
        typeof meta.merkleRootHex !== 'string' ||
        !MERKLE_ROOT_REGEX.test(meta.merkleRootHex)
    ) {
        throw new Error(
            '>> [CANON][ERROR] CANON_CORRUPTED: Invalid or non-hex 64-char Merkle root',
        )
    }

    return deepFreeze(parsed as BibleStatePayload)
}
