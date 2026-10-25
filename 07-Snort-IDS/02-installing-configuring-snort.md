# 07.02: Installing & Configuring Snort

**Level:** 🔴 Advanced | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Install Snort on Ubuntu Server and configure network interfaces for packet inspection
- Disable hardware NIC offloading (`ethtool`) to prevent packet dissection errors
- Master the Snort directory structure and configuration hierarchy
- Define critical network variables: `HOME_NET` and `EXTERNAL_NET`
- Test configuration syntax with `-T` and run Snort in Sniffer, Logger, and NIDS modes

---

## 1. Preparing the Network Interface (Disabling Offloads)

Modern Network Interface Cards (NICs) perform **Hardware Offloading** (TSO, GSO, GRO) to combine small packets into 64 KB super-packets in hardware before passing them to the kernel.

> ⚠️ **The IDS Problem:** Hardware offloading corrupts packet reassembly and causes Snort to drop or miscalculate TCP checksums! Before running an IDS, hardware offloading **must be disabled**.

On **ubuntu-srv**:
```bash
# Check current offload status
sudo ethtool -k enp0s3 | grep -E "segmentation|receive-offload|checksumming"

# Disable all offloads for packet inspection accuracy:
sudo ethtool -K enp0s3 rx off tx off tso off gso off gro off

# Ensure promiscuous mode is enabled:
sudo ip link set enp0s3 promisc on
```

---

## 2. Installing Snort

On **ubuntu-srv**:
```bash
sudo apt update
sudo apt install -y snort
```
*(During installation, the prompt asks for the local network range: enter `10.10.10.0/24`).*

Check version:
```bash
snort -V
```

---

## 3. Directory Structure & Key Files

| Path | Purpose |
|---|---|
| `/etc/snort/snort.conf` | The primary master configuration file. |
| `/etc/snort/rules/` | Directory containing rule files (`community.rules`, `web-attacks.rules`...). |
| `/etc/snort/rules/local.rules`| **Your custom rules file!** This is where you write your own detection signatures. |
| `/var/log/snort/` | Default directory where alert logs and PCAP captures are stored. |

---

## 4. Configuring Network Variables (`HOME_NET`)

Open `/etc/snort/snort.conf` in your editor:
```bash
sudo nano /etc/snort/snort.conf
```

Find **Step #1: Set the network variables**:
```conf
# Change:
# ipvar HOME_NET any
# To your actual lab subnet:
ipvar HOME_NET 10.10.10.0/24

# Set EXTERNAL_NET to anything NOT in HOME_NET:
ipvar EXTERNAL_NET !$HOME_NET
```

> 💡 **Why `HOME_NET` is crucial:** If you leave `HOME_NET any`, rules designed to detect *"outbound data leakage from $HOME_NET to $EXTERNAL_NET"* will inspect every packet in both directions, doubling CPU usage and generating false alarms!

---

## 5. The Three Operating Modes of Snort

### 5.1 Sniffer Mode
Reads packets off the wire and prints them to the terminal:
```bash
sudo snort -v -i enp0s3        # Print IP/TCP headers
sudo snort -vd -i enp0s3       # Print headers + packet payload
```

### 5.2 Packet Logger Mode
Logs all passing traffic to disk in standard PCAP format:
```bash
sudo snort -dev -l /var/log/snort -i enp0s3
```

### 5.3 NIDS Mode (Intrusion Detection System)
Analyzes traffic in real-time against loaded rules and generates alerts:
```bash
sudo snort -A console -c /etc/snort/snort.conf -i enp0s3
```
- `-A console`: Prints alerts in real-time directly to the terminal.
- `-c <file>`: Specifies the configuration file.
- `-i <interface>`: Specifies which network interface to monitor.

---

## 6. Testing Configuration Syntax (`-T`)

Before deploying changes, always validate syntax:
```bash
sudo snort -T -c /etc/snort/snort.conf -i enp0s3
```

If everything is configured correctly, Snort prints:
```
Snort successfully validated the configuration!
Snort exiting
```

---

## 7. 🎯 Mission: Configure and Test Your Sensor

1. On **ubuntu-srv**, disable offloads on `enp0s3` as shown in Section 1.
2. Edit `/etc/snort/snort.conf` and set `HOME_NET 10.10.10.0/24`.
3. Verify syntax with `sudo snort -T -c /etc/snort/snort.conf -i enp0s3`.
4. Run Snort in sniffer mode:
   ```bash
   sudo snort -vd -i enp0s3
   ```
5. From **Kali**, send a ping and an HTTP request:
   ```bash
   ping -c 2 10.10.10.20
   curl http://10.10.10.20/login.html
   ```
6. Verify in Ubuntu terminal that Snort captures and prints the packet payload in ASCII and hex. Press `Ctrl + C` to stop.

---

## 💼 Business Corner: Enterprise Sensor Placement
Where should an organization deploy NIDS sensors?

```
      Internet
         │
    [ Firewall ]
         │
   ══════╪══════ DMZ Network ══════════════ [ Sensor 1: Monitors public web/mail servers ]
         │
    [ Firewall ]
         │
   ══════╪══════ Internal Corporate LAN ══ [ Sensor 2: Monitors employee endpoints ]
         │
   ══════╪══════ Server / DB VLAN ═════════ [ Sensor 3: Monitors PCI DSS / crown jewels ]
```

1. **Inside the Firewall (Not outside!):** Placing an IDS on the public internet floods the sensor with millions of automated bots and port scans that the firewall would block anyway. Place sensors **behind** perimeter firewalls to inspect traffic that actually penetrated defenses.
2. **Core Switch SPAN Port:** Mirrors internal East-West traffic between VLANs to catch lateral movement and ransomware propagation inside the corporate network.

---

## 🧠 Knowledge Check
1. Why must network interface hardware offloading (TSO/GRO) be disabled when running Snort?
2. What is the operational danger of defining `ipvar HOME_NET any` in an enterprise network?
3. Which flag instructs Snort to validate its configuration file syntax without capturing live traffic?
4. What is the difference between Snort's Packet Logger mode and NIDS mode?

<details><summary>Answers</summary>

1. Hardware offloading creates artificially large packets (up to 64 KB) in the NIC hardware, corrupting packet stream reassembly and triggering false TCP checksum errors in Snort.
2. It breaks directional rules (e.g. `$HOME_NET -> $EXTERNAL_NET`), causing severe alert degradation, false positives, and increased CPU usage.
3. `-T` (e.g. `snort -T -c /etc/snort/snort.conf`).
4. Packet Logger mode blindly records all packets to disk as raw PCAP files without inspection; NIDS mode evaluates packets against loaded rule signatures and generates security alerts.
</details>

---
⬅️ [01 IDS/IPS Concepts](01-ids-ips-concepts.md) | ➡️ [03 Writing Snort Rules](03-writing-snort-rules.md)
