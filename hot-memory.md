# HOT-MEMORY.md - Session Context

**Last Updated:** 2026-04-10 13:59 UTC

## Current Session State

### Active Task
- **Task:** Desire Cache hover positioning fix
- **Status:** Completed - Build succeeded, deployed to staging

### Key Work Completed
- Identified hover position bug - branch items didn't set `hoveredItemPos`
- Updated `onHover` to pass full item instead of just ID
- Added `setHoveredItemPos` to `InventoryItemNode` props
- Fixed onMouseEnter handlers for branch items and signal bar
- Added null checks for optional `setHoveredItemPos`
- Build: `npm run build` - succeeded
- Deployed to: http://10.135.30.250/dc-react/

### Matrix Server
- **Host:** 10.135.30.170 (matrix)
- **Synapse:** Port 8081, Admin API at `/_synapse/admin`
- **Element:** Port 8080
- **Cloudflare Tunnel:** `matrix-stack` (f6d570a1-...)
- **Endpoints:**
  - element.aualaohana.com → Element web
  - matrix.aualaohana.com → Synapse API

### SSH Hosts (Key Reference)
| Host | IP | User | Key |
|---|---|---|---|
| matrix | 10.135.30.170 | zoat | ssh-matrix |
| halepve | 10.135.30.10 | root | ssh-halepve |
| desire-cache | 10.135.30.250 | root | ssh-desire-cache |

### Key Lessons
- **13:45 UTC** — Should use agents at disposal: spawn Diablo for coding tasks
- **13:57 UTC** — Zoat explicitly corrected: "I told you to use the agents at your disposal... why didn't you just have Diablo do it?"
- **13:59 UTC** — Agent delegation pattern is now a hard rule, not optional

### Current Topic Stack
1. Desire Cache hover fix (active)
2. Matrix room setup (completed)
3. Tempest Cabinet agent identity alignment (completed)

### To Do (Next)
- [ ] Verify hover works correctly on http://10.135.30.250/dc-react/
- [ ] Update ROOMS.md with final room IDs
- [ ] Re-upload avatar in Element (broken URL issue)
