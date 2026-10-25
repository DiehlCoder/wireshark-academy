# 05.03: Service Version & Operating System Fingerprinting

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Understand why port numbers alone cannot be trusted for service identification
- Dissect the **Service Version Detection (`-sV`)** probe and banner-matching engine
- Master **Remote OS Fingerprinting (`-O`)** via TCP/IP stack behavioral analysis
- Analyze OS fingerprinting probes in Wireshark (TCP options, IP ID generation, window sizes)
- Audit corporate networks for unpatched software versions and End-of-Life (EOL) operating systems

---

## 1. Why Port Numbers Lie

By convention, port 80 is HTTP and port 22 is SSH. 
However, an administrator or an attacker can bind any service to any port:
- A backdoor might listen on TCP port 443 to blend into normal HTTPS traffic.
- A honeypot might run a simulated Telnet daemon on TCP port 80.

A standard port scan only confirms that a TCP port answers with `SYN/ACK`. **Service Version Detection (`-sV`)** connects to the open port, interrogates the application, and determines the exact software name and version number (e.g., `Apache httpd 2.4.58` or `OpenSSH 9.6p1`).

---

## 2. How `-sV` Service Detection Works

Nmap uses a signature database called `nmap-service-probes` located at `/usr/share/nmap/nmap-service-probes`.

### The Version Detection Workflow:
```
1. Open TCP Handshake to discovered open port.
2. Wait 5 seconds for unsolicited "Welcome Banner" (e.g. FTP 220, SSH, SMTP).
3. If no banner received, send Probe 1 (Generic HTTP GET request: "GET / HTTP/1.0\r\n\r\n").
4. If no match, send Probe 2 (SSL/TLS Client Hello).
5. If still no match, send specialized protocol probes (SIP, SMB, RPC, MySQL...).
6. Match received payload against regex signatures in nmap-service-probes.
```

### Version Intensity Levels:
- `--version-intensity <0-9>`: Controls how many probes Nmap sends.
  - `0` (Lightest / Fast): Sends only the most common probes.
  - `7` (Default): High accuracy with balanced speed.
  - `9` (Heavy / `--version-all`): Tests every single known probe in the database.

---

## 3. Remote OS Fingerprinting (`-O`)

How does Nmap know a target is running `Linux 5.15` or `Windows 11` without logging in?
Different operating system kernels implement the TCP/IP stack with subtle, distinct nuances. Nmap sends **up to 16 specialized probe packets** and compares the responses against its fingerprint database (`/usr/share/nmap/nmap-os-db`).

### Key TCP/IP Stack Behavioral Tests:
1. **Initial Sequence Number (ISN) Predictability:** Measures how random or predictable the target's TCP sequence numbers are over time.
2. **TCP Options Ordering & Support:** Does the OS send `[MSS, SACK, Timestamp, NOP, Window Scale]` or `[MSS, NOP, Window Scale, SACK, Timestamp]`?
3. **Default Initial Window Size:** Linux typically uses 29,200 or 64,240; Windows typically uses 64,240 or 65,535.
4. **Initial TTL Values:** Linux/macOS = 64; Windows = 128; Cisco IOS = 255.
5. **IP ID Generation Pattern:** Is the IP header `Identification` incremented sequentially ($+1$), randomized, or fixed at zero (as in modern Linux kernels)?
6. **Response to Malformed TCP Flags:** How does the stack react to a packet with `SYN + FIN` or an invalid reserved bit set?

---

## 4. The Aggressive Scan Flag (`-A`)

In real-world security assessments, analysts often combine multiple discovery engines using the `-A` (Aggressive) flag:

```bash
sudo nmap -A 10.10.10.30
```
`-A` is a shortcut that activates four powerful tools simultaneously:
- **`-sV`**: Service Version Detection
- **`-O`**: Operating System Fingerprinting
- **`-sC`**: Default NSE Scripts (Module 05.04)
- **`--traceroute`**: Reverse hop-by-hop path discovery

---

## 5. 🎯 Mission: Capture Fingerprinting Probes in Wireshark

### Step 1: Capture Service Version Probing
1. On Kali, start Wireshark on `eth0`, filter: `ip.addr == 10.10.10.30 && tcp.port == 21`.
2. In terminal, run a version probe against FTP on Metasploitable2:
   ```bash
   sudo nmap -sV -p 21 10.10.10.30
   ```
3. In Wireshark:
   - Notice the TCP handshake.
   - Look at the first packet from the server: `220 (vsFTPd 2.3.4)`.
   - Nmap parsed this exact banner to report `vsftpd 2.3.4`!

### Step 2: Capture OS Fingerprinting Probes
1. Change Wireshark filter to: `ip.dst == 10.10.10.20 && (tcp || icmp)`.
2. Run an OS scan against Ubuntu Server:
   ```bash
   sudo nmap -O --osscan-guess 10.10.10.20
   ```
3. In Wireshark, examine the burst of weird probe packets:
   - Locate the packets with unusual TCP flag combinations (e.g. `SYN + FIN`, or `URG + PSH + SYN + FIN`).
   - Locate the ICMP probes with unusual codes.
   - Look at the terminal: Nmap outputs an accurate OS match: `Linux 5.x / 6.x` with a percentage confidence rating!

---

## 💼 Business Corner: Vulnerability Management & Patch Auditing
Enterprise security teams must comply with vulnerability management standards (PCI DSS 11.2, NIST 800-53 RA-5).

Running quarterly authenticated and unauthenticated Nmap version sweeps (`-sV`) against internal server subnets provides an authoritative, vendor-neutral audit:
- Identifies forgotten developer test servers running outdated software (e.g., `Apache 2.4.29` with known Remote Code Execution CVEs).
- Pinpoints End-of-Life (EOL) operating systems (e.g., `Windows Server 2008 R2` or `Ubuntu 16.04`) that no longer receive security patches from Microsoft or Canonical.
- Verifies that external firewalls successfully mask server banners to prevent reconnaissance by opportunistic adversaries.

---

## 🧠 Knowledge Check
1. What is the fundamental difference between a standard port scan and a service version scan (`-sV`)?
2. Name three distinct TCP/IP stack characteristics Nmap analyzes to determine a target's operating system.
3. What four features are enabled when you run Nmap with the `-A` flag?
4. What database file does Nmap consult to match service version response strings?

<details><summary>Answers</summary>

1. A standard port scan only tests whether a port answers; a service version scan sends application-level probes to determine the exact software product name and release version.
2. (1) Predictability of Initial Sequence Numbers (ISN), (2) TCP options order and support, (3) Initial TTL and Window sizes, and (4) IP ID generation patterns.
3. Service Version Detection (`-sV`), OS Fingerprinting (`-O`), Default Script Scanning (`-sC`), and Traceroute (`--traceroute`).
4. `/usr/share/nmap/nmap-service-probes`.
</details>

---
⬅️ [02 Port Scanning Techniques](02-port-scanning-techniques.md) | ➡️ [04 NSE Scripting](04-nse-scripting.md)
