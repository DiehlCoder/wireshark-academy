# 📋 Module 07 Cheat Sheet: Snort IDS & Detection Engineering

## ⚡ Core Snort Commands
```bash
# Validate configuration file syntax
sudo snort -T -c /etc/snort/snort.conf -i enp0s3

# Run NIDS live with real-time console alerts
sudo snort -A console -c /etc/snort/snort.conf -i enp0s3

# Process an offline PCAP file
sudo snort -r capture.pcap -c /etc/snort/snort.conf -A console -q

# Sniffer mode (print packet headers + payload)
sudo snort -vd -i enp0s3

# Packet logger mode (record traffic to PCAP directory)
sudo snort -dev -l /var/log/snort -i enp0s3
```

---

## 🛠️ Network Interface Preparation (Crucial!)
```bash
# Disable hardware offloading (prevents corrupted packet inspection)
sudo ethtool -K enp0s3 rx off tx off tso off gso off gro off

# Enable promiscuous mode
sudo ip link set enp0s3 promisc on
```

---

## 📜 Snort Rule Syntax Anatomy
```
[action] [protocol] [src_ip] [src_port] [direction] [dst_ip] [dst_port] ( [options] )
```

### Rule Header Reference:
- **Actions:** `alert`, `log`, `pass`, `drop` *(IPS)*, `reject` *(IPS)*
- **Protocols:** `tcp`, `udp`, `icmp`, `ip`
- **Direction:** `->` (Unidirectional), `<>` (Bidirectional)
- **Variables:** `$HOME_NET`, `$EXTERNAL_NET`, `any`

### SID Allocation Standard:
- `1` – `999,999`: Reserved for official Cisco Talos / Snort community rules.
- **`>= 1,000,000`**: **Custom user-defined rules (`local.rules`)**.

---

## 🔍 Key Rule Options & Modifiers
| Option | Syntax Example | Meaning |
|---|---|---|
| **Message** | `msg:"ATTACK Detected";` | Alert title displayed to analysts |
| **SID & Rev** | `sid:1000001; rev:1;` | Unique ID and revision number |
| **Flow** | `flow:to_server,established;` | Inspect only established sessions |
| **Content** | `content:"/admin.php";` | Pattern match (ASCII or `\|0d 0a\|`) |
| **Case Insensitive** | `nocase;` | Ignores capitalization for preceding content |
| **HTTP Buffer** | `http_uri;` / `http_header;` | Search normalized protocol buffers |
| **POST Data** | `http_client_body;` | Search payload of web POST submissions |
| **Regex** | `pcre:"/admin[0-9]+/i";` | Perl-Compatible Regular Expression |
| **Rate Limit** | `detection_filter: track by_src, count 20, seconds 5;` | Throttling / Brute-force trigger |
| **TCP Flags** | `flags:S,12;` | Match TCP SYN-only packets |
| **ICMP Type** | `itype:8; icode:0;` | Match ICMP Echo Request |

---

## 🛡️ Production Detection Rule Templates

```conf
# 1. Detect Inbound TCP Port Scan
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Inbound TCP Port Scan"; flags:S,12; detection_filter: track by_src, count 20, seconds 5; sid:1000001; rev:1;)

# 2. Detect SQL Injection (UNION SELECT)
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK SQL Injection Attempt"; flow:to_server,established; content:"UNION"; nocase; http_uri; content:"SELECT"; nocase; http_uri; sid:1000002; rev:1;)

# 3. Detect Directory Traversal (../)
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK Directory Traversal (../)"; flow:to_server,established; http_uri; content:".."; sid:1000003; rev:1;)

# 4. Detect Shellshock RCE (CVE-2014-6271)
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"EXPLOIT GNU Bash Shellshock Attempt"; flow:to_server,established; http_header; content:"() {"; sid:1000004; rev:1;)

# 5. Detect Anonymous FTP Access
alert tcp $EXTERNAL_NET any -> $HOME_NET 21 (msg:"AUTH Anonymous FTP Login Attempt"; flow:to_server,established; content:"USER anonymous"; nocase; sid:1000005; rev:1;)
```
