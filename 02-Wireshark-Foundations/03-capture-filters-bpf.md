# 02.03: Capture Filters (BPF)

**Level:** 🟢 Beginner | **Time:** 1 h | **XP:** 100

## 🎯 Learning Objectives
- Write Berkeley Packet Filter (BPF) expressions
- Know when (and when not) to use capture filters
- Use byte-offset filters for TCP flags

---

## 1. What Is BPF?
Capture filters use **BPF syntax** (the same syntax as tcpdump). They're compiled into bytecode and run **in the kernel**, so they're very fast. Packets that don't match are **never saved**.

> ⚠️ Capture filter syntax ≠ display filter syntax!
> Capture: `host 10.10.10.20 and port 80`
> Display: `ip.addr == 10.10.10.20 && tcp.port == 80`

---

## 2. Syntax Building Blocks

**Qualifiers:** `type` (host, net, port, portrange) · `dir` (src, dst) · `proto` (ether, ip, ip6, arp, tcp, udp, icmp)

| Filter | Meaning |
|---|---|
| `host 10.10.10.20` | To or from this IP |
| `src host 10.10.10.10` | Only from this IP |
| `dst net 10.10.10.0/24` | To this subnet |
| `port 53` | TCP or UDP port 53 |
| `tcp port 80` | Only TCP 80 |
| `portrange 1-1024` | Port range |
| `ether host 08:00:27:aa:aa:aa` | By MAC address |
| `arp` / `icmp` / `ip6` | By protocol |
| `broadcast` / `multicast` | L2 broadcast/multicast |
| `less 128` / `greater 1000` | By packet length |
| `not port 22` | Exclude SSH (your own session) |
| `host 10.10.10.20 and (port 80 or port 443)` | Combine with and / or / not and parentheses |

Operators: `and` (`&&`), `or` (`||`), `not` (`!`). Quote complex filters in the shell: `'...'`.

---

## 3. Byte-Offset Filters (Advanced)
Syntax: `proto[offset:size]`, where size is 1, 2 or 4 bytes.

| Filter | Meaning |
|---|---|
| `tcp[tcpflags] & tcp-syn != 0` | Any packet with SYN set |
| `tcp[tcpflags] & (tcp-syn\|tcp-ack) == tcp-syn` | Only initial SYNs (connection attempts, scans!) |
| `tcp[tcpflags] & tcp-rst != 0` | Resets |
| `tcp[13] == 0x29` | FIN+PSH+URG = Nmap **Xmas** scan |
| `tcp[13] == 0` | No flags = Nmap **NULL** scan |
| `icmp[icmptype] == icmp-echo` | Ping requests |
| `ip[8] < 5` | TTL lower than 5 (traceroute-like) |
| `udp[8:2] == 0x0000` | First 2 payload bytes are zero |
| `tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420` | Payload starts with `GET ` (HTTP GET) |

Byte 13 of the TCP header holds the flags: `CWR ECE URG ACK PSH RST SYN FIN` = `128 64 32 16 8 4 2 1`.

---

## 4. When to Use Capture Filters
| ✅ Use them when | ❌ Avoid them when |
|---|---|
| The link is busy and you'd drop packets | You're not sure what you're looking for |
| Privacy rules forbid capturing other traffic | You're doing incident response (you might filter out the attacker!) |
| Long-term captures of one specific service | Short captures on a quiet network |

> 💡 **Analyst wisdom:** "Capture wide, filter narrow." Capture everything you're allowed to, then use display filters.

Test a BPF filter before using it (Kali):
```bash
dumpcap -f "tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn" -d -i eth0 | head   # prints compiled BPF code
```

---

## 5. 🎯 Mission: Filter Gauntlet
Write the capture filter, test it with `sudo tcpdump -i eth0 -nn '<filter>'`, and generate matching traffic:

| # | Goal | Your filter |
|---|---|---|
| 1 | Only traffic to/from metasploitable2 | |
| 2 | Only DNS | |
| 3 | Everything except SSH and ARP | |
| 4 | Only TCP SYN packets (no SYN/ACK) | |
| 5 | Only ICMP echo **replies** | |
| 6 | Only HTTP traffic between Kali and ubuntu-srv | |

Generate traffic: `ping`, `dig @10.10.10.20 www.lab.local`, `curl`, `nmap -sS 10.10.10.30 -p 1-100`.

<details><summary>Solutions</summary>

1. `host 10.10.10.30`
2. `port 53`
3. `not port 22 and not arp`
4. `tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn`
5. `icmp[icmptype] == icmp-echoreply`
6. `host 10.10.10.10 and host 10.10.10.20 and tcp port 80`
</details>

---

## 🧠 Knowledge Check
1. Where are capture filters executed?
2. Translate to BPF: "UDP traffic from 10.10.10.30 on ports 1–1024".
3. Which value in `tcp[13]` matches a pure SYN?

<details><summary>Answers</summary>

1. In the kernel (compiled BPF bytecode), before packets reach Wireshark.
2. `udp and src host 10.10.10.30 and src portrange 1-1024` (or `portrange` without `src`, depending on the intent).
3. `0x02` (decimal 2).
</details>

---
⬅️ [02 Capturing Traffic](02-capturing-traffic.md) | ➡️ [04 Display Filters](04-display-filters.md)


