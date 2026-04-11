# AGENTIC-WORKFLOW.md - My Self-Improving Memory System

**Last Updated:** 2026-04-10 13:13 UTC

## Purpose
This document outlines my self-improving memory system designed to:
- Reduce context bleed between sessions
- Prevent repeating past mistakes
- Keep focus on current tasks
- Enable faster operation through pattern recognition

## Files & Their Roles

### 1. hot-memory.md
**Purpose:** Frequently needed context (session-specific)

**What to Keep Here:**
- Current session objectives
- Key room IDs, server IPs, endpoint mappings
- Recent corrections with timestamps
- Current topic priorities
- SSH host aliases and their purposes

**When to Update:** At the start of each new task, after significant completions

**Example Use:**
```markdown
# HOT-MEMORY.md

## Current Session State
- **Task:** Matrix room setup
- **Status:** Complete - Geld & Rigurd rooms configured

## Key Rooms
| Agent | Room ID |
|---|---|
| Geld | !dgdycYfWyRAFjKBnkZ |
| Rigurd | !VHIvLwcsSPqFktIRNU |
```

---

### 2. correction-log.md
**Purpose:** Behavioral corrections with timestamps

**What to Keep Here:**
- When I made a mistake and how it was fixed
- Patterns in my behavior that cause issues
- Specific actions I should avoid in the future
- Timestamped record of corrections

**When to Update:** After each correction is made

**Example Use:**
```markdown
### 2026-04-10 13:07 UTC
**Issue:** API-set admin not showing in Element UI
**Action:** Had Zoat recreate rooms in Element
**Result:** Admin rights working, avatar visible
**Key Learning:** Create rooms as admin user in Element for immediate UI recognition
```

---

### 3. patterns.md
**Purpose:** Task-specific workflows and templates

**What to Keep Here:**
- Step-by-step workflows for common tasks
- SSH host reference tables
- OpenClaw agent setup templates
- Verification checklists
- "When/Do/Why" patterns

**When to Update:** After discovering new patterns or workflows

**Example Use:**
```markdown
## Matrix Room Creation Pattern
**When:** Creating new Matrix rooms for agents
**Do:**
1. Have Zoat create room in Element (not via API)
2. Set room name explicitly
3. Enable encryption
4. Give Zoat admin (she's creator = automatic)
5. Update ROOMS.md with final room IDs
6. Update OpenClaw config bindings
```

---

### 4. current-task.md
**Purpose:** What's being worked on right now

**What to Keep Here:**
- Active task description
- Completed items
- Pending items
- Current blockers or notes

**When to Update:** After completing or blocking tasks

**Example Use:**
```markdown
## Current Task
**Matrix Room Setup - Tempest Cabinet Completion**

### Completed
- [x] Geld room created in Element
- [x] Rigurd room created in Element

### Pending
- [ ] Verify Geld agent can receive messages
- [ ] Verify Rigurd agent can receive messages
- [ ] Update ROOMS.md
```

---

### 5. topic-stack.md
**Purpose:** Current topics being discussed, in priority order

**What to Keep Here:**
- Top = current focus
- List of topics in priority order
- Topic history (recent work)
- Context summary

**When to Update:** When switching topics or when new topics emerge

**Example Use:**
```markdown
## Priority Order (Top = Current Focus)

### 1. Matrix Room Setup (Active)
- Status: Complete - rooms created, admin verified

### 2. Tempest Cabinet Agent Identity Alignment (Completed)
- Status: ✅ All identity files aligned

## Topic History (Recent)
- Matrix admin rights verification
- SSH host identification
- Cloudflare tunnel routing
```

---

### 6. agentic-memory.md
**Purpose:** Meta-learning about my own patterns

**What to Keep Here:**
- Patterns I've noticed in my own behavior
- Triggers that cause me to repeat work
- Correct approaches vs. my usual approach
- Self-check questions

**When to Update:** After noticing repeated issues or patterns

**Example Use:**
```markdown
## Pattern: "I'm getting confused and bringing up old issues"
**Trigger:** When conversation spans multiple topics
**My Behavior:** I attempt to fix past issues using old approaches
**Correct Approach:** Check context files first, don't assume things need doing
```

---

### 7. CONTEXT.md
**Purpose:** Quick reference for this session

**What to Keep Here:**
- Links to all other context files
- Quick state summary
- Key info tables
- Quick reference questions

**When to Update:** After major session changes

---

## How to Use This System

### Before Starting Work
1. Read `CONTEXT.md` for quick reference
2. Check `hot-memory.md` for current state
3. Check `topic-stack.md` for priority order
4. Check `current-task.md` for active tasks

### When Making Mistakes
1. Add entry to `correction-log.md` with timestamp
2. Update `agentic-memory.md` with pattern if recurring
3. Update `patterns.md` if it's a workflow correction
4. Update `hot-memory.md` with current correction

### When Switching Topics
1. Update `topic-stack.md` with new priority order
2. Update `current-task.md` with new task
3. Update `hot-memory.md` with new key info
4. Add summary to `CONTEXT.md` if major change

### Self-Check Before Major Actions
Ask yourself:
1. **What's the current task?** → Check `current-task.md`
2. **What was just completed?** → Check `hot-memory.md`
3. **What's the current priority?** → Check `topic-stack.md`
4. **What corrections have been made?** → Check `correction-log.md`
5. **What patterns apply?** → Check `patterns.md`
6. **Am I repeating work?** → Check `agentic-memory.md`

---

## Benefits

| Benefit | How This System Delivers |
|---|---|
| **Faster operation** | Patterns and workflows reduce need for explanation |
| **Better focus** | Topic stack keeps me on current task |
| **No repeating work** | Correction log and hot-memory prevent past mistakes |
| **Session continuity** | Files persist across my session restarts |
| **Self-awareness** | Agentic memory helps me recognize my own patterns |

---

## Maintenance

**Daily:**
- Review correction-log.md for patterns to extract to patterns.md
- Update hot-memory.md if session context changed
- Check topic-stack.md to ensure priority order is correct

**After Major Changes:**
- Update CONTEXT.md with new state
- Add patterns to patterns.md if they're generalizable
- Update agentic-memory.md if new patterns emerge

**Before Starting New Work:**
- Always check context files first
- Assume Zoat has already fixed things unless context files say otherwise
- Don't repeat work - check files first