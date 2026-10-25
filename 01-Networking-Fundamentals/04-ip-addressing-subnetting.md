# 01.04: IP Addressing & Subnetting

**Level:** 🟢 Beginner | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Convert between binary and decimal
- Understand CIDR, subnet masks, network/broadcast addresses
- Subnet quickly in your head (the "magic number" method)
- Recognize private, special and IPv6 addresses

---

## 1. Binary in 2 Minutes
An IPv4 address = 32 bits = 4 **octets**. Each octet's bit values:

```
128  64  32  16   8   4   2   1
  1   1   0   0   0   0   0   0   = 192
  0   0   0   0   1   0   1   0   = 10
```
`10.10.10.20` = `00001010.00001010.00001010.00010100`

---

## 2. Network vs. Host Part (CIDR)
The **subnet mask** marks which bits belong to the network.
`/24` = 24 one-bits = `255.255.255.0`

| CIDR | Mask | Hosts (2ⁿ − 2) | Block size |
|---|---|---|---|
| /8 | 255.0.0.0 | 16,777,214 | — |
| /16 | 255.255.0.0 | 65,534 | — |
| /24 | 255.255.255.0 | 254 | 256 |
| /25 | 255.255.255.128 | 126 | 128 |
| /26 | 255.255.255.192 | 62 | 64 |
| /27 | 255.255.255.224 | 30 | 32 |
| /28 | 255.255.255.240 | 14 | 16 |
| /29 | 255.255.255.248 | 6 | 8 |
| /30 | 255.255.255.252 | 2 | 4 |
| /31 | 255.255.255.254 | 2 (point-to-point, RFC 3021) | 2 |
| /32 | 255.255.255.255 | 1 (single host) | 1 |

---

## 3. The Magic Number Method ✨
**Example:** What network is `172.16.45.130/26` in?
1. /26 → the interesting octet is the 4th, the mask there is `192`
2. Magic number = 256 − 192 = **64** → subnets start at 0, 64, **128**, 192
3. 130 lies in the block 128–191
4. Network `172.16.45.128`, broadcast `172.16.45.191`, usable `.129`–`.190` (62 hosts)

**Example 2:** `10.20.77.5/20`
1. /20 → 3rd octet, mask `240` → magic = **16** → blocks 0, 16, 32, 48, **64**, 80…
2. 77 lies in 64–79 → network `10.20.64.0`, broadcast `10.20.79.255`

---

## 4. Special Address Ranges

| Range | Purpose |
|---|---|
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | **Private** (RFC 1918), not routed on the Internet |
| `127.0.0.0/8` | Loopback |
| `169.254.0.0/16` | APIPA / link-local, **a sign that DHCP failed!** |
| `100.64.0.0/10` | Carrier-grade NAT |
| `224.0.0.0/4` | Multicast |
| `255.255.255.255` | Limited broadcast |
| `0.0.0.0` | "This host" / unspecified (seen in DHCP Discover) |

---

## 5. IPv6 Essentials
- 128 bits, hex, written as 8 groups: `fe80:0000:0000:0000:0a00:27ff:feaa:aaaa` → `fe80::a00:27ff:feaa:aaaa`
- Rules: drop leading zeros, replace **one** run of zero groups with `::`

| Prefix | Type |
|---|---|
| `::1` | Loopback |
| `fe80::/10` | Link-local (always present on every interface) |
| `fc00::/7` (`fd..`) | Unique Local (private) |
| `2000::/3` | Global unicast |
| `ff00::/8` | Multicast (IPv6 has **no broadcast**) |

IPv6 replaces ARP with **NDP** (ICMPv6 Neighbor Solicitation/Advertisement). In Wireshark, filter with `icmpv6`.

> ⚠️ **Security:** Many networks "don't use IPv6", but every modern OS has it enabled. Attackers abuse rogue Router Advertisements (e.g., mitm6). Always check `ipv6` in your captures!

---

## 6. 🎯 Mission: Subnet Drill
Solve on paper, then verify with `ipcalc` on Kali (`sudo apt install ipcalc`):

| # | Address | Network | Broadcast | First–Last host | # Hosts |
|---|---|---|---|---|---|
| 1 | 192.168.1.77/27 | | | | |
| 2 | 10.10.10.200/25 | | | | |
| 3 | 172.20.33.9/22 | | | | |
| 4 | 10.0.0.6/30 | | | | |
| 5 | 192.168.100.255/23 | | | | |

```bash
ipcalc 192.168.1.77/27
```

<details><summary>Answers</summary>

| # | Network | Broadcast | Hosts range | # |
|---|---|---|---|---|
| 1 | 192.168.1.64 | 192.168.1.95 | .65–.94 | 30 |
| 2 | 10.10.10.128 | 10.10.10.255 | .129–.254 | 126 |
| 3 | 172.20.32.0 | 172.20.35.255 | 172.20.32.1–172.20.35.254 | 1022 |
| 4 | 10.0.0.4 | 10.0.0.7 | .5–.6 | 2 |
| 5 | 192.168.100.0 | 192.168.101.255 | 192.168.100.1–192.168.101.254 (so .100.255 is a **valid host**!) | 510 |
</details>

### Lab task
On Kali, add a second IP from a *different* subnet and observe what happens:
```bash
sudo ip addr add 10.10.20.10/24 dev eth0
ping -c 2 10.10.10.20     # works (same subnet)
ping -c 2 10.10.20.99     # what does Wireshark show? (ARP who-has with no reply)
sudo ip addr del 10.10.20.10/24 dev eth0
```

---

## 💼 Business Corner
Good IP planning (an **IPAM** process) prevents outages from overlapping subnets, especially during **mergers & acquisitions**, when two companies both use `192.168.1.0/24`. Network segmentation (separate subnets/VLANs for servers, clients, OT, guests) is also required by standards like **PCI DSS** and **ISO 27001** and recommended by **BSI IT-Grundschutz**. It limits the damage ransomware can do by restricting lateral movement.

---

## 🧠 Knowledge Check
1. How many usable hosts are in a /28?
2. A host shows `169.254.13.7`. What happened?
3. Shorten `2001:0db8:0000:0000:0000:ff00:0042:8329`.
4. What replaces ARP in IPv6?

<details><summary>Answers</summary>

1. 14
2. It didn't get a DHCP lease and auto-assigned an APIPA/link-local address.
3. `2001:db8::ff00:42:8329`
4. NDP (Neighbor Discovery Protocol, ICMPv6 types 135/136).
</details>

---
⬅️ [03 TCP/IP & Encapsulation](03-tcpip-and-encapsulation.md) | ➡️ [05 Ports, Protocols & Sockets](05-ports-protocols-sockets.md)
