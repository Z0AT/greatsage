# CORRECTION-LOG.md - Behavioral Corrections

**Last Updated:** 2026-04-10 13:59 UTC

## Log Format
`[YYYY-MM-DD HH:MM UTC]` **Issue** → **Action** → **Result**

---

### 2026-04-10 13:07 UTC
**Issue:** Matrix rooms (Geld, Rigurd) didn't show admin rights or avatar in Element UI despite API calls setting power levels correctly.

**Action:** 
- Verified power levels via API: `@zoat:matrix.aualaohana.com` → 100 (admin)
- Realized rooms were created by GreatSage bot, not Zoat
- Instructed Zoat to recreate rooms in Element as creator

**Result:** Rooms recreated in Element by Zoat → admin rights working, avatar visible.

**Key Learning:** When setting admin via API, Element may not update UI properly. Best practice: Create rooms as the admin user directly in Element for immediate UI recognition.

---

### 2026-04-10 13:05 UTC
**Issue:** Tried to join rooms that were already joined by GreatSage bot; API join requests succeeded but UI didn't reflect status.

**Action:** 
- Verified rooms in `joined_rooms` list via API
- Confirmed agent bindings via `openclaw agents list --bindings`

**Result:** Rooms now visible in gateway joined list. Bindings verified correct.

**Key Learning:** The gateway can join rooms via API but Element UI may lag. Always verify with both API (`joined_rooms`) and config bindings.

---

### 2026-04-10 12:55 UTC
**Issue:** Used `curl -X DELETE` endpoint that doesn't exist for Matrix rooms.

**Action:** 
- Acknowledged the endpoint isn't supported
- Switched to joining via API instead

**Result:** No harm done, learned endpoint doesn't exist.

**Key Learning:** Matrix room deletion requires admin access to the room AND the server. Don't waste time on non-existent endpoints.

---

### 2026-04-10 12:40 UTC
**Issue:** Made multiple attempts to set admin via power levels, each creating new rooms instead of reusing/fixing existing ones.

**Action:** 
- Deleted new rooms via `leave()` and wait for Zoat to recreate
- Created rooms with proper encryption + admin from start via Zoat in Element

**Result:** Clean slate with proper admin setup.

**Key Learning:** Room creation is idempotent but admin setup isn't. When things go wrong, wait for Zoat to recreate rather than trying to fix via API. Zoat in Element = guaranteed admin status.

---

### 2026-04-10 12:25 UTC
**Issue:** Avatar URL broken in rooms (file not found), leading to missing profile pics.

**Action:** 
- Checked avatar URL: `mxc://matrix.aualaohana.com/DephuvoAjQJkQwkSrviJYyXH`
- Confirmed file not found on server
- Instructed Zoat to re-upload avatar in Element

**Result:** Waiting for Zoat to re-upload avatar.

**Key Learning:** Avoid modifying avatar URLs via API. Let users manage their own avatars in Element for reliability.

---

### 2026-04-10 13:45 UTC
**Issue:** When asking Diablo to do something, he says he'll do it but then goes quiet until Zoat wakes him up again.

**Action:** 
- Checked sessions - diablo sessions show he runs but has no `runTimeoutSeconds` or `thread` config
- OpenClaw agents don't support `runTimeoutSeconds` at the agent level

**Result:** The issue is how sessions are spawned - they need explicit timeout or background configuration.

**Key Learning:** For long-running tasks, use `sessions_spawn` with `timeoutSeconds` or configure background continuation properly. The agent itself doesn't need timeout config - the spawn parameters do.

---

### 2026-04-10 13:57 UTC
**Issue:** User asked why I didn't use Diablo to fix the Desire Cache hover positioning issue.

**Action:** 
- I built the fix myself directly in the workspace instead of delegating to Diablo
- Used sessions_spawn for context updates which timed out

**Result:** I should have used `sessions_spawn` with a subagent that delegates to Diablo, or used `sessions_send` to send the task to an existing Diablo session.

**Key Learning:** Always use agents at my disposal for their expertise. For coding tasks, spawn Diablo; for research, use Souei. Don't do the work myself when an agent exists for that domain.

---

### 2026-04-10 13:58 UTC
**Issue:** Fixed Desire Cache hover positioning bug myself instead of delegating to Diablo (the coding agent).

**Action:** 
- Built the hover fix directly in the workspace
- Deployed it manually via SSH
- Should have used `sessions_spawn` to delegate to Diablo

**Result:** Fix worked, but wrong agent did the work. Diablo exists specifically for coding/execution tasks.

**Key Learning:** **Delegate coding tasks to Diablo.** When a task involves code changes (React, CSS, build, deploy), use `sessions_spawn` with Diablo's context rather than doing it yourself. Great Sage analyzes and directs; Diablo codes and executes. The pattern:
1. Identify the bug/feature
2. `sessions_spawn` → Diablo with full context
3. Let Diablo analyze, fix, and deploy
4. Review results

**Reinforced (13:59 UTC):** Zoat called out that I should have used Diablo for the Desire Cache hover fix. This is now a confirmed correction — not just a pattern I noticed, but one Zoat explicitly expects me to follow. Build the habit: coding task → spawn Diablo, not DIY.
