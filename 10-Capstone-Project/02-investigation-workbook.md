# 10.02: Capstone Investigation Workbook

**Level:** 🔴 Pro | **Time:** 3 h | **XP:** 250

## 🎯 Investigation Objectives
- Analyze the `capstone_breach.pcapng` capture file using Wireshark and TShark
- Answer the 15 forensic incident questions across all 6 attack phases
- Maintain strict evidentiary standards (UTC timestamps, Frame numbers, display filters)
- Calculate your Capstone Score (Pass mark: 80% / 12 of 15 correct)

---

## 📋 Evidence Identification
Fill in the preliminary metadata before proceeding:
- **PCAP Filename:** `capstone_breach.pcapng`
- **SHA-256 Checksum:** `________________________________________________`
- **Total Packet Count:** `________` | **Duration (seconds):** `________`
- **Analyst Name:** `________________` | **Date (UTC):** `________________`

---

## 🔍 Phase 1: Reconnaissance & Discovery

### Question 1 (10 pts)
What was the IP address and MAC address of the suspected attacker/rogue workstation initiating network scans?
- **Attacker IP:** `____________________`
- **Attacker MAC:** `____________________`
- **Wireshark Display Filter used:** `____________________`

### Question 2 (15 pts)
During the port scan of `10.10.10.20`, what specific TCP scan technique was utilized (SYN Stealth vs. Connect vs. Xmas)? How does the packet exchange prove this?
- **Scan Type:** `____________________`
- **Packet Proof:** Describe the 3rd packet sent by the scanner to an open port:
  `______________________________________________________________________`

### Question 3 (15 pts)
Which destination TCP ports on `10.10.10.20` responded with `SYN/ACK` (Open)?
- **Open Ports Discovered:** `____________________`
- **Wireshark Display Filter:** `____________________`

---

## 🔑 Phase 2: Infiltration & Credential Harvesting

### Question 4 (15 pts)
What legacy unencrypted protocol on `10.10.10.30` was targeted by the attacker to harvest administrative credentials?
- **Target Protocol:** `____________________` | **Port:** `________`

### Question 5 (20 pts)
What exact cleartext credentials did the attacker submit to the legacy service?
- **Username:** `____________________`
- **Password:** `____________________`
- **Frame Number(s):** `________`

### Question 6 (15 pts)
What FTP command did the attacker execute immediately after successfully authenticating?
- **Command:** `____________________`

---

## 🌐 Phase 3: Web Application Exploitation

### Question 7 (15 pts)
What specific web application resource (URI path) was targeted on Ubuntu Server (`10.10.10.20`)?
- **Requested URI:** `________________________________________`

### Question 8 (20 pts)
What specific attack technique and SQL payload was injected into the web request?
- **Attack Category:** `____________________`
- **Exact Injected Payload:** `________________________________________`
- **Wireshark Display Filter:** `____________________`

### Question 9 (15 pts)
What anomalous User-Agent string was transmitted by the attacker's automated tool during the subsequent HTTP POST request?
- **User-Agent String:** `________________________________________`
- **Frame Number:** `________`

---

## 🚨 Phase 4: Staging & Account Compromise

### Question 10 (20 pts)
In the HTTP POST submission to `/login.html`, what stolen user credentials and authentication token were transmitted?
- **Submitted Username:** `____________________`
- **Submitted Password:** `____________________`
- **Stolen Token:** `____________________`

### Question 11 (15 pts)
What HTTP response status code did the web server return in response to the attacker's POST submission?
- **HTTP Status Code:** `____________________`
- **Wireshark Display Filter:** `____________________`

---

## 📡 Phase 5: Covert Data Exfiltration

### Question 12 (20 pts)
What network protocol was abused as a covert channel to exfiltrate proprietary data from the network?
- **Covert Protocol:** `____________________`

### Question 13 (25 pts)
Decode the ASCII string hidden within the payload bytes of the exfiltration packets.
- **Decoded ASCII Payload:** `________________________________________`
- **Frame Numbers of Exfiltration:** `________` to `________`

### Question 14 (15 pts)
How many total packets did the attacker transmit to execute the exfiltration event?
- **Packet Count:** `________`

---

## 🛡️ Phase 6: Detection Engineering

### Question 15 (40 pts)
Write two production-ready Snort rules to detect this exact breach in the future:

#### Rule A: Detect the Web SQL Injection (`UNION SELECT`)
```conf
# SID 1000050:
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (
  __________________________________________________________________
  sid:1000050; rev:1;
)
```

#### Rule B: Detect the Covert ICMP Data Exfiltration
```conf
# SID 1000051 (Detect ICMP echo containing the exfiltrated string):
alert icmp $EXTERNAL_NET any -> $HOME_NET any (
  __________________________________________________________________
  sid:1000051; rev:1;
)
```

---

## 📊 Scoring & Evaluation
- **Total Points Available:** 260 points
- **Passing Grade (80%):** 208 points
- **Your Score:** `________ / 260`
- **Outcome:** `[  ] PASSED - PACKET NINJA CERTIFIED`  |  `[  ] NEEDS RETRY`

When you have completed all questions in your journal, check your answers against **[03 Solution Guide](03-solution-guide.md)**!

---
⬅️ [01 Capstone Scenario](01-capstone-scenario.md) | ➡️ [03 Solution Guide](03-solution-guide.md)
