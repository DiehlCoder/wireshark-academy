# 📋 Module 02 Cheat Sheet: Wireshark Foundations

## ⌨️ Essential Keyboard Shortcuts
| Shortcut | Action | Shortcut | Action |
|---|---|---|---|
| `Ctrl + E` | Start / Stop Capture | `Ctrl + K` | Capture Options |
| `Ctrl + /` | Jump to Display Filter bar | `Ctrl + F` | Find Packet dialog |
| `Ctrl + G` | Go to specific packet number | `Ctrl + M` | Mark / Unmark packet |
| `Ctrl + Alt + C` | Add comment to selected packet | `Ctrl + \` | Toggle Packet Colorization |
| `Ctrl + Alt + 4` | Time: Seconds since start | `Ctrl + Alt + 6` | Time: Delta from prev packet |
| `Ctrl + Alt + 7` | Time: UTC Date and Time of Day | `Ctrl + Shift + O` | Follow TCP Stream |

---

## ⚖️ Capture Filters (BPF) vs Display Filters
| Feature | Capture Filter (BPF) | Display Filter |
|---|---|---|
| **Engine** | Kernel / libpcap | Wireshark user-space engine |
| **Execution** | Before packet hits memory | After packet is in memory / on disk |
| **Data Loss** | Non-matching packets are **discarded forever** | Non-matching packets are simply hidden |
| **Syntax Example** | `host 10.10.10.20 and port 80` | `ip.addr == 10.10.10.20 && tcp.port == 80` |
| **Use When** | High-throughput capture, disk/CPU constraints | Analysis, triage, hunting, forensics |

---

## 🎯 BPF (Capture Filter) Quick Reference
```
host 10.10.10.20                       # Traffic to/from IP
src net 192.168.0.0/16                 # Source in subnet
port 53                                # TCP or UDP port 53
not port 22                            # Exclude SSH traffic
ether host 08:00:27:aa:bb:cc           # By MAC address
tcp[tcpflags] & tcp-syn != 0           # Any SYN packet
tcp[tcpflags] & (tcp-syn|tcp-ack) == 2 # Initial SYN only (scans / handshakes)
tcp[tcpflags] & tcp-rst != 0           # Any RST packet
tcp[13] == 0x29                        # Xmas scan (FIN+PSH+URG)
tcp[13] == 0x00                        # Null scan (no flags)
ip[8] < 5                              # TTL less than 5
```

---

## 🔍 Display Filters Quick Reference

### Operators
- Equality: `==` or `eq` | Inequality: `!=` or `ne` (use `!(field == val)`)
- Logical: `&&` / `and` | `||` / `or` | `!` / `not`
- Sets: `field in {val1 val2 val3}` or `field in {1..100}`
- Substrings: `contains "text"` | Regex: `matches "(?i)pattern"`
- Bitwise: `&` (e.g. `tcp.flags & 0x02`)

### Core Filters
```
# IP & Transport
ip.addr == 10.10.10.20                 # All traffic to or from host
ip.src == 10.10.10.10 && ip.dst == 10.10.10.20
tcp.flags.syn == 1 && tcp.flags.ack == 0  # Initial connection attempts
tcp.flags.reset == 1                   # Connection resets
tcp.analysis.retransmission            # Packet retransmissions
tcp.analysis.duplicate_ack             # Duplicate ACKs (loss indicator)
tcp.analysis.zero_window               # Buffer exhaustion alert
tcp.stream == 2                        # Follow specific conversation

# DNS
dns.flags.response == 0                # DNS queries
dns.flags.rcode != 0                   # DNS lookup errors (e.g. NXDOMAIN = 3)
dns.qry.type == 16                     # TXT record queries (look for tunneling)

# HTTP & TLS
http.request.method == "POST"          # HTTP form submissions
http.response.code >= 400              # Web client/server errors
http.authorization                     # HTTP Basic Auth credentials
tls.handshake.type == 1                # TLS Client Hello
tls.handshake.extensions_server_name   # TLS SNI target domain

# Plaintext Protocol Auditing
ftp.request.command in {"USER","PASS"} # FTP credentials
telnet                                 # Telnet traffic
```

---

## 🖥️ Command-Line Capturing
```bash
# dumpcap (highest performance, no packet drop)
dumpcap -i eth0 -w capture.pcapng
dumpcap -i eth0 -b filesize:102400 -b files:10 -w ring.pcapng   # 10x 100MB ring buffer

# tcpdump
sudo tcpdump -i eth0 -nn -s0 -w output.pcap
sudo tcpdump -i eth0 -nn -A port 80    # Print payload in ASCII
sudo tcpdump -r output.pcap -nn 'tcp[tcpflags] & tcp-syn != 0'

# Remote capture stream over SSH into Wireshark
ssh user@remote "sudo tcpdump -i eth0 -U -s0 -w - 'not port 22'" | wireshark -k -i -
```
