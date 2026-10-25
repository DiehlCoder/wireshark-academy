# 📖 Packet Ninja: The Comprehensive Networking & Security Glossary

A complete alphabetical reference of essential terms across the course.

---

### A
- **ACK (Acknowledgment):** A TCP control flag indicating the `Acknowledgment Number` field contains the next sequence number expected by the receiver.
- **Anycast:** A network addressing and routing methodology in which a single destination IP address is shared by multiple physical routing points (used by Cloudflare, Google DNS 8.8.8.8).
- **APIPA (Automatic Private IP Addressing):** The `169.254.0.0/16` range automatically assigned by client operating systems when a DHCP server fails to respond.
- **ARP (Address Resolution Protocol):** Defined in RFC 826, resolves a known Layer 3 IPv4 address to an unknown Layer 2 physical MAC address.
- **ARP Poisoning / Spoofing:** A Layer 2 attack where an adversary sends spoofed, unsolicited ARP replies to redirect traffic through their machine (Man-in-the-Middle).
- **ASIC (Application-Specific Integrated Circuit):** Specialized hardware chips inside enterprise switches and routers that perform wire-speed frame switching and packet filtering in silicon.
- **AXFR (Authoritative Zone Transfer):** A DNS mechanism over TCP port 53 used to replicate DNS databases between primary and secondary nameservers.

### B
- **Bandwidth:** The theoretical maximum data transfer capacity of a network link (e.g., 1 Gbps).
- **BDP (Bandwidth-Delay Product):** The product of a data link's capacity (bits/sec) and its round-trip time (sec). Dictates the TCP window size required to maximize throughput.
- **Bind Shell:** A malicious payload where the victim machine listens on a network port and binds a command shell (`/bin/bash`) to incoming connections.
- **BPF (Berkeley Packet Filter):** A kernel-level architecture and syntax used by libpcap, tcpdump, and Wireshark for ultra-fast, pre-memory packet capture filtering.
- **Broadcast:** A packet or frame transmitted to all devices within a local Layer 2 broadcast domain (`ff:ff:ff:ff:ff:ff` or `255.255.255.255`).

### C
- **C2 (Command and Control):** Infrastructure and covert protocols used by attackers to maintain communication with, issue commands to, and exfiltrate data from compromised endpoints.
- **CAM Table (Content Addressable Memory):** High-speed hardware table in a network switch mapping physical switch ports to known MAC addresses.
- **CIDR (Classless Inter-Domain Routing):** The IP addressing scheme (e.g. `/24`) replacing obsolete Class A, B, and C networks, defined in RFC 1519.
- **CWR (Congestion Window Reduced):** A TCP flag set by the sender to indicate it received an ECN-Echo flag and lowered its transmission rate.

