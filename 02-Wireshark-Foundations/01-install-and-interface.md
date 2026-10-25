# 02.01: Installing Wireshark & Interface Tour

**Level:** 🟢 Beginner | **Time:** 1 h | **XP:** 75

## 🎯 Learning Objectives
- Understand what Wireshark is (and isn't)
- Know the components (dumpcap, tshark, Npcap/libpcap)
- Navigate the 3-pane GUI
- Configure name resolution and time display formats

---

## 1. What Is Wireshark?
**Wireshark** is a free, open-source **network protocol analyzer** (GPLv2). It started as *Ethereal* in 1998 (Gerald Combs) and was renamed in 2006. It captures packets and **dissects** thousands of protocols into readable fields.

| Wireshark **is** | Wireshark **is not** |
|---|---|
| A packet capture + analysis tool | An IDS. It doesn't alert by itself (that's Snort) |
| Passive: it only listens | A packet generator or attack tool |
| Great for troubleshooting, forensics, learning | A 24/7 full-packet-capture platform (use Arkime/Zeek) |

| Component | Role |
|---|---|
| **libpcap / Npcap** | Capture library/driver (Linux / Windows) |
| **dumpcap** | Small privileged capture engine used by Wireshark & tshark |
| **Wireshark** | GUI analyzer |
| **tshark** | CLI analyzer (Module 04) |
| **editcap, mergecap, capinfos, text2pcap** | File helpers |
| **.pcap / .pcapng** | File formats. pcapng supports comments and multiple interfaces |

---

## 2. Installation
- **Kali:** done in Module 00 (non-root capture via the `wireshark` group).
- **Windows host (optional):** <https://www.wireshark.org/download.html>, and install **Npcap** when prompted.
- **Ubuntu server:** `sudo apt install tshark`

```bash
wireshark --version | head -1
```

---

## 3. Interface Tour

```
[ Menu: File Edit View Go Capture Analyze Statistics Telephony Wireless Tools Help ]
[ Toolbar: start | stop | restart | open | save | find | zoom | colorize ...      ]
[ Display filter bar:  ip.addr == 10.10.10.20 && tcp                       ->    ]
----------------------------------------------------------------------------------
 (1) PACKET LIST    No. | Time | Source | Destination | Protocol | Length | Info
----------------------------------------------------------------------------------
 (2) PACKET DETAILS > Frame  > Ethernet II  > IPv4  > TCP  > HTTP   (tree)
----------------------------------------------------------------------------------
 (3) PACKET BYTES   0000  08 00 27 ...  hex + ASCII
----------------------------------------------------------------------------------
[ Status bar: expert info | file | Packets: 1234 Displayed: 56 | Profile: Default ]
```

| Pane | What it shows | Pro tip |
|---|---|---|
| **Packet List** | One line per frame | Right-click a column header to add/hide columns |
| **Packet Details** | Protocol tree for the selected frame | Right-click a field → *Apply as Filter* / *Apply as Column* |
| **Packet Bytes** | Raw hex + ASCII | Click a byte to jump to its field |
| **Status bar** | Expert info, packet counts, profile | Click the colored dot to open Expert Info |

| Menu | Use |
|---|---|
| *Capture → Options* (Ctrl+K) | Interfaces, capture filter, ring buffers |
| *Analyze → Expert Information / Decode As / Follow* | Core analysis |
| *Statistics → Protocol Hierarchy / Conversations / Endpoints / I/O Graphs* | Big picture (Module 04) |
| *Edit → Preferences* (Ctrl+Shift+P) | Everything configurable |

---

## 4. Essential Settings

### 4.1 Time display (*View → Time Display Format*)
| Format | Shortcut | Use |
|---|---|---|
| Seconds since beginning of capture | Ctrl+Alt+4 | Default |
| **Seconds since previous displayed packet** | Ctrl+Alt+6 | Spot delays/gaps |
| **UTC date and time of day** | Ctrl+Alt+7 | Forensics: correlate with logs (always UTC!) |

### 4.2 Name resolution (*View → Name Resolution*)
| Option | Effect | Recommendation |
|---|---|---|
| Resolve physical addresses | `08:00:27:..` → `PCSSystemtec_..` (OUI vendor) | ✅ On |
| Resolve network addresses | IP → hostname via DNS | ⚠️ Off. It creates extra DNS traffic, can tip off attackers and slows Wireshark |
| Resolve transport addresses | `443` → `https` | Personal preference |

> 💡 You can define local names without DNS: *View → Name Resolution → Edit Resolved Name*, or create a `hosts` file in your Wireshark profile directory.

### 4.3 Keyboard shortcuts you'll use daily
| Shortcut | Action |
|---|---|
| Ctrl+E | Start/stop capture |
| Ctrl+K | Capture options |
| Ctrl+/ | Jump to the display filter bar |
| Ctrl+G | Go to packet number |
| Ctrl+F | Find packet (string, hex, regex, filter) |
| Ctrl+→ / Ctrl+← | Expand/collapse subtree |
| Ctrl+Alt+Shift+T | Follow TCP stream |
| Ctrl+M | Mark (highlight) packet |
| Ctrl+Shift+N | Next marked packet |
| Ctrl+Alt+C | Add a packet comment |

---

## 5. 🎯 Mission: Interface Scavenger Hunt
1. Start Wireshark on `eth0` and run `ping -c 3 10.10.10.30` and `curl -s http://10.10.10.20 >/dev/null`.
2. Stop the capture (Ctrl+E) and save it as `~/packet-ninja/captures/02-first.pcapng`.
3. Find and write down:
   - [ ] How many packets were captured? (status bar)
   - [ ] The vendor name Wireshark shows for your MAC address
   - [ ] The time between the first ICMP request and its reply (use Ctrl+Alt+6 and filter `icmp`)
   - [ ] Add `ip.ttl` as a column (right-click the TTL field → Apply as Column)
   - [ ] Add a packet comment "my first HTTP request" to the HTTP GET
   - [ ] Open *Statistics → Capture File Properties*: what's the capture duration?

---

## 🧠 Knowledge Check
1. Which component actually captures the packets?
2. Why should you disable network name resolution during an investigation?
3. Which time format do you use to correlate a capture with server logs?

<details><summary>Answers</summary>

1. `dumpcap` (using libpcap/Npcap).
2. It generates DNS queries (noise in the capture, can alert attackers who watch their DNS logs, adds delay), and the results may be wrong.
3. UTC date and time of day.
</details>

---
⬅️ [Module 01](../01-Networking-Fundamentals/cheatsheet.md) | ➡️ [02 Capturing Traffic](02-capturing-traffic.md)

