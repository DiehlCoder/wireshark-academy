# 03.03: TCP Deep Dive: Handshakes, Teardown & Troubleshooting

**Level:** 🟡 Intermediate | **Time:** 2.5 h | **XP:** 200

## 🎯 Learning Objectives
- Dissect the 20-byte TCP header and critical TCP options (MSS, Window Scale, SACK)
- Understand Sequence and Acknowledgment arithmetic (Relative vs. Absolute)
- Map the 3-Way Handshake and 4-Way Teardown against the TCP State Machine
- Master Wireshark's TCP Expert Analysis flags (Retransmissions, Dup ACKs, Zero Window)
- Calculate Bandwidth-Delay Product (BDP) for business cloud applications

---

## 1. The TCP Header Architecture (RFC 793, RFC 9293)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 1.1 The 9 Control Flags:
- **SYN (Synchronize):** Initializes a connection; synchronizes Initial Sequence Numbers (ISN).
- **ACK (Acknowledgment):** Indicates the `Acknowledgment Number` field contains valid data. (Set on almost every packet after initial SYN).
- **FIN (Finish):** Sender has finished transmitting data; gracefully closes half of the connection.
- **RST (Reset):** Aborts a connection immediately. Sent when a port is closed or connection state is corrupt.
- **PSH (Push):** Tells the receiving TCP stack to push data to the application layer immediately without waiting for buffer to fill.
- **URG (Urgent):** Data pointed to by the Urgent Pointer should be processed out-of-band.
- **ECE / CWR:** Explicit Congestion Notification (RFC 3168) signaling router congestion.
- **NS (Nonce Sum):** RFC 3540 ECN protection.

### 1.2 Critical TCP Options (Negotiated during SYN):
| Option | Kind | Why it exists |
|---|---|---|
| **MSS (Maximum Segment Size)** | 2 | Declares the max payload size this host can receive (usually 1460 bytes for Ethernet). |
| **Window Scale (WSopt)** | 3 | Multiplies the 16-bit Window field by $2^N$ (up to $1\text{ GB}$ window). Crucial for gigabit and cloud networks! |
| **SACK Permitted** | 4 | Selective ACK: lets receiver acknowledge non-contiguous blocks, avoiding retransmitting already received data. |
| **Timestamps** | 8 | Measures Round Trip Time (RTT) and protects against wrapped sequence numbers (PAWS). |

---

## 2. The 3-Way Handshake & Sequence Number Math

Wireshark by default shows **Relative Sequence Numbers** starting at `0` for readability. 
Under the hood, real TCP uses random 32-bit **Absolute Sequence Numbers (ISN)** to prevent spoofing.

```
Client (10.10.10.10)                                 Server (10.10.10.20)
       │                                                     │
  [1]  ├──────────── SYN (Seq=0) ───────────────────────────►│ (State: SYN_RCVD)
       │                                                     │
  [2]  │◄─────────── SYN+ACK (Seq=0, Ack=1) ─────────────────┤ 
       │                                                     │
  [3]  ├──────────── ACK (Seq=1, Ack=1) ────────────────────►│ (State: ESTABLISHED)
       │                                                     │
```

### The Rule of Sequence and Acknowledgment Numbers:
- **SYN and FIN flags consume 1 sequence number** (they are treated as 1 virtual byte of data).
- **ACK number = The NEXT byte of data the receiver expects to see.**
- If Client sends $500\text{ bytes}$ of data starting at `Seq=1`, the Server replies with `Ack=501`.

---

## 3. Connection Teardown: Graceful FIN vs. Harsh RST

### 3.1 The 4-Way Teardown (Graceful)
TCP is **full-duplex** (two independent unidirectional communication streams). Closing requires both sides to agree:

```
Client                                               Server
   ├──────────── FIN (Seq=100, Ack=500) ────────────►│ (Client state: FIN_WAIT_1)
   │◄─────────── ACK (Seq=500, Ack=101) ─────────────┤ (Server state: CLOSE_WAIT)
   │                                                 │ (Client state: FIN_WAIT_2)
   │◄─────────── FIN (Seq=500, Ack=101) ─────────────┤ (Server state: LAST_ACK)
   ├──────────── ACK (Seq=101, Ack=501) ────────────►│ (Server state: CLOSED)
   │                                                 │ (Client waits 2*MSL in TIME_WAIT)
```

> 💡 **Why `TIME_WAIT`?** The client stays in `TIME_WAIT` (typically 60–120 seconds) to ensure its final ACK was received by the server, and to prevent old delayed packets from colliding with a new connection reusing the same port.

