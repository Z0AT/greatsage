# TEMPEST CABINET - Room Assignments

| Agent | Role | Room ID | Encrypted |
|---|---|---|---|
| Great Sage | Analysis, Ciel evolution path | `!hkyahtREOAtnlNxWkv:matrix.aualaohana.com` | ✅ |
| Diablo | Coding / execution | `!UhMnLEXMLLIkOMmEXD:matrix.aualaohana.com` | ✅ |
| Souei | Research / intelligence | `!zqVnKIPHlTQnoBAstt:matrix.aualaohana.com` | ✅ |
| Geld | Infrastructure / construction | *TBD* | ✅ (pending creation) |
| Rigurd | Administration / housekeeping | *TBD* | ✅ (pending creation) |

### Notes

- All rooms are encrypted (m.megolm.v1.aes-sha2)
- Owner/Admin: `@zoat:matrix.aualaohana.com`
- Bot: `@greatsage:matrix.aualaohana.com` (moderator permissions)
- Room creation order: Great Sage → Diablo → Souei → Geld → Rigurd

### Creating New Rooms (Manual Steps)

1. Open Element → Create Room → "Private room, invite people"
2. Set room alias (optional): `geld` or `rigurd` under `matrix.aualaohana.com`
3. Invite `@greatsage:matrix.aualaohana.com` and set to **Moderator**
4. Enable encryption (Room Settings → Security & Privacy → Enable Encryption)
5. Copy room ID from Room Settings → Advanced → Room ID
6. Add to this file and update MEMORY.md in each agent's workspace