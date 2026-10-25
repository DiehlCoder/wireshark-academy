# 08.01: ARP Spoofing & Man-in-the-Middle (MITM) Analysis

**Level:** 🔴 Advanced | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Understand the technical mechanics of **ARP Cache Poisoning / MITM** attacks
- Execute a controlled ARP redirection in the home lab using `arpspoof`
- Identify the exact packet-level signatures and Wireshark expert alerts of an active ARP attack
- Trace MAC-to-IP binding mutations over time
- Implement enterprise switch mitigations: **Dynamic ARP Inspection (DAI)**

---

## 1. How ARP Spoofing Works at Layer 2

As learned in Module 03.01, ARP is an unauthenticated, stateless protocol. Operating systems dynamically update their ARP cache whenever they receive an ARP Reply, **even if they never asked for it**.

```
Normal Flow:
   Ubuntu Server (10.10.10.20) ◄════════════════════════► Gateway / Target (10.10.10.30)

During ARP Poisoning:
   Ubuntu Server (10.10.10.20)                           Gateway / Target (10.10.10.30)
          │                                                       ▲
          ▼                                                       │
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Kali Attacker (10.10.10.10)                                         │
   │ 1. Tells Ubuntu: "10.10.10.30 is at Kali's MAC"                    │
   │ 2. Tells Target: "10.10.10.20 is at Kali's MAC"                    │
   │ 3. Forwards intercepted packets transparently (IP Forwarding = 1)   │
   └─────────────────────────────────────────────────────────────────────┘
```

When Kali poisons both targets, all network traffic flowing between Ubuntu Server and Metasploitable2 physically routes through Kali's network card. Kali can passively inspect credentials, tamper with data in transit, or selectively drop packets.

---

## 2. Packet Signatures in Wireshark

When an ARP spoofing attack is launched, Wireshark's protocol analysis engine flags anomalies immediately:

### 2.1 The Critical Wireshark Warnings:
- **`[Duplicate IP address detected for 10.10.10.30 (also in use by 08:00:27:...)]`**
- **High-Frequency Unsolicited ARP Replies:** An attacker must constantly re-poison the targets (typically once per second) to overwrite legitimate ARP traffic.

### 2.2 Wireshark Display Filters:
```
# Filter for ARP poisoning anomalies:
arp.duplicate-address-detected

# Filter for all ARP replies:
arp.opcode == 2

# Inspect ARP traffic for specific IP:
arp.src.proto_ipv4 == 10.10.10.30
```

---

## 3. 🎯 Mission: Execute & Detect ARP Spoofing in the Lab

> ⚠️ **Ethical Reminder:** Only run this inside your isolated VirtualBox `labnet`! Never run ARP spoofing tools on public, school, or corporate Wi-Fi.

### Step 1: Enable IP Forwarding on Kali
Before poisoning, Kali must be configured to route intercepted packets so communication is not broken:
```bash
# On Kali:
sudo sysctl -w net.ipv4.ip_forward=1
```

### Step 2: Start Packet Capture on Kali
1. Launch Wireshark on Kali on `eth0`.
2. Filter: `arp`.

### Step 3: Launch `arpspoof`
We will intercept traffic between **Ubuntu Server (10.10.10.20)** and **Metasploitable2 (10.10.10.30)**:
```bash
# In Kali Terminal 1 (Poison Ubuntu Server):
sudo arpspoof -i eth0 -t 10.10.10.20 10.10.10.30

# In Kali Terminal 2 (Poison Metasploitable2):
sudo arpspoof -i eth0 -t 10.10.10.30 10.10.10.20
```

### Step 4: Generate Traffic Between the Targets
On **ubuntu-srv**, ping Metasploitable2:
```bash
ping -c 4 10.10.10.30
```

### Step 5: Analyze the Forensic Artifacts in Wireshark
1. Stop `arpspoof` in Kali terminals (`Ctrl + C`).
2. In Wireshark, look at the packet list:
   - Notice the endless stream of ARP replies sent by Kali claiming to be `10.10.10.30`.
   - Locate the yellow and red warning lines flagged by Wireshark:
     `Duplicate IP address detected for 10.10.10.30`.
   - In the Packet Details pane, expand `Address Resolution Protocol (reply)` ➔ `Expert Info`:
     Wireshark explicitly warns: *"Duplicate IP address detected"*.
3. Change Wireshark filter to: `icmp`.
   - Notice that Kali captured ICMP echo requests and replies **between 10.10.10.20 and 10.10.10.30**!
   - Expand Ethernet II header: notice the **Destination MAC is Kali's MAC**, yet the **Destination IP is 10.10.10.30**! This is undeniable proof of a Man-in-the-Middle condition.

---

## 4. Defense & Countermeasures

| Defense Layer | Mechanism | Effectiveness |
|---|---|---|
| **Enterprise Switch** | **Dynamic ARP Inspection (DAI)** | **100% effective**. Switch hardware verifies ARP against DHCP Snooping table; drops spoofed packets at the port. |
| **Endpoint (OS)** | **Static ARP Tables** (`arp -s <ip> <mac>`) | Effective for static servers/gateways; unmanageable for thousands of dynamic endpoints. |
| **Endpoint Software** | **Arpwatch / XArp** | Monitors ARP cache; alerts administrators when a MAC address changes. |
| **Transport Layer** | **End-to-End Encryption (TLS / SSH / IPsec)** | Even if an attacker poisons ARP, application data is encrypted; attacker only sees scrambled ciphertext. |

---

## 💼 Business Corner: Zero Trust at Layer 2
Historically, enterprise networks operated on an outdated security paradigm:
> *"The external internet is untrusted, but everyone inside the office building is trusted."*

ARP spoofing proves why this "perimeter-only" model fails completely. If a rogue contractor, malicious employee, or compromised IoT security camera is plugged into an office switch port:
- They can intercept traffic from executive laptops on the same VLAN.
- They can redirect traffic destined for the default gateway.

**Modern Architecture:** Under **Zero Trust Network Architecture (ZTNA)** and IEEE **802.1X Network Access Control (NAC)**:
1. Every switch port requires cryptographic 802.1X certificate authentication before passing packets.
2. Private VLANs (PVLANs) isolate user laptops so they cannot communicate directly with each other at Layer 2.
3. DAI and DHCP Snooping prevent MAC and ARP spoofing.

---

## 🧠 Knowledge Check
1. What is the technical mechanism that allows an attacker to poison a target's ARP table?
2. In Wireshark, how can an analyst prove that a packet was intercepted via MITM rather than delivered directly?
3. What happens if an attacker launches ARP spoofing without enabling IP forwarding (`net.ipv4.ip_forward=1`) on their machine?
4. What switch-level security feature completely prevents ARP spoofing attacks on corporate Ethernet switches?

<details><summary>Answers</summary>

1. Operating systems accept unprompted, unsolicited ARP replies (Gratuitous ARP) and update their internal ARP table without verifying whether an ARP request was ever sent.
2. The Ethernet Layer 2 Destination MAC address belongs to the attacker's network card, while the Layer 3 Destination IP address belongs to the intended victim/gateway.
3. Intercepted packets are dropped by the attacker's kernel, causing a complete Denial of Service (network outage) for the victims rather than a stealthy interception.
4. Dynamic ARP Inspection (DAI), working in tandem with DHCP Snooping.
</details>

---
⬅️ [Module 07 Cheat Sheet](../07-Snort-IDS/cheatsheet.md) | ➡️ [02 Detecting Scans, Floods & DoS](02-detecting-scans-floods-dos.md)
