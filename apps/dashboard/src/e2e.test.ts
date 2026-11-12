import { afterAll, beforeAll, describe, expect, it } from 'vitest'
// import puppeteer, { Browser, Page } from 'puppeteer'

const hasClerkKeys =
    !!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY || !!process.env.CLERK_SECRET_KEY

describe.skip('E2E Sanity Check', () => {
    let browser: any
    let page: any

    beforeAll(async () => {
        // Stripped puppeteer native browser binary in Node container
        browser = null
        page = null
    })

    afterAll(async () => {
        if (browser) {
            await browser.close()
        }
    })

    it('should load the home page', async () => {
        // Increased timeout for slow dev server starts
        await page.goto('http://localhost:4321', {
            waitUntil: 'networkidle0',
            timeout: 60000,
        })

        // Check for some text that should be on the page
        const content = await page.content()
        expect(content).toContain(
            'Experiencing the Intimacy of the Tuning you own RPG',
        )

        // Verify the 'Now Open A Vein And Own Your Own Mess' registration link is present
        const forgeLink = await page.$('a[href="/market"]')
        expect(forgeLink).not.toBeNull()
    }, 30000)

    it.skipIf(!hasClerkKeys)(
        'should handle the multi-stage Client Trust handshake',
        async () => {
            await page.goto('http://localhost:4321/login', {
                waitUntil: 'networkidle0',
            })

            // 1. Enter Credentials
            await page.type('#identifier', 'test@alligator.ink')
            await page.type('#password', 'handshake123')
            await page.click('#submit-btn')

            // 2. Detect & Verify UI Pivot (Transition to Verification Sector)
            // We wait for the 'verification-sector' to become visible
            await page.waitForSelector('#verification-sector:not(.hidden)', {
                timeout: 5000,
            })

            const btnText = await page.$eval(
                '#submit-btn',
                (el) => el.textContent,
            )
            expect(btnText?.trim()).toBe('VERIFY_CODE')

            // 3. Simulating MFA Injection (In a real test, this would use a Testing Token)
            await page.type('#verification_code', '123456')

            // Note: We don't click submit here unless we have a live Clerk backend to handle '123456'
            // but we have verified the UI state machine is active.
        },
        30000,
    )

    it.skipIf(!hasClerkKeys)(
        'should handle the multi-stage Registration handshake',
        async () => {
            await page.goto('http://localhost:4321/signup', {
                waitUntil: 'networkidle0',
            })

            // 1. Agree to The Covenant
            await page.click('#covenant-check')

            // 2. Enter Credentials
            await page.type('#username', 'TestRunner')
            await page.type('#emailAddress', 'test-reg@alligator.ink')
            await page.type('#password', 'reg-handshake123')

            // 3. Tactically Initialize
            await page.click('#submit-btn')

            // 4. Verify UI Pivot to Stage II (Transmission)
            await page.waitForSelector('#transmission-sector:not(.hidden)', {
                timeout: 5000,
            })

            const btnText = await page.$eval(
                '#submit-btn',
                (el) => el.textContent,
            )
            expect(btnText?.trim()).toBe('VERIFY_PULSE')
        },
        30000,
    )

    it('should load the /signup page and render all Stage I form fields', async () => {
        await page.goto('http://localhost:4321/signup', {
            waitUntil: 'networkidle0',
            timeout: 30000,
        })

        // Verify all covenant stage elements are present
        const username = await page.$('#username')
        const email = await page.$('#emailAddress')
        const password = await page.$('#password')
        const covenantCheck = await page.$('#covenant-check')
        const submitBtn = await page.$('#submit-btn')
        const errorMsg = await page.$('#error-message')

        expect(username).not.toBeNull()
        expect(email).not.toBeNull()
        expect(password).not.toBeNull()
        expect(covenantCheck).not.toBeNull()
        expect(submitBtn).not.toBeNull()
        expect(errorMsg).not.toBeNull()

        // Verify button text is correct for Stage I
        const btnText = await page.$eval('#submit-btn', (el) => el.textContent)
        expect(btnText?.trim()).toBe('INITIALIZE_COVENANT')

        // Verify OTP sector is hidden (Stage I default state)
        const transmissionHidden = await page.$eval(
            '#transmission-sector',
            (el) => el.classList.contains('hidden'),
        )
        expect(transmissionHidden).toBe(true)
    })

    it('should measure page render latency under 3000ms', async () => {
        const start = Date.now()

        await page.goto('http://localhost:4321/signup', {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        })

        // Wait for submit button to be interactive
        await page.waitForSelector('#submit-btn', { timeout: 5000 })
        const elapsed = Date.now() - start

        console.log(`[LATENCY_PROBE] Signup page render: ${elapsed}ms`)
        // A render time under 3s is acceptable for dev server
        expect(elapsed).toBeLessThan(3000)
    })
})
