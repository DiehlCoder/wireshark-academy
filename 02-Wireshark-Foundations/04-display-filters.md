# 02.04: Display Filters: Your Superpower

**Level:** 🟢→🟡 | **Time:** 1.5 h | **XP:** 150

## 🎯 Learning Objectives
- Write display filters with fields, operators and functions
- Build filters from the GUI (Apply/Prepare as Filter)
- Save filter buttons for daily use
- Master the 40 filters every analyst uses

---

## 1. Anatomy of a Display Filter
```
   protocol.field   operator   value
   ip.src           ==         10.10.10.10
   tcp.flags.syn    ==         1
   http.request.method == "POST"
```
- Green filter bar = valid ✅, red = syntax error ❌, yellow = valid but probably not what you meant ⚠️
- Every field in the Packet Details pane has a filter name. Click a field and look at the **status bar**.
- Full reference: <https://www.wireshark.org/docs/dfref/>

---

## 2. Operators

| Operator | C-style | Example |
|---|---|---|
| eq | `==` | `ip.addr == 10.10.10.20` |
| ne | `!=` | `tcp.port != 22` |
| gt / lt / ge / le | `>` `<` `>=` `<=` | `frame.len > 1000` |
| and / or / not | `&&` `\|\|` `!` | `tcp && !(tcp.port == 22)` |
| contains | | `http.user_agent contains "curl"` |
| matches | (regex, case-insensitive with `(?i)`) | `http.host matches "(?i)lab\.local$"` |
| in | set membership | `tcp.port in {21 22 23 80}` |
| ranges | | `tcp.port in {1..1024}` |
| slices | `[]` | `eth.src[0:3] == 08:00:27` (OUI) |
| bitwise and | `&` | `tcp.flags & 0x12` |

> ⚠️ **The `!=` trap:** `ip.addr != 10.10.10.20` matches almost everything, because a packet has *two* addresses and one of them is usually not .20. Use `!(ip.addr == 10.10.10.20)`. (Recent Wireshark versions treat `!=` as "all not equal" (`~=` is "any not equal"), but the `!( )` form is safe in every version.)

---

## 3. Advanced Syntax & Useful Functions

Wireshark display filter engine supports functions and advanced field expressions:

| Expression / Function | Syntax | Real-World Use Case |
|---|---|---|
| **Field Existence** | `tcp.analysis.flags` | Matches any packet where Wireshark flagged an issue (retransmissions, dup ACKs, zero window) |
| **Membership (`in`)** | `tcp.dstport in {80 443 8080 8443}` | Filter for common web ports without endless `||` statements |
| **String Conversion** | `string(ip.dst) matches "10\.10\."` | Convert numerical or address field to string for regex matching |
| **Case Insensitive** | `lower(http.user_agent) contains "nmap"` | Catch user-agent strings regardless of capitalization |
| **Slice Syntax** | `frame[0:4] == 00:0c:29:4f` | Inspect specific raw byte sequences within any protocol layer |
| **Layer Reference** | `ip.proto#1 == 1` | Filter on nested protocols (e.g. ICMP inside IP-in-IP tunnels) |

---

## 4. The 40 Display Filters Every Analyst Needs

### 🌐 IP & Layer 2/3
1. `ip.addr == 10.10.10.20` — All packets involving this IP (source or destination)
2. `!(ip.addr == 10.10.10.10)` — Exclude local analyst workstation
3. `ip.src == 10.10.10.10 && ip.dst == 10.10.10.20` — Unidirectional traffic between two specific hosts
4. `ip.ttl < 10` — Potential traceroute traffic or routing loops
5. `arp.duplicate-address-detected` — IP conflict or ARP spoofing in progress!
6. `icmp.type == 3` — ICMP Destination Unreachable (port closed, host down, or filtered)
7. `ipv6` — Any IPv6 traffic (crucial for finding rogue IPv6 / SLAAC / DHCPv6 on "IPv4 only" networks)

### ⚡ TCP & Connection State
8. `tcp.flags.syn == 1 && tcp.flags.ack == 0` — Initial connection requests (SYN scan, new sessions)
9. `tcp.flags.syn == 1 && tcp.flags.ack == 1` — Server accepting connections (open ports)
10. `tcp.flags.reset == 1` — Connection aborted or rejected (closed port or firewall RST)
11. `tcp.flags == 0x000` — TCP NULL packet (malicious probe / scan)
12. `tcp.flags == 0x029` — TCP Xmas packet (FIN+PSH+URG set — scanning tool probe)
13. `tcp.window_size == 0 && tcp.flags.reset == 0` — TCP Zero Window (receiver buffer is full; application stall)
14. `tcp.analysis.retransmission` — Packet lost on wire and re-sent
15. `tcp.analysis.duplicate_ack` — Receiver alerting sender of missing packets
16. `tcp.analysis.lost_segment` — Wireshark detected gap in sequence numbers
17. `tcp.port == 445` — SMB traffic (file sharing, lateral movement, PsExec)

### 📡 DNS (Domain Name System)
18. `dns` — All DNS traffic
19. `dns.flags.response == 0` — DNS queries only
20. `dns.flags.response == 1` — DNS server replies only
21. `dns.flags.rcode != 0` — DNS errors (e.g., `rcode == 3` is NXDOMAIN / domain does not exist)
22. `dns.qry.name contains "corp"` — Query for internal hostnames
23. `dns.qry.type == 16` — TXT records (frequently used by C2 beacons and data exfiltration!)
24. `dns.time > 0.2` — Slow DNS lookups taking over 200 ms

