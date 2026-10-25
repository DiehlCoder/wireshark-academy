# 09.02: Forensic Reporting, Documentation & Executive Communication

**Level:** 🔴 Pro | **Time:** 1.5 h | **XP:** 75

## 🎯 Learning Objectives
- Write professional incident reports catering to both **Executives** and **Technical Engineers**
- Construct a standardized Incident Timeline in UTC with supporting packet evidence
- Structure actionable remediation recommendations (Immediate, Short-Term, Long-Term)
- Export filtered, sanitized evidence subsets (`Export Specified Packets`) for legal discovery
- Master the industry-standard Incident Report Template

---

## 1. The Two Audiences: Executives vs. Engineers

A common failing of junior security analysts is sending a 40-page technical hex dump to the Chief Financial Officer (CFO) or Board of Directors. 

A professional report must be bifurcated:

```
┌────────────────────────────────────────────────────────┐
│ PART 1: EXECUTIVE SUMMARY (1 Page)                     │
│ Target: C-Suite, Board, Legal Counsel, Insurers        │
│ Focus: Business risk, financial impact, legal status,  │
│        high-level root cause, strategic remediation.   │
├────────────────────────────────────────────────────────┤
│ PART 2: TECHNICAL FINDINGS & EVIDENCE (Detailed)       │
│ Target: SOC Analysts, Network Engineers, Sysadmins     │
│ Focus: Frame numbers, UTC timestamps, display filters, │
│        packet diagrams, exact CVEs, firewall changes.  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Standardized Incident Report Structure

### Section 1: Executive Summary
- Brief statement of what happened.
- Time of detection and time of containment.
- Scope of affected systems.
- Impact on customer data and ongoing business operations.

### Section 2: Chronological Event Timeline
Every event must be specified in **UTC** with supporting evidence:
```
[2026-10-16 14:15:22 UTC] Host 10.10.10.10 initiates TCP SYN scan across subnet (Frame #142 - #890).
[2026-10-16 14:17:05 UTC] Attacker exploits vsftpd backdoor on 10.10.10.30 (Frame #1102).
[2026-10-16 14:18:40 UTC] Lateral movement to database server via SMB (Frame #1540).
```

### Section 3: Technical Findings & Evidence
Each finding should follow the **Vulnerability / Evidence / Impact / Recommendation** structure:
- **Finding Title:** Cleartext Credential Exposure via Plaintext FTP
- **Severity:** High (CVSS 7.5)
- **Evidence:** Packet #412 (`ftp.request.command == "PASS"`) captured cleartext password `SecretDBPass789!`.
- **Root Cause:** Insecure legacy service running without TLS encryption.

### Section 4: Actionable Recommendations Matrix
Categorize recommendations by urgency:
- **Immediate (0–24 hours):** Isolate infected IP `10.10.10.30`, revoke compromised database credentials, block external C2 IP on edge firewall.
- **Short-Term (1–7 days):** Implement Dynamic ARP Inspection (DAI) on core switches, patch Apache web server.
- **Long-Term (30–90 days):** Enforce 802.1X Network Access Control (NAC), deploy enterprise EDR agents across all subnets.

---

## 3. Preparing Packet Evidence for Court / Third Parties

Never send an entire 50 GB unredacted capture file to an external auditor or insurance investigator (it contains sensitive corporate trade secrets and employee personal data).

### How to Export an Evidence Subset:
1. In Wireshark, apply a display filter that isolates only the incident packets (e.g. `ip.addr == 10.10.10.30 && (http || ftp)`).
2. Go to: **File ➔ Export Specified Packets...**
3. Under *Packet Range*, select: **Displayed** (NOT *Captured*!).
4. Save the new sanitized evidence PCAP (e.g. `Exhibit_A_attack_evidence.pcapng`).
5. Calculate its SHA-256 hash and attach it to your report!

---

## 4. 🎯 Mission: Draft an Incident Report

Open your Analyst Journal (`~/packet-ninja/notes/incident_report.md`) on Kali and compile a formal incident report based on the **Attack Simulation** conducted in Module 07 and 08:
1. Write a 1-paragraph Executive Summary for the CEO.
2. Build a 4-row timeline table including UTC timestamps, Frame numbers, and Wireshark display filters.
3. Formulate 3 prioritized remediation recommendations (Immediate, Short-Term, Strategic).

---

## 💼 Business Corner: Cyber Insurance Claim Validation
Following a ransomware attack, organizations file multi-million-euro claims with their **Cyber Insurance Underwriters** (Allianz, Chubb, AIG) to recover business interruption losses and forensics costs.

Insurance claims examiners employ specialized forensic legal auditors:
- If your incident report is vague (*"We think the hacker got in through a website"*), the insurer may deny the claim under "failure to maintain reasonable security controls."
- If your report provides **verifiable packet timestamps, SHA-256 hashes, and concrete Wireshark evidence** proving the exact timeline, claims are approved rapidly, saving the business from catastrophic insolvency.

---

## 🧠 Knowledge Check
1. Why must executive summaries avoid technical packet hex dumps?
2. What are the three time-horizon categories for incident remediation recommendations?
3. How do you export only the packets matching your current display filter to a new PCAP file in Wireshark?
4. What role does evidence hashing play when submitting a forensic report to insurance underwriters or legal counsel?

<details><summary>Answers</summary>

1. Executives, board members, and legal counsel require high-level risk assessments, financial impact, and strategic decisions; technical minutiae distracts from executive governance.
2. Immediate (0–24h), Short-Term (1–7 days), and Long-Term / Strategic (30–90 days).
3. Go to *File ➔ Export Specified Packets*, and under Packet Range select the **Displayed** radio button.
4. It cryptographically proves that the evidence was not altered, tampered with, or fabricated during the investigation, establishing legal admissibility.
</details>

---
⬅️ [01 Legal & Ethics](01-legal-ethics-business-value.md) | ➡️ [03 Careers & Certifications](03-careers-and-certifications.md)
