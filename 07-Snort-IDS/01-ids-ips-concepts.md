# 07.01: IDS vs. IPS: Concepts & Architecture

**Level:** 🔴 Advanced | **Time:** 1.5 h | **XP:** 75

## 🎯 Learning Objectives
- Differentiate between **Intrusion Detection Systems (IDS)** and **Intrusion Prevention Systems (IPS)**
- Understand detection engines: **Signature-based** vs. **Anomaly/Heuristic-based**
- Dissect the internal architecture of **Snort** (DAQ, Preprocessors/Inspectors, Detection Engine, Logging)
- Master detection quality metrics: True/False Positives and True/False Negatives
- Understand the business impact of **Alert Fatigue** in corporate SOC environments

---

## 1. IDS vs. IPS: Passive Monitoring vs. Active Blocking

```
=== IDS (Passive / Out-of-Band) ===
   Internet ──────► Switch (SPAN / TAP) ──────► Internal Network
                         │
                         ▼ (Mirrored Copy)
                     [ Snort IDS ] ──► Generates Alert in SIEM

=== IPS (Active / Inline) ===
   Internet ──────► [ Snort IPS ] ──────► Internal Network
                     (Inspects & Blocks
                      Malicious Packets!)
```

| Dimension | IDS (Intrusion Detection) | IPS (Intrusion Prevention) |
|---|---|---|
| **Placement** | **Out-of-band** (connected to a switch SPAN/mirror port or network TAP). | **Inline** (packets physically flow *through* the device like a firewall). |
| **Action** | **Alerts only**. Monitors, logs, and notifies analysts. Does not stop traffic. | **Blocks & drops**. Drops malicious packets, injects TCP resets (`RST`), or bans IPs. |
| **Network Risk**| **Zero risk to uptime**. If the IDS crashes, production traffic flows unaffected. | **High risk**. If the IPS crashes or locks up, production network traffic halts! |
| **Latency** | **0 ms**. Packets reach destination simultaneously with inspection. | Adds a small hardware processing latency (microseconds to milliseconds). |

---

## 2. Detection Methodologies

### 2.1 Signature-Based Detection
Matches packet payloads and headers against static rules of known exploits:
- *Example:* If an HTTP GET request contains `/etc/passwd` or `UNION SELECT`, fire alert.
- **Strengths:** Extremely fast, highly accurate with very low false positive rates for known attacks.
- **Weaknesses:** Blind to Zero-Day exploits (new attacks that lack signatures) and encrypted payloads.

### 2.2 Anomaly / Behavioral-Based Detection
Builds a baseline of "normal" network activity over weeks (e.g. average bandwidth, typical working hours, standard protocols per server):
- *Example:* If a workstation suddenly transfers 50 GB of data via DNS at 3:00 AM on Sunday, flag an anomaly.
- **Strengths:** Can detect zero-days, insider threats, and sophisticated lateral movement.
- **Weaknesses:** High False Positive rate; legitimate business spikes trigger false alarms.

---

## 3. The Snort Architecture

Created by Martin Roesch in 1998 and maintained by Cisco Talos, **Snort** is the world's most widely deployed open-source NIDS/NIPS engine.

```
       [ Wire / Network Interface ]
                   │
                   ▼
       ┌────────────────────────┐
       │ DAQ (Data Acquisition) │ (libpcap, AF_PACKET, NFQ)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Preprocessors /        │ (Defragments IP, reassembles TCP streams,
       │ Inspectors             │  normalizes HTTP URL encodings)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Detection Engine       │ (Evaluates packets against Snort rules)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Output Modules         │ (Alert files, JSON, Syslog, SIEM)
       └────────────────────────┘
```

### Why Preprocessors are Critical:
If an attacker sends an exploit encoded as `%2e%2e%2f` (URL-encoded `../`), or splits an exploit string across five fragmented TCP packets (`U`, `N`, `I`, `O`, `N`), a naive pattern matcher will miss it!
The **Preprocessors / Inspectors**:
1. Reassemble fragmented IP packets and out-of-order TCP streams.
2. Decode URL encoding, hex encoding, and compression before the rules are evaluated.

---

## 4. Detection Metrics: The Confusion Matrix

In cybersecurity detection engineering, rules are evaluated across four outcomes:

| Reality \ Detection | Alert Triggered | No Alert |
|---|---|---|
| **Real Attack** | **True Positive (TP)** ✅ (Goal!) | **False Negative (FN)** ❌ (Disaster: Breach missed!) |
| **Benign Traffic** | **False Positive (FP)** ❌ (Alert Fatigue) | **True Negative (TN)** ✅ (Normal operation) |

---

## 5. 💼 Business Corner: The Operational Cost of Alert Fatigue
A tier-1 SOC analyst at a large financial institution can realistically review and triage **40 to 60 security alerts per 8-hour shift**.

If an improperly tuned IDS generates **5,000 False Positive alerts per day** (e.g., poorly written rules flagging legitimate database updates or developer software builds):
- Analysts become overwhelmed and desensitized ("Alert Fatigue").
- Analysts begin reflexively clicking *"Dismiss / Close Alert"* without thorough investigation.
- When an actual ransomware intrusion occurs (True Positive), the alert is buried beneath thousands of false alarms.

**The Target Breach Case Study (2013):**
During the infamous Target breach (40 million credit cards stolen), Target's intrusion detection system **did detect and alert on the malware**. However, the SOC team received so many thousands of false alerts that the legitimate intrusion alert was ignored until the US Department of Justice contacted Target executives weeks later!

---

## 🧠 Knowledge Check
1. What is the fundamental operational difference between an IDS and an IPS?
2. Why must a modern NIDS include TCP stream reassembly preprocessors before evaluating rules?
3. What is a "False Positive", and why does an abundance of them endanger an enterprise?
4. How does signature-based detection differ from anomaly-based detection?

<details><summary>Answers</summary>

1. An IDS monitors traffic passively out-of-band and only generates alerts without blocking; an IPS sits inline and actively blocks or drops malicious packets in real-time.
2. Attackers can evade simple pattern matching by fragmenting their exploit payloads across multiple small TCP packets. Stream reassembly combines the fragments so the full payload can be inspected.
3. A False Positive occurs when benign, legitimate network traffic is incorrectly flagged as an attack. Too many False Positives cause "Alert Fatigue", causing analysts to overlook real security breaches.
4. Signature-based detection matches packets against specific known patterns of attacks (fast, accurate, but misses zero-days); anomaly-based detection flags deviations from a baseline of normal behavior (can catch new attacks, but higher false alarm rate).
</details>

---
⬅️ [Module 06 Cheat Sheet](../06-Netcat/cheatsheet.md) | ➡️ [02 Installing & Configuring Snort](02-installing-configuring-snort.md)
