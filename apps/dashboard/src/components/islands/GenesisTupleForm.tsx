/**
 * apps/dashboard/src/components/islands/GenesisTupleForm.tsx
 * Interactive Client-Side Genesis Configuration Island.
 * Manages narrative tuple state in browser memory at T_0 = $0.00.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import React, { useState, useMemo } from 'react'
import {
    GenesisTupleSchema,
    canonicalizeJsonString,
    type GenesisTuplePayload,
} from '../../lib/validation/genesisSchema'

export const DEFAULT_TUPLE: GenesisTuplePayload = {
    series_slug: 'under-the-floorboards',
    state_space: {
        active_characters: ['char-bog', 'char-spleen'],
        primary_locations: ['loc-warm-pipe'],
        initial_items: ['item-founder-token'],
    },
    action_vocabulary: {
        kinetic_verbs: ['SEIZE', 'CONCEAL', 'BARTER', 'FLEE'],
        allow_unarmed_combat: true,
    },
    invariant_laws: {
        scarcity_index_bps: 8500,
        paranoia_baseline_bps: 4200,
        max_farce_ratio_bps: 1200,
        somatic_death_permanent: true,
        two_handed_equip_cap: true,
    },
    medium_projections: {
        render_aspect_ratio: '16:9',
        master_fps: 24,
        target_medium: 'SCREENPLAY_AST',
    },
}

export default function GenesisTupleForm() {
    const [tuple, setTuple] = useState<GenesisTuplePayload>(DEFAULT_TUPLE)
    const [activeTab, setActiveTab] = useState<
        'IDENTITY' | 'STATE' | 'ACTIONS' | 'INVARIANTS'
    >('IDENTITY')

    const validationResult = useMemo(() => {
        return GenesisTupleSchema.safeParse(tuple)
    }, [tuple])

    const canonicalOutput = useMemo(() => {
        return canonicalizeJsonString(tuple)
    }, [tuple])

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTuple((prev) => ({ ...prev, series_slug: e.target.value }))
    }

    const handleFarceBpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10) || 0
        setTuple((prev) => ({
            ...prev,
            invariant_laws: {
                ...prev.invariant_laws,
                max_farce_ratio_bps: val,
            },
        }))
    }

    const handleScarcityBpsChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const val = parseInt(e.target.value, 10) || 0
        setTuple((prev) => ({
            ...prev,
            invariant_laws: {
                ...prev.invariant_laws,
                scarcity_index_bps: val,
            },
        }))
    }

    return (
        <div className="genesis-tuple-island" data-testid="genesis-tuple-form">
            <div className="panel-header">
                <div className="badge-rack">
                    <span className="badge-tag">
                        GENESIS PROTOCOL :: $0.00 COMPUTE
                    </span>
                    {validationResult.success ? (
                        <span
                            className="badge-valid"
                            data-testid="status-badge">
                            [SCHEMA_VALID]
                        </span>
                    ) : (
                        <span
                            className="badge-invalid"
                            data-testid="status-badge">
                            [ERRORS_DETECTED]
                        </span>
                    )}
                </div>
            </div>

            <nav className="tab-bar">
                {(['IDENTITY', 'STATE', 'ACTIONS', 'INVARIANTS'] as const).map(
                    (tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={
                                activeTab === tab ? 'tab-btn active' : 'tab-btn'
                            }
                            onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ),
                )}
            </nav>

            <div className="tab-viewport">
                {activeTab === 'IDENTITY' && (
                    <div className="form-group">
                        <label htmlFor="series-slug-input">
                            SERIES IDENTIFIER (POSIX KEBAB-CASE):
                        </label>
                        <input
                            id="series-slug-input"
                            type="text"
                            value={tuple.series_slug}
                            onChange={handleSlugChange}
                            className="text-input"
                        />
                    </div>
                )}

                {activeTab === 'STATE' && (
                    <div className="form-group">
                        <label>ACTIVE CHARACTERS (COMMA-SEPARATED):</label>
                        <input
                            type="text"
                            value={tuple.state_space.active_characters.join(
                                ', ',
                            )}
                            onChange={(e) => {
                                const chars = e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                setTuple((prev) => ({
                                    ...prev,
                                    state_space: {
                                        ...prev.state_space,
                                        active_characters: chars,
                                    },
                                }))
                            }}
                            className="text-input"
                        />
                    </div>
                )}

                {activeTab === 'ACTIONS' && (
                    <div className="form-group">
                        <label>
                            KINETIC VERB VOCABULARY (MIN 3 UPPERCASE):
                        </label>
                        <input
                            type="text"
                            value={tuple.action_vocabulary.kinetic_verbs.join(
                                ', ',
                            )}
                            onChange={(e) => {
                                const verbs = e.target.value
                                    .split(',')
                                    .map((s) => s.trim().toUpperCase())
                                    .filter(Boolean)
                                setTuple((prev) => ({
                                    ...prev,
                                    action_vocabulary: {
                                        ...prev.action_vocabulary,
                                        kinetic_verbs: verbs,
                                    },
                                }))
                            }}
                            className="text-input"
                        />
                    </div>
                )}

                {activeTab === 'INVARIANTS' && (
                    <div className="form-group">
                        <label htmlFor="scarcity-bps-input">
                            SCARCITY INDEX (BPS: 0 - 10000):{' '}
                            {tuple.invariant_laws.scarcity_index_bps} bps
                        </label>
                        <input
                            id="scarcity-bps-input"
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={tuple.invariant_laws.scarcity_index_bps}
                            onChange={handleScarcityBpsChange}
                        />

                        <label htmlFor="farce-bps-input">
                            MAX FARCE RATIO (BPS: 0 - 1500 CAP):{' '}
                            {tuple.invariant_laws.max_farce_ratio_bps} bps
                        </label>
                        <input
                            id="farce-bps-input"
                            type="range"
                            min="0"
                            max="1500"
                            step="50"
                            value={tuple.invariant_laws.max_farce_ratio_bps}
                            onChange={handleFarceBpsChange}
                        />
                    </div>
                )}
            </div>

            {!validationResult.success && (
                <div className="error-dossier" data-testid="error-list">
                    {validationResult.error.issues.map((err, idx) => (
                        <div key={idx} className="error-line">
                            &gt;&gt; [INVARIANT_BREACH] {err.path.join('.')}:{' '}
                            {err.message}
                        </div>
                    ))}
                </div>
            )}

            <div className="canonical-preview">
                <div className="preview-label">CANONICAL RFC 8785 STREAM:</div>
                <pre className="preview-payload">{canonicalOutput}</pre>
            </div>
        </div>
    )
}
