# 📋 Module 04 Cheat Sheet: Advanced Wireshark & TShark

## 📊 Statistics & Triage Menu Shortcuts
| Analysis Task | Menu Path | What to Look For |
|---|---|---|
| **Inventory protocols** | *Statistics ➔ Protocol Hierarchy* | Rogue protocols, excessive broadcast % |
| **Find Top Talkers** | *Statistics ➔ Conversations ➔ IPv4* | Sort by Bytes descending |
| **Inventory all machines** | *Statistics ➔ Endpoints ➔ IPv4* | Excessive connection counts (scanning) |
| **Visualize throughput** | *Statistics ➔ I/O Graphs* | Spikes, micro-bursts (set interval to 10ms) |
| **Diagnose TCP health** | *Statistics ➔ TCP Stream Graphs ➔ tcptrace* | Stalls, flatlines, buffer exhaustion |
| **Carve files** | *File ➔ Export Objects ➔ HTTP / SMB* | Extracted binaries, documents, images |

---

## 💻 TShark Power One-Liners
```bash
# Live capture with display filter to stdout
tshark -i eth0 -Y "http.request"

# Extract custom fields to clean CSV
tshark -r cap.pcapng -Y "dns.flags.response==0" \
  -T fields -e ip.src -e dns.qry.name \
  -E header=y -E separator=, > dns_queries.csv

# Extract distinct TLS SNI domains
tshark -r cap.pcapng -Y "tls.handshake.extensions_server_name" \
  -T fields -e tls.handshake.extensions_server_name | sort -u

# Decrypt TLS on the fly via SSLKEYLOGFILE
tshark -r cap.pcapng -o "tls.keylog_file:/tmp/sslkeys.log" -Y "http"

# Count top talkers
tshark -r cap.pcapng -q -z conv,ip
```

---

## 🛠️ CLI File Surgery Tools
```bash
# capinfos: Instant capture file summary & checksum
capinfos capture.pcapng

# editcap: Slice specific packet range (e.g. packets 500 to 1200)
editcap -r full.pcapng slice.pcapng 500-1200

# editcap: Slice specific time window
editcap -A "2026-10-16 14:00:00" -B "2026-10-16 14:15:00" in.pcapng out.pcapng

# editcap: Deduplicate identical packets
editcap -d in.pcapng deduplicated.pcapng

# editcap: Strip payloads for privacy/GDPR (snaplen 96 bytes)
editcap -s 96 in.pcapng headers_only.pcapng

# mergecap: Combine multiple captures chronologically
mergecap -w combined.pcapng file1.pcapng file2.pcapng
```

---

## 🔑 TLS Decryption Setup
1. **Set client environment variable:**
   ```bash
   export SSLKEYLOGFILE=/tmp/sslkeys.log
   ```
2. **Configure Wireshark:**
   *Edit ➔ Preferences ➔ Protocols ➔ TLS* ➔ *(Pre)-Master-Secret log filename* = `/tmp/sslkeys.log`
3. **Generate HTTPS traffic:**
   ```bash
   curl -k https://target/
   ```
4. **Result:** Port 443 dissects as cleartext `HTTP` / `HTTP2`!

---

## ⚡ Performance Troubleshooting Display Filters
```
# Latency & Stalls
tcp.time_delta > 1.0                   # Gaps over 1 sec in conversation
tcp.analysis.initial_rtt > 0.05        # Baseline network latency over 50ms
tcp.analysis.ack_rtt > 0.1             # Packet ACK RTT over 100ms
http.time > 2.0                        # Server backend took over 2 seconds

# Packet Loss & Buffer Issues
tcp.analysis.retransmission            # Packet retransmissions
tcp.analysis.duplicate_ack             # Loss indicator / out-of-order
tcp.analysis.zero_window               # Receiving application buffer full!
tcp.analysis.window_full               # Sender hit receiver window cap
```

---

## 🧪 Linux Network Impairment (`tc netem`)
```bash
# Add 100ms latency (+/- 10ms jitter) and 5% packet loss
sudo tc qdisc add dev eth0 root netem delay 100ms 10ms loss 5%

# Remove impairment
sudo tc qdisc del dev eth0 root
```
