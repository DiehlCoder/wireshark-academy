# 01.03: The TCP/IP Model & Encapsulation

**Level:** 🟢 Beginner | **Time:** 1 h | **XP:** 100

## 🎯 Learning Objectives
- Compare the OSI model and the TCP/IP model
- Explain encapsulation/decapsulation and header overhead
- Understand MTU, MSS and fragmentation
- Read a packet byte by byte in hex

---

## 1. OSI vs. TCP/IP

```
   OSI (7)                TCP/IP (4)            Example
 ┌──────────────┐      ┌──────────────────┐
 │ Application  │      │                  │
 │ Presentation │ ───► │   Application    │   HTTP, DNS, TLS, SSH
 │ Session      │      │                  │
 ├──────────────┤      ├──────────────────┤
 │ Transport    │ ───► │   Transport      │   TCP, UDP
 ├──────────────┤      ├──────────────────┤
 │ Network      │ ───► │   Internet       │   IPv4, IPv6, ICMP
 ├──────────────┤      ├──────────────────┤
 │ Data Link    │ ───► │   Link /         │   Ethernet, Wi-Fi, ARP
 │ Physical     │      │   Network Access │
 └──────────────┘      └──────────────────┘
```
The TCP/IP model (RFC 1122) describes how the Internet **actually** works. OSI is the vocabulary we use to talk about it.

---

## 2. Encapsulation: Russian Dolls for Data

When Kali requests a web page, each layer **wraps** the data from the layer above with its own header:

```
L7  [                         HTTP data: "GET / HTTP/1.1..."                 ]
L4  [ TCP hdr 20B ][                   HTTP data                             ]
L3  [ IP hdr 20B  ][ TCP hdr ][         HTTP data                            ]
L2  [ Eth hdr 14B ][ IP hdr  ][ TCP hdr ][  HTTP data                ][FCS 4B]
L1  0101010110101010101011011110 ... (preamble + bits on the wire)
```

On the receiving side, **decapsulation** happens: each layer strips its header, checks it, and passes the payload up. The **type/protocol fields** tell each layer who comes next:

| Header | Field | Example value | Means "next is…" |
|---|---|---|---|
| Ethernet | EtherType | `0x0800` | IPv4 |
| Ethernet | EtherType | `0x0806` | ARP |
| Ethernet | EtherType | `0x86DD` | IPv6 |
| Ethernet | EtherType | `0x8100` | 802.1Q VLAN tag |
| IPv4 | Protocol | `1` / `6` / `17` | ICMP / TCP / UDP |
| TCP/UDP | Dst port | `80` / `443` / `53` | HTTP / HTTPS / DNS (by convention!) |

> ⚠️ Ports are only a **convention**. Wireshark guesses the L7 protocol from the port, so SSH running on port 443 may show up as malformed "TLS". Use *Decode As…* (Module 02) to fix this.

---

## 3. MTU, MSS & Overhead

| Term | Meaning | Typical value |
|---|---|---|
| **MTU** | Max L3 packet size on a link | 1500 B (Ethernet) |
| **Frame size** | MTU + 14 B Ethernet header | 1514 B in Wireshark (+4 B FCS on the wire) |
| **MSS** | Max TCP payload = MTU − IP hdr − TCP hdr | 1500 − 20 − 20 = **1460 B** |
| **Fragmentation** | Splitting IP packets bigger than the MTU | Avoided in IPv4 via the DF bit + PMTUD |

**Overhead example:** 1460 B of payload costs 1460 + 20 + 20 + 14 + 4 (FCS) + 8 (preamble) + 12 (inter-frame gap) = **1538 B** on the wire, about **95% efficiency**. A 1-byte Telnet keystroke wastes over 98% of the bandwidth.

> 💡 **TSO/GRO note:** On Linux you may see "packets" of 20,000+ bytes in Wireshark. The NIC segments them **after** capture (offloading). To see real on-wire sizes: `sudo ethtool -K eth0 tso off gso off gro off`

---

## 4. Reading Hex Like a Pro

A real ICMP echo request frame (Kali → ubuntu-srv) in the **Packet Bytes** pane:

```
0000  08 00 27 bb bb bb 08 00 27 aa aa aa 08 00 45 00   ..'.....'.....E.
0010  00 54 3c 1d 40 00 40 01 d6 3a 0a 0a 0a 0a 0a 0a   .T<.@.@..:......
0020  0a 14 08 00 f7 ff 00 01 00 01 ...                 ..........
```

| Bytes (offset) | Value | Meaning |
|---|---|---|
| 0x00–0x05 | `08 00 27 bb bb bb` | Destination MAC |
| 0x06–0x0b | `08 00 27 aa aa aa` | Source MAC |
| 0x0c–0x0d | `08 00` | EtherType = IPv4 |
| 0x0e | `45` | IP version **4**, header length **5×4 = 20 B** |
| 0x10–0x11 | `00 54` | Total length = 84 B |
| 0x14 | `40` | Flags: **DF** (Don't Fragment) set |
| 0x16 | `40` | TTL = 64 (a typical Linux default) |
| 0x17 | `01` | Protocol = 1 = **ICMP** |
| 0x1a–0x1d | `0a 0a 0a 0a` | Source IP 10.10.10.10 |
| 0x1e–0x21 | `0a 0a 0a 14` | Destination IP 10.10.10.20 |
| 0x22 | `08` | ICMP type 8 = Echo Request |

> 💡 **Default TTL fingerprinting:** Linux/macOS = 64, Windows = 128, Cisco/network gear = 255. A received TTL of 117 most likely came from a Windows host 11 hops away.

---

## 5. 🎯 Mission: Watch Encapsulation Happen
```bash
# On Kali: capture 1 ping into a file and print it in hex
tcpdump -i eth0 -c 2 -w ~/packet-ninja/captures/01-icmp.pcap icmp &
ping -c 1 10.10.10.20
sleep 1; tcpdump -r ~/packet-ninja/captures/01-icmp.pcap -XX -n
```
Tasks:
1. Find the EtherType, IP protocol number, TTL and ICMP type in the hex dump.
2. Compare the TTL in the request and in the reply. Does it match the "default TTL" table?
3. Open the file in Wireshark, click on a header field and watch the matching hex bytes get highlighted.

---

## 🧠 Knowledge Check
1. Map the 7 OSI layers to the 4 TCP/IP layers.
2. Which EtherType indicates ARP?
3. What is the typical TCP MSS on Ethernet, and how is it calculated?
4. You see a packet with TTL 126. Which OS probably sent it, and how many hops away is it?
5. Why might Wireshark show a 30,000-byte TCP segment on a 1500-MTU network?

<details><summary>Answers</summary>

1. App+Pres+Session → Application; Transport → Transport; Network → Internet; Data Link+Physical → Link.
2. `0x0806`
3. 1460 B = 1500 MTU − 20 IP − 20 TCP.
4. Windows (default 128), 2 hops away.
5. Segmentation offload (TSO/GSO/GRO): the capture happens before the NIC splits the data.
</details>

---
⬅️ [02 OSI Model](02-osi-model.md) | ➡️ [04 IP Addressing & Subnetting](04-ip-addressing-subnetting.md)