### 3.2 The Reset (RST)
If a client sends a SYN to port 8080 where no service is listening, or if a firewall abruptly terminates an unauthorized session, the recipient responds with a **RST+ACK**. A reset has no ACK delay and closes the socket immediately.

---

## 4. Wireshark's TCP Expert Analysis Engine

Wireshark inspects sequence numbers in the background and tags anomalies:

| Wireshark Expert Warning | Technical Cause | Root Cause in Enterprise |
|---|---|---|
| `[TCP Retransmission]` | Sender did not receive an ACK before its RTO (Retransmission Timeout) timer expired. | Packet dropped due to switch congestion or bad cable. |
| `[TCP Fast Retransmission]` | Sender received 3 Duplicate ACKs and retransmitted immediately without waiting for RTO. | Loss on a high-throughput link. |
| `[TCP Duplicate ACK]` | Receiver received an out-of-order packet; alerts sender to the missing byte range. | Packet lost in transit or packet reordering by multi-path routing. |
| `[TCP ZeroWindow]` | Receiver advertised `Window Size: 0`. Sender MUST stop sending data. | The application process on the receiver is hung or CPU pegged; its OS socket buffer is full. |
| `[TCP Window Full]` | Sender has transmitted all data up to the receiver's advertised window limit. | Throughput is bottlenecked by window size or latency. |
| `[TCP ACKed unseen segment]` | Wireshark saw an ACK for data that was never captured in the PCAP file. | Packet dropped by the capturing NIC / SPAN port overload. |

---

## 5. 🎯 Mission: Analyze Handshake & Teardown in Wireshark

1. On Kali, start Wireshark on `eth0`, filter: `tcp.port == 80`.
2. In terminal, fetch the test webpage:
   ```bash
   curl -v http://10.10.10.20/login.html
   ```
3. Stop capture. Select the conversation packets.
4. **Inspect the Handshake:**
   - Frame 1: Check `Flags: 0x002 (SYN)`. Open `Options`: verify `MSS: 1460`, `SACK permitted`, `Window scale`.
   - Frame 2: Check `Flags: 0x012 (SYN, ACK)`.
   - Frame 3: Check `Flags: 0x010 (ACK)`.
5. **Inspect the Teardown:**
   - Locate the FIN packets. Note which side initiated the teardown (curl or Apache).
6. **Follow TCP Stream:**
   - Right-click any packet ➔ **Follow ➔ TCP Stream**.
   - Notice red text = client request, blue text = server response.

---

## 💼 Business Corner: The Bandwidth-Delay Product (BDP)
Why do multi-gigabit cloud connections often feel sluggish?

$$\text{BDP (bits)} = \text{Bandwidth (bits/sec)} \times \text{Round Trip Time (seconds)}$$

**Scenario:** A company replicates database backups between Frankfurt and New York:
- Bandwidth: $1\text{ Gbps}$ ($1,000,000,000\text{ bps}$)
- Latency (RTT): $80\text{ ms}$ ($0.080\text{ s}$)
- $\text{BDP} = 1,000,000,000 \times 0.080 = 80,000,000\text{ bits} = \mathbf{10\text{ Megabytes}}$

**The Problem:** The standard original TCP window field is only 16-bit ($65,535\text{ bytes} \approx 64\text{ KB}$).
Without **TCP Window Scaling (RFC 7323)**, the maximum achievable throughput is:

$$\text{Max Throughput} = \frac{\text{Window Size}}{\text{RTT}} = \frac{65,535 \times 8}{0.080} \approx \mathbf{6.55\text{ Mbps}}$$

A $1\text{ Gbps}$ circuit is utilized at less than 1% because of TCP window limits! Network engineers must verify that TCP Window Scaling is enabled on cloud servers and not stripped by legacy firewalls.

---

## 🧠 Knowledge Check
1. Why does an initial SYN packet consume 1 sequence number if it carries 0 bytes of payload?
2. What are the three TCP options negotiated strictly inside the SYN and SYN/ACK packets?
3. What does a `[TCP ZeroWindow]` message indicate about the receiving system?
4. What is the difference between a TCP FIN teardown and a TCP RST?

<details><summary>Answers</summary>

1. TCP assigns a sequence number to the SYN flag so that the receiver can reliably acknowledge its receipt.
2. MSS (Maximum Segment Size), Window Scale (WSopt), and SACK Permitted.
3. The receiving system's application is not reading data from its OS buffer fast enough, so the buffer is completely full. The sender must pause transmission.
4. A FIN is a graceful, full-duplex negotiation where both sides flush buffers and close cleanly. A RST is an immediate, unacknowledged termination that drops the connection state instantly.
</details>

---
⬅️ [02 IP & ICMP](02-ip-and-icmp.md) | ➡️ [04 UDP & DNS](04-udp-and-dns.md)
