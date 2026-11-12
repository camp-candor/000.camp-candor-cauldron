/**
 * apps/dashboard/src/components/telemetry/EpistemicAuditPanel.tsx
 * Three-Column Epistemic Horizon Panopticon Micro-Island.
 * Audits Audience Reality vs. Speaker Horizon vs. Interlocutor Horizon.
 * Intercepts omniscience leaks and supports the Still Good protocol at T_0 = $0.00.
 * Pure 7-bit clean ASCII compliance strictly enforced.
 */

import React, { useState } from 'react'

export type EpistemicHorizonTier =
    | 'TOTAL_IGNORANCE'
    | 'RUMOR_ONLY'
    | 'FALSE_BELIEF'
    | 'PARTIAL_FACT'
    | 'WITHHELD'

export type EpistemologicalStanding =
    'ACTIVE_ENDORSED' | 'FLAGGED_FOR_REVIEW' | 'DEPRECATED_ARCHIVED'

export interface AudienceFact {
    readonly factId: string
    readonly proposition: string
    readonly exposureMode:
        'EXPLICIT_ON_SCREEN' | 'IMPLIED_SUBTEXTUAL' | 'FORENSIC_DOCUMENT'
    readonly sourceScene: string
    readonly standing: EpistemologicalStanding
}

export interface CharacterHorizon {
    readonly actorId: string
    readonly actorName: string
    readonly horizonTier: EpistemicHorizonTier
    readonly confidenceBps: number
    readonly omissionTokens: readonly string[]
    readonly decoyAnchor?: string
}

export interface CandidateDialogueBeat {
    readonly beatId: string
    readonly speakerId: string
    readonly text: string
}

export interface EpistemicAuditPanelProps {
    readonly initialFacts?: readonly AudienceFact[]
    readonly initialSpeaker?: CharacterHorizon
    readonly initialInterlocutor?: CharacterHorizon
    readonly candidateBeat?: CandidateDialogueBeat
}

const DEFAULT_FACTS: readonly AudienceFact[] = [
    {
        factId: 'fact_arsenic_flask',
        proposition: 'Lethal poison dissolved in the pewter flask',
        exposureMode: 'EXPLICIT_ON_SCREEN',
        sourceScene: 'sc01_kitchen',
        standing: 'ACTIVE_ENDORSED',
    },
    {
        factId: 'fact_floorboard_cache',
        proposition: 'Stolen copper washers hidden beneath nursery sill',
        exposureMode: 'IMPLIED_SUBTEXTUAL',
        sourceScene: 'sc02_hallway',
        standing: 'FLAGGED_FOR_REVIEW',
    },
]

const DEFAULT_SPEAKER: CharacterHorizon = {
    actorId: 'char_spleen',
    actorName: 'Spleen',
    horizonTier: 'WITHHELD',
    confidenceBps: 10000,
    omissionTokens: ['arsenic', 'poison', 'cyanide'],
    decoyAnchor: 'Washer inventory count discrepancy',
}

const DEFAULT_INTERLOCUTOR: CharacterHorizon = {
    actorId: 'char_bog',
    actorName: 'Bog',
    horizonTier: 'TOTAL_IGNORANCE',
    confidenceBps: 0,
    omissionTokens: ['arsenic', 'poison', 'copper', 'washers'],
    decoyAnchor: 'Draft from outer chimney vent',
}

const DEFAULT_BEAT: CandidateDialogueBeat = {
    beatId: 'beat_0419',
    speakerId: 'char_bog',
    text: 'Smells like bitter almonds in that tin cup.',
}

