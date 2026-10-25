# 05.01: Nmap Host Discovery: Packet-Level Mechanics

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Master Nmap host discovery techniques (`-sn`, `-PE`, `-PS`, `-PA`, `-PU`, `-Pn`)
- Analyze how host discovery packets actually look on the wire in Wireshark
- Understand why local subnet scans default to ARP (`-PR`) and bypass local OS firewalls
- Know when and why to use `-Pn` against hardened enterprise targets
- Discover rogue assets and "Shadow IT" on enterprise subnets

---

## 1. What is Host Discovery ("Ping Sweep")?

Before scanning 65,535 ports on thousands of IP addresses, a penetration tester or security auditor runs **Host Discovery** to answer one simple question:
*Which IP addresses are actually powered on and responsive?*

Skipping offline hosts saves hours of scanning time.

```bash
nmap -sn 10.10.10.0/24
```
*(The `-sn` flag instructs Nmap: "Ping scan only — DO NOT scan ports").*

---

## 2. The Local vs. Remote Discovery Dichotomy (Crucial!)

One of the most common points of confusion for beginners:

| Target Location | Nmap Default Behavior | Packets on Wire | Firewall Impact |
|---|---|---|---|
| **Same Local Subnet (Layer 2)** | **ARP Request (`-PR`)** | Broadcast `ARP who-has` | **Bypasses Windows / Linux firewalls!** OS firewalls cannot block ARP without losing connectivity. |
| **Remote Subnet (Routed Layer 3)** | **Multi-Probe Suite** | ICMP Echo, TCP SYN 443, TCP ACK 80, ICMP Timestamp | Often blocked by stateful network firewalls. |

> 💡 **Key Takeaway:** If you run `nmap -sn 10.10.10.0/24` from Kali inside the labnet, Nmap sends **ARP requests**, NOT ICMP pings!

---

## 3. Remote Discovery Probe Techniques

When scanning across routers (or when forcing Layer 3 discovery using `--disable-arp-ping`), Nmap sends specialized probe packets:

### 3.1 ICMP Probes
- **`-PE` (ICMP Echo):** Standard ping. Target responds with ICMP Echo Reply (Type 0).
- **`-PP` (ICMP Timestamp):** Queries remote system clock (ICMP Type 13). Often forgotten and allowed by old firewalls!
- **`-PM` (ICMP Address Mask):** Queries subnet mask (ICMP Type 17).

### 3.2 TCP Probes
- **`-PS<ports>` (TCP SYN Ping):** Sends a TCP SYN to ports (default: 443).
  - If port is **open**: Target responds with **SYN/ACK**. Target is alive! Nmap immediately drops connection with **RST**.
  - If port is **closed**: Target responds with **RST**. Target is STILL alive!
- **`-PA<ports>` (TCP ACK Ping):** Sends a raw TCP ACK to port 80.
  - Since there is no existing connection, any active target responds with a **RST**. If a RST returns, Nmap knows the host is alive. Great for bypassing simple stateless firewalls!

### 3.3 UDP & SCTP Probes
- **`-PU<ports>` (UDP Ping):** Sends UDP to an unlikely high port (default: 40125). If target responds with **ICMP Port Unreachable (Type 3 Code 3)**, the host is confirmed alive.
- **`-PY<ports>` (SCTP INIT Ping):** Sends SCTP INIT chunks to test telecom/cellular infrastructure.

---

## 4. The Famous `-Pn` Flag: Treating All Hosts as Online

By default, if Nmap's discovery probes receive no reply, Nmap assumes the IP is offline and skips it entirely.

**The Enterprise Problem:** Modern Windows 10/11 and Windows Server systems enable Windows Defender Firewall by default, which silently drops ICMP Echo Requests and unsolicited TCP packets.

```bash
# Force Nmap to skip host discovery and scan every port regardless:
nmap -Pn 10.10.10.40
```
- **Pros:** Scans hosts that hide behind silent packet-dropping firewalls.
- **Cons:** Scanning an entire /24 subnet where 200 IPs are truly offline will take significantly longer due to retransmission timeouts.

---

## 5. 🎯 Mission: Dissect Host Discovery in Wireshark

### Part 1: Local ARP Discovery
1. On Kali, start Wireshark on `eth0`, filter: `arp`.
2. In terminal, run a ping sweep of the lab:
   ```bash
   nmap -sn 10.10.10.0/24
   ```
3. In Wireshark:
   - Notice that Nmap exclusively flooded `ARP who-has` requests for `.1` through `.254`.
   - Watch `10.10.10.20` and `10.10.10.30` reply with their MAC addresses.

### Part 2: Routed Layer 3 / 4 Discovery Simulation
Force Nmap to behave as if it is scanning across an internet router by disabling ARP discovery:
1. In Wireshark, change filter to: `icmp || tcp.flags.syn==1 || tcp.flags.ack==1`.
2. On Kali, run:
   ```bash
   sudo nmap -sn --disable-arp-ping -PE -PS80,443 -PA80 10.10.10.20
   ```
3. In Wireshark:
   - Identify the **ICMP Echo Request** packet.
   - Identify the **TCP SYN to port 443**.
   - Identify the **TCP ACK to port 80**.
   - Observe how Ubuntu Server responds to each probe!

---

## 💼 Business Corner: Asset Inventory & Shadow IT
In regulatory compliance frameworks (CIS Controls #1 and #2, ISO 27001, PCI DSS Requirement 1.1):
> *"Organizations must maintain an accurate, up-to-date inventory of all authorized and unauthorized devices connected to the network."*

### The Danger of "Shadow IT":
A software developer brings their personal Raspberry Pi or unmanaged wireless router from home and plugs it into an office Ethernet jack. That device has no corporate antivirus, no patch management, and default passwords (`admin/admin`).

Automated weekly Nmap discovery sweeps (scripted via cron) compare active subnet IPs against the corporate CMDB (Configuration Management Database). Any unknown MAC or IP triggers an immediate Slack/Teams alert to the SOC to locate and disconnect the rogue device.

---

## 🧠 Knowledge Check
1. Why does Nmap use ARP requests instead of ICMP pings when scanning hosts on the same local subnet?
2. How can a TCP SYN ping (`-PS`) prove a host is online even if the targeted port is closed?
3. What does the `-Pn` option do, and when is it required?
4. How does a TCP ACK ping (`-PA`) help bypass simple stateless packet-filtering firewalls?

<details><summary>Answers</summary>

1. ARP is faster, reliable, and cannot be blocked by operating system software firewalls (like Windows Firewall) on the local link.
2. If the port is closed, an active operating system will return a TCP RST packet. Receiving the RST proves to Nmap that the host is alive and responding.
3. `-Pn` disables host discovery entirely, forcing Nmap to attempt full port scans on all specified IP addresses. It is required when targets drop ICMP and discovery probes.
4. Stateless firewalls permit inbound ACK packets assuming they are responses to established outbound connections initiated by internal hosts. When the ACK arrives at the target, the OS generates a RST, confirming the host is active.
</details>

---
⬅️ [Module 04 Cheat Sheet](../04-Wireshark-Advanced/cheatsheet.md) | ➡️ [02 Port Scanning Techniques](02-port-scanning-techniques.md)
