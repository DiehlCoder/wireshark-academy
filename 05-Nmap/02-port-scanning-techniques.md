# 05.02: Port Scanning Techniques & Packet Signatures

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Master Nmap's 6 port states: `open`, `closed`, `filtered`, `unfiltered`, `open|filtered`, `closed|filtered`
- Dissect the packet exchanges of **SYN Scan (`-sS`)** vs. **Connect Scan (`-sT`)**
- Understand stealth scans: **FIN (`-sF`)**, **NULL (`-sN`)**, and **Xmas (`-sX`)** based on RFC 793
- Analyze **UDP Scanning (`-sU`)** and understand why it is notoriously slow
- Map firewall filtering rules using **TCP ACK Scan (`-sA`)**

---

## 1. Nmap's Six Port States

When Nmap tests a port, it categorizes the result into one of six states:

| Port State | What it means technically | What the target returned |
|---|---|---|
| **`open`** | A service is actively listening and accepting connections. | `SYN/ACK` (TCP) or UDP application response. |
| **`closed`** | Port is accessible, but no service is listening. | `RST` (TCP) or `ICMP Port Unreachable` (UDP). |
| **`filtered`** | A firewall / ACL blocked the probe; Nmap cannot tell if port is open. | **No response** (packet dropped) or `ICMP Type 3 Code 13` (Admin Prohibited). |
| **`unfiltered`** | Port is accessible, but whether it is open or closed is undetermined. | `RST` response in an ACK scan. |
| **`open\|filtered`** | Inconclusive; could be open or could be a packet-filtering firewall. | No response received in UDP, FIN, NULL, or Xmas scans. |
| **`closed\|filtered`** | Inconclusive between closed or filtered (IP ID idle scans). | Ambiguous response. |

---

## 2. SYN ("Stealth") Scan vs. TCP Connect Scan

### 2.1 TCP SYN Scan (`sudo nmap -sS <target>`)
The default and most popular scan. Requires `root` or administrator privileges because Nmap crafts raw TCP packets:

```
Scanner (Kali)                                       Target
   ├─── TCP SYN (DstPort: 80) ─────────────────────────►│
   │◄── TCP SYN/ACK (Port is OPEN!) ────────────────────┤
   ├─── TCP RST (RST sent immediately; no ACK!) ───────►│ (Connection aborted!)
```
- **Why "Stealth"?** The full 3-way handshake is **never completed**. 
- Because an application connection was never established, older web servers and daemons did not generate a log entry in their application logs (though modern firewalls and IDSs easily detect it!).

### 2.2 TCP Connect Scan (`nmap -sT <target>`)
Used when the user does not have raw packet privileges (non-root):

```
Scanner (Kali)                                       Target
   ├─── TCP SYN (DstPort: 80) ─────────────────────────►│
   │◄── TCP SYN/ACK ────────────────────────────────────┤
   ├─── TCP ACK (Connection ESTABLISHED!) ─────────────►│ <--- Application logs connection!
   ├─── TCP RST+ACK (Disconnect) ──────────────────────►│
```
- Completes the full OS-level handshake via the standard `connect()` system call.
- Generates substantial log noise on the target server.

---

## 3. RFC 793 Stealth Inversion Scans: NULL, FIN & Xmas

These scans exploit a subtle clause in the original TCP specification (RFC 793, Page 65):
> *"If the state is CLOSED, an incoming segment not containing a RST causes a RST to be sent in response. If the state is LISTEN or SYN-RECEIVED, incoming segments without SYN, RST, or ACK are silently ignored."*

| Scan Type | Flag Syntax | TCP Flags Set | Wire Signature |
|---|---|---|---|
| **NULL Scan** | `-sN` | None (`0x00`) | No flags set at all (`tcp.flags == 0`) |
| **FIN Scan** | `-sF` | `FIN` (`0x01`) | Only FIN set |
| **Xmas Scan** | `-sX` | `FIN + PSH + URG` (`0x29`) | "Lit up like a Christmas tree" (`tcp[13] == 0x29`) |

```
If Port is CLOSED: ─────► Target replies with TCP RST.
If Port is OPEN:   ─────► Target SILENTLY DROPS probe (open|filtered).
```

> ⚠️ **The Windows Exception:** Microsoft Windows, Cisco IOS, and BSD systems **do not strictly adhere to RFC 793**. They respond with a `RST` to any unexpected packet regardless of whether the port is open or closed. Therefore, NULL, FIN, and Xmas scans **only work against standard Linux, Unix, and macOS targets**.

