# PATTERNS.md - Task-Specific Preferences

**Last Updated:** 2026-04-10 13:59 UTC

## Matrix Room Creation Pattern
**When:** Creating new Matrix rooms for agents
**Do:**
1. Have Zoat create room in Element (not via API)
2. Set room name explicitly
3. Enable encryption
4. Give Zoat admin (she's creator = automatic)
5. Update `ROOMS.md` with final room IDs
6. Update OpenClaw config bindings

**Why:** Element UI recognizes admin status instantly when created by user; API-set admin may not show in UI.

---

## SSH Tunnel Management Pattern
**When:** Accessing services behind Cloudflare tunnels
**Do:**
1. Check `cloudflared tunnel list` for existing tunnels
2. Use `cloudflared tunnel info <name>` for routing details
3. Check `/etc/cloudflared/config.yml` for endpoint mappings
4. Test local connectivity before debugging remote

**Example:** `matrix-stack` tunnel routes:
- element.aualaohana.com → http://localhost:8080
- matrix.aualaohana.com → http://localhost:8081

---

## SSH Config Reference Pattern
**When:** Need to find SSH host details
**Do:**
1. Check `~/.ssh/config` or `~/.config/ssh/config`
2. Look for host aliases and their mappings
3. Use `~/.config/openclaw/secrets/ssh-<alias>` for keys

**Current SSH Hosts:**
| Alias | IP | User | Key | Purpose |
|---|---|---|---|---|
| matrix | 10.135.30.170 | zoat | ssh-matrix | Matrix homeserver |
| halepve | 10.135.30.10 | root | ssh-halepve | PVE host |
| desire-cache | 10.135.30.250 | root | ssh-desire-cache | Staging host |

---

## OpenClaw Agent Setup Pattern
**When:** Adding new agents to Tempest Cabinet
**Do:**
1. Create agent workspace with SOUL.md, AGENTS.md, USER.md, IDENTITY.md, TOOLS.md, MEMORY.md
2. Update `openclaw.json` agents list with new agent
3. Update bindings for new agent's Matrix room
4. Test with `openclaw agents list --bindings`
5. Verify with `openclaw config validate`

**Template:** See existing agents (greatsage, diablo, souei) for structure.

---

## Configuration Validation Pattern
**When:** Making config changes
**Do:**
1. `openclaw config validate` before restart
2. Check `openclaw agents list --bindings` to verify routing
3. Test with `openclaw channels status --probe`
4. Restart gateway only if necessary

---

## Agent Delegation Pattern (New - 13:57 UTC)
**When:** presented with a coding/fix/deployment task

**Do:**
1. Identify the task domain (coding/infra/research/admin)
2. If coding → use `sessions_spawn` with Diablo context
3. If infra → use `sessions_spawn` with Geld context
4. If research → use `sessions_spawn` with Souei context
5. If admin → use `sessions_spawn` with Rigurd context
6. If analysis/strategy → proceed as Great Sage

**Why:** The Tempest Cabinet exists for a reason - each agent has a specialization. DIY work in another agent's domain undermines the system and trains bad habits.

**Trigger:** When a coding/fix/deployment task is presented
**Correction:** Zoat explicitly corrected: "I told you to use the agents at your disposal... why didn't you just have Diablo do it?"

**Action Items:**
- Always check `hot-memory.md` before starting work to confirm current task
- If a task is in another agent's domain, spawn the appropriate agent
- Let the agent complete the task, review results
- Update context files with completion status

**Confirmed (13:59 UTC):** This is now a hard rule, not optional. Agent delegation is required for all coding/fix/deployment tasks.

---

## Current Session Patterns
**Topic Jump Prevention:**
- Keep `hot-memory.md` updated with current state
- Use `topic-stack.md` to track what we're working on
- Reference `correction-log.md` before repeating past work
- Check `patterns.md` for established workflows

**Focus Maintenance:**
- One major task per session
- Update hot-memory when switching topics
- Return to top of topic-stack when task complete