### 🌍 HTTP / Cleartext Web
25. `http.request` — All HTTP requests (GET, POST, PUT, DELETE)
26. `http.request.method == "POST"` — Form submissions, credential posts, file uploads
27. `http.response.code >= 400` — Web errors (401 Unauthorized, 404 Not Found, 500 Server Error)
28. `http.authorization` — Cleartext Basic Authentication credentials
29. `http.cookie` — Session cookies transmitted over cleartext
30. `http contains "password"` — Sensitive strings in web requests or responses

### 🔒 TLS / Encrypted Traffic
31. `tls.handshake.type == 1` — Client Hello (starts TLS handshake; contains SNI / target hostname)
32. `tls.handshake.extensions_server_name` — SNI (Server Name Indication) showing target website
33. `tls.handshake.type == 11` — Server Certificate exchange
34. `tls.alert_message` — Handshake failures, untrusted certificate errors, or cipher mismatches

### 🚨 Credentials & Suspicious Cleartext Services
35. `ftp.request.command in {"USER", "PASS"}` — Plaintext FTP logins
36. `telnet` — Completely plaintext Telnet traffic
37. `smtp.req.command in {"AUTH", "MAIL", "RCPT"}` — Email headers and credentials
38. `snmp.community` — Plaintext SNMP community strings (v1 / v2c)
39. `frame.len > 1400 && udp.port == 53` — Abnormally large DNS packets (DNS amplification or tunneling)
40. `frame.time_delta > 2.0` — Gaps longer than 2 seconds between packets in a conversation

---

## 5. GUI Accelerators: Apply as Filter & Custom Buttons

### 5.1 The Right-Click Trick (Never memorize everything!)
If you see something interesting in the Packet Details pane:
1. Right-click the field (e.g. `User-Agent: curl/7.88.1`)
2. Select **Apply as Filter** ➔ **Selected** (replaces current filter)
3. Or **Apply as Filter** ➔ **... and Selected** (appends to existing filter with `&&`)
4. Or **Prepare as Filter** ➔ fills the filter bar without applying immediately, allowing you to edit it first

### 5.2 Creating Permanent Filter Buttons
Look at the right side of the Display Filter bar: there is a small **`+` (Add a filter button)** icon.
Clicking `+` creates a clickable button on your toolbar!

Recommended Buttons to create right now:
- **Button Label:** `SYN-Only` | **Filter:** `tcp.flags.syn==1 && tcp.flags.ack==0`
- **Button Label:** `RST` | **Filter:** `tcp.flags.reset==1`
- **Button Label:** `Retrans` | **Filter:** `tcp.analysis.retransmission`
- **Button Label:** `DNS Errors` | **Filter:** `dns.flags.rcode != 0`
- **Button Label:** `Web Creds` | **Filter:** `http.request.method == "POST" || http.authorization`

---

## 6. 🎯 Mission: Display Filter Drill in the Lab

Generate live traffic on Kali and verify each query:
```bash
# Terminal 1: Run these generators
curl -X POST http://10.10.10.20/login.html -d "username=admin&password=SuperSecretPassword123"
dig @10.10.10.20 nonexistentdomain.lab.local
nc -zv 10.10.10.20 9999     # Closed port -> triggers RST
```

Now in Wireshark on Kali, execute these filters and record your findings in your journal:
1. Filter `http.request.method == "POST"`:
   - What is the frame number?
   - In the Packet Details pane under `HTML Form URL Encoded`, verify whether the password is completely visible.
2. Filter `dns.flags.rcode == 3`:
   - What does Wireshark display in the Info column for RCODE?
3. Filter `tcp.flags.reset == 1 && tcp.port == 9999`:
   - Which IP sent the RST flag? Why?

---

## 💼 Business Corner: Mean Time to Detect (MTTD)
In an incident response scenario, an analyst might receive a 10 GB PCAP captured from a core gateway during an active ransomware attack or data exfiltration. Trying to scroll through 15 million packets manually is impossible. 

Knowing precise display filters reduces triage time from 4 hours to 30 seconds:
- Pinpoint C2 domains via `dns.flags.response == 0 && frame.len > 100`
- Pinpoint lateral movement via `tcp.port == 445 && tcp.flags.syn == 1`
- Pinpoint credential harvesting via `ftp.request.command == "PASS" || http.authorization`

Saving those 4 hours can be the difference between isolating a compromised laptop and an entire Active Directory domain getting encrypted.

---

## 🧠 Knowledge Check
1. Why does `ip.addr != 10.10.10.20` not reliably exclude host 10.10.10.20?
2. What display filter isolates TLS Client Hello messages to see which domains a machine is visiting?
3. What is the difference between *Apply as Filter* and *Prepare as Filter*?
4. How do you filter for all TCP retransmissions in a capture?

<details><summary>Answers</summary>

1. Because an IP packet has both a source and a destination address. If `ip.src` is 10.10.10.20 and `ip.dst` is 10.10.10.30, the condition `ip.addr != 10.10.10.20` evaluates to true for `ip.dst`, matching the packet. The correct syntax is `!(ip.addr == 10.10.10.20)`.
2. `tls.handshake.type == 1` (or specifically `tls.handshake.extensions_server_name`).
3. *Apply as Filter* immediately executes the filter and changes the view. *Prepare as Filter* pastes the syntax into the filter bar so you can edit or combine it before pressing Enter.
4. `tcp.analysis.retransmission`.
</details>

---
⬅️ [03 Capture Filters (BPF)](03-capture-filters-bpf.md) | ➡️ [05 Profiles, Columns & Coloring](05-profiles-columns-coloring.md)