### D
- **DAI (Dynamic ARP Inspection):** An enterprise switch security feature that inspects ARP packets against the DHCP Snooping database and drops spoofed ARP replies.
- **DAQ (Data Acquisition):** The abstraction library used by Snort to interact with underlying packet sources (libpcap, AF_PACKET, NFQ).
- **DF Bit (Don't Fragment):** A bit in the IPv4 header flags instructing routers never to fragment the packet. If the packet exceeds link MTU, the router drops it and sends ICMP Type 3 Code 4.
- **DHCP (Dynamic Host Configuration Protocol):** RFC 2131 protocol operating on UDP ports 67/68 automating IP, mask, gateway, and DNS configuration.
- **DHCP Snooping:** An enterprise switch feature that classifies switch ports as trusted or untrusted, dropping rogue DHCP server offers on untrusted access ports.
- **DORA:** The four sequential stages of DHCP lease negotiation: Discover, Offer, Request, ACK.
- **DSCP (Differentiated Services Code Point):** A 6-bit field in the IPv4/IPv6 header used to classify network traffic for Quality of Service (QoS) prioritization.

### E
- **ECN (Explicit Congestion Notification):** An extension to IP and TCP (RFC 3168) allowing routers to notify endpoints of impending congestion without dropping packets.
- **EDNS0 (Extension Mechanisms for DNS):** RFC 6891 extension expanding the traditional 512-byte UDP DNS message size cap up to 4096 bytes.
- **Egress Filtering:** Firewall rules that monitor and restrict outbound connections leaving an internal network to the internet.
- **Ephemeral Port:** A temporary, dynamic high port (typically 49152–65535 or 32768–60999) allocated by client operating systems for outbound connections.
- **EtherType:** A two-octet field in an Ethernet II frame indicating which protocol is encapsulated in the payload (e.g., `0x0800` for IPv4).

### F
- **FCS (Frame Check Sequence):** A 4-byte CRC-32 checksum at the end of an Ethernet frame used by the physical NIC to detect transmission bit errors.
- **FIN:** A TCP control flag indicating the sender has finished transmitting data, initiating a graceful connection close.
- **Five-Tuple:** The five values that uniquely identify an IP network connection: Source IP, Source Port, Destination IP, Destination Port, and Protocol.
- **Flow Control:** The TCP mechanism (sliding window) ensuring that a fast sender does not overwhelm a slow receiver's buffer.
- **FTP (File Transfer Protocol):** RFC 959 legacy protocol utilizing TCP port 21 for control commands and TCP port 20 (or ephemeral ports) for data transfer.

### G
- **GARP (Gratuitous ARP):** An unprompted ARP reply where Sender IP equals Target IP, used to announce IP address changes or failover states.
- **GDPR (General Data Protection Regulation):** EU regulation governing privacy and personal data protection, establishing IP addresses as PII under Article 4.

### H
- **Half-Open Connection:** A TCP connection where the client sends a SYN, receives a SYN/ACK, but never sends the final ACK (utilized in SYN stealth scans).
- **HIDS (Host-Based Intrusion Detection System):** An IDS agent running directly on an operating system inspecting local logs, system calls, and file integrity (e.g. OSSEC, Wazuh).
- **HTTP (Hypertext Transfer Protocol):** An unencrypted application-layer request-response protocol running over TCP port 80.
- **HTTPS:** HTTP encapsulated within an encrypted TLS tunnel over TCP port 443.

### I
- **ICMP (Internet Control Message Protocol):** RFC 792 network-layer protocol (IP Protocol 1) used by network devices for diagnostic messaging and operational error reporting.
- **IGMP (Internet Group Management Protocol):** Protocol used by IPv4 hosts to report multicast group memberships to adjacent routers.
- **IHL (Internet Header Length):** A 4-bit field in the IPv4 header specifying the header length in 32-bit words (default is 5, representing 20 bytes).
- **IOC (Indicator of Compromise):** Forensic artifacts (IP addresses, domain names, file hashes, registry keys) that indicate a computer system has been breached.
- **IPS (Intrusion Prevention System):** An inline network security device that inspects traffic in real time and actively drops malicious packets.
- **ISN (Initial Sequence Number):** The starting 32-bit sequence number randomly generated by a TCP stack during the initial SYN handshake.

### J
- **Jitter:** The statistical variation in packet transit latency across a network, or the randomized timing offset added to malware C2 beacons to avoid detection.
- **Jumbo Frame:** An Ethernet frame with a payload exceeding the standard 1500-byte MTU (typically 9000 bytes), used in storage area networks (SAN).

### L
- **Latency:** The elapsed time required for a packet of data to travel across a network from source to destination (measured in milliseconds).
- **Link-Local Address:** An IP address valid only within the local network segment (`169.254.0.0/16` in IPv4, `fe80::/10` in IPv6).

### M
- **MAC Address (Media Access Control):** A unique 48-bit physical identifier burned into a Network Interface Card.
- **MITM (Man-in-the-Middle):** An attack where an adversary secretly relays and alters communications between two parties who believe they are communicating directly.
- **MSS (Maximum Segment Size):** The largest amount of TCP payload data (in bytes) that a device can receive in a single segment.
- **MTU (Maximum Transmission Unit):** The maximum packet size (including L3 headers) that a network link can transmit without fragmentation (standard Ethernet = 1500 bytes).

### N
- **NAC (Network Access Control):** Security systems (like 802.1X) enforcing policy compliance and authentication before permitting a device to access the network.
- **NAT (Network Address Translation):** RFC 1631 methodology mapping private IP addresses to a public routable address at a firewall or router boundary.
- **NDP (Neighbor Discovery Protocol):** The ICMPv6-based protocol replacing ARP in IPv6 networks.
- **NIDS (Network Intrusion Detection System):** An out-of-band monitoring appliance inspecting passive copies of network traffic for intrusion signatures.
- **NSE (Nmap Scripting Engine):** An embedded Lua interpreter inside Nmap enabling automated network discovery, vulnerability scanning, and exploitation.
- **NXDOMAIN:** DNS Response Code 3 indicating the requested domain name does not exist.

### O
- **OSI Model:** Open Systems Interconnection 7-layer reference model (Physical, Data Link, Network, Transport, Session, Presentation, Application).
- **OUI (Organizationally Unique Identifier):** The first 24 bits (3 octets) of a MAC address assigned by the IEEE to identify the hardware manufacturer.

### P
- **PCAP (Packet Capture):** The industry-standard file format (`.pcap`, `.pcapng`) used to record raw network traffic.
- **PFS (Perfect Forward Secrecy):** A cryptographic property of modern TLS (via ECDHE) ensuring that compromise of long-term server private keys cannot decrypt past sessions.
- **PMTUD (Path MTU Discovery):** An automated mechanism (RFC 1191) using the DF bit and ICMP Type 3 Code 4 to discover the smallest MTU across a routed network path.
- **Promiscuous Mode:** A NIC configuration instructing the controller to pass all received frames to the operating system, regardless of whether the destination MAC matches the card.

### Q
- **QUIC:** A modern UDP-based transport protocol (RFC 9000) incorporating multiplexing and integrated TLS 1.3 encryption, forming the foundation of HTTP/3.

### R
- **Reverse Shell:** A shell connection where the compromised target connects *outbound* to the attacker's listening server, bypassing inbound perimeter firewalls.
- **RFC (Request for Comments):** Technical standards documents published by the Internet Engineering Task Force (IETF) governing internet protocols.
- **RST (Reset):** A TCP control flag that immediately terminates an active connection or rejects an unauthorized connection attempt.
- **RTT (Round Trip Time):** The duration (in milliseconds) required for a data packet to travel from sender to destination and for the acknowledgment to return.

### S
- **SACK (Selective Acknowledgment):** A TCP option (RFC 2018) allowing a receiver to acknowledge non-contiguous blocks of data, optimizing loss recovery.
- **SID (Snort ID):** A unique numerical identifier assigned to a Snort rule (SIDs $\ge 1,000,000$ are reserved for custom local rules).
- **Slowloris:** An application-layer Denial of Service attack that ties up web server resources by sending partial HTTP requests very slowly without terminating.
- **SMB (Server Message Block):** A client-server communication protocol used for sharing files, printers, and serial ports over TCP port 445.
- **Snaplen (Snapshot Length):** The maximum number of bytes per packet recorded to disk during a capture (e.g. 96 bytes for headers-only).
- **SNI (Server Name Indication):** A cleartext extension in the TLS Client Hello handshake indicating the target website hostname before encryption is negotiated.
- **SPAN (Switched Port Analyzer):** A dedicated switch monitor port configured to receive mirrored copies of traffic from other ports or VLANs for analysis.
- **SYN Cookie:** A defensive technique that prevents TCP SYN flood DoS attacks by encoding connection parameters into the Initial Sequence Number without allocating state memory.

### T
- **TAP (Test Access Point):** A dedicated passive hardware device spliced into a physical network cable to duplicate 100% of network traffic without packet loss.
- **TCP (Transmission Control Protocol):** RFC 793 connection-oriented, reliable transport protocol featuring handshakes, sequence numbers, flow control, and retransmissions.
- **Throughput:** The actual achieved data transfer rate across a network link under real-world conditions (always $\le$ bandwidth).
- **TLS (Transport Layer Security):** Cryptographic protocol (RFC 8446) providing privacy, authentication, and data integrity over computer networks.
- **TSO (TCP Segmentation Offload):** A network card performance optimization where large TCP data segments are split into MTU-sized packets by the NIC hardware rather than the CPU.
- **TTL (Time to Live):** An 8-bit field in the IPv4 header decremented by 1 at every router hop; packets are dropped when TTL reaches zero to prevent infinite routing loops.

### U
- **UDP (User Datagram Protocol):** RFC 768 minimal, connectionless, stateless transport-layer protocol running without acknowledgments or retransmissions.
- **Unicast:** Network communication transmitted from a single sender directed to a single specific destination device.

### V
- **VLAN (Virtual Local Area Network):** Logical segmentation of a physical network switch into isolated broadcast domains (IEEE 802.1Q).

### W
- **Window Scale (WSopt):** A TCP option (RFC 7323) that multiplies the 16-bit Window field by a power of two, enabling receive windows up to 1 gigabyte for high-speed networks.

### Z
- **Zero Window:** A TCP state where a receiver advertises a Window Size of 0, signaling the sender to pause data transmission because the receiver's application buffer is completely full.
