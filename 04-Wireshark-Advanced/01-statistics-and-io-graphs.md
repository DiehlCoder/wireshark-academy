# 04.01: Statistics, Endpoints & I/O Graphs

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Use **Protocol Hierarchy** to rapidly inventory unknown PCAP files
- Identify top talkers and scanning sweeps using **Conversations** and **Endpoints**
- Build multi-metric, dynamic **I/O Graphs** to visualize throughput, latency, and packet loss
- Adjust graph calculation intervals to expose micro-bursts and buffer overruns
- Export visual metrics for executive capacity planning reports

---

## 1. Top-Down Triage with Statistics

When an analyst receives an unfamiliar 500 MB capture file, opening packets sequentially is the slowest possible method. Advanced analysts start with the **Statistics** menu.

### 1.1 Protocol Hierarchy (*Statistics ➔ Protocol Hierarchy*)
Displays a tree showing percentage of frames and bytes per protocol.

```
Protocol                       % Packets   Packets   % Bytes   Bytes
▼ Frame                        100.0%      10000     100.0%    8.4 MB
  ▼ Ethernet                   100.0%      10000     100.0%    8.4 MB
    ▼ Internet Protocol Ver 4  98.2%       9820      97.8%     8.2 MB
      ▼ Transmission Control    92.1%       9210      95.1%     8.0 MB
        ► Hypertext Transfer    65.4%       6540      88.2%     7.4 MB
        ► Transport Layer Sec   26.7%       2670       6.9%     580 KB
      ► User Datagram Protocol  6.1%         610       2.7%     226 KB
    ► Address Resolution Proto  1.8%         180       0.2%      10 KB
```

**What to look for immediately:**
- **Rogue protocols:** BitTorrent, IRC, Telnet, or cleartext databases in a DMZ capture.
- **Broadcast storms:** ARP or NetBIOS taking up $>10\%$ of total bandwidth indicates a switching loop or misconfiguration.
- **Suspicious UDP:** Massive volume of UDP on non-standard ports (amplification DDoS or C2 exfiltration).

---

## 2. Endpoints & Conversations

### 2.1 Conversations (*Statistics ➔ Conversations*)
Shows bidirectional communication between pairs of hosts across Ethernet (L2), IPv4/IPv6 (L3), and TCP/UDP (L4).

- Click the **IPv4** tab and sort by **Bytes ➔** instantly reveals the **"Top Talker"** consuming bandwidth.
- Click the **TCP** tab ➔ right-click any conversation ➔ **Apply as Filter ➔ Selected** to immediately isolate those two hosts in the main window!

### 2.2 Endpoints (*Statistics ➔ Endpoints*)
Lists every individual machine that sent or received traffic in the PCAP.
- If a single internal IP has connections to 10,000 distinct IP addresses on port 445 or 22, it is actively running a **network scan or worm propagation**.
- If external IPs are present, enable *Map ➔ Open in Browser* to visually geolocate external connections on a global map!

---

## 3. Mastering I/O Graphs (*Statistics ➔ I/O Graphs*)

I/O Graphs plot network metrics over time, turning millions of packet timestamps into an intuitive timeline.

```
 Throughput (Packets/s)
   │
800│         ▲ (Spike: SYN Flood / Port Scan)
   │        ╱ ╲
400│       ╱   ╲                  ▲ (Normal Traffic)
   │  ────┴─────┴───────────────┴─┴────────
 0 └───────────────────────────────────────► Time (seconds)
   0s    10s    20s    30s    40s    50s
```

### 3.1 Creating a 3-Layer Diagnostic Graph
Click `+` in the bottom-left of the I/O Graphs window to add lines:

| Graph Name | Display Filter | Color | Y-Axis Calculation | Purpose |
|---|---|---|---|---|
| **All Traffic** | *(leave blank)* | Black | `Packets/s` | Overall activity baseline |
| **TCP Retransmissions** | `tcp.analysis.retransmission` | Red | `Packets/s` | Spikes indicate packet loss / congestion |
| **HTTP Errors** | `http.response.code >= 400` | Orange | `COUNT(frame.len)` | Web application failures |
| **TCP Round Trip Time** | `tcp.analysis.ack_rtt` | Blue | `AVG(tcp.analysis.ack_rtt)` | Network latency fluctuations |

