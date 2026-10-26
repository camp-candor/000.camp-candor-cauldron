# Solo Engineering Ops: Proactive Accountability, Tiered Slack Digests & GitHub Actions State Engine

An operational and technical specification for engineering solo developer accountability. It solves the "silence problem" by coupling reactive real-time notifications with a stateful, proactive daily digest running via GitHub Actions, enforcing progressive escalation when repositories stall.

---

## 1. The Core Engineering Challenge: Breaking the Silence

The primary failure mode of solo engineering is not lack of technical capability or missing commit data—it is invisible dormancy:
* **The Silence Failure Mode:** Days pass without commits, but because no external entity observes the silence, nothing creates friction or demands course correction.
* **The Two Halves of Accountability:**
  1. **The Reactive Stream:** Real-time commit, pull request, and build notifications. Traditional, passive, and fires only when labor has *already* occurred.
  2. **The Proactive Digest:** Scheduled daily interrogation that notices silence and actively confronts the developer when labor has *stalled*.
* **The Single-Channel Principle (`#dev-log`):** Reactive notifications and proactive daily digests must share a single chronological channel. Dividing them separates activity from inaction, destroying the visual contrast of empty timelines.

---

## 2. Architecture & The Stateful Escalation Engine

```
[ GitHub Repo Activity / Commits ]
                │
                ├─► Native GitHub Slack App ──────► Slack #dev-log (Reactive, Zero-Maintenance)
                │
                └─► Scheduled GitHub Action ──────► daily_digest.py
                            │                               │
                            ▼                               ▼
                 [ Read Commit History ]        [ Read digest_state.json ]
                            │                               │
                            └───────────────┬───────────────┘
                                            │
                                            ▼ Compute Stale Multiplier
                                [ Formulate Tone & Pings ]
                                            │
                                            ├─► Post Formatted Slack Payload
                                            │
                                            └─► Commit Updated digest_state.json
```

### A. Progressive Three-Tier Stale-Repo Escalation
Escalation is relative to each repository’s declared check-in window (e.g., a 2-day window for an active core engine vs. a 4-day window for narrative lore docs):

| Escalation Tier | Relative Threshold | Tone & Operational Mechanics | Slack Channel Impact |
|---|---|---|---|
| 🟡 **Quiet** | $1.0\times - 2.0\times$ Window | Neutral check-in. Summarizes days elapsed since last commit. | Standard digest entry. No @-mentions. |
| 🟠 **Stale** | $2.0\times - 3.0\times$ Window | Pointed friction. Prompts whether the repo remains an active priority. | Dedicated warning block in digest. |
| 🔴 **Critical** | $\ge 3.0\times$ Window (or 3 consecutive flags) | Urgent confrontation: *"Is something blocking you, or is this dead?"* | Header prepends `🚨`; injects `@here` ping. |

### B. Persistent State Memory (`digest_state.json`)
Escalation requires historical memory across execution cycles:
* Instead of deploying an external database, the scheduled GitHub Action reads `digest_state.json` at run start and commits the mutated state back to the repository at completion.
* Tracks consecutive flagged cycles (`consecutive_flags`). Any new commit touching the tracked branch immediately resets `consecutive_flags` to `0`.

---

## 3. Implementation Blueprint: Script & GitHub Actions Workflow

### A. Python Digest Engine (`daily_digest.py`)
```python
import os
import json
import datetime
import requests

GITHUB_TOKEN = os.environ["DIGEST_GITHUB_TOKEN"]
SLACK_WEBHOOK = os.environ["SLACK_WEBHOOK_URL"]
STATE_FILE = "digest_state.json"

# Per-repo configuration: owner/repo and target active check-in window (days)
TRACKED_REPOS = [
    {"repo": "owner/wiregrass-engine", "window": 2},
    {"repo": "owner/wiregrass-bible", "window": 4},
    {"repo": "owner/wiregrass-assets", "window": 3}
]

def fetch_last_commit_date(repo_name):
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    url = f"https://api.github.com/repos/{repo_name}/commits?per_page=1"
    res = requests.get(url, headers=headers)
    if res.status_code == 200 and len(res.json()) > 0:
        commit_date_str = res.json()[0]["commit"]["committer"]["date"]
        return datetime.datetime.fromisoformat(commit_date_str.replace("Z", "+00:00"))
    return None

def run_digest():
    now = datetime.datetime.now(datetime.timezone.utc)
    state = {}
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            state = json.load(f)

    critical_repos = []
    stale_repos = []
    quiet_repos = []
    active_repos = []

    for item in TRACKED_REPOS:
        repo = item["repo"]
        window = item["window"]
        last_commit = fetch_last_commit_date(repo)
        
        if not last_commit:
            days_inactive = 999
        else:
            days_inactive = (now - last_commit).days

        multiplier = days_inactive / window
        streak = state.get(repo, {}).get("consecutive_flags", 0)

        if multiplier >= 3.0 or streak >= 3:
            streak += 1
            critical_repos.append((repo, days_inactive, streak))
        elif multiplier >= 2.0:
            streak += 1
            stale_repos.append((repo, days_inactive, streak))
        elif multiplier >= 1.0:
            streak += 1
            quiet_repos.append((repo, days_inactive, streak))
        else:
            streak = 0
            active_repos.append((repo, days_inactive))

        state[repo] = {"consecutive_flags": streak, "last_evaluated": now.isoformat()}

    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

    # Compose Slack Payload
    blocks = []
    has_critical = len(critical_repos) > 0
    header_text = "🚨 *Daily Engineering Audit: Critical Stagnation Detected* 🚨" if has_critical else "📋 *Daily Engineering Audit*"
    if has_critical:
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": f"<!here> {header_text}"}})
    else:
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": header_text}})

    summary_text = ""
    for r, d, s in critical_repos:
        summary_text += f"• 🔴 *{r}*: Inactive for *{d} days* (Flagged {s}x in a row). *Is something blocking you?*\n"
    for r, d, s in stale_repos:
        summary_text += f"• 🟠 *{r}*: Inactive for *{d} days* (Flagged {s}x). *Still the active priority?*\n"
    for r, d, s in quiet_repos:
        summary_text += f"• 🟡 *{r}*: Inactive for *{d} days*. Approaching stale boundary.\n"
    for r, d in active_repos:
        summary_text += f"• 🟢 *{r}*: Active ({d}d ago).\n"

    blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": summary_text}})
    requests.post(SLACK_WEBHOOK, json={"blocks": blocks})

if __name__ == "__main__":
    run_digest()
```

### B. Scheduled Automation Workflow (`.github/workflows/daily-digest.yml`)
```yaml
name: Proactive Daily Digest & Accountability Audit

on:
  schedule:
    # Executes once daily at 09:00 UTC (05:00 AM EDT)
    - cron: '0 9 * * *'
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.DIGEST_GITHUB_TOKEN }}

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: pip install requests

      - name: Execute Daily Audit
        env:
          DIGEST_GITHUB_TOKEN: ${{ secrets.DIGEST_GITHUB_TOKEN }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: python daily_digest.py

      - name: Commit State Persistence
        run: |
          git config user.name "AccountabilityBot"
          git config user.email "bot@wiregrass.internal"
          git add digest_state.json
          git commit -m "chore(ops): update daily digest state persistence [skip ci]" || echo "No state change"
          git push
```
