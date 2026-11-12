/**
 * apps/dashboard/src/components/islands/SomaticAuditInteractive.tsx
 *
 * Surgically Hydrated Somatic Audit Island (React 19).
 * Hydrated selectively via client:load or client:idle.
 * Defends against client-side JSON thaw by re-wrapping props in deepFreeze().
 * Dispatches signed DirectorIntentEnvelope payloads; zero direct database writes.
 */
import React, { useState, useEffect } from 'react'
import { deepFreeze, type DeepReadonly } from '../../lib/canon/deepFreeze'

export interface SomaticMaskPayload {
    readonly actorId: string
    readonly availableArms: number
    readonly bannedKineticVerbs: readonly string[]
    readonly sensoryAcuity: {
        readonly visualAcuity: number
        readonly auditoryAcuity: number
    }
    readonly activeConditions: readonly string[]
}

export interface SomaticAuditInteractiveProps {
    readonly actorId: string
    readonly initialMask: SomaticMaskPayload
    readonly cycle?: number
}

export interface DirectorIntentEnvelope {
    readonly intent_id: string
    readonly intent_type: 'OVERRIDE_SOMATIC_DEBUFF' | 'PIN_RECEPTOR_WINDOW'
    readonly authorizer_role: 'SHOWRUNNER' | 'SCENE_DIRECTOR'
    readonly timestamp_sim_cycle: number
    readonly payload: Record<string, unknown>
    readonly client_signature: string
}

export const SomaticAuditInteractive: React.FC<
    SomaticAuditInteractiveProps
> = ({ actorId, initialMask, cycle = 1 }) => {
    // CLIENT DEFENSE: Re-apply deepFreeze upon browser hydration to defend against JSON thaw
    const [frozenMask] = useState<DeepReadonly<SomaticMaskPayload>>(() =>
        deepFreeze(initialMask),
    )

    const [stagedDebuff, setStagedDebuff] = useState<string>('sprained_wrist')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [dispatchStatus, setDispatchStatus] = useState<string>('IDLE')

    // Verify in-memory immutability in browser runtime
    useEffect(() => {
        try {
            // Intentional defense assertion: ensure mutating frozen prop throws fatal TypeError
            ;(
                frozenMask as unknown as { availableArms: number }
            ).availableArms = 99.0
            console.error(
                '>> [CRITICAL_BREACH] deepFreeze failed to prevent client mutation!',
            )
        } catch (err: unknown) {
            if (err instanceof TypeError) {
                console.log(
                    '>> [IMMUTABILITY_ASSERTION_PASSED] Client JSON thaw defense active.',
                )
            }
        }
    }, [frozenMask])

    const handleDispatchIntent = async () => {
        setIsSubmitting(true)
        setDispatchStatus('PACKAGING_ENVELOPE')

        const envelope: DirectorIntentEnvelope = {
            intent_id: `intent_${Date.now()}`,
            intent_type: 'OVERRIDE_SOMATIC_DEBUFF',
            authorizer_role: 'SHOWRUNNER',
            timestamp_sim_cycle: cycle,
            payload: {
                targetActor: actorId,
                stagedDebuff,
                baseArms: frozenMask.availableArms,
            },
            client_signature: 'sig_mock_ed25519_client_token',
        }

        try {
            setDispatchStatus('DISPATCHING')
            const response = await fetch('/api/v1/intents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(envelope),
            })

            if (response.ok) {
                setDispatchStatus('ACKNOWLEDGED (HTTP 200)')
            } else {
                setDispatchStatus(`REJECTED (${response.status})`)
            }
        } catch {
            setDispatchStatus('DISPATCH_ERROR (LOOPBACK_OFFLINE)')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-neutral-900 border border-neutral-700 rounded p-4 font-mono text-xs text-neutral-200 select-none">
            {/* Island Supervisory Banner */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="font-bold text-neutral-100 tracking-wider">
                        INTERACTIVE SOMATIC AUDITOR
                    </span>
                </div>
                <span className="text-[10px] bg-blue-950/80 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800">
                    REACT_ISLAND (client:load)
                </span>
            </div>

            {/* Live Actor Telemetry */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center py-1 border-b border-neutral-800/40">
                    <span className="text-neutral-500">LOCKED_ACTOR_ID:</span>
                    <span className="text-neutral-100 font-bold">
                        {frozenMask.actorId}
                    </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-800/40">
                    <span className="text-neutral-500">
                        IMMUTABLE_CAPACITY:
                    </span>
                    <span className="text-emerald-400 font-bold">
                        {frozenMask.availableArms} ARMS
                    </span>
                </div>
            </div>

            {/* Directorial Staging Input */}
            <div className="pt-2 border-t border-neutral-800 space-y-3">
                <div>
                    <label className="text-neutral-400 block mb-1">
                        STAGE_SIMULATION_DEBUFF:
                    </label>
                    <select
                        value={stagedDebuff}
                        onChange={(e) => setStagedDebuff(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 p-1.5 rounded focus:outline-none focus:border-amber-500">
                        <option value="sprained_wrist">
                            SPRAINED_WRIST (ARMS -0.5)
                        </option>
                        <option value="tracheal_trauma">
                            TRACHEAL_TRAUMA (BAN: SPEAK)
                        </option>
                        <option value="corneal_burn">
                            CORNEAL_BURN (VISUAL -50%)
                        </option>
                    </select>
                </div>

                <button
                    onClick={handleDispatchIntent}
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold py-1.5 px-3 rounded transition-colors disabled:opacity-50">
                    {isSubmitting
                        ? 'DISPATCHING INTENT...'
                        : 'EMIT INTENT ENVELOPE'}
                </button>

                <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-1">
                    <span>INTENT_PIPE:</span>
                    <span className="text-amber-400 font-semibold">
                        [{dispatchStatus}]
                    </span>
                </div>
            </div>
        </div>
    )
}
