# 06.01: Netcat Basics: The TCP/IP Swiss Army Knife

**Level:** 🟡 Intermediate | **Time:** 1 h | **XP:** 75

## 🎯 Learning Objectives
- Understand the role of Netcat (`nc`) as the foundational networking and socket tool
- Distinguish between Netcat implementations (`netcat-traditional`, `netcat-openbsd`, `ncat`)
- Master Client mode (connecting to remote ports) and Listener mode (spawning servers)
- Build an interactive, raw two-way chat service across hosts
- Analyze raw socket communications in Wireshark

---

## 1. What is Netcat?

Written originally by "Hobbit" in 1995, **Netcat (`nc`)** is a computer networking utility for reading from and writing to network connections using TCP or UDP. It reads from standard input (`stdin`) and writes to standard output (`stdout`), turning standard shell pipelines into network streams.

### The Different Flavors of Netcat:
1. **`netcat-traditional` (Original):** Includes the `-e` flag (execute program after connect — often abused for reverse shells).
2. **`netcat-openbsd`:** Standard on Debian/Ubuntu/Kali. Modernized, stripped of the dangerous `-e` flag for security.
3. **`ncat` (The Nmap Project):** Modern rewrite supporting SSL/TLS encryption, IPv6, proxies, and connection brokering.
4. **`socat` (Socket Cat):** Multipurpose bidirectional relay tool (Module 06.03).

---

## 2. Core Netcat Modes & Flags

```bash
# CLIENT MODE: Connect to an existing service
nc [options] <target_ip> <port>

# LISTENER MODE: Open a port and wait for incoming connections
nc -l -p <port> [options]
```

| Flag | Meaning | Use Case |
|---|---|---|
| **`-l`** | Listen mode | Create a server / wait for connections |
| **`-p <port>`** | Local port number | Specify which port to bind |
| **`-v` / `-vv`**| Verbose / Very Verbose | Prints connection status and errors |
| **`-n`** | Numeric IPs only | Suppresses slow DNS lookups |
| **`-u`** | UDP mode | Switch from TCP to UDP |
| **`-w <sec>`** | Timeout | Closes connection after N seconds of silence |
| **`-z`** | Zero-I/O mode | Probes port status without sending data (port scan) |
| **`-k`** | Keep-alive | Keeps listener open after a client disconnects |

---

## 3. Basic Netcat Capabilities

### 3.1 Raw Port Connectivity Check
Verify whether a remote firewall or server is permitting connections without opening a web browser:
```bash
nc -zv 10.10.10.20 80
# Output: Connection to 10.10.10.20 80 port [tcp/http] succeeded!
```

### 3.2 Quick Port Sweep (Bash + Netcat)
```bash
nc -zvn -w1 10.10.10.20 20-25
```

---

## 4. 🎯 Mission: Build a Raw Chat & Capture in Wireshark

We will establish a live two-way chat between Kali and Ubuntu Server over an arbitrary TCP port, sniff the conversation in Wireshark, and inspect the raw TCP packets!

### Step 1: Start the Listener on Ubuntu Server
On **ubuntu-srv**:
```bash
# Listen on TCP port 4444 with verbose output
nc -lvnp 4444
```
*(Ubuntu Server is now a listening TCP socket, waiting for an incoming connection).*

### Step 2: Start Packet Capture on Kali
1. On **Kali**, launch Wireshark on `eth0`, filter: `tcp.port == 4444`.

### Step 3: Connect from Kali
In Kali terminal:
```bash
nc -vn 10.10.10.20 4444
```
Look at both terminals: the connection is established!

### Step 4: Chat Back and Forth
- In Kali terminal, type: `Hello Ubuntu! Analyst connected.` and press Enter.
- Look at Ubuntu terminal: the text appears instantly!
- In Ubuntu terminal, type: `Message received loud and clear.` and press Enter.
- Look at Kali: the response appears!
- Press `Ctrl + C` on Kali to terminate the session.

### Step 5: Dissect the Chat in Wireshark
1. Stop capture in Wireshark.
2. Observe the initial 3-way handshake (`SYN ➔ SYN/ACK ➔ ACK`).
3. Click on the first data packet:
   - Notice the TCP flag `[PSH, ACK]`.
   - Look at the Packet Bytes pane: the exact keystrokes `Hello Ubuntu!` are visible in raw ASCII.
4. Right-click ➔ **Follow ➔ TCP Stream** to view the full dialogue.

---

## 💼 Business Corner: Network Connectivity Triage
During critical server outages, network engineers and system administrators frequently clash:
- Sysadmin: *"The firewall is blocking port 8443 to our new application!"*
- Firewall admin: *"The firewall rule is active and passing packets; your application service is simply crashed or not listening!"*

**The Netcat Proof in 10 Seconds:**
The sysadmin runs `nc -lvnp 8443` on the server.
The client runs `nc -zv <server_ip> 8443`.
- If the connection succeeds, the firewall is 100% functional and passing traffic. The issue is definitively within the application service configuration.
- If the connection times out, the packet was dropped in transit by the network or firewall.

---

## 🧠 Knowledge Check
1. How do you instruct Netcat to listen on TCP port 9000?
2. What does the `-n` flag do, and why should it always be used during incident response?
3. How do you configure Netcat to test a UDP port instead of a TCP port?
4. What happens by default to a standard Netcat listener when the connected client disconnects?

<details><summary>Answers</summary>

1. `nc -lvnp 9000`.
2. `-n` disables DNS hostname resolution, preventing delay and avoiding unwanted outbound DNS queries.
3. Use the `-u` flag (e.g., `nc -uvn <ip> <port>`).
4. The listener process terminates and exits back to the shell (unless the `-k` keep-alive flag is used).
</details>

---
⬅️ [Module 05 Cheat Sheet](../05-Nmap/cheatsheet.md) | ➡️ [02 File Transfers, Banners & Shells](02-file-transfers-banners-shells.md)
