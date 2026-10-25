# 📋 Module 08 Cheat Sheet: Attack & Defense Traffic Analysis

## 🚨 Attack Detection Display Filters

### 1. ARP Spoofing & MITM
```
arp.duplicate-address-detected         # Wireshark expert alert for IP conflict
arp.opcode == 2                        # Unsolicited ARP replies
```

### 2. Reconnaissance & Denial of Service (DoS)
```
# Inbound TCP SYN Scan / Flood
tcp.flags.syn == 1 && tcp.flags.ack == 0

# TCP Reset Floods / Closed Port Sweeps
tcp.flags.reset == 1

# Stealth Xmas / Null Scans
tcp.flags == 0x029 || tcp.flags == 0x000

# Low-and-Slow Application DoS (Slowloris)
http && frame.len < 100 && tcp.flags.push == 1
```

### 3. Cleartext Credential Harvesting
```
# HTTP Basic Auth (Automatically decoded in Details pane!)
http.authorization

# Web Form POST Submissions with Passwords
http.request.method == "POST" && (http contains "password" || http contains "passwd")

# Plaintext FTP / Telnet
ftp.request.command in {"USER", "PASS"}
telnet

# Plaintext Mail & SNMP
pop.request.command == "PASS" || imap.request contains "LOGIN"
snmp.community
```

### 4. Malware C2 & Covert Channels
```
# Suspicious Non-Browser User-Agents
http.user_agent && !(http.user_agent contains "Mozilla")

# ICMP Data Tunneling / Exfiltration
icmp && frame.len > 120

# DNS Data Exfiltration (Long subdomains / TXT queries)
dns.qry.name.len > 50 || dns.qry.type == 16

# Periodic Beacons (Jitter Analysis)
frame.time_delta > 1.0 && frame.time_delta < 10.0
```

### 5. Web Exploitation & Injections
```
# Shellshock RCE (CVE-2014-6271)
http.user_agent contains "() {" || http.header contains "() {"

# Directory Traversal
http.request.uri contains ".."

# SQL Injection
http.request.uri contains "UNION" || http.request.uri contains "SELECT"
```

---

## 🔒 Forensic Evidence Integrity Protocol
```bash
# 1. Compute SHA-256 hash immediately upon acquisition
sha256sum incident.pcapng > incident.sha256

# 2. Set master file to Read-Only
chmod 400 incident.pcapng

# 3. Create working copy for analysis
cp incident.pcapng incident_working_copy.pcapng

# 4. Extract metadata & verify duration
capinfos incident.pcapng
```

---

## 💻 Rapid TShark Forensic One-Liners
```bash
# Extract all HTTP Basic Auth credentials and decode from Base64
tshark -r incident.pcap -Y "http.authorization" \
  -T fields -e http.authorization | awk '{print $2}' | base64 -d 2>/dev/null

# Extract all cleartext FTP logins
tshark -r incident.pcap -Y 'ftp.request.command in {"USER","PASS"}' \
  -T fields -e ip.src -e ftp.request.command -e ftp.request.arg

# Find top 10 queried external domains
tshark -r incident.pcap -Y "dns.flags.response==0" \
  -T fields -e dns.qry.name | sort | uniq -c | sort -rn | head -10
```

---

## 📋 The 10-Step Incident Triage Routine
1. **Hash Verification:** Compute SHA-256; maintain chain of custody.
2. **Metadata Review:** Run `capinfos` (duration, packet count, interfaces).
3. **Protocol Inventory:** Check *Statistics ➔ Protocol Hierarchy* for anomalies.
4. **Top Talkers:** Sort *Statistics ➔ Conversations* by Bytes.
5. **DNS Audit:** Hunt for NXDOMAIN spikes (`rcode==3`) and TXT records.
6. **Web / TLS Audit:** Inspect HTTP methods, unusual User-Agents, and SNIs.
7. **Scan Check:** Identify SYN spikes (`tcp.flags.syn==1 && tcp.flags.ack==0`).
8. **Credential Audit:** Filter for cleartext passwords (HTTP, FTP, Telnet).
9. **Carve Objects:** Use *File ➔ Export Objects* to extract dropped files.
10. **Document Timeline:** Correlate all events in **UTC** with MITRE ATT&CK IDs.
