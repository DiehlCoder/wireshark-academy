# 03.07: Legacy & Enterprise Protocols (FTP, Telnet, SSH, SMTP, SMB)

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Analyze cleartext legacy protocols (FTP, Telnet) and extract credentials
- Dissect the SSH connection lifecycle and understand banner fingerprinting
- Trace email transactions in SMTP and identify phishing artifacts
- Understand SMB (Server Message Block) architecture and lateral movement indicators
- Justify the business imperative to deprecate cleartext legacy protocols

---

## 1. FTP: The File Transfer Protocol (RFC 959)

FTP separates control commands from data transfers using **two separate TCP connections**:

```
Client                                                 Server
  │                                                      │
  ├──────── TCP Port 21: Control Channel (Commands) ─────► (USER, PASS, LIST, RETR)
  │◄─────── Response Codes (220, 331, 230) ──────────────┤
  │                                                      │
  │   --- Mode A: Active FTP (Server initiates data) --- │
  │◄─────── TCP Port 20: Data Channel ───────────────────┤ (File content / directory list)
  │                                                      │
  │   --- Mode B: Passive FTP (Client initiates data) -- │
  │──────── TCP Random Port: Data Channel ──────────────►│ (File content / directory list)
```

- **Active FTP (`PORT` command):** Client sends its IP and an ephemeral port; the server connects *back* to the client from port 20. (Often blocked by client-side NAT/firewalls).
- **Passive FTP (`PASV` command):** Server tells client to connect to an ephemeral high port on the server.
- **Insecurity:** Commands and data are sent in raw ASCII.
  - Display filter: `ftp || ftp-data`
  - Credentials: `ftp.request.command in {"USER", "PASS"}`

---

## 2. Telnet: The Ultimate Insecure Shell (Port 23)

Telnet sends every character typed by the user directly across the network in individual packets:
- No encryption, no hashing, no integrity checks.
- An analyst or attacker sniffing a Telnet session can reassemble the exact commands, password prompts, and terminal outputs simply by right-clicking and selecting **Follow ➔ TCP Stream**.
- Display filter: `telnet`

---

## 3. SSH: Secure Shell (Port 22, RFC 4253)

SSH encrypts terminal sessions, SFTP file transfers, and port-forwarded tunnels.

### 3.1 Connection Lifecycle:
1. **TCP 3-Way Handshake** to port 22.
2. **Identification Exchange (Cleartext Banner!):**
   - Both sides announce their software version in cleartext:
   - Example: `SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13`
   - **Analyst value:** Instant, passive remote OS and software fingerprinting!
3. **Key Exchange (KEXINIT):** Both sides exchange supported ciphers, key algorithms, and MACs.
4. **Diffie-Hellman Key Exchange:** Derives shared symmetric encryption key.
5. **Encrypted Authentication & Session:** Passwords and public keys are transferred inside the encrypted tunnel.

### Display filters:
- `ssh` — All SSH packets
- `ssh.protocol` — Cleartext banner exchange packets

---

## 4. SMTP: Simple Mail Transfer Protocol (Port 25 / 587)

SMTP transfers email between mail servers.

### 4.1 Typical SMTP Conversation (RFC 5321):
```smtp
S: 220 mail.lab.local ESMTP Postfix
C: EHLO kali.lab.local
S: 250-mail.lab.local
S: 250-STARTTLS
S: 250 OK
C: MAIL FROM:<ceo@company.com>
S: 250 2.1.0 Ok
C: RCPT TO:<finance@company.com>
S: 250 2.1.5 Ok
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: Subject: Urgent Wire Transfer Required
C: 
C: Please wire €50,000 to the attached IBAN immediately.
C: .
S: 250 2.0.0 Ok: queued as A1B2C3D4
C: QUIT
S: 221 2.0.0 Bye
```

- **STARTTLS:** An opportunistic command to upgrade a cleartext connection to TLS. If an attacker strips the `STARTTLS` keyword from the `EHLO` response (STARTTLS stripping attack), the email is sent in plaintext!
- Display filter: `smtp`

---

## 5. SMB: Server Message Block (Port 445)

SMB provides file sharing, printer sharing, and remote IPC (Inter-Process Communication) on Windows networks.

