import { vi } from 'vitest'

/**
 * BIO_PUNK_AUTH_MOCK
 * Simulates Clerk's client-side impulse for unit testing.
 * Covers both SignIn (Login Protocol) and SignUp (Registration Protocol).
 */

export const mockUser = {
    id: 'user_123',
    publicMetadata: { role: 'gamerunner' },
    organizationMemberships: [],
}

export const mockSignIn = {
    status: 'needs_client_trust',
    supportedFirstFactors: [
        { strategy: 'email_code', emailAddressId: 'email_123' },
    ],
    create: vi.fn(),
    prepareFirstFactor: vi.fn(),
    attemptFirstFactor: vi.fn(),
}

export const mockSignUp = {
    status: 'missing_requirements',
    createdSessionId: 'session_mock_123',
    create: vi.fn().mockResolvedValue({
        status: 'missing_requirements',
        prepareEmailAddressVerification: vi.fn().mockResolvedValue({}),
        attemptEmailAddressVerification: vi.fn().mockResolvedValue({
            status: 'complete',
            createdSessionId: 'session_mock_123',
        }),
    }),
    prepareEmailAddressVerification: vi.fn().mockResolvedValue({}),
    attemptEmailAddressVerification: vi.fn().mockResolvedValue({
        status: 'complete',
        createdSessionId: 'session_mock_123',
    }),
}

// Mock the nanostores/Clerk integration
vi.mock('@clerk/astro/client', () => ({
    $clerkStore: {
        get: vi.fn(() => ({
            client: {
                signIn: mockSignIn,
                signUp: mockSignUp,
            },
            user: mockUser,
            setActive: vi.fn().mockResolvedValue({}),
        })),
    },
}))
