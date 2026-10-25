# 📋 Module 03 Cheat Sheet: Protocol Analysis

## 📦 Protocol Header Sizes & Encapsulation
| Layer | Protocol | Standard Header Size | Key Identification Field |
|---|---|---|---|
| **L2** | Ethernet II | 14 Bytes (+4 B FCS) | EtherType (`0x0800` IPv4, `0x0806` ARP, `0x86dd` IPv6) |
| **L3** | IPv4 | 20 Bytes (up to 60 B) | Protocol (`1` ICMP, `6` TCP, `17` UDP) |
| **L3** | IPv6 | 40 Bytes (fixed) | Next Header |
| **L4** | TCP | 20 Bytes (up to 60 B) | Source & Destination Ports (0–65535) |
| **L4** | UDP | 8 Bytes (fixed) | Source & Destination Ports |
| **L3** | ICMP | 8 Bytes (header) | Type and Code |

---

## ⚡ TCP Control Flags & State Quick Reference
```
[ CWR | ECE | URG | ACK | PSH | RST | SYN | FIN ]
 128    64    32    16     8     4     2     1
```
- **3-Way Handshake:** `SYN` ➔ `SYN+ACK` ➔ `ACK`
- **4-Way Teardown:** `FIN` ➔ `ACK` ➔ `FIN` ➔ `ACK`
- **Immediate Abort:** `RST` or `RST+ACK`
- **Relative Sequence Math:** `Ack Number` = Next byte expected. SYN & FIN consume 1 sequence count.

---

## 🚨 ICMP Types & Codes
| Type | Code | Meaning |
|---|---|---|
| **0** | 0 | Echo Reply (Ping answer) |
| **8** | 0 | Echo Request (Ping query) |
| **3** | 0 | Net Unreachable (Routing failure) |
| **3** | 1 | Host Unreachable (Target failed ARP) |
| **3** | 3 | Port Unreachable (Target closed UDP port) |
| **3** | 4 | Fragmentation Needed & DF set (**PMTUD failure**) |
| **3** | 13 | Admin Filtered (Firewall / ACL block) |
| **11** | 0 | Time-to-Live Exceeded in Transit (**Traceroute hop**) |

---

## 📡 DNS Records & RCODEs
- **Port:** UDP 53 (queries/standard replies), TCP 53 (AXFR, >512 B responses)
- **Common Records:** `A` (IPv4), `AAAA` (IPv6), `CNAME` (Alias), `PTR` (Reverse), `MX` (Mail), `TXT` (SPF/C2), `SRV` (Service locator)
- **Response Codes (RCODE):**
  - `0` = NoError (Success)
  - `2` = Server Failure (SERVFAIL)
  - `3` = Non-Existent Domain (NXDOMAIN)
  - `5` = Refused

---

## 🔄 DHCP (DORA) Process
- **Ports:** Client `UDP 68`, Server `UDP 67`
- **Lifecycle:** **D**iscover (`0.0.0.0` ➔ `255.255.255.255`) ➔ **O**ffer ➔ **R**equest ➔ **A**CK
- **Key Options:**
  - `Option 53`: Message Type (1=Discover, 2=Offer, 3=Request, 5=ACK)
  - `Option 1`: Subnet Mask | `Option 3`: Default Gateway (Router)
  - `Option 6`: DNS Servers | `Option 12`: Client Hostname
  - `Option 51`: Lease Time (seconds)

---

## 🔍 Protocol Display Filters
```
# Layer 2 & 3
arp.opcode == 1                        # ARP Requests
arp.opcode == 2                        # ARP Replies
arp.duplicate-address-detected         # IP conflict / ARP Poisoning
icmp.type == 3 && icmp.code == 4       # PMTUD Black Hole detector
icmp.type == 11                        # Traceroute TTL expirations

# TCP Analysis
tcp.flags.syn == 1 && tcp.flags.ack == 0  # Connection initiates / Scans
tcp.flags.reset == 1                   # Resets
tcp.analysis.retransmission            # Packet loss
tcp.analysis.zero_window               # Application buffer lockup
tcp.window_size < 1000 && tcp.flags.reset == 0

# DNS
dns.flags.rcode == 3                   # NXDOMAIN errors
dns.qry.type == 16                     # DNS TXT queries (check for C2)
dns.flags.response == 0 && frame.len > 100 # Large suspicious queries

# Web & Cleartext
http.request.method in {"GET","POST"}
http.response.code >= 400
tls.handshake.type == 1                # TLS Client Hello
tls.handshake.extensions_server_name   # SNI target domain
ftp.request.command in {"USER","PASS"} # FTP credentials
telnet                                 # Telnet plaintext traffic
ssh.protocol                           # SSH cleartext banner strings
```
