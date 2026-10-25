# 10.03: Capstone Solution Guide & Incident Walkthrough

**Level:** 🔴 Pro | **XP:** 250 (Total Module 10 XP: 500!)

> ⚠️ **CONFIDENTIAL - FORENSIC SOLUTION KEY**
> Review this solution guide **only after** attempting all 15 questions in the [Investigation Workbook](02-investigation-workbook.md).

---

## 🔍 Phase 1: Reconnaissance & Discovery Solutions

### Question 1: Attacker IP & MAC
- **Attacker IP:** `10.10.10.10`
- **Attacker MAC:** Oracle VirtualBox OUI (`08:00:27:...`) belonging to Kali interface `eth0`.
- **Wireshark Filter:** `arp.src.proto_ipv4 == 10.10.10.10 || (tcp.flags.syn == 1 && tcp.flags.ack == 0)`

### Question 2: Scan Technique
- **Scan Type:** **TCP SYN (Stealth / Half-Open) Scan (`-sS`)**
- **Packet Proof:** When Ubuntu Server replied with `SYN, ACK` on port 80/22, the attacker's machine immediately responded with a **`RST` (Reset)** packet. The third handshake `ACK` was never sent, proving the connection was aborted to avoid logging.

### Question 3: Open Ports Discovered
- **Open Ports:** **`22 (SSH)`** and **`80 (HTTP)`** (Both returned `SYN, ACK`).
- **Wireshark Filter:** `ip.src == 10.10.10.20 && tcp.flags.syn == 1 && tcp.flags.ack == 1`

---

## 🔑 Phase 2: Infiltration & Credential Harvesting Solutions

### Question 4: Target Protocol
- **Target Protocol:** **FTP (File Transfer Protocol)** | **Port:** `21`

### Question 5: Cleartext Credentials
- **Username:** `msfadmin`
- **Password:** `msfadmin`
- **Wireshark Filter:** `ftp.request.command in {"USER", "PASS"}`

### Question 6: Subsequent Command
- **Command:** `LIST` (Attacker attempted to list root directory contents).
- **Wireshark Filter:** `ftp.request.command == "LIST"`

---

## 🌐 Phase 3: Web Application Exploitation Solutions

### Question 7: Requested Resource
- **Target URI:** `/search.php?query=1%20UNION%20SELECT%20username,password%20FROM%20users`
- **Wireshark Filter:** `http.request.uri contains "search.php"`

### Question 8: Exploit Technique & Payload
- **Attack Category:** **SQL Injection (SQLi) - UNION-Based**
- **Exact Payload:** `1 UNION SELECT username,password FROM users`
- **Wireshark Filter:** `http.request.uri contains "UNION"`

### Question 9: Anomalous User-Agent
- **User-Agent String:** `Mozilla/5.0 (Rogue-Infiltrator/2.4)`
- **Wireshark Filter:** `http.user_agent contains "Rogue-Infiltrator"`

---

## 🚨 Phase 4: Staged Credentials Solutions

### Question 10: Staged POST Credentials
- **Submitted Username:** `dr_evans`
- **Submitted Password:** `PatientRecords2026!`
- **Stolen Token:** `SUPERSECRET`
- **Wireshark Filter:** `http.request.method == "POST"`
- **Details Pane:** Under `HTML Form URL Encoded`, inspect the submitted key-value pairs.

### Question 11: Server HTTP Response Status
- **HTTP Status Code:** `200 OK` (or `405 Method Not Allowed` depending on Apache mod_rewrite config).
- **Wireshark Filter:** `http.response && ip.src == 10.10.10.20`

---

## 📡 Phase 5: Covert Data Exfiltration Solutions

### Question 12: Covert Channel Protocol
- **Protocol:** **ICMP (Internet Control Message Protocol) Echo Request**

### Question 13: Decoded ASCII Payload
- **Decoded ASCII Payload:** **`DB_EXFIL_PATIENT_DATA`**
- **Hex bytes in payload:** `44 42 5f 45 58 46 49 4c 5f 50 41 54 49 45 4e 54 5f 44 41 54 41`
- **Wireshark Filter:** `icmp.type == 8 && data.len > 10`
- **Details Pane:** Expand `Internet Control Message Protocol` ➔ `Data (21 bytes)`.

### Question 14: Total Exfiltration Packets
- **Packet Count:** **`4 packets`** (4 ICMP Echo Requests sent).

---

## 🛡️ Phase 6: Detection Engineering Solutions

### Question 15: Production Snort Rules

#### Rule A: Web SQL Injection Rule
```conf
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (
  msg:"WEB-ATTACK SQL Injection UNION SELECT in URI";
  flow:to_server,established;
  http_uri;
  content:"UNION"; nocase;
  content:"SELECT"; nocase;
  classtype:web-application-attack;
  sid:1000050; rev:1;
)
```

#### Rule B: Covert ICMP Data Exfiltration Rule
```conf
alert icmp $EXTERNAL_NET any -> $HOME_NET any (
  msg:"EXFIL Covert ICMP Echo Payload Data Detected";
  itype:8;
  content:"DB_EXFIL_PATIENT_DATA";
  classtype:bad-traffic;
  sid:1000051; rev:1;
)
```

---

## 📄 Model Executive Summary for CISO / Board

```markdown
# EXECUTIVE INCIDENT BRIEFING
**Case:** INC-2026-8819 | **Date:** 2026-10-16 | **Status:** CONTAINED
**To:** Board of Directors, MedTech Innovations AG
**From:** Kira D., Lead Digital Forensics & Incident Response Investigator

### 1. Executive Summary
On 2026-10-16, an unauthorized internal workstation (IP: 10.10.10.10) conducted a multi-stage breach against MedTech corporate intranet systems. The adversary executed network reconnaissance, harvested administrative credentials from an unencrypted legacy firmware server, and performed a UNION-based SQL injection attack against the internal medical search portal. 

Stolen physician credentials belonging to Dr. Evans were submitted, and proprietary database records were exfiltrated off the network disguised as ICMP ping packets.

### 2. Forensic Findings & Scope
- **Patient Zero:** Workstation `10.10.10.10` (MAC: 08:00:27:xx:xx:xx).
- **Target Assets:** `10.10.10.20` (Intranet Web Server), `10.10.10.30` (Legacy Firmware Server).
- **Exfiltrated Data Volume:** Four ICMP payload frames containing database identifier strings (`DB_EXFIL_PATIENT_DATA`). Full bulk database export was successfully interrupted prior to completion.

### 3. Immediate Remediation Actions Taken
1. Rogue IP `10.10.10.10` has been quarantined at the switch port level.
2. Insecure plaintext FTP daemon on `10.10.10.30` has been disabled; credentials for `msfadmin` and `dr_evans` have been revoked.
3. Snort NIDS detection signatures (SID 1000050 & 1000051) have been deployed across internal core sensor nodes.
```

---

## 🏆 Capstone Completed: +500 XP!
Congratulations on successfully resolving the MedTech Incident! 

Your rank is now **🦈 Wire Shark**. 
You are now ready to sit the **[Final Certification Exam](../11-Final-Exam/01-final-exam-theory.md)**!

---
⬅️ [02 Investigation Workbook](02-investigation-workbook.md) | ➡️ [Module 11: Final Exam](../11-Final-Exam/01-final-exam-theory.md)