### 3.2 Unmasking Micro-Bursts (The Interval Trick)
By default, the I/O Graph interval is **1 sec**. 
On a 1 Gbps link, a switch buffer holds only a few megabytes. A burst of traffic that peaks at 1.5 Gbps for **50 milliseconds** will drop packets and cripple VoIP or database transactions, yet appear as a gentle, normal 100 Mbps average on a 1-second graph!

- Change **Interval** from `1 sec` ➔ `10 millisec` or `1 millisec`.
- Watch the smooth baseline break out into sharp, high-amplitude micro-burst spikes!

---

## 4. 🎯 Mission: Build a Diagnostic I/O Graph

### Step 1: Generate Mixed Lab Traffic
On **Kali**, run this automated traffic generation loop:
```bash
# 1. Normal web traffic
for i in $(seq 1 30); do curl -s http://10.10.10.20/ >/dev/null; done

# 2. Web errors (404)
for i in $(seq 1 20); do curl -s http://10.10.10.20/nonexistent-$i.html >/dev/null; done

# 3. Connection reset bursts (closed ports)
for i in $(seq 1 25); do nc -zv -w1 10.10.10.20 90$i 2>/dev/null; done
```

### Step 2: Analyze in Wireshark
1. Stop capture and open *Statistics ➔ Protocol Hierarchy*.
   - What percentage of packets are TCP?
2. Open *Statistics ➔ Conversations ➔ IPv4*.
   - Which two IP addresses exchanged the most bytes?
3. Open *Statistics ➔ I/O Graphs*:
   - Graph 1: `All Traffic` (Color: Black)
   - Graph 2: `http.response.code == 404` (Color: Red, Style: FBar)
   - Graph 3: `tcp.flags.reset == 1` (Color: Orange, Style: Line)
4. Correlate the graph:
   - Click on the peak of the Red bar in the graph ➔ notice Wireshark automatically jumps to the corresponding packet in the main packet list!

---

## 💼 Business Corner: Network Capacity & SLA Reporting
Network engineers frequently face finger-pointing from software developers: *"The network is slow!"*

Using I/O Graphs and TCP RTT statistics, an analyst can objectively prove where latency originates:
1. Plot `tcp.analysis.initial_rtt` (Time from client SYN to server SYN/ACK) = **Network Transit Time**.
2. Plot `http.time` (Time from client HTTP GET to server HTTP 200 response) = **Server Application Processing Time**.

If the Network Transit Time is **2 ms** while the Server Application Time is **4,800 ms**, the analyst has concrete, mathematical evidence that the network is performing flawlessly and the database or application backend is bottlenecked.

---

## 🧠 Knowledge Check
1. Where in Wireshark can you quickly verify if an unfamiliar capture file contains unexpected cleartext protocols?
2. How do you find the single host that transmitted the highest volume of bytes in a capture?
3. What is a "micro-burst" and why does a 1-second I/O graph fail to reveal it?
4. How do you jump directly to the packets that caused a spike in an I/O Graph?

<details><summary>Answers</summary>

1. *Statistics ➔ Protocol Hierarchy*.
2. Open *Statistics ➔ Endpoints ➔ IPv4* (or *Conversations*) and click the **Bytes** column to sort in descending order.
3. A micro-burst is an extremely brief spike in traffic volume (lasting a few milliseconds) that exceeds switch port buffer capacity, causing packet drops. A 1-second interval averages out the spike over 1,000 milliseconds, hiding the peak.
4. Click directly on the peak or data point in the I/O Graph window; Wireshark synchronizes the main packet list to that exact timestamp.
</details>

---
⬅️ [Module 03 Cheat Sheet](../03-Protocol-Analysis/cheatsheet.md) | ➡️ [02 Streams & Object Extraction](02-streams-and-object-extraction.md)
