# 🦈 Packet Ninja: The Complete Wireshark & Network Security Crash Course

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Modules](https://img.shields.io/badge/Modules-12%20Interactive%20Units-indigo.svg)](#-course-roadmap)
[![Est. Time](https://img.shields.io/badge/Total%20Course-70--90%20Hours-orange.svg)](#-course-roadmap)
[![Tools](https://img.shields.io/badge/Tools-Wireshark_4.x_%7C_Nmap_%7C_Snort_3-brightgreen.svg)](#-tool-versions-used)
[![Environment](https://img.shields.io/badge/Lab-VirtualBox_7.x%20(Offline)-purple.svg)](#-the-home-lab-at-a-glance)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)

> **From "what is a packet?" to professional network forensics.**  
> Learn Wireshark, the OSI model, TCP/IP, Nmap, Netcat, Snort, and real-world attack & defense analysis through hands-on missions in an isolated VirtualBox home lab.

```text
  Beginner ──► Practitioner ──► Analyst ──► Professional ──► 🎓 Exam
  Mod 00-02     Mod 03-04        Mod 05-08    Mod 09-10        Mod 11
```

---

## 📚 How This Course Works

| Element | Meaning |
|---|---|
| 📁 **Folder** | A **module** (a self-contained topic) |
| 📄 **`.md` file** | A **worksheet**: read it, execute the commands, and analyze results |
| 🎯 **Mission** | A hands-on practical lab task to execute in your home lab |
| 🧠 **Knowledge Check** | Interactive quiz questions (answers collapsible inside blocks) |
| 💼 **Business Corner** | How this maps to enterprise budgets, compliance (SOC 2, ISO 27001), and careers |
| ⚠️ **Important** | Critical mistakes that break network stability or compromise security |
| 📋 **Cheat Sheet** | One-page rapid reference at the end of every module |
| 🏆 **Challenge** | Advanced optional challenges to push analytical thinking |

### 🎖️ XP Progression System

Each worksheet lists the XP you earn upon completion. Track your progress directly in the table below:

| XP Range | Rank | Status |
|---|---|---|
| 0 – 499 | 🐟 **Packet Plankton** | Setting up home lab & learning network frames |
| 500 – 1,499 | 🐠 **Frame Fish** | Decoding OSI layers & writing display filters |
| 1,500 – 2,999 | 🐬 **Protocol Dolphin** | Deep packet analysis (TCP, TLS, DNS, DHCP) |
| 3,000 – 4,499 | 🦈 **Wire Shark** | IDS rule writing (Snort 3) & attack detection |
| 4,500+ | 🐉 **Packet Ninja** | Complete Capstone & Pass the Final Practical Exam |

---

## 🗺️ Course Roadmap

| # | Module | Level | Topics Covered | Est. Time |
|:---:|---|:---:|---|:---:|
| **00** | [🏠 Home Lab Setup](00-Home-Lab-Setup/) | 🟢 Beginner | VirtualBox 7.x, Internal Network `labnet`, Kali, Ubuntu Server, Metasploitable2 | 3–4 h |
| **01** | [🌐 Networking Fundamentals](01-Networking-Fundamentals/) | 🟢 Beginner | OSI 7 Layers, TCP/IP Encapsulation, CIDR Subnetting, Ports & Sockets | 6–8 h |
| **02** | [🔍 Wireshark Foundations](02-Wireshark-Foundations/) | 🟢 Beginner | Promiscuous mode, BPF Capture Filters, Display Filters, Coloring Rules | 5–6 h |
| **03** | [🔬 Protocol Analysis](03-Protocol-Analysis/) | 🟡 Intermediate | ARP, IP, ICMP, TCP 3-Way Handshake & Teardown, UDP, DNS, DHCP, TLS | 10–12 h |
| **04** | [⚡ Advanced Wireshark & TShark](04-Wireshark-Advanced/) | 🟡 Intermediate | I/O Graphs, TCP Stream Reassembly, CLI TShark, TLS Decryption (Pre-Master Secret) | 8–10 h |
| **05** | [🎯 Nmap Recon & Port Scanning](05-Nmap/) | 🟡 Intermediate | SYN vs Full Connect Scans, Service Detection (`-sV`), OS Fingerprinting, NSE | 6–8 h |
| **06** | [🔌 Netcat: The Swiss Army Knife](06-Netcat/) | 🟡 Intermediate | Port listening, File exfiltration, Reverse vs Bind Shells, Socat & encryption | 3–4 h |
| **07** | [🛡️ Snort 3 Network IDS/IPS](07-Snort-IDS/) | 🔴 Advanced | Rule architecture, Header inspection, Content matching, Payload detection | 8–10 h |
| **08** | [⚔️ Attack & Defense Analysis](08-Attack-Defense-Analysis/) | 🔴 Advanced | ARP Cache Poisoning, SYN Floods, Credential Hunting, Malware C2 Beacons | 10–12 h |
| **09** | [💼 Professional Practice](09-Professional-Practice/) | 🔴 Pro | Incident response reports, Legal bounds, Compliance, Career roadmap | 3–4 h |
| **10** | [🏆 Capstone Incident Project](10-Capstone-Project/) | 🔴 Pro | Full-scope enterprise breach investigation: reconstruct attacker actions | 6–8 h |
| **11** | [🎓 Final Certification Exam](11-Final-Exam/) | 🎓 Master | Comprehensive Theory & Practical Exam to certify Packet Ninja status | 4–5 h |
| **📎** | [📂 Resources & Scripts](resources/) | — | Master Cheat Sheet, Full Acronym Glossary, Lab Automation Scripts | — |

**Total Duration:** ~70–90 hours of guided hands-on lab training (6–10 weeks at 1–2 hours/day).

---

## 🖥️ The Home Lab Architecture

The entire course is built around an isolated virtual sandbox where you can safely generate malicious traffic and capture packets without risking your host machine or home router:

```text
                   Host PC (Windows / Linux / macOS) + VirtualBox 7.x
                                         │
             Internal Network "labnet"  10.10.10.0/24  (Promiscuous Mode: Allow All)
   ┌──────────────────────┬──────────────────────┴──────────────────────┬─────────────────────┐
   │                      │                                             │                     │
 kali                  ubuntu-srv                                metasploitable2       win-client (optional)
 10.10.10.10           10.10.10.20                               10.10.10.30           10.10.10.40
 Analyst / Attacker    Web, DNS, DHCP, FTP + Snort 3 Sensor      Deliberately          Victim Workstation
                       Target Services                           Vulnerable Target     Telemetry
```

> **Security Note:** Kali and `ubuntu-srv` utilize a secondary NAT adapter solely for pulling system packages. `metasploitable2` is strictly air-gapped on `labnet` with **no Internet connectivity**.
> Full setup walkthrough: [Module 00: Home Lab Setup](00-Home-Lab-Setup/)

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/DiehlCoder/packet-ninja-wireshark.git
cd packet-ninja-wireshark
```

### 2. Verify Prerequisites
* **CPU:** 64-bit multi-core with hardware virtualization (**VT-x / AMD-V**) enabled in BIOS/UEFI
* **RAM:** 16 GB recommended (8 GB minimum if running only 2 VMs concurrently)
* **Storage:** 100 GB free disk space
* **Hypervisor:** [VirtualBox 7.0+](https://www.virtualbox.org/)

### 3. Begin With Module 00
Follow the step-by-step instructions in [`00-Home-Lab-Setup/01-lab-architecture.md`](00-Home-Lab-Setup/01-lab-architecture.md) to initialize your virtual network and provision the target machines.

---

## 📈 Progress Tracker

Copy this checklist into your analyst notebook or check off modules as you advance:

### Module 00: Home Lab Setup
- [ ] 01 Lab Architecture (50 XP)
- [ ] 02 VirtualBox & Networking (75 XP)
- [ ] 03 Building the VMs (150 XP)
- [ ] 04 Verification & Snapshots (75 XP)

### Module 01: Networking Fundamentals
- [ ] 01 What Is a Network (50 XP)
- [ ] 02 The OSI Model (100 XP)
- [ ] 03 TCP/IP & Encapsulation (100 XP)
- [ ] 04 IP Addressing & Subnetting (150 XP)
- [ ] 05 Ports, Protocols & Sockets (75 XP)

### Module 02: Wireshark Foundations
- [ ] 01 Install & Interface Tour (75 XP)
- [ ] 02 Capturing Traffic (75 XP)
- [ ] 03 Capture Filters (BPF) (100 XP)
- [ ] 04 Display Filters (150 XP)
- [ ] 05 Profiles, Columns, Coloring (75 XP)

### Module 03: Protocol Analysis
- [ ] 01 Ethernet & ARP (100 XP)
- [ ] 02 IP & ICMP (100 XP)
- [ ] 03 TCP Deep Dive (200 XP)
- [ ] 04 UDP & DNS (150 XP)
- [ ] 05 DHCP (100 XP)
- [ ] 06 HTTP & TLS (200 XP)
- [ ] 07 FTP, Telnet, SSH, SMTP, SMB (150 XP)

### Module 04: Advanced Wireshark
- [ ] 01 Statistics & I/O Graphs (100 XP)
- [ ] 02 Streams & Object Extraction (100 XP)
- [ ] 03 TShark & CLI Tools (150 XP)
- [ ] 04 Decrypting TLS (150 XP)
- [ ] 05 Performance Troubleshooting (150 XP)

### Module 05: Nmap
- [ ] 01 Host Discovery (100 XP)
- [ ] 02 Port Scanning Techniques (150 XP)
- [ ] 03 Service & OS Detection (100 XP)
- [ ] 04 NSE Scripting (150 XP)
- [ ] 05 Timing, Evasion & Output (100 XP)

### Module 06: Netcat
- [ ] 01 Netcat Basics (75 XP)
- [ ] 02 File Transfers, Banners & Shells (100 XP)
- [ ] 03 Ncat, Socat & Encryption (75 XP)

### Module 07: Snort
- [ ] 01 IDS/IPS Concepts (75 XP)
- [ ] 02 Installing & Configuring Snort 3 (150 XP)
- [ ] 03 Writing Snort Rules (200 XP)
- [ ] 04 Detection Lab (200 XP)

### Module 08: Attack & Defense Analysis
- [ ] 01 ARP Spoofing & MITM (150 XP)
- [ ] 02 Detecting Scans, Floods & DoS (150 XP)
- [ ] 03 Cleartext Credential Hunting (100 XP)
- [ ] 04 Malware & C2 Traffic Analysis (200 XP)
- [ ] 05 Network Forensics & Incident Response (200 XP)

### Module 09: Professional Practice
- [ ] 01 Legal, Ethics & Business Value (75 XP)
- [ ] 02 Reporting & Documentation (75 XP)
- [ ] 03 Careers & Certifications (50 XP)

### Module 10 & 11: Capstone & Certification
- [ ] Capstone Project: Comprehensive Incident Investigation (500 XP)
- [ ] Final Exam: Theory Assessment (250 XP)
- [ ] Final Exam: Practical Packet Analysis (500 XP)

**Current Total XP:** `______`  |  **Current Rank:** `______`

---

## 🧰 Tool Versions Tested

| Tool | Version Tested | Purpose |
|---|---|---|
| **VirtualBox** | `7.x` | Lab virtualization & isolated network segments |
| **Kali Linux** | `2024.x / 2025.x Rolling` | Primary security analyst & attack simulation station |
| **Ubuntu Server** | `24.04 LTS` | Core network services & Snort 3 sensor host |
| **Metasploitable** | `2` | Vulnerable target environment for traffic generation |
| **Wireshark / TShark** | `4.x` | GUI packet analyzer & command-line dissection |
| **Nmap** | `7.9x` | Network exploration & security auditing |
| **Ncat / Netcat** | `7.9x / 1.10` | Raw socket connection, banner grabbing, data pipes |
| **Snort** | `3.x` | Real-time network intrusion detection system (NIDS) |

---

## ⚖️ Legal & Ethical Notice

> [!CAUTION]
> Only scan, sniff, or inspect traffic on networks and devices **you own or have explicit written permission to test**. Running unauthorized port scans or packet captures against third-party or corporate networks violates laws including:
> * **§202a–c StGB** (Germany)
> * **Computer Misuse Act** (United Kingdom)
> * **Computer Fraud and Abuse Act (CFAA)** (United States)
> 
> All exercises in this curriculum are strictly restricted to your private, non-routable `labnet` VirtualBox network.

---

## 🤝 Contributing

Improvements, typos fixes, additional packet capture scenarios (`.pcap`), or new Snort 3 detection rules are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewPcapLab`)
3. Commit your Changes (`git commit -m 'feat: add DNS exfiltration analysis lab'`)
4. Push to the Branch (`git push origin feature/NewPcapLab`)
5. Open a Pull Request

---

## 📄 License

This course and repository are licensed under the [MIT License](LICENSE) — free to use, modify, and distribute for personal learning, academic courses, or defensive training.