---

## 4. UDP Scanning (`-sU`) & ICMP Rate-Limiting

Scanning UDP is challenging because UDP has no handshake:

```
Scanner (Kali)                                       Target
   ├─── Empty UDP Datagram (DstPort: 53) ──────────────►│
   │◄── UDP DNS Response (Port is OPEN!) ───────────────┤ (Definitive open)
   │                                                    │
   ├─── Empty UDP Datagram (DstPort: 44444) ───────────►│
   │◄── ICMP Type 3 Code 3 (Port Unreachable) ──────────┤ (Definitive closed)
   │                                                    │
   ├─── Empty UDP Datagram (DstPort: 161) ─────────────►│
   │    [ ... silence / packet dropped ... ]            │ (open|filtered)
```

### Why UDP scans take hours:
Linux kernels enforce strict **ICMP Destination Unreachable rate-limiting** (RFC 1812) to prevent denial of service (typically limiting ICMP errors to 1 per second). Scanning all 65,535 UDP ports would take over 18 hours! 
**Best Practice:** Always scan specific known UDP ports: `nmap -sU -p 53,67,68,69,123,161,500 <target>`.

---

## 5. 🎯 Mission: Capture and Compare Scans in Wireshark

### Step 1: Observe a TCP SYN Scan
1. On Kali, start Wireshark on `eth0`, filter: `tcp.port == 80`.
2. Run a SYN scan against Ubuntu Server:
   ```bash
   sudo nmap -sS -p 80 10.10.10.20
   ```
3. In Wireshark, verify the 3-packet sequence:
   - Packet 1: `SYN` (Kali ➔ Ubuntu)
   - Packet 2: `SYN, ACK` (Ubuntu ➔ Kali)
   - Packet 3: `RST` (Kali ➔ Ubuntu) — **No third handshake ACK!**

### Step 2: Observe a TCP Connect Scan
1. In Wireshark, keep filter: `tcp.port == 80`.
2. Run a Connect scan:
   ```bash
   nmap -sT -p 80 10.10.10.20
   ```
3. In Wireshark, note that Packet 3 is an `ACK` (completing the handshake), followed immediately by a `RST+ACK` to tear down the connection.

### Step 3: Observe a Xmas Scan
1. Filter in Wireshark: `tcp.flags == 0x29 || tcp.flags.reset == 1`.
2. Run an Xmas scan against an open port (80) and a closed port (9999) on Metasploitable2:
   ```bash
   sudo nmap -sX -p 80,9999 10.10.10.30
   ```
3. In Wireshark:
   - Notice the probe packets with `[FIN, PSH, URG]` set.
   - Closed port 9999 returns a `RST`.
   - Open port 80 returns **complete silence**!

---

## 💼 Business Corner: Network Security Auditing & IDS Alerting
Every organization must maintain an approved matrix of exposed network services.
When conducting authorized vulnerability assessments:
- Always notify the SOC ahead of time ("Change Request / Maintenance Window").
- Port scans trigger high-severity alerts in SIEMs and Intrusion Detection Systems (e.g. Snort rule: *"Inbound SYN scan detected"*).
- If an unannounced scan is launched during business hours, automated firewall intrusion rules may blacklist the tester's IP or accidentally overload sensitive legacy ICS/SCADA equipment in factory environments!

---

## 🧠 Knowledge Check
1. What packet does Nmap send in response to a `SYN/ACK` during a `-sS` SYN scan?
2. Why does a `-sT` Connect scan generate more log evidence on the target server than a `-sS` scan?
3. How does an Xmas scan determine if a port is closed on a compliant Linux server?
4. Why do NULL, FIN, and Xmas scans fail to distinguish open from closed ports on Windows operating systems?

<details><summary>Answers</summary>

1. A TCP RST (Reset) packet, terminating the half-open connection immediately.
2. Because it completes the full 3-way handshake via the operating system's `connect()` API, creating an active connection that application-layer daemons log.
3. The closed port replies with an immediate TCP RST packet.
4. Microsoft Windows does not comply with the RFC 793 exception and responds with a RST to all unexpected probes, regardless of whether the port is open or closed.
</details>

---
⬅️ [01 Host Discovery](01-host-discovery.md) | ➡️ [03 Service & OS Detection](03-service-and-os-detection.md)
