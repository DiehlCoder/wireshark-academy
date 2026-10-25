# 08.05: Network Forensics & Incident Response (IR) Playbook

**Level:** 🔴 Advanced | **Time:** 2.5 h | **XP:** 200

## 🎯 Learning Objectives
- Execute the NIST SP 800-61r2 Incident Response lifecycle using packet-level evidence
- Maintain strict legal **Chain of Custody** and evidence hashing standards
- Correlate network timestamps with host logs to identify **Patient Zero**
- Trace **Lateral Movement** (East-West traffic) across enterprise subnets
- Execute the 10-Step PCAP Forensic Triage Checklist under simulated incident pressure

---

## 1. The Incident Response Lifecycle (NIST SP 800-61r2)

Network packet captures are the single most authoritative source of truth during an incident:
- Endpoints can have their event logs wiped by rootkits.
- Attackers can modify files and timestamps on disk (timestomping).
- **Packets on the wire do not lie.**

```
┌──────────────┐     ┌───────────────────────┐     ┌─────────────┐
│ 1.PREPARATION├────►│2. DETECTION & ANALYSIS├────►│3.CONTAINMENT│
└──────────────┘     └───────────┬───────────┘     └──────┬──────┘
                                 │                        │
                                 │ (Wireshark Forensics)   ▼
┌──────────────┐     ┌───────────▼───────────┐     ┌─────────────┐
│6. POST-MORTEM│◄────┤      5. RECOVERY      │◄────┤4.ERADICATION│
└──────────────┘     └───────────────────────┘     └─────────────┘
```

---

## 2. Evidence Integrity & Chain of Custody

Before opening an incident capture file in any analysis tool:

### 2.1 Cryptographic Hash Verification
Generate and record cryptographic checksums immediately upon capture acquisition:
```bash
sha256sum incident_capture.pcapng | tee incident_capture.sha256
```

### 2.2 Forensic Rules of Engagement:
1. **Never analyze the master file directly.** Mark the original capture file as read-only (`chmod 400 incident_capture.pcapng`) and archive it in secure storage.
2. **Make a working copy:** Perform all carving, filtering, and slicing on a duplicate working copy.
3. **UTC Timestamps Only:** Ensure all tools and Wireshark displays are configured to **UTC** (`Ctrl + Alt + 7`) to prevent catastrophic timeline errors caused by Daylight Saving Time or differing server time zones.

---

## 3. The 10-Step PCAP Forensic Triage Checklist 📋

When handed an unknown forensic capture during an active security incident, follow this systematic 10-step protocol:

| Step | Action | Tool / Filter | Goal |
|---|---|---|---|
| **1** | **Integrity** | `sha256sum <file>` | Record hash in evidence log |
| **2** | **Metadata** | `capinfos <file>` | Duration, packet count, capture point |
| **3** | **Hierarchy** | *Statistics ➔ Protocol Hierarchy* | High-level protocol inventory & anomalies |
| **4** | **Top Talkers**| *Statistics ➔ Conversations (IPv4)* | Identify hosts with highest byte transfer |
| **5** | **DNS Audit** | `dns.flags.rcode != 0 \|\| dns.qry.type == 16` | C2 domains, DGA spikes, TXT tunneling |
| **6** | **Web / TLS** | `http.request \|\| tls.handshake.type == 1` | Hostnames, unusual User-Agents, SNIs |
| **7** | **Scans** | `tcp.flags.syn==1 && tcp.flags.ack==0` | Port scanning, reconnaissance sweeps |
| **8** | **Credentials**| `http.authorization \|\| ftp.request.command=="PASS"` | Harvested passwords on the wire |
| **9** | **Carve Files**| *File ➔ Export Objects ➔ HTTP/SMB* | Extract downloaded malware or exfiltrated files |
| **10**| **Report IOCs**| Markdown / Case Notes | Compile IPs, domains, hashes, and timeline |

---

## 4. 🎯 Mission: The Multi-Stage Breach Investigation

