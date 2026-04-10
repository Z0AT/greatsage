# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

### Home Lab Notes

- Home Assistant VM is `101` on `halepve`.
- HA USB passthrough:
  - `10c4:ea70` → Silicon Labs CP2105 Dual UART Bridge, used for Z-Wave.
  - `8087:0026` → Intel Bluetooth, intended for future Bluetooth-capable device support.
  - `303a:831a` → previous Wi-Fi-related path that did not become the preferred HA connectivity approach.
- HA network intent: keep HA inherently present on the IoT layer rather than depending on Wi-Fi bridging hacks, while retaining trusted/admin-side management access.
- UniFi access additions exist under `/secrets`, including API credentials for UniFi controller access. Current preferred pattern is API-key based access using `X-API-KEY` against the local UniFi controller endpoint (example shape: `https://192.168.1.1/proxy/network/integration/v1/...`). `unifi-local` remains a local-only SSH path if low-level access is ever specifically needed, but API access is preferred.

### OpenClaw Gateway

- **Mode:** local, loopback, port 18789
- **Channels:** Matrix (encrypted), Mattermost (dmPolicy pairing)
- **Matrix rooms:** Great Sage=`!hkyahtREOAtnlNxWkv`, Diablo=`!UhMnLEXMLLIkOMmEXD`, Souei=`!zqVnKIPHlTQnoBAstt` (all encrypted)
- **Ollama auth:** Device-bound via `ollama signin`, OpenClaw config uses `api_key` mode
- **Model stack:** `glm-5.1:cloud` (primary), `qwen3-coder-next:cloud` (coding), `gemma4:31b-cloud` (lightweight), `openai-codex/gpt-5.4` (fallback)
- **Web search:** SearXNG at `10.135.30.251:8080` (Docker LXC CT 100 on halepve)

### SearXNG Setup

- **Host:** PVE LXC CT 100 (`searxng`, 10.135.30.251:8080)
- **Docker image:** `searxng/searxng`
- **Config:** `/opt/searxng/core-config/settings.yml`
- **Fixes applied:**
  - Disabled rate limiter for LAN/programmatic access
  - Fixed YAML: `formats: [html, json]`
- **OpenClaw binding:** `provider: searxng`, `baseUrl: http://10.135.30.251:8080`

### Tempest Cabinet (Multi-Agent Setup)

| Agent | Role | Model | Workspace | GitHub | Room |
|---|---|---|---|---|---|
| Great Sage | Analysis, Ciel evolution path | `ollama/glm-5.1:cloud` | `~/.openclaw/workspace` | Z0AT/greatsage | `!hkyahtREOAtnlNxWkv` |
| Diablo | Coding, execution, technical work | `ollama/qwen3-coder-next:cloud` | `~/.openclaw/workspace-diablo` | Z0AT/diablo | `!UhMnLEXMLLIkOMmEXD` |
| Geld | Infrastructure, DevOps | `ollama/gemma4:31b-cloud` | `~/.openclaw/workspace-geld` | Z0AT/geld | (none) |
| Souei | Research, web searches, intelligence | `ollama/glm-5.1:cloud` | `~openclaw/workspace-souei` | Z0AT/souei | `!zqVnKIPHlTQnoBAstt` |
| Rigurd | Admin, housekeeping, heartbeat | `ollama/gemma4:31b-cloud` | `~/.openclaw/workspace-rigurd` | Z0AT/rigurd | (none) |
| Cicil | General purpose (备用) | `ollama/gemma4:31b-cloud` | `~/.openclaw/workspace-cicil` | (none) | (none) |

- All agent configs backed up to GitHub
- Each agent has dedicated workspace with SOUL.md, AGENTS.md, USER.md
- Agent authorization via `tools:profile` and `alsoAllow` settings
- Agent naming follows Tempest theme (Rimiru's companions)

### Desire Cache (React Pivot)

- **Host:** 10.135.30.250 (desire-cache, PVE container)
- **Path:** `/opt/desire-cache-react-pivot/`
- **Web URL:** `http://10.135.30.250/dc-react/`
- **Source:** `~/.openclaw/workspace/react-pivot/`
- **Build:** `VITE_BASE_PATH=/dc-react/ npm run build`
- **Deploy:** `tar czf /tmp/dc-react-deploy.tar.gz . && scp -i ~/.config/openclaw/secrets/ssh-desire-cache /tmp/dc-react-deploy.tar.gz desire-cache:/opt/desire-cache-react-pivot/`

### SSH Hosts

- **desire-cache** → 10.135.30.250, root, identity: `~/.config/openclaw/secrets/ssh-desire-cache`
- **halepve** → Local PVE host (halepve), used for CT/VM management
- **unifi-local** → Local-only SSH if low-level UniFi access needed (API preferred)

### Matrix Room IDs

| Room | ID | Purpose |
|---|---|---|
| Great Sage (main) | `!hkyahtREOAtnlNxWkv:matrix.aualaohana.com` | Primary chat, analysis, evolution |
| Diablo | `!UhMnLEXMLLIkOMmEXD:matrix.aualaohana.com` | Coding, execution, technical |
| Souei | `!zqVnKIPHlTQnoBAstt:matrix.aualaohana.com` | Research, web searches, intelligence |

- All rooms encrypted (m.megolm.v1.aes-sha2)
- Owner/Admin: `@zoat:matrix.aualaohana.com`
- Bot: `@greatsage:matrix.aualaohana.com`

### Credential Locations

- **Matrix access token:** `~/.openclaw/openclaw.json` (encrypted in config)
- **SSH keys:** `~/.config/openclaw/secrets/ssh-*`
- **UniFi API keys:** `~/.openclaw/secrets/` (unifi-api-key, unifi-local-ssh)

### CLI Commands

```bash
# Gateway
openclaw gateway status
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw config validate
openclaw agents list --bindings
openclaw channels status --probe

# Build and deploy Desire Cache
VITE_BASE_PATH=/dc-react/ npm run build
cd dist && tar czf /tmp/dc-react-deploy.tar.gz .
scp -i ~/.config/openclaw/secrets/ssh-desire-cache /tmp/dc-react-deploy.tar.gz desire-cache:/opt/desire-cache-react-pivot/
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
