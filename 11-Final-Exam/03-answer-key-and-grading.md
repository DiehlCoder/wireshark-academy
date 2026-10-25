# 11.03: Final Exam: Answer Key & Grading Rubric

```
┌────────────────────────────────────────────────────────────────────────┐
│            OFFICIAL CERTIFICATION ANSWER KEY & SCORING RUBRIC          │
│  Confidential: For self-grading and instructor evaluation only.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Part 1: Theory Exam Answer Key (Q1 – Q50)

| Q# | Answer | Explanation |
|---|---|---|
| **1** | **B** | Layer 2 (Data Link) handles physical node-to-node frame delivery via MAC addresses. |
| **2** | **C** | The Layer 4 TCP PDU is a **Segment** (UDP is Datagram). |
| **3** | **C** | `0x0800` represents IPv4 (`0x0806` is ARP, `0x86dd` is IPv6). |
| **4** | **A** | $2^{(32-28)} - 2 = 16 - 2 = 14$ usable host IP addresses. |
| **5** | **B** | `169.254.0.0/16` is APIPA / Link-Local, indicating a DHCP lease negotiation failure. |
| **6** | **C** | MSS = MTU (1500) − IPv4 Header (20) − TCP Header (20) = 1460 bytes. |
| **7** | **B** | IPv6 replaces ARP with Neighbor Discovery Protocol (NDP) via ICMPv6. |
| **8** | **B** | Windows defaults to TTL 128. $128 - 118 = 10$ router hops. |
| **9** | **B** | A Layer 2 Switch maintains a CAM table to forward unicast frames to specific ports. |
| **10**| **B** | ECN signals router queue congestion without intentionally dropping packets. |
| **11**| **B** | `dumpcap` is the lightweight, privileged packet capture process. |
| **12**| **B** | BPF capture filters execute in the operating system kernel before user-space processing. |
| **13**| **B** | Non-matching packets are discarded immediately in kernel space and are permanently lost. |
| **14**| **B** | Packets have both `ip.src` and `ip.dst`; testing `!=` matches whenever either address differs. |
| **15**| **B** | `tcp[tcpflags] & (tcp-syn\|tcp-ack) == 2` filters for pure SYN packets. |
| **16**| **B** | `Ctrl + Alt + Shift + T` follows a TCP stream. |
| **17**| **C** | The receiving application's socket buffer is full; sender must halt transmission. |
| **18**| **C** | `editcap -A ... -B ...` slices PCAPs by time or frame numbers. |
| **19**| **A** | Modern browsers log symmetric session secrets via the `SSLKEYLOGFILE` variable. |
| **20**| **B** | Blue text represents traffic originating from the Server heading back to the Client. |
| **21**| **B** | SYN flags consume 1 sequence number so their receipt can be reliably acknowledged. |
| **22**| **C** | The `RST` (Reset) flag immediately aborts a TCP connection. |
| **23**| **C** | RCODE 3 indicates Non-Existent Domain (NXDOMAIN). |
| **24**| **B** | Outbound port 53 is almost universally permitted, and TXT records hold arbitrary strings. |
| **25**| **B** | Discover, Offer, Request, ACK (DORA). |
| **26**| **B** | DHCP Option 3 specifies the Default Gateway (Router). |
| **27**| **C** | The standard UDP header is 8 bytes fixed (Src Port, Dst Port, Length, Checksum). |
| **28**| **B** | In the Client Hello packet inside the Server Name Indication (SNI) extension. |
| **29**| **B** | A router dropping ICMP Type 3 Code 4, preventing Path MTU Discovery (PMTUD). |
| **30**| **B** | A remote buffer overflow in SMBv1 transaction handling (MS17-010). |
| **31**| **C** | Nmap sends ARP requests (`-PR`) by default on local Ethernet subnets. |
| **32**| **B** | Nmap sends an immediate `RST` packet to abort the half-open connection. |
| **33**| **C** | The Windows TCP stack sends a RST in response to any unexpected non-SYN packet. |
| **34**| **B** | A firewall or packet filter dropped the probe without returning a response. |
| **35**| **B** | `-sV` (Service Version Detection). |
| **36**| **B** | `-Pn` disables host discovery, treating all target IP addresses as online. |
| **37**| **C** | Intermixes scan probes with randomized spoofed decoy IP addresses (`-D`). |
| **38**| **B** | `xsltproc scan.xml -o report.html`. |
| **39**| **B** | `nc -lvnp 4444`. |
| **40**| **B** | Reverse shells initiate outbound connections, bypassing perimeter ingress firewall rules. |
| **41**| **B** | Ncat natively supports SSL/TLS encryption (`--ssl`). |
| **42**| **B** | By creating a Unix FIFO named pipe (`mkfifo /tmp/f`). |
| **43**| **A** | Socat connects any two arbitrary bidirectional data streams together. |
| **44**| **D** | SIDs 1,000,000 and higher are reserved for custom, local rules. |
| **45**| **A** | Restricts inspection strictly to the normalized, URL-decoded URI buffer. |
| **46**| **B** | TSO/GRO synthesizes 64 KB super-packets in hardware, breaking rule reassembly. |
| **47**| **B** | `detection_filter: track by_src, count 25, seconds 10;`. |
| **48**| **B** | `Duplicate IP address detected for <IP> (also in use by <MAC>)`. |
| **49**| **B** | 72 hours under GDPR Article 33. |
| **50**| **B** | Executive summaries focus on business risk and governance; technical reports detail frame numbers and CVEs. |

---

## 📊 Part 2: Practical Exam Solutions & Scoring

### Task 1: Evidence Custody (50 pts)
- **SHA-256 Hash:** Accurate 64-character hexadecimal checksum of PCAP file (25 pts).
- **Metadata:** Accurate packet count, duration, and bit rate from `capinfos` (25 pts).

### Task 2: Reconnaissance Analysis (75 pts)
- **Attacker Profile:** Identified IP `10.10.10.10` and Oracle VirtualBox MAC (25 pts).
- **Scan Technique:** Identified TCP SYN scan (`-sS`) with proof that 3rd packet was `RST` (30 pts).
- **Decoys:** Real scanner identified by checking where SYN/ACK replies successfully established communication (20 pts).

### Task 3: Credential Harvesting (100 pts)
- **Target Service:** Plaintext FTP on port 21 (25 pts).
- **Extracted Credentials:** `msfadmin` / `msfadmin` (35 pts).
- **Wireshark Filter:** `ftp.request.command in {"USER","PASS"}` (20 pts).
- **Transcript:** Complete dialogue (`USER`, `PASS`, `LIST`, `QUIT`) (20 pts).

### Task 4: Web Exploitation (100 pts)
- **Target Endpoint:** `/search.php` (25 pts).
- **Payload:** `1 UNION SELECT username,password FROM users` (SQL Injection / CWE-89) (35 pts).
- **User-Agent:** `Mozilla/5.0 (Rogue-Infiltrator/2.4)` flagged as custom script indicator (40 pts).

### Task 5: Data Exfiltration (100 pts)
- **Covert Protocol:** ICMP Echo Request (Type 8) (25 pts).
- **Payload Decoded:** `DB_EXFIL_PATIENT_DATA` (21 bytes) (50 pts).
- **Packet Count:** 4 packets (25 pts).

### Task 6: Detection Engineering (75 pts)
- **Rule 1 (Web SQLi):**
  ```conf
  alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"EXPLOIT SQL Injection UNION SELECT in URI"; flow:to_server,established; http_uri; content:"UNION"; nocase; content:"SELECT"; nocase; sid:1000100; rev:1;)
  ```
- **Rule 2 (ICMP Exfiltration):**
  ```conf
  alert icmp $EXTERNAL_NET any -> $HOME_NET any (msg:"EXFIL Covert ICMP Data Payload Detected"; itype:8; content:"DB_EXFIL_PATIENT_DATA"; sid:1000101; rev:1;)
  ```
  *(Full syntax validity and SID range verified: 75 pts).*

---

## 🎓 Certification Issuance

If your combined score exceeds **80% on Theory (40/50)** and **80% on Practical (400/500)**:

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                  PACKET NINJA MASTER CERTIFICATION                             ║
║                                                                                ║
║   This is to certify that the candidate has successfully mastered the         ║
║   principles of Network Protocol Analysis, Network Forensics, Intrusion        ║
║   Detection Engineering (Snort), Active Reconnaissance (Nmap), and Raw Socket  ║
║   Operations (Netcat).                                                         ║
║                                                                                ║
║   Rank Conferred: 🐉 PACKET NINJA MASTER                                      ║
║   Credential ID: PN-2026-CERT-8891                                             ║
║   Standard: Wireshark 4.x / Snort 3.x / RFC Protocol Standards                 ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

You have completed the entire curriculum! Update your [Course README](../README.md) progress tracker to 100%!