You have been supplied with an incident capture file (`attack_simulation.pcap` generated in Module 07.04). 
Assume the role of Lead DFIR Analyst and reconstruct the attacker's timeline.

### Step 1: File Verification
```bash
cd ~/packet-ninja/captures/
capinfos attack_simulation.pcap
sha256sum attack_simulation.pcap
```
Record the SHA-256 hash and packet count in your journal.

### Step 2: Determine Attacker IP (Patient Zero)
1. Open the PCAP in Wireshark.
2. Open *Statistics ➔ Conversations ➔ IPv4*.
3. Identify the external IP address initiating connections to the internal servers.

### Step 3: Reconstruct the Chronological Incident Timeline
Filter by conversation and reconstruct the attacker's sequence of actions:

| Timestamp (UTC) | Source IP | Destination IP | Protocol | Attacker Action / Observed Attack |
|---|---|---|---|---|
| `HH:MM:SS.xxx` | `10.10.10.10` | `10.10.10.20` | HTTP | Directory traversal attempt targeting `/etc/passwd` |
| `HH:MM:SS.xxx` | `10.10.10.10` | `10.10.10.20` | HTTP | Shellshock RCE probe injected into User-Agent |
| `HH:MM:SS.xxx` | `10.10.10.10` | `10.10.10.20` | HTTP | Command injection attempt (`whoami`) in POST body |
| `HH:MM:SS.xxx` | `10.10.10.10` | `10.10.10.20` | FTP | Anonymous authentication probe on port 21 |

### Step 4: Draft Containment Recommendations
Based on the packet evidence, write 3 concrete remediation actions for the firewall and system engineering teams:
1. Block source IP at the edge firewall.
2. Upgrade web server and patch Bash vulnerability (Shellshock).
3. Disable anonymous FTP access on the server daemon.

---

## 💼 Business Corner: The GDPR 72-Hour Breach Notification Clock
Under **Article 33 of the European General Data Protection Regulation (GDPR)**:
> *"In the case of a personal data breach, the controller shall without undue delay and, where feasible, not later than **72 hours** after having become aware of it, notify the supervisory authority."*

### Why Network Forensics Determines Legal Liability:
If an attacker compromises a healthcare or financial database:
- **Without network captures:** The company cannot prove what data was taken. Regulators must assume that **100% of the customer database (millions of records)** was exfiltrated. Maximum fines apply (up to €20,000,000 or 4% of global turnover).
- **With network captures:** The forensic team proves via PCAP analysis that while the attacker breached the server, total outbound data exfiltration was limited to **14.2 KB** (system diagnostic logs), and zero customer database records were transferred across the wire. Fines are drastically minimized or eliminated!

---

## 🧠 Knowledge Check
1. Why must network capture analysis always be performed in the UTC time standard?
2. What is the very first action an analyst must perform upon receiving a forensic PCAP file?
3. In the NIST incident response lifecycle, how does packet analysis assist the Containment phase?
4. How can packet evidence prove that customer data was NOT exfiltrated during a confirmed database breach?

<details><summary>Answers</summary>

1. To ensure flawless time correlation with servers, firewalls, and cloud systems located across different geographical time zones, avoiding discrepancies caused by local time shifts and Daylight Saving Time.
2. Calculate and record the cryptographic hash (SHA-256) of the file to establish evidence integrity and legal chain of custody.
3. It identifies all IP addresses, domain names, and compromised user accounts associated with the attacker, allowing firewall administrators to block exact Indicators of Compromise (IOCs).
4. By analyzing total byte volume and outbound streams from the database server; if no large outbound data transfers occurred during the intrusion window, forensics proves no bulk records left the network.
</details>

---
⬅️ [04 Malware & C2 Traffic](04-malware-c2-traffic-analysis.md) | ➡️ [Module 08 Cheat Sheet](cheatsheet.md) | ➡️ [Module 09](../09-Professional-Practice/01-legal-ethics-business-value.md)
