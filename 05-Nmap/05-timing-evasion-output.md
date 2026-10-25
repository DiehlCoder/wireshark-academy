# 05.05: Timing Templates, Firewall Evasion & Output Formats

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 100

## 🎯 Learning Objectives
- Master Nmap's timing templates (`-T0` Paranoid to `-T5` Insane) and rate-tuning controls
- Analyze IDS and firewall evasion techniques: **Decoys (`-D`)**, **Source Port Spoofing (`-g`)**, and **Fragmentation (`-f`)**
- Observe evasion techniques on the wire in Wireshark
- Generate professional audit outputs (`-oA`) and compile HTML executive reports

---

## 1. Nmap Timing Templates (`-T0` to `-T5`)

Nmap dynamically adjusts probe timing based on network responsiveness. The `-T` flag sets preset timing templates:

| Template | Name | Delay between probes | Real-World Use Case |
|---|---|---|---|
| **`-T0`** | **Paranoid** | 5 minutes | Evading legacy threshold-based Intrusion Detection Systems (IDS). |
| **`-T1`** | **Sneaky** | 15 seconds | IDS evasion on sensitive networks. |
| **`-T2`** | **Polite** | 0.4 seconds | Minimizes bandwidth; prevents crashing fragile IoT / SCADA hardware. |
| **`-T3`** | **Normal** | Dynamic (default) | Balanced standard scan. |
| **`-T4`** | **Aggressive** | Dynamic (fast) | **Standard for modern pentesting on LANs and cloud networks.** |
| **`-T5`** | **Insane** | Extremely fast | Sacrifices accuracy; drops packets on slow links. |

### Fine-Grained Timing Controls:
```bash
# Force scanning at a constant rate of 1,000 packets per second:
sudo nmap --min-rate 1000 -p- 10.10.10.30

# Cap maximum retries to 1 for rapid sweeps:
sudo nmap --max-retries 1 10.10.10.0/24
```

---

## 2. Firewall & IDS Evasion Techniques

When firewalls block or log scans, security analysts use evasion techniques to test firewall resilience:

### 2.1 Decoy Scanning (`-D`)
Nmap generates identical scan probes from **spoofed decoy IP addresses** interspersed with your real IP address:

```bash
sudo nmap -D 10.10.10.99,10.10.10.105,ME -sS -p 80 10.10.10.20
```
- The target system's firewall and IDS log connections arriving simultaneously from `10.10.10.99`, `10.10.10.105`, and your real IP (`ME`).
- **Analyst outcome:** The SOC analyst cannot easily determine which IP is the real attacker and which are innocent decoys without investigating where the replies were routed!

### 2.2 Source Port Manipulation (`-g` / `--source-port`)
Stateless or legacy firewalls are often configured with overly permissive rules allowing incoming traffic from well-known ports (like DNS port 53 or NTP port 123) under the assumption that it is incoming server replies:

```bash
# Force Nmap to send all scan probes from source port 53:
sudo nmap -g 53 -sS -p 80,443 10.10.10.20
```

### 2.3 Packet Fragmentation (`-f`)
Splits the 20-byte TCP header across multiple 8-byte IP fragments (`-f`) or 16-byte fragments (`-ff`):
- Frag 1: IP header + First 8 bytes of TCP header (Source & Destination Ports).
- Frag 2: IP header + Remaining TCP flags and sequence numbers.
- **Why this evaded old firewalls:** Simple packet filters that only inspected the first packet could not evaluate the TCP flags because the flags were located in the second fragment! Modern stateful firewalls reassemble fragments before inspection.

### 2.4 Payload Padding (`--data-length`)
By default, Nmap TCP probes carry 0 bytes of payload. Firewalls easily detect empty TCP SYN packets.
```bash
sudo nmap --data-length 35 -p 80 10.10.10.20
```
Appends 35 bytes of random dummy data to every probe packet, altering the packet length signature.

---

## 3. Output Formats & Report Generation

Never run an assessment without saving your output!

| Flag | Format | Primary Use |
|---|---|---|
| **`-oN <file>`** | Normal text | Human reading in terminal |
| **`-oX <file>`** | XML | Automated parsing, Python scripts, Eyewitness, Metasploit |
| **`-oG <file>`** | Grepable | Parsing with `grep`, `awk`, and `cut` |
| **`-oA <name>`** | **All 3 Formats!** | Saves `.nmap`, `.xml`, and `.gnmap` simultaneously (Best Practice!) |

### Converting XML to Executive HTML Reports:
```bash
# Convert Nmap XML to clean interactive HTML report
xsltproc scan_results.xml -o audit_report.html
```

---

## 4. 🎯 Mission: Evasion in Action

### Step 1: Run a Decoy Scan and Verify in Wireshark
1. On Kali, start Wireshark on `eth0`, filter: `tcp.dstport == 80`.
2. Run a decoy scan against Ubuntu Server:
   ```bash
   sudo nmap -D 10.10.10.77,10.10.10.88,ME -sS -p 80 10.10.10.20
   ```
3. In Wireshark:
   - Notice the three consecutive SYN packets arriving at port 80 from `10.10.10.77`, `10.10.10.88`, and `10.10.10.10`!
   - Observe how Ubuntu Server sends `SYN/ACK` replies to all three IPs!

### Step 2: Source Port 53 Verification
1. Change Wireshark filter to: `tcp.srcport == 53`.
2. Run:
   ```bash
   sudo nmap -g 53 -sS -p 80 10.10.10.20
   ```
3. In Wireshark:
   - Inspect the outbound SYN packet: verify `Source Port: 53 (domain)` and `Destination Port: 80 (http)`.

### Step 3: Generate All Formats & HTML Report
```bash
sudo nmap -A -p 21,22,80 -oA ~/packet-ninja/reports/lab_audit 10.10.10.20
xsltproc ~/packet-ninja/reports/lab_audit.xml -o ~/packet-ninja/reports/lab_audit.html
ls -la ~/packet-ninja/reports/
```

---

## 💼 Business Corner: Rules of Engagement (RoE) & Safety
In commercial penetration testing contracts:
1. **Timing matters:** Running `-T5` against a customer's production firewall can exhaust state tables, causing an accidental denial-of-service (DoS) outage during business peak hours.
2. **Decoy scanning risks:** If you use `-D` with random external IP addresses (e.g. Google's or government IPs) against a customer's firewall, the customer's security team might contact law enforcement reporting that an attack originated from those third-party organizations!
3. **Always document scope:** The final `-oA` files serve as legally defensible proof of testing boundaries and exact timestamps.

---

## 🧠 Knowledge Check
1. Which Nmap timing template is the recommended default for responsive local area networks?
2. How does a Decoy scan (`-D`) confuse a defensive analyst reviewing firewall logs?
3. What is the security rationale behind manipulating the source port to 53 (`-g 53`)?
4. Which single command-line option exports Nmap results in Normal, XML, and Grepable formats simultaneously?

<details><summary>Answers</summary>

1. `-T4` (Aggressive).
2. It sends probe packets with spoofed source IPs intermingled with the tester's real IP, making it appear that multiple machines are scanning simultaneously.
3. To bypass legacy or poorly configured firewall rules that blindly allow inbound traffic from trusted ports (like DNS port 53).
4. `-oA <prefix>`.
</details>

---
⬅️ [04 NSE Scripting](04-nse-scripting.md) | ➡️ [Module 05 Cheat Sheet](cheatsheet.md) | ➡️ [Module 06](../06-Netcat/01-netcat-basics.md)
