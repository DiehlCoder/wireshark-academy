# 02.05: Profiles, Custom Columns & Coloring Rules

**Level:** 🟢→🟡 | **Time:** 1 h | **XP:** 75

## 🎯 Learning Objectives
- Build customized Wireshark configuration **Profiles** for different roles (Security, Troubleshooting, Voice)
- Add powerful **Custom Columns** to the Packet List (Stream ID, TCP Delta Time, HTTP Host / TLS SNI)
- Create custom **Coloring Rules** to visually detect anomalies instantly
- Export, import, and backup your customized configuration profiles

---

## 1. Why Profiles Matter

By default, Wireshark opens with generic columns: `No. | Time | Source | Destination | Protocol | Length | Info`.
This layout is suboptimal for both security investigations and deep troubleshooting:
- You cannot see the destination port without expanding the packet details.
- You cannot see the TCP Stream index to know which conversation a packet belongs to.
- HTTP and TLS domain names are buried inside the lower panes.

Wireshark allows you to create **Profiles**. A profile stores:
- Column layouts
- Coloring rules
- Custom filter buttons
- Protocol preferences (e.g., custom port mappings, RSA keys)
- Recent filter history

You can switch profiles with one click in the bottom-right corner of the status bar.

---

## 2. Setting Up an "Analyst" Profile

### 2.1 Create the Profile
1. Look at the bottom-right corner of the Wireshark window (where it says `Profile: Default`).
2. Right-click `Profile: Default` ➔ **Manage Profiles...** (or menu *Edit ➔ Configuration Profiles...*).
3. Click the `+` button, enter the name `Security-Analyst`, and click **OK**.
4. Wireshark instantly switches to this new profile. Any modifications you make now will only affect this profile.

---

## 3. Customizing Columns

Let's build a layout that shows critical protocol metadata directly in the packet list.

### 3.1 Recommended Column Layout
| Column Title | Type | Field | Justification |
|---|---|---|---|
| **No.** | Number | *(built-in)* | Frame reference |
| **Delta (prev)** | Delta time | *(built-in)* | Highlights latency spikes and stalls |
| **Src IP** | Custom | `ip.src` | Clear sender address |
| **Src Port** | Custom | `tcp.srcport || udp.srcport` | Sender port |
| **Dst IP** | Custom | `ip.dst` | Target address |
| **Dst Port** | Custom | `tcp.dstport || udp.dstport` | Target service (80, 443, 22...) |
| **Stream** | Custom | `tcp.stream` | Conversation index (crucial for filtering) |
| **Host / SNI** | Custom | `http.host || tls.handshake.extensions_server_name` | Identifies web destinations immediately |
| **Info** | Information | *(built-in)* | High-level packet summary |

### 3.2 How to Add a Custom Column
**Method A (Direct from Details pane — fastest!):**
1. Click any packet containing the field you want (e.g. click a TCP packet, expand `Transmission Control Protocol`).
2. Right-click the field (e.g., `Stream index: 0`).
3. Select **Apply as Column**.
4. Right-click the newly created column header to rename it.

**Method B (Preferences menu):**
1. Go to *Edit ➔ Preferences ➔ Appearance ➔ Columns*.
2. Click `+` at the bottom of the list.
3. Set the Title (e.g., `Dst Port`), change Type to `Custom`, and set Field to `tcp.dstport || udp.dstport`.
4. Drag and drop rows to reorder columns.

---

## 4. Custom Coloring Rules

Wireshark evaluates coloring rules from **top to bottom**. The first rule that matches a packet sets its foreground and background colors.

Open coloring rules: *View ➔ Coloring Rules...* (or click the coloring icon on the toolbar).

### Recommended Security Rules
Click `+` to add these rules, and drag them near the **top** of the list:

