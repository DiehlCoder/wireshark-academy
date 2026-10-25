# 03.04: UDP & DNS (Domain Name System)

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 150

## 🎯 Learning Objectives
- Dissect the minimal 8-byte UDP header
- Understand the complete DNS protocol structure (RFC 1035) and header flags
- Analyze DNS query/response workflows and record types (A, AAAA, PTR, TXT, SRV, MX)
- Decipher DNS Response Codes (NoError, SERVFAIL, NXDOMAIN, Refused)
- Detect DNS abuse: Amplification DDoS, Cache Poisoning, and DNS Data Exfiltration / C2 Tunneling

---

## 1. The UDP Header (RFC 768)

Unlike TCP's complex 20–60 byte header, UDP is a minimal **8-byte** wrapper:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Length             |           Checksum            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- **Length:** Header (8 bytes) + payload length in bytes.
- **Checksum:** Covers pseudo-header (IPs) + UDP header + payload. (Optional in IPv4, mandatory in IPv6).
- **No connection, no sequencing, no retransmission:** The application layer must handle packet loss or ordering if required.

---

## 2. DNS Protocol Architecture (Port 53)

DNS maps human-readable domain names (`srv.lab.local`) to IP addresses (`10.10.10.20`).
It uses **UDP port 53** for queries and standard replies. It switches to **TCP port 53** for:
- Zone transfers (`AXFR`) between nameservers
- Responses exceeding the UDP buffer size ($512\text{ bytes}$, or negotiated EDNS0 size) where the **TC (Truncated)** bit is set.

### 2.1 The DNS Message Header (12 Bytes)
```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Transaction ID         |             Flags             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Questions Count         |         Answers Count         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Authority RR Count       |      Additional RR Count      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 DNS Flags Explained:
- **QR (Query/Response):** `0` = Query, `1` = Response.
- **AA (Authoritative Answer):** `1` = Responding server is the official authority for the zone.
- **TC (Truncated):** `1` = Response exceeded max UDP size; client should retry over TCP!
- **RD (Recursion Desired):** Set by client to ask the server to recursively resolve the domain.
- **RA (Recursion Available):** Set by server indicating recursive queries are supported.
- **RCODE (Response Code):**
  - `0` = **NoError** (Success)
  - `1` = **FormatError**
  - `2` = **ServerFailure (SERVFAIL)** (Upstream resolver issue)
  - `3` = **Non-Existent Domain (NXDOMAIN)** (Domain does not exist)
  - `5` = **Refused** (Policy or ACL blocked request)

---

## 3. Important DNS Record Types

| Record | Type ID | Purpose | Security Relevance |
|---|---|---|---|
| **A** | 1 | IPv4 address mapping | Fast-flux botnets rapidly change A records |
| **AAAA** | 28 | IPv6 address mapping | Often overlooked in corporate logging |
| **CNAME** | 5 | Canonical name (alias) | Cloud services, CDN routing |
| **PTR** | 12 | Reverse DNS (IP to Name) | Looking up `in-addr.arpa` addresses |
| **MX** | 15 | Mail exchange servers | Phishing, mail routing validation |
| **TXT** | 16 | Arbitrary text (SPF, DKIM, DMARC) | **High risk:** C2 channels and data exfiltration |
| **SRV** | 33 | Service location (port + host) | Active Directory domain controllers, SIP |
| **SOA** | 6 | Start of Authority | Zone serial numbers, refresh timers |

---

## 4. Threat Hunting: Malicious DNS Patterns

Because almost all firewalls allow outbound UDP 53 to reach internal or external DNS servers, attackers aggressively abuse DNS:

```
              ┌───────────────────────────────────────────────┐
              │  Attacker Control Server: attacker-c2.com     │
              └───────────────────────▲───────────────────────┘
                                      │ Authoritative DNS resolution
                                      │
              ┌───────────────────────┴───────────────────────┐
              │ Enterprise Internal DNS Resolver (Forwarder)   │
              └───────────────────────▲───────────────────────┘
                                      │ Resolves subdomains
                                      │
Compromised Host ──► query: [BASE64_EXFIL_DATA].attacker-c2.com
Compromised Host ◄── reply (TXT record): [BASE64_COMMANDS]
```

### Wireshark Hunting Filters for DNS Abuse:
- High volume of queries: `dns.flags.response == 0`
- DNS Tunneling / Exfiltration: `dns.qry.name.len > 50` or `dns.qry.type == 16`
- Large replies (Amplification DDoS): `frame.len > 512 && udp.port == 53`
- Domain Generation Algorithms (DGA): Spikes of `dns.flags.rcode == 3` (NXDOMAIN)

---

## 5. 🎯 Mission: DNS Forensics in the Lab

Generate diverse DNS queries on **Kali**:
```bash
# 1. Standard A record lookup
dig @10.10.10.20 www.lab.local

# 2. Reverse PTR lookup
dig @10.10.10.20 -x 10.10.10.20

# 3. Non-existent domain (trigger NXDOMAIN)
dig @10.10.10.20 badguy-malware-test.lab.local

# 4. Check TXT record
dig @10.10.10.20 TXT lab.local
```

### Analysis in Wireshark:
1. Filter: `dns`.
2. Locate the query for `badguy-malware-test.lab.local`:
   - Match the **Transaction ID** of the query with the reply.
   - In the reply, verify `Reply code: No such name (3)`.
3. Locate the reverse PTR lookup:
   - Notice the special reverse domain format: `20.10.10.10.in-addr.arpa`.

---

## 💼 Business Corner: Protective DNS & Sinkholing
Enterprise networks process hundreds of millions of DNS queries every day. A critical cybersecurity capability is **Protective DNS** (e.g. Quad9, Cloudflare 1.1.1.2, Cisco Umbrella):

1. **Threat Intelligence Feeds:** Updated lists of known malware, ransomware, and phishing domains are synced to corporate DNS resolvers every minute.
2. **DNS Sinkholing:** When an infected workstation queries a known ransomware C2 domain (e.g. `lockbit-payment-portal.xyz`), the internal resolver intercepts the query and responds with the IP of an internal SOC monitoring server (`10.10.99.99`) instead of NXDOMAIN or the real attacker IP.
3. **Automated Incident Response:** The SOC server alerts the analyst that host `10.10.10.40` connected to the sinkhole, triggering an automated endpoint quarantine via EDR before files are encrypted.

---

## 🧠 Knowledge Check
1. How many bytes is the standard UDP header?
2. When does DNS switch from UDP port 53 to TCP port 53?
3. What does RCODE 3 indicate?
4. How do attackers use DNS TXT records for Command and Control (C2)?

<details><summary>Answers</summary>

1. 8 bytes.
2. For zone transfers (AXFR) or when a DNS response is larger than the maximum UDP payload size, indicated by the Truncated (TC) flag.
3. NXDOMAIN (Non-Existent Domain).
4. Attackers encode commands or exfiltrated data into TXT records (which can hold up to 255 bytes per string), bypassing basic outbound firewalls that allow DNS traffic.
</details>

---
⬅️ [03 TCP Deep Dive](03-tcp-deep-dive.md) | ➡️ [05 DHCP](05-dhcp.md)
