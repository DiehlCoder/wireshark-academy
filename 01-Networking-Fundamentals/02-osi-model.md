# 01.02: The OSI Model

**Level:** 🟢 Beginner | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Name and explain all 7 OSI layers, their PDUs, protocols and devices
- Map Wireshark's packet-details pane to the layers
- Use the OSI model as a **troubleshooting method**

---

## 1. Why a Model?
The **OSI model** (ISO/IEC 7498-1) splits communication into 7 layers. Each layer **serves** the one above it, **uses** the one below it, and talks *logically* to the same layer on the remote host.
It gives engineers a shared vocabulary ("that's a Layer 2 problem").

**Mnemonics**
- 7→1: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing
- 1→7: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way

---

## 2. The 7 Layers

| # | Layer | Purpose | PDU | Address | Examples | Devices |
|---|---|---|---|---|---|---|
| 7 | **Application** | Network services for apps | Data | Hostname/URL | HTTP, DNS, SMTP, FTP, SSH, DHCP, SMB | Proxy, WAF |
| 6 | **Presentation** | Encoding, encryption, compression | Data | — | TLS*, UTF-8, JPEG, MIME | — |
| 5 | **Session** | Establish/maintain/terminate sessions | Data | Session ID | NetBIOS, RPC, SOCKS | — |
| 4 | **Transport** | End-to-end delivery, ports, reliability | **Segment** (TCP) / **Datagram** (UDP) | **Port** | TCP, UDP, QUIC* | Firewall (stateful) |
| 3 | **Network** | Logical addressing and routing | **Packet** | **IP address** | IPv4, IPv6, ICMP, IPsec, OSPF | Router, L3 switch |
| 2 | **Data Link** | Node-to-node delivery on one segment, error detection (FCS) | **Frame** | **MAC address** | Ethernet (802.3), Wi-Fi (802.11), ARP*, VLAN (802.1Q), PPP | Switch, bridge, AP |
| 1 | **Physical** | Bits as electrical/optical/radio signals | **Bits** | — | Cables (Cat6, fiber), RJ45, 1000BASE-T, radio | Hub, repeater, NIC, cable |

\* Some protocols don't fit neatly: **ARP** sits between L2 and L3, **TLS** spans L5–L6, **QUIC** combines L4 and parts of L7. The OSI model is a **reference** model. The Internet actually runs on **TCP/IP** (next worksheet).

---

## 3. Wireshark ↔ OSI Mapping

When you click a packet, the **Packet Details** pane shows the layers bottom-up:

```
▶ Frame 42: 74 bytes on wire ...                     ← Capture metadata (not a protocol)
▶ Ethernet II, Src: 08:00:27:..., Dst: 08:00:27:...  ← Layer 2
▶ Internet Protocol Version 4, Src: 10.10.10.10 ...  ← Layer 3
▶ Transmission Control Protocol, Src Port: 51234 ... ← Layer 4
▶ Hypertext Transfer Protocol                        ← Layers 5–7
```

> 💡 Wireshark does not show the physical layer (the NIC already turned the signals into bits) and usually not the Ethernet **FCS** (the NIC strips it).

---

## 4. The OSI Model as a Troubleshooting Method

| Approach | How it works | When to use it |
|---|---|---|
| **Bottom-up** | Start at L1 (cable/link light) and go up | Total outage ("nothing works") |
| **Top-down** | Start at the application and go down | One app is broken, the others work |
| **Divide & conquer** | Start at L3 (`ping`) and go up or down depending on the result | Experienced analysts, fastest on average |
| **Follow the path** | Trace the packet hop by hop | Routing/firewall issues |

### Symptom → layer cheat table
| Symptom | Likely layer | Tool/check |
|---|---|---|
| No link light, `NO-CARRIER` in `ip link` | 1 | Cable, VM adapter "cable connected" |
| `Destination Host Unreachable` in the same subnet, ARP incomplete | 2 | `ip neigh`, Wireshark `arp` |
| No route / wrong gateway / TTL exceeded | 3 | `ip route`, `traceroute`, ICMP in Wireshark |
| Connection refused (RST) or timeout to a port | 4 | `nc -zv host port`, `tcp.flags.reset==1` |
| Login session drops, NetBIOS/RPC errors | 5 | Application logs, Wireshark expert info |
| Garbled characters, TLS handshake failure | 6 | `tls.alert_message`, certificate check |
| HTTP 500, DNS NXDOMAIN, wrong data | 7 | `http.response.code >= 400`, `dns.flags.rcode != 0` |

---

## 5. 🎯 Mission: Find the Layers in a Real Packet
1. On **Kali** start Wireshark on `eth0`: `wireshark -i eth0 -k &`
2. In a terminal: `curl http://10.10.10.20/`
3. Stop the capture. Type the display filter `http` and press Enter.
4. Click the `GET / HTTP/1.1` packet and expand each layer.

Fill in this table in your journal:

| Layer | Field | Value you found |
|---|---|---|
| L2 | Source MAC | |
| L2 | Destination MAC | |
| L3 | Source IP / TTL | |
| L4 | Source port / destination port | |
| L7 | HTTP method + Host header | |

---

## 💼 Business Corner
Clearly naming the layer speeds up escalations a lot. "Users can't log into the CRM" turns into a ticket routed to the network, server or app team. Saying *"TCP SYNs to 10.0.5.20:443 get no SYN/ACK, so it's L4/firewall"* sends the problem to the **right** team immediately. That cuts **MTTR** (Mean Time To Resolve), a key metric in IT service management (ITIL) and SLAs.

---

## 🧠 Knowledge Check
1. What is the PDU at Layer 2? At Layer 4 for TCP?
2. Which layer uses port numbers?
3. A switch works at which layer? A router?
4. A user can ping a server but the website times out. Which layers are probably OK, and where do you look next?
5. At which layer would you place an encryption/encoding problem?

<details><summary>Answers</summary>

1. Frame; segment.
2. Layer 4 (Transport).
3. Switch: Layer 2. Router: Layer 3.
4. Layers 1–3 work (ping proves IP connectivity). Next, check L4 (is TCP port 80/443 open? Is a firewall blocking it?) and then L7 (is the web server running?).
5. Layer 6, Presentation.
</details>

---
⬅️ [01 What Is a Network](01-what-is-a-network.md) | ➡️ [03 TCP/IP & Encapsulation](03-tcpip-and-encapsulation.md)

