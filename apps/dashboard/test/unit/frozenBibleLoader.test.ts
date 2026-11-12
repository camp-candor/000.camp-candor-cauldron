import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
    deepFreeze,
    loadFrozenBibleState,
    type BibleStatePayload,
} from '../../src/lib/canon/frozenBibleLoader'

const MOCK_FIXTURE: BibleStatePayload = {
    _meta: {
        seriesSlug: 'under-the-floorboards',
        merkleRootHex:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        schemaVersion: 1,
        compiledEpochMs: 1700000000000,
    },
    characters: {
        spleen: {
            id: 'char-spleen',
            name: 'Spleen',
            status: 'ALIVE',
            handCapacityBps: 20000,
            somaticMask: ['LIMPING'],
        },
    },
    locations: {
        warm_pipe: {
            id: 'loc-warm-pipe',
            name: 'The Warm Pipe',
            adjacentLocationIds: ['loc-junction'],
        },
    },
    worldAxioms: ['NO_MAGIC', 'SOMATIC_DEATH_PERMANENT'],
}

describe('frozenBibleLoader Module Gauntlet', () => {
    const tempDir = path.resolve(process.cwd(), 'test-temp-canon')
    const compiledDir = path.resolve(
        tempDir,
        'compiled',
        'under-the-floorboards',
    )

    beforeEach(() => {
        fs.mkdirSync(compiledDir, { recursive: true })
        fs.writeFileSync(
            path.resolve(compiledDir, 'bible-state.json'),
            JSON.stringify(MOCK_FIXTURE, null, 2),
            'utf8',
        )
    })

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true })
        }
    })

    describe('deepFreeze Immutability Trap', () => {
        it('seals nested properties against direct modification', () => {
            const cloned = JSON.parse(JSON.stringify(MOCK_FIXTURE))
            const frozen = deepFreeze(cloned)

            expect(() => {
                // @ts-expect-error mutating readonly property
                frozen.characters.spleen.status = 'DEAD'
            }).toThrow(TypeError)

            expect(frozen.characters.spleen.status).toBe('ALIVE')
        })

        it('prevents adding new properties to sealed objects', () => {
            const cloned = JSON.parse(JSON.stringify(MOCK_FIXTURE))
            const frozen = deepFreeze(cloned)

            expect(() => {
                // @ts-expect-error adding property to frozen object
                frozen.characters.newGuy = { id: 'char-new' }
            }).toThrow(TypeError)
        })

        it('handles circular object references without call stack overflow', () => {
            interface CircularNode {
                name: string
                self?: CircularNode
            }
            const node: CircularNode = { name: 'ouroboros' }
            node.self = node

            const frozen = deepFreeze(node)
            expect(Object.isFrozen(frozen)).toBe(true)
            expect(() => {
                // @ts-expect-error mutating readonly property
                frozen.name = 'broken'
            }).toThrow(TypeError)
        })
    })

    describe('loadFrozenBibleState Ingestion', () => {
        it('ingests valid canon snapshots and returns frozen object graph', () => {
            const canon = loadFrozenBibleState('under-the-floorboards', tempDir)
            expect(canon._meta.seriesSlug).toBe('under-the-floorboards')
            expect(canon.characters.spleen.name).toBe('Spleen')

            expect(() => {
                // @ts-expect-error mutating readonly property
                canon.characters.spleen.status = 'MUTATED'
            }).toThrow(TypeError)
        })

        it('fails closed when bible-state.json is missing', () => {
            expect(() => {
                loadFrozenBibleState('non-existent-series', tempDir)
            }).toThrow(/CANON_NOT_SEALED/)
        })

        it('fails closed when internal slug mismatches expected parameter', () => {
            const corrupted = {
                ...MOCK_FIXTURE,
                _meta: { ...MOCK_FIXTURE._meta, seriesSlug: 'mismatched-slug' },
            }
            fs.writeFileSync(
                path.resolve(compiledDir, 'bible-state.json'),
                JSON.stringify(corrupted),
                'utf8',
            )

            expect(() => {
                loadFrozenBibleState('under-the-floorboards', tempDir)
            }).toThrow(/CANON_DESYNC_HALT/)
        })

        it('fails closed when Merkle root hash is invalid hex', () => {
            const corrupted = {
                ...MOCK_FIXTURE,
                _meta: {
                    ...MOCK_FIXTURE._meta,
                    merkleRootHex: 'not-a-valid-sha256',
                },
            }
            fs.writeFileSync(
                path.resolve(compiledDir, 'bible-state.json'),
                JSON.stringify(corrupted),
                'utf8',
            )

            expect(() => {
                loadFrozenBibleState('under-the-floorboards', tempDir)
            }).toThrow(/CANON_CORRUPTED/)
        })
    })
})
