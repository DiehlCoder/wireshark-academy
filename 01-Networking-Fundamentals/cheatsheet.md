# 📋 Module 01 Cheat Sheet: Networking Fundamentals

## OSI Model
| # | Layer | PDU | Address | Examples | Device |
|---|---|---|---|---|---|
| 7 | Application | Data | URL/host | HTTP, DNS, SMTP, SSH | Proxy/WAF |
| 6 | Presentation | Data | — | TLS, UTF-8, JPEG | — |
| 5 | Session | Data | — | NetBIOS, RPC | — |
| 4 | Transport | Segment/Datagram | Port | TCP, UDP | Stateful FW |
| 3 | Network | Packet | IP | IPv4/6, ICMP | Router |
| 2 | Data Link | Frame | MAC | Ethernet, ARP, 802.1Q | Switch |
| 1 | Physical | Bits | — | Cable, radio | Hub, NIC |

**Mnemonic (1→7):** Please Do Not Throw Sausage Pizza Away

## Header Sizes
| Header | Size |
|---|---|
| Ethernet II | 14 B (+4 B FCS, +4 B per VLAN tag) |
| IPv4 | 20 B (up to 60 B with options) |
| IPv6 | 40 B fixed |
| TCP | 20 B (up to 60 B with options) |
| UDP | 8 B |
| ICMP | 8 B |

## Identification Fields
| Field | Value → Meaning |
|---|---|
| EtherType | 0x0800 IPv4 · 0x0806 ARP · 0x86DD IPv6 · 0x8100 VLAN |
| IP Protocol | 1 ICMP · 6 TCP · 17 UDP · 47 GRE · 50 ESP · 58 ICMPv6 |
| Default TTL | 64 Linux/macOS · 128 Windows · 255 network devices |

## Subnetting
| CIDR | Mask | Hosts | Block |
|---|---|---|---|
| /24 | .0 | 254 | 256 |
| /25 | .128 | 126 | 128 |
| /26 | .192 | 62 | 64 |
| /27 | .224 | 30 | 32 |
| /28 | .240 | 14 | 16 |
| /29 | .248 | 6 | 8 |
| /30 | .252 | 2 | 4 |

**Magic number** = 256 − mask octet → subnets are multiples of it.

## Special Addresses
`10/8` `172.16/12` `192.168/16` private · `127/8` loopback · `169.254/16` APIPA (DHCP failed) · `224/4` multicast · `fe80::/10` IPv6 link-local · `ff00::/8` IPv6 multicast

## Key Ports
21 FTP · 22 SSH · 23 Telnet · 25 SMTP · 53 DNS · 67/68 DHCP · 80 HTTP · 110 POP3 · 123 NTP · 137-139 NetBIOS · 143 IMAP · 161 SNMP · 389 LDAP · 443 HTTPS · 445 SMB · 3306 MySQL · 3389 RDP · 5900 VNC · 8080 HTTP-alt

## Linux Network Commands
```bash
ip -br addr            # IPs
ip -br link            # MACs / link state
ip route               # routing table
ip neigh               # ARP cache
ss -tulpn              # listening sockets
ping -c 4 HOST         # ICMP reachability
traceroute HOST        # path (UDP by default; -I = ICMP, -T = TCP)
dig @SERVER NAME       # DNS lookup
ipcalc 10.0.0.1/27     # subnet calculator
```

## Windows Equivalents
```powershell
ipconfig /all ; Get-NetIPAddress
route print ; Get-NetRoute
arp -a ; Get-NetNeighbor
netstat -ano ; Get-NetTCPConnection -State Listen
Test-NetConnection HOST -Port 443
tracert HOST ; nslookup NAME
```

## Troubleshooting Approaches
Bottom-up (outage) · Top-down (single app broken) · Divide & conquer (start with ping at L3) · Follow the path
