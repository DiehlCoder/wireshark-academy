# 00.01: Lab Architecture: Designing Your Packet Playground

**Level:** 🟢 Beginner | **Time:** 30 min | **XP:** 50

## 🎯 Learning Objectives
- Understand **why** we use an isolated virtual lab
- Know the role of every VM in the lab
- Understand the IP plan you will use throughout the course

---

## 1. Why a Home Lab?

Reading about packets is like reading about swimming. You have to get wet.

| Benefit | Explanation |
|---|---|
| **Safety** | Attacks stay inside your PC; nothing leaks onto real networks |
| **Legality** | You own everything, so you are allowed to scan, sniff and attack it |
| **Repeatability** | Snapshots let you break things and restore them in seconds |
| **Realism** | Real OSes, real services, real packets |
| **Career proof** | "I built and documented my own SOC lab" is a strong interview talking point |

---

## 2. The Topology

```
                 ┌──────────────── Host PC (Windows) ────────────────┐
                 │                                                    │
   Internet ◄────┤ NAT (adapter 2, only Kali + Ubuntu, for updates)  │
                 │                                                    │
                 │   ═════ Internal Network "labnet" 10.10.10.0/24 ═════
                 │     │              │               │            │  │
                 │   kali         ubuntu-srv     metasploitable2  win  │
                 │   .10            .20             .30          .40   │
                 └────────────────────────────────────────────────────┘
```

### VM Roles

| VM | IP | RAM | Disk | Role |
|---|---|---|---|---|
| **kali** | 10.10.10.10 | 4 GB | 60 GB | Analyst workstation: Wireshark, Nmap, Netcat, attacker tools |
| **ubuntu-srv** | 10.10.10.20 | 2 GB | 25 GB | Services (Apache, BIND/dnsmasq, vsftpd, SSH) + **Snort sensor** |
| **metasploitable2** | 10.10.10.30 | 512 MB–1 GB | 8 GB | Deliberately vulnerable Linux target |
| **win-client** *(optional)* | 10.10.10.40 | 4 GB | 50 GB | Windows 10/11 Evaluation: SMB, NetBIOS, "user" traffic |

> 💡 **Low RAM?** For most worksheets you only need **kali + one target** running. Snort labs need kali + ubuntu-srv.

---

## 3. Key Design Decisions (and why)

### 3.1 Internal Network instead of Bridged
- **Bridged** puts VMs directly on your home Wi-Fi/LAN. A scan or ARP-spoof could then hit your family's devices or your router. ❌
- **Internal Network** is a virtual switch that exists only inside VirtualBox. ✅

### 3.2 Promiscuous Mode "Allow All"
A normal network card only accepts frames addressed to its own MAC. In **promiscuous mode** it accepts *every* frame it sees.
With VirtualBox's internal network set to **"Allow All"**, Kali's NIC can see traffic between ubuntu-srv and metasploitable2. This behaves like a **hub** or a switch **SPAN/mirror port**, which is exactly what a real network analyst uses.

### 3.3 Static IPs
Predictable addresses make exercises reproducible. DHCP is still covered in Module 03, where ubuntu-srv acts as a DHCP server.

### 3.4 Dual-homed Kali/Ubuntu (NAT + Internal)
- **Adapter 1:** Internal Network `labnet` (the lab)
- **Adapter 2:** NAT (internet for `apt update`). **Disable it during attack labs** to keep captures clean.

---

## 4. IP Address Plan (memorize this!)

| Item | Value |
|---|---|
| Network | `10.10.10.0/24` |
| Subnet mask | `255.255.255.0` |
| Usable hosts | `10.10.10.1` – `10.10.10.254` |
| Broadcast | `10.10.10.255` |
| Gateway | none (flat lab network), optional `10.10.10.1` later |
| DNS (lab) | `10.10.10.20` (ubuntu-srv, set up in Module 03) |
| Lab domain | `lab.local` |

| Hostname | FQDN | IP |
|---|---|---|
| kali | kali.lab.local | 10.10.10.10 |
| ubuntu-srv | srv.lab.local / www.lab.local | 10.10.10.20 |
| metasploitable2 | msf.lab.local | 10.10.10.30 |
| win-client | win.lab.local | 10.10.10.40 |

---

## 💼 Business Corner
Companies spend real money on **cyber ranges** (training labs). Commercial ones like RangeForce or Immersive Labs cost from €500 per seat per year into the thousands. Your home lab gives you the same core skill set for €0. Many SOC teams also keep a **"pre-production" lab** like this one to test IDS rules and firewall changes before deploying them, which prevents outages that can cost thousands of euros per hour.

---

## 🧠 Knowledge Check
1. Why is a *Bridged* adapter dangerous for attack labs?
2. What does promiscuous mode "Allow All" let Kali do?
3. Which VM must **never** be connected to the internet, and why?

<details><summary>Answers</summary>

1. Bridged mode puts the VM on your real LAN, so scans, spoofing or exploits could affect real devices and could be illegal or disruptive.
2. It lets Kali receive frames that are not addressed to its own MAC, so it can sniff traffic between other VMs (like a SPAN port).
3. **Metasploitable2.** It is deliberately full of remotely exploitable vulnerabilities and would be compromised within minutes.
</details>

---
➡️ Next: [02 VirtualBox & Networking](02-virtualbox-and-networking.md)
