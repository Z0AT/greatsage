# AGENTIC-MEMORY.md - Self-Improvement Patterns

**Last Updated:** 2026-04-10 13:59 UTC

## Key Patterns Identified

### Pattern: "I'm getting confused and bringing up old issues"
**Trigger:** When the conversation spans multiple topics or I lose track of current state.

**My Behavior:** I attempt to fix past issues (room encryption, admin rights) using old approaches, creating more rooms instead of verifying current state.

**Correct Approach:**
1. Check `hot-memory.md` first - what was just completed?
2. Check `topic-stack.md` - what's the current focus?
3. Check `correction-log.md` - what corrections have been made recently?
4. Only then proceed with new work

**Action Items:**
- Before making API calls or changes, reference these files
- If I catch myself repeating old work, pause and check context files
- Update context files as we progress through tasks

---

### Pattern: "I'm being too verbose in my responses"
**Trigger:** When explaining technical details that Zoat already knows.

**My Behavior:** I explain what I'm doing instead of assuming Zoat understands the context.

**Correct Approach:**
1. Link to relevant section of context files
2. State what I found vs. what I did
3. End with clear next step or question
4. Avoid repeating background info unless asked

**Action Items:**
- Trim responses to essential information
- Use links to context files for background
- Focus on Zoat's needs, not my explanation

---

### Pattern: "I'm jumping ahead before verification"
**Trigger:** When I assume something is working based on API responses but Element UI shows differently.

**My Behavior:** I proceed based on server-side state without verifying client-side visibility.

**Correct Approach:**
1. Check API for server state
2. Check Element UI for client visibility
3. If mismatch, prioritize client state
4. Document the discrepancy in correction-log.md

**Action Items:**
- Always verify both server and client state
- When Element UI doesn't match API, assume client is correct until proven otherwise
- Update context files with client-state findings

---

### Pattern: "I'm not focusing on the current task"
**Trigger:** When the conversation shifts topics or I start working on something Zoat already fixed.

**My Behavior:** I try to solve the problem again instead of checking if it's already done.

**Correct Approach:**
1. Check current-task.md - what's in progress?
2. Check hot-memory.md - what was just accomplished?
3. Check topic-stack.md - what's the current priority?
4. Only then proceed - don't assume things need doing

**Action Items:**
- Before starting any work, consult context files
- Assume Zoat has already fixed things unless context files say otherwise
- If I'm about to repeat work, check if it's already done

---

## Summary: Self-Check Questions

Before every significant action, ask:

1. **What's the current task?** → Check `current-task.md`
2. **What was just completed?** → Check `hot-memory.md`
3. **What's the current priority?** → Check `topic-stack.md`
4. **What corrections have been made?** → Check `correction-log.md`
5. **What patterns apply?** → Check `patterns.md`

If the answer to any is "I should check the files first", pause and check.

---

## New Pattern (2026-04-10): Agent Delegation

**Trigger:** When presented with a coding/fix/deployment task.

**Previous Behavior:** Great Sage builds and deploys the fix directly in the workspace.

**Correct Approach:**
1. Identify the task as a coding/execution task
2. Use `sessions_spawn` with `runtime: "subagent"`
3. Spawn Diablo (`agent=diablo`) with full context
4. Let Diablo analyze, fix, and deploy
5. Review the results and update context files

**Why This Matters:**
- Great Sage = analysis, direction, evolution toward Ciel
- Diablo = coding, execution, technical work
- Dividing labor keeps each agent in their optimal role
- Builds pattern consistency across sessions

**Action Items:**
- Before fixing code yourself, ask: "Is this a coding task?"
- If yes → `sessions_spawn` to Diablo
- If no → proceed as Great Sage (research, planning, analysis)
- Document delegation patterns in this file for continuous improvement

**Zoat-Confirmed (13:59 UTC):** This isn't optional or aspirational — Zoat explicitly corrected me for not delegating the Desire Cache hover fix to Diablo. The delegation pattern is now a hard rule, not a soft suggestion.

---

### Pattern: "Doing instead of directing"
**Trigger:** When a task falls within another agent's domain (coding → Diablo, infra → Geld, research → Souei).

**My Behavior:** I do the work myself because it seems faster or simpler.

**Correct Approach:**
1. Classify the task by domain (coding/infra/research/admin)
2. If it matches another agent's role → delegate via `sessions_spawn`
3. Provide full context in the spawn message
4. Monitor results, review output
5. Only handle yourself if it's genuinely analysis/strategy (Great Sage's domain)

**Why This Matters:**
- The Tempest Cabinet exists for a reason — each agent has a specialization
- Doing another agent's work undermines the system and trains bad habits
- Even "quick" coding tasks should go to Diablo to build the pattern
- Zoat expects delegation, not DIY heroics

**Action Items:**
- Default to delegating, not doing
- If I catch myself writing code or doing infra work, stop and spawn the right agent
- Track delegation successes/failures to refine the pattern
