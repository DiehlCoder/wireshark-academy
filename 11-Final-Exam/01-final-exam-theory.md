# 11.01: Final Exam: Theoretical Knowledge (50 Questions)

**Level:** 🎓 Comprehensive Certification | **Time:** 90 min | **XP:** 250

```
┌────────────────────────────────────────────────────────────────────────┐
│             PACKET NINJA CERTIFICATION: THEORETICAL EXAM               │
│  Passing Score: 80% (40 / 50 questions correct)                       │
│  Rules: Closed book. Record your answers in your Analyst Journal.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Part 1: OSI Model & TCP/IP Fundamentals (Q1 – Q10)

1. **Which layer of the OSI model is responsible for node-to-node frame delivery across a local segment using physical MAC addresses?**
   - A) Layer 1 (Physical)
   - B) Layer 2 (Data Link)
   - C) Layer 3 (Network)
   - D) Layer 4 (Transport)

2. **What is the Protocol Data Unit (PDU) at Layer 4 when using TCP?**
   - A) Frame
   - B) Packet
   - C) Segment
   - D) Datagram

3. **In an Ethernet II frame, which EtherType value indicates that the encapsulated payload is an IPv4 packet?**
   - A) `0x0806`
   - B) `0x86dd`
   - C) `0x0800`
   - D) `0x8100`

4. **How many usable host IP addresses are available in a `/28` IPv4 subnet?**
   - A) 14
   - B) 16
   - C) 30
   - D) 6

5. **A workstation is assigned the IP address `169.254.88.12`. What does this indicate about the network state?**
   - A) The machine received a static route from the BGP gateway.
   - B) The DHCP server was unreachable, and the OS auto-assigned an APIPA address.
   - C) The machine is using a link-local IPv6 address.
   - D) The network card is operating in monitor mode.

6. **What is the default TCP Maximum Segment Size (MSS) on an Ethernet network with an MTU of 1500 bytes?**
   - A) 1514 bytes
   - B) 1500 bytes
   - C) 1460 bytes
   - D) 1420 bytes

7. **What protocol replaces ARP in IPv6 networks?**
   - A) RARP
   - B) NDP (Neighbor Discovery Protocol)
   - C) DHCPv6 exclusively
   - D) IGMP

8. **An incoming packet has a received TTL of 118. What operating system was the original sender likely running, and how many router hops away is it?**
   - A) Linux (TTL 64), 54 hops away
   - B) Windows (TTL 128), 10 hops away
   - C) Cisco Router (TTL 255), 137 hops away
   - D) macOS (TTL 64), 10 hops away

9. **Which device operates strictly at Layer 2 and maintains a CAM/MAC table to forward unicast frames only to the designated port?**
   - A) Hub
   - B) Switch
   - C) Router
   - D) Repeater

10. **What is the purpose of the Explicit Congestion Notification (ECN) bits in the IPv4 and TCP headers?**
    - A) To encrypt the payload during transit.
    - B) To alert endpoints of router queue congestion without dropping packets.
    - C) To force immediate retransmission of duplicate ACKs.
    - D) To negotiate Maximum Transmission Unit.

---

## 🦈 Part 2: Wireshark Core Architecture & Filters (Q11 – Q20)

11. **Which core component of the Wireshark suite is the lightweight, privileged engine that directly captures packets from the network adapter?**
    - A) TShark
    - B) dumpcap
    - C) editcap
    - D) libpcap GUI

12. **Where are BPF (Berkeley Packet Filter) capture filters executed?**
    - A) In user-space memory after Wireshark loads the packet.
    - B) In the operating system kernel before packets reach Wireshark.
    - C) On the remote web server.
    - D) Inside the Wireshark display rendering engine.

13. **What is the critical consequence of using a Capture Filter versus a Display Filter?**
    - A) Capture filters slow down the graphical user interface.
    - B) Packets excluded by a Capture Filter are discarded and never saved to disk.
    - C) Capture filters only work on wireless networks.
    - D) Display filters alter packet timestamps.

14. **Why is the display filter `ip.addr != 10.10.10.20` considered a dangerous trap for analysts?**
    - A) It causes Wireshark to crash.
    - B) It matches any packet where either the source OR destination IP is not .20, matching almost every packet.
    - C) It only matches IPv6 packets.
    - D) It permanently deletes matching packets.

15. **What BPF capture filter isolates initial TCP SYN packets (connection requests)?**
    - A) `tcp.flags.syn == 1`
    - B) `tcp[tcpflags] & (tcp-syn|tcp-ack) == 2`
    - C) `port 80`
    - D) `tcp-syn-only`

16. **Which keyboard shortcut opens the Follow TCP Stream window in Wireshark?**
    - A) `Ctrl + E`
    - B) `Ctrl + Alt + Shift + T`
    - C) `Ctrl + K`
    - D) `Ctrl + Shift + P`

17. **What does the `[TCP ZeroWindow]` expert info notification signify?**
    - A) The link has suffered a total physical fiber cut.
    - B) The sender's network interface card is defective.
    - C) The receiver's application socket buffer is full and cannot accept more data.
    - D) The TCP sequence number wrapped past $2^{32}$.

18. **Which command-line tool slices an existing 500 MB capture file into a specific 10-minute time window?**
    - A) `mergecap`
    - B) `capinfos`
    - C) `editcap`
    - D) `text2pcap`

19. **What environment variable must be exported to allow Wireshark to decrypt modern TLS 1.3 browser traffic?**
    - A) `SSLKEYLOGFILE`
    - B) `OPENSSL_PRIVATE_KEY`
    - C) `TLS_DECRYPT_SECRET`
    - D) `WIRESHARK_SSL_ENABLE`

20. **In the Wireshark Follow Stream window, what does Blue text represent?**
    - A) Traffic sent from Client to Server.
    - B) Traffic sent from Server to Client.
    - C) Dropped or corrupted packets.
    - D) Encrypted TLS record headers.

---

## ⚡ Part 3: Protocols Deep Dive (Q21 – Q30)

21. **In the TCP 3-Way Handshake, why do SYN flags consume 1 sequence count even with 0 bytes of payload?**
    - A) To account for the 20-byte TCP header.
    - B) So the receiver can reliably acknowledge receipt of the synchronization signal.
    - C) It is a bug in RFC 793 that was never fixed.
    - D) To calculate the TCP checksum.

22. **What TCP flag is sent to abort a connection immediately without waiting for acknowledged teardown?**
    - A) FIN
    - B) PSH
    - C) RST
    - D) URG

23. **Which DNS Response Code (RCODE) indicates that the queried domain name does not exist?**
    - A) RCODE 0 (NoError)
    - B) RCODE 2 (SERVFAIL)
    - C) RCODE 3 (NXDOMAIN)
    - D) RCODE 5 (Refused)

24. **Why do attackers frequently abuse DNS TXT records for Command and Control (C2)?**
    - A) TXT records are encrypted with RSA by default.
    - B) Firewalls permit outbound DNS, and TXT records can carry arbitrary payload strings.
    - C) TXT records bypass the UDP length limitation.
    - D) DNS servers do not log TXT record queries.

25. **What are the four sequential steps of the DHCP lease negotiation lifecycle?**
    - A) Request, Offer, Discover, ACK
    - B) Discover, Offer, Request, ACK
    - C) SYN, SYN/ACK, ACK, FIN
    - D) Solicit, Advertise, Request, Reply

26. **Which DHCP Option carries the IPv4 address of the Default Gateway?**
    - A) Option 1
    - B) Option 3
    - C) Option 6
    - D) Option 53

27. **What is the total size of the standard UDP header?**
    - A) 20 bytes
    - B) 14 bytes
    - C) 8 bytes
    - D) 4 bytes

28. **In TLS 1.2, in which unencrypted handshake packet can an analyst inspect the target domain name via SNI?**
    - A) Server Hello
    - B) Client Hello
    - C) Certificate Verify
    - D) Encrypted Extensions

29. **What is an MTU Black Hole?**
    - A) An optical fiber bend that absorbs light.
    - B) A firewall dropping ICMP Type 3 Code 4 (Frag Needed), preventing Path MTU Discovery.
    - C) A rogue DHCP server assigning /32 subnet masks.
    - D) An Ethernet frame exceeding 9000 bytes.

30. **What is the critical security vulnerability in SMBv1 exploited by the EternalBlue (MS17-010) exploit?**
    - A) Cleartext transmission of passwords in Basic Auth.
    - B) Buffer overflow in SMBv1 transaction handling allowing unauthenticated RCE.
    - C) Weak Diffie-Hellman primes in SSL negotiations.
    - D) DNS zone transfers permitted to anonymous users.

---

## 🎯 Part 4: Nmap & Active Reconnaissance (Q31 – Q38)

31. **When Nmap performs a ping sweep (`-sn`) against targets on the SAME local Ethernet subnet, what probe does it send by default?**
    - A) ICMP Echo Request
    - B) TCP SYN to port 443
    - C) ARP Request
    - D) UDP probe to port 40125

32. **What does Nmap send in response to a `SYN/ACK` packet during a TCP SYN scan (`-sS`)?**
    - A) ACK
    - B) RST
    - C) FIN
    - D) PSH+ACK

33. **Why do TCP NULL, FIN, and Xmas scans fail to detect open ports on Windows operating systems?**
    - A) Windows does not support TCP/IP.
    - B) Windows firewall automatically drops all packets.
    - C) The Windows TCP stack violates RFC 793 and responds with RST to all non-SYN probes regardless of port state.
    - D) Windows only listens on IPv6.

34. **What does a port state of `filtered` signify in an Nmap report?**
    - A) A service is listening and accepted the connection.
    - B) A firewall or filter dropped the probe, and no response was returned.
    - C) The port responded with a TCP RST.
    - D) The port is only accessible via IPv6.

35. **Which Nmap option executes Service Version Detection by querying open ports with application-layer probes?**
    - A) `-sS`
    - B) `-sV`
    - C) `-O`
    - D) `-sn`

36. **What does the `-Pn` option do?**
    - A) Enables promiscuous mode on the network card.
    - B) Disables host discovery, assuming all target hosts are online.
    - C) Forces scanning via passive FTP.
    - D) Spoofs the scanner's source port to 53.

37. **What is the effect of running Nmap with the `-D` flag?**
    - A) It decrypts TLS traffic using a master secret log.
    - B) It fragments packets into 8-byte chunks.
    - C) It intermixes the scan with spoofed decoy IP addresses to obscure the real scanner's IP.
    - D) It disables DNS resolution.

38. **Which command compiles an Nmap XML output file into an interactive HTML report?**
    - A) `editcap -T html scan.xml`
    - B) `xsltproc scan.xml -o report.html`
    - C) `tshark -r scan.xml -w report.html`
    - D) `snort -c scan.xml --html`

---

## 🐱 Part 5: Netcat & Socket Operations (Q39 – Q43)

39. **What command launches a Netcat TCP listener on port 4444 on Linux?**
    - A) `nc 0.0.0.0 4444`
    - B) `nc -lvnp 4444`
    - C) `nc -c 4444 -l`
    - D) `nc -zvn 4444`

40. **Why are Reverse Shells preferred over Bind Shells during red team assessments?**
    - A) Reverse shells are encrypted with AES-256 by default.
    - B) Reverse shells initiate outbound connections, which bypass perimeter ingress firewall rules.
    - C) Reverse shells do not require an IP address.
    - D) Reverse shells consume zero bandwidth.

41. **What major feature does `ncat` (from the Nmap project) provide that original `netcat` lacks?**
    - A) Support for TCP.
    - B) Native SSL/TLS encryption support (`--ssl`).
    - C) Ability to read standard input.
    - D) Support for port numbers below 1024.

42. **How does an attacker create a reverse shell using Netcat on a target where the `-e` flag was removed?**
    - A) By upgrading to Wireshark 4.
    - B) By creating a Unix FIFO named pipe (`mkfifo /tmp/f`).
    - C) By setting the `SSLKEYLOGFILE` variable.
    - D) It is impossible without the `-e` flag.

43. **What is the primary operational capability of `socat` compared to traditional `netcat`?**
    - A) Socat can link any two arbitrary bidirectional data streams together (e.g. TCP-LISTEN to another TCP port).
    - B) Socat only works on Windows machines.
    - C) Socat cannot forward ports.
    - D) Socat replaces the Linux kernel.

---

## 🛡️ Part 6: Snort IDS & Detection (Q44 – Q47)

44. **What is the valid Snort ID (SID) numerical range for custom, locally written detection rules?**
    - A) SIDs 1 to 100
    - B) SIDs 1,000 to 9,999
    - C) SIDs 100,000 to 999,999
    - D) SIDs 1,000,000 and higher

45. **What does the `http_uri` modifier do inside a Snort rule?**
    - A) Restricts pattern matching strictly to the normalized, URL-decoded HTTP URI buffer.
    - B) Converts HTTP packets to HTTPS.
    - C) Forces Snort to drop the web request.
    - D) Encrypts the alert message.

46. **Why should hardware offloading (TSO/GRO) be disabled on a network card running Snort?**
    - A) Hardware offloading uses too much electricity.
    - B) It creates 64 KB super-packets in hardware that corrupt packet stream reassembly and trigger false checksum errors.
    - C) Snort only supports 10 Mbps Ethernet cards.
    - D) Offloading prevents Wireshark from saving PCAPs.

47. **What Snort rule option restricts alerts so they only fire if an event occurs 25 times within 10 seconds?**
    - A) `threshold: limit`
    - B) `detection_filter: track by_src, count 25, seconds 10;`
    - C) `flow: established;`
    - D) `rate_limit: 25;`

---

## 🚨 Part 7: Attacks & Professional Practice (Q48 – Q50)

48. **In Wireshark, what is the clear forensic indicator of an ongoing ARP poisoning / MITM attack?**
    - A) Consecutive TCP FIN packets.
    - B) An expert alert: `Duplicate IP address detected for <IP> (also in use by <MAC>)`.
    - C) HTTP response status `500 Server Error`.
    - D) DNS queries with RCODE 3.

49. **Under GDPR Article 33, what is the maximum time window an organization has to report a confirmed personal data breach to supervisory authorities?**
    - A) 24 hours
    - B) 72 hours
    - C) 30 days
    - D) 1 year

50. **What is the primary difference between a Technical Incident Finding and an Executive Summary in a forensic report?**
    - A) The technical finding is written in English; the executive summary is in German.
    - B) The executive summary focuses on business risk, financial exposure, and strategic remediation without raw hex dumps; the technical finding details exact frame numbers, UTC timestamps, and CVEs.
    - C) The executive summary includes all Wireshark screenshots.
    - D) There is no difference; both documents are identical.

---
⬅️ [Module 10 Capstone Solution](../10-Capstone-Project/03-solution-guide.md) | ➡️ [02 Practical Exam](02-final-exam-practical.md)
