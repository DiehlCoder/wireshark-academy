# 07.04: Snort Detection Lab: Offline PCAP Analysis & Alert Triage

**Level:** 🔴 Advanced | **Time:** 2 h | **XP:** 200

## 🎯 Learning Objectives
- Run Snort in **Offline Analysis Mode (`-r`)** against historical PCAP files
- Configure modern alert logging formats (Fast Alert vs. JSON for SIEM ingestion)
- Engineer detection signatures for critical historical vulnerabilities (Shellshock CVE-2014-6271, Directory Traversal)
- Correlate Snort alert logs with Wireshark packet timestamps to confirm True Positives
- Perform **Retrospective Threat Hunting** across archived network data

---

## 1. Offline PCAP Processing with Snort (`-r`)

In an enterprise SOC, you do not only run Snort live on an interface. 
When a new Zero-Day threat intelligence report is published (e.g., CISA releases new Snort signatures for a critical vulnerability actively exploited in the wild):
- You don't just wait for future attacks.
- You **replay past network captures** against the new rules to answer: *"Were we breached last week before the signature was published?"*

### Offline Syntax:
```bash
sudo snort -r <capture_file.pcap> -c /etc/snort/snort.conf -l /var/log/snort/ -A console
```

---

## 2. Advanced Attack Signatures for the Lab

Open `/etc/snort/rules/local.rules` on **ubuntu-srv**:
```bash
sudo nano /etc/snort/rules/local.rules
```

Add these four specialized exploit detection signatures:

```conf
# 1. Shellshock RCE (CVE-2014-6271) inside HTTP Headers
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"EXPLOIT GNU Bash Shellshock RCE Attempt"; flow:to_server,established; http_header; content:"() {"; sid:1000010; rev:1;)

# 2. Directory Traversal / Path Traversal Attack
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK Directory Traversal Attempt (../)"; flow:to_server,established; http_uri; content:".."; sid:1000011; rev:1;)

# 3. UNIX Command Injection (whoami / id execution)
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK Command Injection id/whoami"; flow:to_server,established; http_client_body; pcre:"/(\||;|&|`)(whoami|id|cat \/etc\/passwd)/i"; sid:1000012; rev:1;)

# 4. Anonymous FTP Login Attempt
alert tcp $EXTERNAL_NET any -> $HOME_NET 21 (msg:"AUTH Anonymous FTP Login Attempt"; flow:to_server,established; content:"USER anonymous"; nocase; sid:1000013; rev:1;)
```

Validate configuration:
```bash
sudo snort -T -c /etc/snort/snort.conf -i enp0s3
```

---

## 3. 🎯 Mission: The End-to-End Hunt

We will simulate a realistic multi-stage web and network attack from Kali, capture the full incident in a PCAP file, analyze the PCAP with Snort offline, and correlate the alerts with Wireshark!

### Step 1: Capture the Incident on Kali
1. On **Kali**, start live capture into a file:
   ```bash
   sudo tcpdump -i eth0 -s0 -w ~/packet-ninja/captures/attack_simulation.pcap "not port 22" &
   TCPDUMP_PID=$!
   ```

### Step 2: Execute the Simulated Attacks
In Kali terminal, execute these four exploit probes:

```bash
# Attack 1: Directory Traversal
curl -s "http://10.10.10.20/view.php?file=../../../../etc/passwd" >/dev/null

# Attack 2: Shellshock Exploit Probe in User-Agent header
curl -s -H "User-Agent: () { :;}; echo 'VULNERABLE' > /tmp/hacked" http://10.10.10.20/ >/dev/null

# Attack 3: Command Injection via POST
curl -s -X POST http://10.10.10.20/login.html -d "user=admin;whoami" >/dev/null

# Attack 4: Anonymous FTP Probe
printf "USER anonymous\r\nPASS guest@\r\nQUIT\r\n" | nc -vn 10.10.10.20 21
```

Stop capture:
```bash
sudo kill $TCPDUMP_PID
```

### Step 3: Copy PCAP to Ubuntu Server & Run Snort Offline
```bash
# Transfer the capture file from Kali to Ubuntu Server
scp ~/packet-ninja/captures/attack_simulation.pcap student@10.10.10.20:/tmp/

# On Ubuntu Server: Replay the PCAP through Snort!
sudo snort -r /tmp/attack_simulation.pcap -c /etc/snort/snort.conf -A console -q
```

### Step 4: Examine Snort's Triage Results
Snort processes the file and prints all triggered alerts:
```
[**] [1:1000011:1] WEB-ATTACK Directory Traversal Attempt (../) [**]
[**] [1:1000010:1] EXPLOIT GNU Bash Shellshock RCE Attempt [**]
[**] [1:1000012:1] WEB-ATTACK Command Injection id/whoami [**]
[**] [1:1000013:1] AUTH Anonymous FTP Login Attempt [**]
```

### Step 5: Correlate in Wireshark
1. Open `attack_simulation.pcap` in Wireshark on Kali.
2. Filter for Shellshock: `http.user_agent contains "() {"`.
3. Verify that the packet timestamp, source IP (`10.10.10.10`), and HTTP headers match the Snort alert log precisely.
4. Record your findings in your Analyst Journal!

---

## 💼 Business Corner: Retrospective Threat Hunting
In 2021, the catastrophic **Log4Shell (CVE-2021-44228)** vulnerability was disclosed in the Apache Log4j library. It allowed unauthenticated Remote Code Execution simply by passing `${jndi:ldap://...}` inside any HTTP header or form field.

Organizations that practiced **Retrospective Threat Hunting**:
1. Released Snort/Suricata rules for `${jndi:` within hours of disclosure.
2. Pulled their 30-day historical edge PCAP archives from cold storage.
3. Automated offline Snort batch processing across all historical PCAP files.
4. Identified servers that had received the exploit string **weeks before the vulnerability was publicly announced**, allowing security teams to remediate backdoored systems before ransomware was deployed.

---

## 🧠 Knowledge Check
1. What command line flag instructs Snort to process a pre-recorded PCAP file offline?
2. What is the business value of performing retrospective threat hunting against archived network captures?
3. In rule SID 1000010, why did we specify `http_header` instead of searching the whole packet?
4. How does combining Snort with Wireshark improve an analyst's confidence in incident reporting?

<details><summary>Answers</summary>

1. `-r <filename.pcap>`.
2. It allows an organization to discover if they were compromised by newly disclosed zero-day vulnerabilities in the past, before public signatures were available.
3. Shellshock payloads typically arrive inside HTTP request headers (like `User-Agent` or `Cookie`). Restricting the search to `http_header` drastically improves inspection speed and eliminates false positives in other packet areas.
4. Snort provides rapid automated signature matching across millions of packets; Wireshark allows the analyst to deeply verify the complete context and payload, proving whether the attack succeeded or failed.
</details>

---
⬅️ [03 Writing Snort Rules](03-writing-snort-rules.md) | ➡️ [Module 07 Cheat Sheet](cheatsheet.md) | ➡️ [Module 08](../08-Attack-Defense-Analysis/01-arp-spoofing-mitm.md)
