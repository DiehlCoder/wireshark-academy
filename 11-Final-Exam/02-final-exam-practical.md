# 11.02: Final Exam: Practical Forensics Lab

**Level:** 🎓 Comprehensive Certification | **Time:** 2.5 h | **XP:** 500

```
┌────────────────────────────────────────────────────────────────────────┐
│             PACKET NINJA CERTIFICATION: PRACTICAL EXAMINATION          │
│  Passing Score: 80% (400 / 500 points)                                │
│  Format: Hands-on PCAP Analysis, Artifact Carving & Snort Engineering  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Practical Exam Scenario: "Operation ShadowStrike"

You have been deployed as the Lead Network Forensic Investigator to examine an intrusion against an energy utility provider's internal control network. 

An alert was triggered by an anomaly detector on core router `10.10.10.1`. You are provided with the forensic capture file generated during the intrusion window (generate it via the script below or replay `~/packet-ninja/captures/capstone_breach.pcapng`).

Your mission is to perform deep packet analysis, carve the stolen file, reverse-engineer the attack vectors, and draft the formal forensic examination submission.

---

## 🛠️ Practical Exam Tasks & Submission Sheet

Record your forensic findings directly in your Analyst Journal (`~/packet-ninja/notes/final_practical_exam.md`).

---

### Task 1: Cryptographic Evidence Custody (50 Points)
1. Calculate the SHA-256 hash of your working evidence PCAP.
2. Using `capinfos`, document:
   - Total number of packets
   - Exact capture duration (in seconds)
   - Average data rate (in bits/sec)
3. State whether any packets were dropped by the capture interface.

---

### Task 2: Reconnaissance & Scan Attribution (75 Points)
1. **Identify Attacker Profile:** Identify the attacker's IP address, MAC address, and hardware vendor OUI.
2. **Scan Dissection:** 
   - Which specific Nmap scan technique was directed against `10.10.10.20`?
   - What specific TCP flags were set in the probes?
   - Document the frame numbers of the first 3 scan probes.
3. **Decoy Analysis:** If decoy scanning was used, how can an analyst distinguish the real scanner IP from spoofed decoys?

---

### Task 3: Infiltration & Credential Harvesting (100 Points)
1. **Vulnerability Identification:** Identify the unencrypted service abused by the attacker on `10.10.10.30`.
2. **Harvest Credentials:** Extract all plaintext usernames, passwords, and authorization tokens transmitted in the capture.
3. **Wireshark Filter:** Provide the exact display filter that isolates the harvested password packet.
4. **Application Dialogue:** Follow the TCP stream of the authentication event and paste the complete ASCII transcript.

---

### Task 4: Web Exploitation & Command Injection (100 Points)
1. **Web Attack Analysis:** 
   - What web application endpoint was targeted on `10.10.10.20`?
   - What attack payload was injected into the URI query string?
   - Identify the Common Weakness Enumeration (CWE) or OWASP Top 10 category for this exploit.
2. **User-Agent Forensics:**
   - Extract the full `User-Agent` header transmitted by the attacker.
   - Explain why this User-Agent stands out as an Indicator of Compromise (IOC).

---

### Task 5: Covert Channel & Data Exfiltration (100 Points)
1. **Covert Protocol Identification:** Identify which protocol was hijacked to exfiltrate proprietary data.
2. **Payload Extraction:**
   - Extract the raw hexadecimal payload bytes from the exfiltration packets.
   - Decode the ASCII string hidden within the payload.
   - What is the exact byte size of the exfiltrated string?
3. **Packet Count:** Document how many total packets were utilized to complete the exfiltration transfer.

---

### Task 6: Detection Engineering (75 Points)
Write two production-ready, fully validated Snort rules to detect this intrusion pattern across the enterprise:

1. **Rule 1 (SID 1000100):** Detects the web injection attempt targeting the application URI.
2. **Rule 2 (SID 1000101):** Detects the covert data exfiltration payload.

*Requirement: Both rules must include valid `msg`, `flow`, `sid`, `rev`, `classtype`, and appropriate protocol buffer modifiers.*

---

## 📊 Grading Rubric
| Task | Maximum Points | Your Score |
|---|---|---|
| Task 1: Evidence Custody | 50 | |
| Task 2: Reconnaissance Analysis | 75 | |
| Task 3: Credential Harvesting | 100 | |
| Task 4: Web Exploitation | 100 | |
| Task 5: Data Exfiltration | 100 | |
| Task 6: Detection Engineering | 75 | |
| **Total** | **500 Points** | |

**Pass Threshold:** $\ge 400\text{ Points}$ ($80\%$).

When your journal submission is complete, verify your results against **[03 Answer Key & Grading Rubric](03-answer-key-and-grading.md)**!

---
⬅️ [01 Final Exam: Theory](01-final-exam-theory.md) | ➡️ [03 Answer Key & Grading Rubric](03-answer-key-and-grading.md)
