# 04.05: Network Performance & Latency Troubleshooting

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Objectively distinguish between **Network Delay**, **Server Delay**, and **Client Bottlenecks**
- Master critical TCP latency metrics (`tcp.analysis.initial_rtt`, `tcp.time_delta`, `tcp.analysis.ack_rtt`)
- Diagnose TCP flow control exhaustion (Zero Window, Window Full)
- Utilize **TCP Stream Graphs** (tcptrace, Round Trip Time, Window Scaling)
- Simulate realistic network impairment (latency & packet loss) using Linux `tc netem`

---

## 1. The Blame Game: Who is Causing the Delay?

When users complain of sluggish applications, IT departments often waste months upgrading bandwidth from 1 Gbps to 10 Gbps without solving the problem. 
Bandwidth is **capacity**; latency is **speed**.

```
Client                                                  Server
  │                                                       │
  ├─── SYN ──────────────────────────────────────────────►│ \
  │                                                       │  } Network RTT (Network Transit Time)
  │◄── SYN+ACK ───────────────────────────────────────────┤ /
  ├─── ACK ──────────────────────────────────────────────►│
  │                                                       │
  ├─── HTTP GET /api/data ───────────────────────────────►│ \
  │    .                                                  │  |
  │    . (Server processing query / database lock)        │  } Server Response Time (Application Delay)
  │    .                                                  │  |
  │◄── HTTP 200 OK (First data segment) ──────────────────┤ /
```

### The Triage Formula:
1. **Network Transit Time:** Measured by the initial TCP 3-way handshake (`tcp.analysis.initial_rtt`). If this is 15 ms, the network cable/fiber path takes 15 ms round-trip.
2. **Server Application Processing Time:** Time between the client's completed request (e.g. HTTP GET or SQL query) and the server's first payload response. If this is 4,200 ms, the delay is **100% server/software backend**.
3. **Client Delay:** High delta times after the server sends data before the client acknowledges or requests the next chunk, or repeated `TCP ZeroWindow` advertisements.

---

## 2. Advanced TCP Stream Graphs (*Statistics ➔ TCP Stream Graphs*)

Wireshark provides visual diagnostic plotting tools specifically for TCP streams:

### 2.1 Time-Sequence Graph (tcptrace)
Plots Sequence Numbers against Time.
- **Healthy connection:** A smooth, steep upward diagonal line (consistent steady throughput).
- **Packet Loss / Stall:** A horizontal flat line followed by a vertical jump (connection paused waiting for timeout, then burst retransmitted).
- **Buffer Exhaustion:** The line hits a flat ceiling created by the advertised receive window.

### 2.2 Round Trip Time (RTT) Graph
Plots calculated RTT over the lifetime of the conversation.
- Spikes identify temporary switch congestion or Wi-Fi interference.

### 2.3 Window Scaling Graph
Displays the receiver's available buffer space over time.
- If the curve dips to 0, the receiving application is failing to consume data from its OS socket buffer.

---

## 3. Wireshark Filter Toolkit for Performance Triage

```
# 1. Show all packets where response took longer than 1 second:
tcp.time_delta > 1.0

# 2. Show packets where network round-trip time exceeded 100 ms:
tcp.analysis.ack_rtt > 0.1

# 3. Find connections where receiver ran out of buffer:
tcp.analysis.zero_window

# 4. Find connections where sender hit receiver window limit:
tcp.analysis.window_full

# 5. Find packet loss events:
tcp.analysis.retransmission || tcp.analysis.fast_retransmission
```

---

## 4. 🎯 Mission: Simulate Impairment with Linux `tc netem`

We will inject artificial latency and packet loss into the lab network using Linux kernel **Traffic Control (tc)**, capture the degraded traffic, and analyze the damage in Wireshark!

### Step 1: Inject Latency & Loss on Ubuntu Server
On **ubuntu-srv**:
```bash
# Add 100ms latency (+/- 10ms jitter) and 5% packet loss on the lab interface
sudo tc qdisc add dev enp0s3 root netem delay 100ms 10ms loss 5%

# Verify impairment rule is active
sudo tc qdisc show dev enp0s3
```

### Step 2: Capture Degraded Traffic from Kali
1. On Kali, launch Wireshark on `eth0`.
2. In terminal, download a file or fetch the web page:
   ```bash
   time curl -s http://10.10.10.20/login.html >/dev/null
   ```
   *(Notice how the command takes significantly longer than normal!)*
3. Stop capture.

### Step 3: Analyze the Impairment in Wireshark
1. Filter: `tcp.analysis.flags`.
   - Observe the flurry of `[TCP Retransmission]`, `[TCP Fast Retransmission]`, and `[TCP Dup ACK]` notifications!
2. Open *Statistics ➔ TCP Stream Graphs ➔ Time-Sequence (tcptrace)*:
   - Notice the jagged steps and flat pauses where packet loss stalled the pipeline.
3. Open *Statistics ➔ TCP Stream Graphs ➔ Round Trip Time*:
   - Verify the RTT data points hover around ~100–120 ms, matching your `tc` configuration!

### Step 4: Clean Up Impairment on Ubuntu Server
On **ubuntu-srv**:
```bash
# Remove the impairment rules
sudo tc qdisc del dev enp0s3 root
sudo tc qdisc show dev enp0s3
```

---

## 💼 Business Corner: Avoiding Unnecessary Bandwidth Upgrades
A European manufacturing enterprise suffered from terrible performance in their SAP ERP system. Branch offices in Milan reported that downloading customer invoices took 45 seconds.

Management was preparing to sign a **€180,000/year contract** to upgrade the Milan WAN connection from 100 Mbps to 1 Gbps.

A network analyst captured the traffic in Wireshark and evaluated the metrics:
1. Average bandwidth utilization was only **6 Mbps** of the available 100 Mbps.
2. The initial TCP handshake was **32 ms** (excellent fiber latency).
3. The server sent 1 packet, then waited **4.2 seconds** for the database before sending the next packet.
4. The client application generated **18 sequential database round-trips** per invoice download instead of 1 batched query ($18 \times 2.5\text{ s} = 45\text{ seconds}$).

**Outcome:** The analyst cancelled the €180,000 WAN upgrade, gave the PCAP to the database team, who added an index to the SQL table. Invoice download times dropped to **0.6 seconds** at zero hardware cost!

---

## 🧠 Knowledge Check
1. How does Wireshark calculate the baseline network transit time (`tcp.analysis.initial_rtt`)?
2. What is the technical difference between network latency and server response time?
3. What does a horizontal flat section in a tcptrace Time-Sequence graph represent?
4. How do you simulate 50ms of network delay on a Linux interface using `tc`?

<details><summary>Answers</summary>

1. It measures the elapsed time between the client's initial SYN packet and the server's SYN/ACK packet.
2. Network latency is the time packets take to travel across cables and routers. Server response time is the duration the server's CPU and application take to process a request and generate the response.
3. A stall or pause in transmission, typically caused by waiting for an ACK, packet loss retransmission timeouts, or window exhaustion.
4. `sudo tc qdisc add dev <interface> root netem delay 50ms`
</details>

---
⬅️ [04 Decrypting TLS](04-decrypting-tls.md) | ➡️ [Module 04 Cheat Sheet](cheatsheet.md) | ➡️ [Module 05](../05-Nmap/01-host-discovery.md)