### 5.1 Protocol Evolution:
- **SMBv1 (CIFS):** Deprecated, legacy, extremely chatty, insecure. Exploited by **EternalBlue (MS17-010)** to spread WannaCry and NotPetya ransomware!
- **SMBv2 (Vista/2008):** Massive performance improvements, reduced round-trips.
- **SMBv3 (Win 8/2012+):** End-to-end AES-128/256 encryption, message signing, multichannel clustering.

### 5.2 SMB in Cyberattacks:
Attackers use SMB for **Lateral Movement**:
- Connecting to administrative hidden shares (`C$`, `ADMIN$`, `IPC$`)
- Executing code remotely using **PsExec** or **Impacket**
- Spraying passwords using NTLM authentication
- Display filter: `smb || smb2`

---

## 6. 🎯 Mission: Capture Cleartext Protocols vs. SSH

### Part 1: Sniff FTP Credentials on Metasploitable2
1. On Kali, start Wireshark on `eth0`, filter: `ftp`.
2. Connect to Metasploitable2's FTP server:
   ```bash
   ftp 10.10.10.30
   # Username: msfadmin
   # Password: msfadmin
   # Type: ls
   # Type: quit
   ```
3. Stop capture. Look at the `ftp.request.command` fields:
   - Notice the exact username and password visible in the Packet List pane.
   - Right-click the packet ➔ **Follow ➔ TCP Stream** to see the whole session.

### Part 2: Inspect SSH Banner Fingerprints
1. Connect to Ubuntu Server via SSH:
   ```bash
   ssh -o StrictHostKeyChecking=no student@10.10.10.20 "whoami"
   ```
2. In Wireshark, filter: `ssh.protocol`.
3. Read the banner string sent by `10.10.10.20`.
   - What version of OpenSSH is running?
   - What underlying Linux distribution does the banner reveal?

---

## 💼 Business Corner: Zero Trust & Legacy Protocol Deprecation
Cleartext protocols represent severe liabilities under cybersecurity frameworks (ISO 27001 Annex A, NIST CSF, BSI IT-Grundschutz):

| Legacy Protocol | Insecure Aspect | Modern Replacement | Migration Impact |
|---|---|---|---|
| **Telnet (23)** | Cleartext passwords | **SSH (22)** | Zero user impact; replace terminal scripts |
| **FTP (21)** | Cleartext credentials + data | **SFTP (22) / FTPS (990)** | Script updates, partner onboarding |
| **HTTP (80)** | Cleartext web traffic | **HTTPS (443) + HSTS** | Requires SSL/TLS certificates |
| **SMBv1 (445)** | Ransomware vulnerability | **SMBv3 with Encryption** | Audit older scanners, printers, and NAS |

**The SMBv1 Ransomware Disaster:**
In 2017, the WannaCry and NotPetya ransomware attacks inflicted over **$10 billion in global damage** (crippling Maersk shipping, the UK NHS, and Merck pharma) within hours by spreading autonomously through SMBv1. Disabling SMBv1 across your enterprise is one of the highest-ROI defensive actions in network security.

---

## 🧠 Knowledge Check
1. Why does FTP use two separate TCP connections?
2. What is the security consequence of an attacker stripping the `STARTTLS` banner in an SMTP negotiation?
3. What information can a security analyst gather from an SSH connection even without decrypting it?
4. Which historic vulnerability in SMBv1 allowed the WannaCry ransomware to spread across global networks without requiring user interaction?

<details><summary>Answers</summary>

1. One connection (port 21) is reserved for interactive commands and status responses (Control Channel), while separate connections (port 20 or high ports) are opened on-demand for actual data transfers and directory listings (Data Channel).
2. The client will fall back to transmitting the email and its authentication credentials in unencrypted cleartext.
3. The exact SSH client and server software versions and underlying operating system release via the cleartext banner exchange, plus IP addresses, connection times, packet lengths, and traffic frequency.
4. EternalBlue (Microsoft Security Bulletin MS17-010 / CVE-2017-0144).
</details>

---
⬅️ [06 HTTP & TLS](06-http-and-tls.md) | ➡️ [Module 03 Cheat Sheet](cheatsheet.md) | ➡️ [Module 04](../04-Wireshark-Advanced/01-statistics-and-io-graphs.md)
