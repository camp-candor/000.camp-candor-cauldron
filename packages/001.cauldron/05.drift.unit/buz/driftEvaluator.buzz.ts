import * as fs from 'fs'
import * as path from 'path'
import { execFileSync } from 'child_process'
import DriftBit, { RepoDriftRecord, DriftStatusCode } from '../fce/drift.bit.js'
import { DriftModel } from '../drift.model.js'
import State from '../../99.core/state.js'

export const evaluateDrift = (
    cpy: DriftModel,
    bal: DriftBit,
    ste: State,
): DriftModel => {
    const rootDir = bal.dat?.customRoot || process.cwd()
    const versionsPath = bal.src || path.join(rootDir, 'versions.json')
    const parentRoot = bal.dat?.customParentRoot || path.resolve(rootDir, '..')

    if (!fs.existsSync(versionsPath)) {
        throw new Error(`versions.json manifest not found at ${versionsPath}`)
    }

    const manifest = JSON.parse(fs.readFileSync(versionsPath, 'utf8'))
    const repos = manifest.repos || {}
    const report: RepoDriftRecord[] = []

    for (const [name, meta] of Object.entries<any>(repos)) {
        const repoPath = path.join(parentRoot, meta.cluster, name)

        if (!fs.existsSync(repoPath)) {
            report.push({
                repo: name,
                cluster: meta.cluster,
                status: 'MISSING',
                expected: meta.ref,
                actual: 'NONE',
            })
            continue
        }

        try {
            const headSha = execFileSync('git', ['rev-parse', 'HEAD'], {
                cwd: repoPath,
                encoding: 'utf8',
                timeout: 3000,
            }).trim()

            const porcelain = execFileSync('git', ['status', '--porcelain'], {
                cwd: repoPath,
                encoding: 'utf8',
                timeout: 3000,
            }).trim()

            let status: DriftStatusCode = 'ALIGNED'

            if (porcelain.length > 0) {
                status = 'DIRTY'
            } else if (
                meta.ref === 'main' ||
                headSha.startsWith(meta.ref) ||
                meta.ref.startsWith(headSha)
            ) {
                status = 'ALIGNED'
            } else {
                status = 'DRIFTED'
            }

            report.push({
                repo: name,
                cluster: meta.cluster,
                status,
                expected: meta.ref,
                actual: headSha,
            })
        } catch {
            report.push({
                repo: name,
                cluster: meta.cluster,
                status: 'MISSING',
                expected: meta.ref,
                actual: 'ERROR',
            })
        }
    }

    cpy.records = report
    cpy.lastEvaluatedAt = new Date().toISOString()
    cpy.hasDrift = report.some((r) => r.status !== 'ALIGNED')

    if (bal.slv) {
        bal.slv({
            drfBit: {
                idx: 'evaluate-drift',
                val: cpy.hasDrift ? 1 : 0,
                dat: report,
            },
        })
    }
    return cpy
}
