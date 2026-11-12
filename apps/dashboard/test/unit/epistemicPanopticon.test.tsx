/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import EpistemicAuditPanel from '../../src/components/telemetry/EpistemicAuditPanel'

describe('EpistemicAuditPanel Micro-Island Gauntlet', () => {
    it('renders all three columns in the panopticon layout', () => {
        render(<EpistemicAuditPanel />)
        expect(screen.getByTestId('col-audience')).toBeDefined()
        expect(screen.getByTestId('col-speaker')).toBeDefined()
        expect(screen.getByTestId('col-interlocutor')).toBeDefined()
    })

    it('illuminates firewall breach alert when candidate beat contains omission tokens', () => {
        render(
            <EpistemicAuditPanel
                candidateBeat={{
                    beatId: 'beat_leak_01',
                    speakerId: 'char_bog',
                    text: 'Bog whispered that the poison was concealed in the cellar.',
                }}
            />,
        )
        expect(screen.getByTestId('breach-alert')).toBeDefined()
        expect(screen.getByTestId('leak-dossier').textContent).toContain(
            'poison',
        )
    })

    it('displays clean status badge when utterance is completely disjoint from omission tokens', () => {
        render(
            <EpistemicAuditPanel
                candidateBeat={{
                    beatId: 'beat_clean_01',
                    speakerId: 'char_bog',
                    text: 'The cold rain continues to fall across the courtyard pavement.',
                }}
            />,
        )
        expect(screen.getByTestId('secure-alert')).toBeDefined()
        expect(
            screen.getByText(/Zero omission token collisions detected/i),
        ).toBeDefined()
    })

    it('re-anchors interlocutor back to TOTAL_IGNORANCE on override button click', () => {
        render(
            <EpistemicAuditPanel
                initialInterlocutor={{
                    actorId: 'char_bog',
                    actorName: 'Bog',
                    horizonTier: 'PARTIAL_FACT',
                    confidenceBps: 5000,
                    omissionTokens: ['arsenic'],
                }}
            />,
        )
        expect(screen.getByText(/\[PARTIAL_FACT\]/i)).toBeDefined()

        const reanchorBtn = screen.getByTestId('reanchor-button')
        fireEvent.click(reanchorBtn)

        expect(screen.getByText(/\[TOTAL_IGNORANCE\]/i)).toBeDefined()
    })

    it('affirms fact standing locally using the 5-second Still Good protocol', () => {
        render(<EpistemicAuditPanel />)
        const stillGoodBtn = screen.getByTestId('still-good-button')
        fireEvent.click(stillGoodBtn)

        expect(screen.getByTestId('receipt-banner').textContent).toContain(
            'Fact standing reaffirmed locally',
        )
    })
})
