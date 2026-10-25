# 01.01: What Is a Network?

**Level:** 🟢 Beginner | **Time:** 45 min | **XP:** 50

## 🎯 Learning Objectives
- Define key terms: node, host, packet, frame, bandwidth, latency
- Distinguish hubs, switches, routers and firewalls
- Understand how professionals capture traffic on switched networks
- Know unicast, broadcast and multicast

---

## 1. Core Concepts & Definitions

| Term | Definition | Analogy |
|---|---|---|
| **Network** | Two or more devices connected to exchange data | A road system |
| **Host** | A device with an address that runs applications | A house |
| **NIC** | Network Interface Card | The front door |
| **MAC address** | 48-bit hardware address, e.g. `08:00:27:aa:bb:cc` | Your name |
| **IP address** | Logical, routable address, e.g. `10.10.10.20` | Your postal address |
| **Protocol** | An agreed set of communication rules | A language |
| **Packet** | A data unit at Layer 3 (IP) | A letter |
| **Frame** | A data unit at Layer 2 (Ethernet) | The courier bag around the letter |
| **Bandwidth** | Maximum data rate of a link | Number of highway lanes |
| **Throughput** | Actually achieved data rate | Cars per hour that really pass |
| **Latency** | Time from A to B (ms) | Travel time |
| **Jitter** | Variation in latency | Unpredictable travel time |
| **Packet loss** | % of packets that never arrive | Lost letters |

---

## 2. Network Devices

| Device | Layer | Function | Sniffing relevance |
|---|---|---|---|
| **Hub** (legacy) | 1 | Repeats every bit to all ports | Every port sees everything |
| **Switch** | 2 | Forwards frames by MAC table (CAM) | You see only your own unicast + broadcasts |
| **Router** | 3 | Forwards packets between networks by IP | Natural choke point |
| **Firewall** | 3–7 | Allows/blocks traffic by rules | Perimeter capture/logging |
| **Access Point** | 1–2 | Bridges Wi-Fi ↔ Ethernet | 802.11 capture needs monitor mode |
| **Proxy / Load balancer** | 4–7 | Terminates/distributes connections | Often where TLS gets decrypted |

### Capturing on switched networks
| Method | Description | Pros / Cons |
|---|---|---|
| **SPAN / Port mirroring** | The switch copies traffic to a monitor port | Cheap. May drop packets under load |
| **Network TAP** | Passive hardware in the cable | Lossless and invisible. Costs money |
| **Host capture** | Wireshark on the endpoint itself | Easy. Shows only that host |
| **ARP spoofing** (attack!) | Redirect traffic through yourself | Never use in production. Module 08 |

---

## 3. Network Scope & Topologies

| Type | Scope | Example |
|---|---|---|
| **PAN** | ~1–10 m | Bluetooth headset |
| **LAN** | Building | Office Ethernet, your VirtualBox `labnet` |
| **WLAN** | Building, wireless | Wi-Fi |
| **MAN** | City | Municipal fiber ring |
| **WAN** | Country/global | The Internet, MPLS between branch offices |

Topologies: **Star** (modern Ethernet: all hosts to a switch), **Bus** (old coax), **Ring**, **Mesh** (WAN cores, Wi-Fi mesh), **Hybrid**.

---

## 4. Traffic Types

| Type | Destination | Ethernet example | IP example |
|---|---|---|---|
| **Unicast** | One host | `08:00:27:12:34:56` | `10.10.10.20` |
| **Broadcast** | All hosts in the L2 segment | `ff:ff:ff:ff:ff:ff` | `10.10.10.255`, `255.255.255.255` |
| **Multicast** | A subscribed group | `01:00:5e:xx:xx:xx` | `224.0.0.0/4` (e.g. mDNS `224.0.0.251`) |
| **Anycast** | Nearest member of a group | — | `8.8.8.8`, `1.1.1.1` |

> 💡 **Broadcast domain** = all hosts that receive each other's broadcasts. Routers (and VLANs) separate broadcast domains. ARP and DHCP rely on broadcasts, which is why they are so easy to sniff and spoof.

---

## 5. 🎯 Mission: Meet Your Own Network
On **Kali**:
```bash
ip -br addr              # interfaces + IPs
ip -br link              # interfaces + MACs
ip route                 # routing table
ip neigh                 # ARP cache (IP ↔ MAC)
ping -c 2 10.10.10.255 -b   # broadcast ping (Linux hosts usually ignore it)
ip neigh                 # did anything change?
```
Write in your journal: Kali's MAC on `eth0`. Which vendor prefix (OUI) does it have? (`08:00:27` = Oracle VirtualBox.)

---

## 💼 Business Corner
- Downtime is expensive: Gartner's often-quoted estimate is **~$5,600 per minute** for large enterprises. Network analysts who find root causes quickly save real money.
- **SPAN vs. TAP** is a typical budget decision. TAPs are around €300–€3,000+ each, but they deliver legally defensible, lossless captures, which matters for forensics and compliance.

---

## 🧠 Knowledge Check
1. Why can't you see other hosts' unicast traffic on a switch?
2. What is the Ethernet broadcast MAC?
3. Name two legitimate ways to capture traffic on a switched network.
4. What separates broadcast domains?

<details><summary>Answers</summary>

1. The switch learns which MAC is on which port and forwards unicast frames only to that port.
2. `ff:ff:ff:ff:ff:ff`
3. SPAN/port mirroring and a network TAP (or capturing on the host itself).
4. Routers (Layer 3 devices) and VLANs.
</details>

---
⬅️ [Module 00](../00-Home-Lab-Setup/04-verification-and-snapshots.md) | ➡️ [02 The OSI Model](02-osi-model.md)
