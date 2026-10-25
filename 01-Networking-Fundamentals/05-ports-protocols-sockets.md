# 01.05: Ports, Protocols & Sockets

**Level:** 🟢 Beginner | **Time:** 1 h | **XP:** 75

## 🎯 Learning Objectives
- Understand ports, sockets and the 5-tuple
- Compare TCP vs. UDP
- Memorize the most important well-known ports
- List the listening services on your lab hosts

---

## 1. Ports & Sockets
- A **port** is a 16-bit number (0–65535) that identifies an application endpoint on a host.
- A **socket** = IP + port (+ protocol), e.g. `10.10.10.20:80/tcp`.
- A **connection** is identified by the **5-tuple**: `protocol, src IP, src port, dst IP, dst port`.

| Range | Name | Notes |
|---|---|---|
| 0–1023 | **Well-known** | Need root to bind on Linux |
| 1024–49151 | **Registered** | e.g. 3306 MySQL, 3389 RDP |
| 49152–65535 | **Dynamic/Ephemeral** | Client source ports (Linux default: 32768–60999) |

---

## 2. TCP vs. UDP

| Feature | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (3-way handshake) | Connectionless |
| Reliability | ACKs, retransmissions, ordering | None ("fire and forget") |
| Flow/congestion control | Yes (windows) | No |
| Header size | 20–60 bytes | 8 bytes |
| Use cases | Web, mail, file transfer, SSH | DNS, DHCP, VoIP, streaming, QUIC |
| Scanning | Easy (SYN → SYN/ACK or RST) | Hard (silence is ambiguous) |

---

## 3. Ports You Must Know 🧠

| Port | Proto | Service | Cleartext? | Security note |
|---|---|---|---|---|
| 20/21 | TCP | FTP data/control | ✅ cleartext | Credentials visible in Wireshark |
| 22 | TCP | SSH / SFTP | ❌ encrypted | Brute-force target |
| 23 | TCP | Telnet | ✅ | Never use it. Every keystroke is visible |
| 25 | TCP | SMTP | ✅ (STARTTLS optional) | Spam relays, phishing |
| 53 | UDP/TCP | DNS | ✅ | Tunneling/exfiltration channel |
| 67/68 | UDP | DHCP server/client | ✅ | Rogue DHCP attacks |
| 69 | UDP | TFTP | ✅ | Network device configs |
| 80 | TCP | HTTP | ✅ | |
| 110 / 143 | TCP | POP3 / IMAP | ✅ | Use 995/993 (TLS) |
| 123 | UDP | NTP | ✅ | Amplification DDoS |
| 137–139 | UDP/TCP | NetBIOS | ✅ | Name poisoning (LLMNR/NBT-NS) |
| 161/162 | UDP | SNMP | ✅ (v1/v2c) | Community string "public" |
| 389 / 636 | TCP | LDAP / LDAPS | ✅ / ❌ | AD enumeration |
| 443 | TCP/UDP | HTTPS / QUIC | ❌ | |
| 445 | TCP | SMB | partly | EternalBlue, ransomware spread |
| 514 | UDP | Syslog | ✅ | |
| 1433 / 3306 / 5432 | TCP | MSSQL / MySQL / PostgreSQL | varies | Never expose to the Internet |
| 3389 | TCP | RDP | ❌ | Top ransomware entry point |
| 5900 | TCP | VNC | weak | |
| 8080 / 8443 | TCP | Alternative HTTP(S), proxies | | |

Full list on Kali: `less /etc/services` or `grep -w 445 /etc/services`

---

## 4. 🎯 Mission: Who Is Listening?
On **ubuntu-srv**:
```bash
sudo ss -tulpn          # t=TCP u=UDP l=listening p=process n=numeric
```
Example output:
```
Netid State  Local Address:Port  Process
udp   UNCONN 0.0.0.0:53          users:(("dnsmasq",pid=812))
tcp   LISTEN 0.0.0.0:22          users:(("sshd",pid=701))
tcp   LISTEN *:80                users:(("apache2",pid=930))
tcp   LISTEN *:21                users:(("vsftpd",pid=744))
```

On **Kali**, connect to a service and watch the connection appear:
```bash
nc 10.10.10.20 80        # then type: GET / HTTP/1.0 and press Enter twice
# meanwhile on ubuntu-srv:
ss -tn state established
```

Questions for your journal:
1. Which ephemeral source port did Kali use?
2. Write down the full 5-tuple of the connection.
3. What's the difference between `0.0.0.0:22` and `127.0.0.1:22` in `ss` output?

<details><summary>Answer to Q3</summary>

`0.0.0.0` = listening on **all** interfaces (reachable from the network). `127.0.0.1` = only reachable locally. Services that are accidentally bound to 0.0.0.0 are a classic exposure finding in pentests.
</details>

---

## 💼 Business Corner
**Attack surface management:** every open port is a potential entry point. Companies run regular port audits (internal + external) and compare them to an approved baseline. Unauthorized open ports (a forgotten test DB on 3306) are a frequent finding in audits and breach reports. Exposed RDP (3389) has been one of the most common ransomware initial access vectors for years.

---

## 🧠 Knowledge Check
1. What is a 5-tuple?
2. Why is DNS mostly UDP but sometimes TCP?
3. Which ports for SMB, RDP and SSH?
4. Name three cleartext protocols whose passwords you could read in Wireshark.

<details><summary>Answers</summary>

1. Protocol, source IP, source port, destination IP, destination port.
2. UDP is fast for small queries. TCP is used for responses larger than the UDP limit (truncated, TC bit set), zone transfers (AXFR), and DNS over TLS.
3. 445, 3389, 22.
4. FTP, Telnet, HTTP (Basic auth or forms), POP3, IMAP, SNMPv1/v2c community strings.
</details>

---
⬅️ [04 IP Addressing](04-ip-addressing-subnetting.md) | ➡️ [Module 01 Cheat Sheet](cheatsheet.md) | ➡️ [Module 02](../02-Wireshark-Foundations/01-install-and-interface.md)
