# 📋 Module 05 Cheat Sheet: Nmap Port Scanning & Reconnaissance

## 🚀 Core Scanning Commands
```bash
# Fast reconnaissance of local subnet (ARP sweep)
nmap -sn 10.10.10.0/24

# Full port scan with service versions, OS, and scripts
sudo nmap -A -p- 10.10.10.20 -oA /path/to/scan_results

# Fast top 100 ports scan
sudo nmap -F 10.10.10.20

# Treat host as online (skip ping) and scan all 65,535 ports
sudo nmap -Pn -p- 10.10.10.30
```

---

## 🎯 Port Scan Flags (`-s*`)
| Flag | Scan Type | Packets Sent | Target Response (Open) | Privileges |
|---|---|---|---|---|
| **`-sS`** | TCP SYN (Stealth) | `SYN` | `SYN/ACK` ➔ Nmap sends `RST` | **Root** required |
| **`-sT`** | TCP Connect | Full 3-Way Handshake | `SYN/ACK` ➔ Nmap sends `ACK` | Non-root default |
| **`-sU`** | UDP Scan | Empty UDP packet | Application data or no response | Root required |
| **`-sN`** | NULL Scan | No flags (`0x00`) | No response (Open) / `RST` (Closed) | Root required |
| **`-sF`** | FIN Scan | `FIN` only (`0x01`)| No response (Open) / `RST` (Closed) | Root required |
| **`-sX`** | Xmas Scan | `FIN+PSH+URG` (`0x29`)| No response (Open) / `RST` (Closed) | Root required |
| **`-sA`** | TCP ACK Scan | `ACK` | `RST` (Maps firewall rules) | Root required |

---

## 🔍 Host Discovery Flags
```bash
-sn                  # Ping scan only (no port scan)
-Pn                  # Skip host discovery entirely (treat all hosts as online)
-PE                  # ICMP Echo Request ping
-PP                  # ICMP Timestamp ping
-PS443,80            # TCP SYN ping to specified ports
-PA80                # TCP ACK ping to specified ports
-PU40125             # UDP ping to high port
--disable-arp-ping   # Force Layer 3 discovery on local subnet
```

---

## 🔬 Service & OS Fingerprinting
```bash
-sV                  # Probe open ports for service version info
--version-intensity 9# Maximum service version probe depth (0-9)
-O                   # TCP/IP stack OS fingerprinting
--osscan-guess       # Aggressively guess operating system
-A                   # Enables -sV, -O, -sC, and --traceroute simultaneously
```

---

## 📜 NSE (Nmap Scripting Engine)
```bash
-sC                  # Run default scripts (equivalent to --script=default)
--script vuln        # Run all vulnerability detection scripts
--script "smb-*"     # Run all scripts matching wildcard
--script-help <name> # View documentation for specific script
--script-args <k=v>  # Pass custom arguments to scripts

# Top Security Scripts
sudo nmap --script ssl-enum-ciphers -p 443 <target>    # Audit TLS ciphers
sudo nmap --script smb-vuln-ms17-010 -p 445 <target>   # Check EternalBlue
sudo nmap --script ftp-anon -p 21 <target>             # Check anonymous FTP
sudo nmap --script http-enum -p 80 <target>            # Enumerate web directories
```

---

## ⏱️ Timing & Evasion
```bash
-T0 to -T5           # Timing templates (-T4 recommended for LAN/cloud)
--min-rate 1000      # Send minimum 1,000 packets per second
-D RND:5,ME          # Intermix scan with 5 randomized decoy IP addresses
-g 53                # Spoof source port as 53 (DNS)
-f                   # Fragment IP packets (8-byte chunks)
--data-length 25     # Append 25 bytes of dummy payload to probes
```

---

## 💾 Output Formats
```bash
-oA <basename>       # Save Normal (.nmap), XML (.xml), and Grepable (.gnmap)
-oX scan.xml         # XML format
xsltproc scan.xml -o report.html  # Compile XML to interactive HTML report
```

---

## 🦈 Detecting Nmap Scans in Wireshark
```
# Detect SYN Scan (High volume of initial SYNs followed by RST)
tcp.flags.syn == 1 && tcp.flags.ack == 0

# Detect Xmas Scan
tcp.flags == 0x029

# Detect NULL Scan
tcp.flags == 0x000

# Detect Decoy Scan (Identical probes arriving simultaneously from multiple IPs)
tcp.dstport == 80 && tcp.flags.syn == 1
```