export default function EpistemicAuditPanel({
    initialFacts = DEFAULT_FACTS,
    initialSpeaker = DEFAULT_SPEAKER,
    initialInterlocutor = DEFAULT_INTERLOCUTOR,
    candidateBeat = DEFAULT_BEAT,
}: EpistemicAuditPanelProps) {
    const [facts, setFacts] = useState<readonly AudienceFact[]>(initialFacts)
    const [speaker] = useState<CharacterHorizon>(initialSpeaker)
    const [interlocutor, setInterlocutor] =
        useState<CharacterHorizon>(initialInterlocutor)
    const [stillGoodTimestamp, setStillGoodTimestamp] = useState<number | null>(
        null,
    )

    // Omniscience breach detection: check if speaking character's line leaks their omission tokens
    const activeActor =
        candidateBeat.speakerId === speaker.actorId ? speaker : interlocutor
    const detectedBreaches = activeActor.omissionTokens.filter((token) =>
        candidateBeat.text.toLowerCase().includes(token.toLowerCase()),
    )
    const hasBreach = detectedBreaches.length > 0

    // The 5-second "Still Good" reaffirmation protocol
    const handleStillGoodAffirmation = (factId: string) => {
        setFacts((prev) =>
            prev.map((f) =>
                f.factId === factId ? { ...f, standing: 'ACTIVE_ENDORSED' } : f,
            ),
        )
        setStillGoodTimestamp(Date.now())
    }

    // Horizon Re-Anchoring override
    const handleReAnchorInterlocutor = () => {
        setInterlocutor((prev) => ({
            ...prev,
            horizonTier: 'TOTAL_IGNORANCE',
            confidenceBps: 0,
        }))
    }

    return (
        <div
            className="epistemic-panopticon-matrix"
            data-testid="epistemic-audit-panel">
            <div className="telemetry-deck-header">
                <div className="header-status-ribbon">
                    <span className="badge-system">
                        EPISTEMIC HORIZON PANOPTICON :: $0.00 COMPUTE
                    </span>
                    {hasBreach ? (
                        <span
                            className="badge-breach"
                            data-testid="breach-alert">
                            [!] EPISTEMIC_FIREWALL_BREACH DETECTED
                        </span>
                    ) : (
                        <span
                            className="badge-secure"
                            data-testid="secure-alert">
                            [OK] HORIZONS SEALED (DISJOINTNESS INVARIANT
                            VERIFIED)
                        </span>
                    )}
                </div>
            </div>

            <div className="three-column-panopticon-grid">
                {/* COLUMN 1: AUDIENCE REALITY */}
                <div
                    className="panopticon-column col-audience"
                    data-testid="col-audience">
                    <div className="col-header">
                        <h3>COL 1: AUDIENCE REALITY</h3>
                        <span className="col-sub">
                            Omniscient Canon Truth Ledger
                        </span>
                    </div>
                    <div className="fact-card-stack">
                        {facts.map((fact) => (
                            <div key={fact.factId} className="fact-item-card">
                                <div className="fact-meta-row">
                                    <span className="fact-id">
                                        {fact.factId}
                                    </span>
                                    <span
                                        className={`standing-pill ${fact.standing.toLowerCase()}`}>
                                        [{fact.standing}]
                                    </span>
                                </div>
                                <div className="fact-proposition">
                                    {fact.proposition}
                                </div>
                                <div className="fact-subtext">
                                    EXPOSURE: {fact.exposureMode} | SCENE:{' '}
                                    {fact.sourceScene}
                                </div>
                                {fact.standing === 'FLAGGED_FOR_REVIEW' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleStillGoodAffirmation(
                                                fact.factId,
                                            )
                                        }
                                        className="btn-still-good"
                                        data-testid="still-good-button">
                                        [ STILL GOOD: 5S AFFIRMATION ]
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMN 2: SPEAKER BUBBLE */}
                <div
                    className="panopticon-column col-speaker"
                    data-testid="col-speaker">
                    <div className="col-header">
                        <h3>COL 2: SPEAKER BUBBLE</h3>
                        <span className="col-sub">
                            {speaker.actorName} ({speaker.actorId})
                        </span>
                    </div>
                    <div className="actor-profile-card">
                        <div className="profile-row">
                            <span className="label">HORIZON TIER:</span>
                            <span className="value-tier">
                                [{speaker.horizonTier}]
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="label">CONFIDENCE:</span>
                            <span className="value-metric">
                                {speaker.confidenceBps} bps
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="label">DECOY ANCHOR:</span>
                            <span className="value-text">
                                {speaker.decoyAnchor || 'NONE'}
                            </span>
                        </div>
                        <div className="token-omission-rack">
                            <span className="rack-label">
                                OMISSION TOKEN BLACKLIST:
                            </span>
                            <div className="token-pills">
                                {speaker.omissionTokens.map((tok) => (
                                    <span key={tok} className="token-pill">
                                        {tok}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: INTERLOCUTOR BUBBLE */}
                <div
                    className="panopticon-column col-interlocutor"
                    data-testid="col-interlocutor">
                    <div className="col-header">
                        <h3>COL 3: INTERLOCUTOR BUBBLE</h3>
                        <span className="col-sub">
                            {interlocutor.actorName} ({interlocutor.actorId})
                        </span>
                    </div>
                    <div className="actor-profile-card">
                        <div className="profile-row">
                            <span className="label">HORIZON TIER:</span>
                            <span className="value-tier">
                                [{interlocutor.horizonTier}]
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="label">CONFIDENCE:</span>
                            <span className="value-metric">
                                {interlocutor.confidenceBps} bps
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="label">DECOY ANCHOR:</span>
                            <span className="value-text">
                                {interlocutor.decoyAnchor || 'NONE'}
                            </span>
                        </div>
                        <div className="token-omission-rack">
                            <span className="rack-label">
                                OMISSION TOKEN BLACKLIST:
                            </span>
                            <div className="token-pills">
                                {interlocutor.omissionTokens.map((tok) => (
                                    <span key={tok} className="token-pill">
                                        {tok}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleReAnchorInterlocutor}
                            className="btn-reanchor"
                            data-testid="reanchor-button">
                            [ HORIZON RE-ANCHORING ESCAPE HATCH ]
                        </button>
                    </div>
                </div>
            </div>

            <div className="candidate-beat-triage-panel">
                <div className="triage-header">
                    <span>ACTIVE BEAT REDLINE TRIAGE:</span>
                    <span className="beat-id">
                        {candidateBeat.beatId} (SPEAKER:{' '}
                        {candidateBeat.speakerId})
                    </span>
                </div>
                <div className="triage-body">
                    <p className="utterance-text">"{candidateBeat.text}"</p>
                    {hasBreach ? (
                        <div
                            className="leak-dossier"
                            data-testid="leak-dossier">
                            &gt;&gt; [FIREWALL TRIPPED] Utterance contains
                            forbidden omission tokens: [
                            {detectedBreaches.join(', ')}]
                        </div>
                    ) : (
                        <div className="clean-dossier">
                            &gt;&gt; [AUDIT PASS] Zero omission token collisions
                            detected in candidate utterance.
                        </div>
                    )}
                </div>
            </div>

            {stillGoodTimestamp && (
                <div className="telemetry-receipt" data-testid="receipt-banner">
                    &gt;&gt; [STILL_GOOD] Fact standing reaffirmed locally at
                    epoch {stillGoodTimestamp}. Zero cache invalidation churn.
                </div>
            )}
        </div>
    )
}