| Rule Name | Filter Expression | Background | Foreground | Reason |
|---|---|---|---|---|
| 🚨 **TCP Reset** | `tcp.flags.reset == 1` | Dark Red | White | Closed ports, rejected connections |
| ⚠️ **TCP Retrans** | `tcp.analysis.retransmission` | Orange | Black | Packet loss, congested links |
| ⚠️ **TCP ZeroWin** | `tcp.analysis.zero_window` | Dark Yellow | Black | Receiver bottleneck / buffer exhaustion |
| 🛡️ **SYN Scan** | `tcp.flags.syn == 1 && tcp.flags.ack == 0` | Cyan | Black | New connection attempts / port scanning |
| 💣 **Bad Flags** | `tcp.flags == 0 || tcp.flags == 0x29` | Magenta | White | NULL or Xmas stealth scans |
| 🔑 **Cleartext Creds** | `http.authorization || ftp.request.command in {"USER","PASS"}` | Bright Red | White | Plaintext credential exposure |
| ❓ **DNS Errors** | `dns.flags.rcode != 0` | Purple | White | NXDOMAIN, Server Failures |

> 💡 **Tip:** To temporarily disable coloring rules and see uncolored raw packets, press `Ctrl + \` (or *View ➔ Colorize Packet List*).

---

## 5. Profile Location & Backup

Wireshark stores profiles as standard text files on your file system:
- **Linux:** `~/.config/wireshark/profiles/<Profile-Name>/`
- **Windows:** `%APPDATA%\Wireshark\profiles\<Profile-Name>\`

Important files inside each profile directory:
- `preferences`: Column setup, protocol settings
- `colorfilters`: Your custom coloring rules
- `dfilter_buttons`: Custom filter buttons

You can zip this folder and share it with your entire SOC or copy it to a new laptop!

---

## 6. 🎯 Mission: Configure and Verify Your Analyst Profile

1. On **Kali**, open Wireshark and create the profile `Security-Analyst`.
2. Add the columns:
   - `Dst Port` (`tcp.dstport || udp.dstport`)
   - `Stream` (`tcp.stream`)
3. Add at least two custom coloring rules:
   - Name: `RST-Red`, Filter: `tcp.flags.reset==1`, Background: Red, Text: White
   - Name: `SYN-Cyan`, Filter: `tcp.flags.syn==1 && tcp.flags.ack==0`, Background: Cyan, Text: Black
4. Generate traffic from Kali:
   ```bash
   # SYN to open web port
   curl -I http://10.10.10.20/
   # SYN to closed port to trigger RST
   nc -zv 10.10.10.20 9999
   ```
5. Verify in the Packet List:
   - Does the initial SYN show in Cyan?
   - Does the RST response show in Red?
   - Does the `Dst Port` column show `80` and `9999` clearly?

---

## 💼 Business Corner: Standard Operating Environment (SOE)
In a modern SOC (Security Operations Center), junior and senior analysts must review incident alerts consistently. If each analyst looks at an uncustomized default Wireshark, triage errors occur because critical details (like high TCP delta time or port anomalies) are overlooked.

Top cybersecurity consulting firms maintain a standardized **"Corporate Forensics Profile"** git repository. When a new analyst joins the team, they pull the repository into their `~/.config/wireshark/profiles/` directory and immediately see the same colors, columns, and filter buttons as the tier-3 leads.

---

## 🧠 Knowledge Check
1. Where in the Wireshark GUI can you see and switch your active configuration profile?
2. If two coloring rules match the same packet, which rule wins?
3. How do you combine TCP and UDP destination ports into a single custom column?
4. What happens to the `Default` profile when you create and modify a new profile?

<details><summary>Answers</summary>

1. In the bottom-right corner of the status bar.
2. The rule positioned higher up in the list (first match wins).
3. Set the Field expression to `tcp.dstport || udp.dstport`.
4. Nothing; the changes are isolated to the active new profile directory.
</details>

---
⬅️ [04 Display Filters](04-display-filters.md) | ➡️ [Module 02 Cheat Sheet](cheatsheet.md) | ➡️ [Module 03](../03-Protocol-Analysis/01-ethernet-and-arp.md)
