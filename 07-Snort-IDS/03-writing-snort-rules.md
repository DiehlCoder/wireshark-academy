# 07.03: Writing Custom Snort Rules: Detection Engineering

**Level:** 🔴 Advanced | **Time:** 2.5 h | **XP:** 200

## 🎯 Learning Objectives
- Master the dual-structure of Snort rules: **Rule Header** and **Rule Options**
- Assign unique **SID (Snort IDs)** and revision numbers following industry conventions
- Write exact payload pattern matches using `content`, `nocase`, `offset`, and `depth`
- Utilize protocol-specific buffers (`http_uri`, `http_header`, `http_method`)
- Implement rate-limiting and brute-force detection using `detection_filter`
- Test and tune custom rules to eliminate False Positives

---

## 1. Anatomy of a Snort Rule

Every Snort rule is composed of two distinct parts:
```
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK SQL Injection Attempt"; content:"UNION"; nocase; http_uri; sid:1000001; rev:1;)
└───┬─────────────────────────────────────┘ └────────────────────────────────────────────────────────────────────────────────────────┘
    │                                                                   │
 [RULE HEADER]                                                    [RULE OPTIONS]
```

---

## 2. The Rule Header

Defines the action, protocol, and network endpoints:

```
[action] [protocol] [src_ip] [src_port] [direction] [dst_ip] [dst_port]
```

### 2.1 Actions
- **`alert`**: Generate an alert using the configured output method (console, syslog) and log the packet.
- **`log`**: Log the packet to disk without alerting.
- **`drop`** *(IPS mode only)*: Drop the packet immediately.
- **`reject`** *(IPS mode only)*: Drop the packet and send a TCP RST (or ICMP Unreachable for UDP).
- **`pass`**: Ignore this packet (whitelist rule).

### 2.2 Protocols
`tcp`, `udp`, `icmp`, `ip`.

### 2.3 Addresses & Ports
- IP addresses: `10.10.10.10`, CIDR `10.10.10.0/24`, or lists `[10.10.10.10,10.10.10.20]`.
- Negation: `!10.10.10.1` (Anything EXCEPT 10.10.10.1).
- Variables: `$HOME_NET`, `$EXTERNAL_NET`, `any`.
- Port ranges: `1:1024` (ports 1 to 1024), `:1024` (ports $\le 1024$), `1025:` (ports $\ge 1025$).
- Direction: `->` (Unidirectional) or `<>` (Bidirectional).

---

## 3. The Rule Options

Enclosed in parentheses `( )`, separated by semicolons.

### 3.1 Metadata & Identification
- **`msg:"<text>";`**: The alert description displayed to analysts.
- **`sid:<number>;`**: **Snort ID** (Must be unique!).
  - `< 1,000,000`: Reserved for official Snort / Talos rules.
  - **`>= 1,000,000`**: **Reserved for your custom local rules!**
- **`rev:<number>;`**: Rule revision (e.g. `rev:1;`). Increment when you modify the rule.
- **`classtype:<type>;`**: Attack classification (e.g. `web-application-attack`, `attempted-admin`, `bad-traffic`).
- **`priority:<1-4>;`**: Severity (1 = High, 2 = Medium, 3 = Low, 4 = Info).

### 3.2 Payload Matching
- **`content:"<string>";`**: Case-sensitive search for an ASCII or hex string:
  - ASCII: `content:"/etc/passwd";`
  - Hex bytes: `content:"|0d 0a 0d 0a|";` (Matches CRLF CRLF)
  - Mixed: `content:"USER |3a 29|";` (Matches `USER :)`)
- **`nocase;`**: Makes the preceding `content` match case-insensitive (`Union`, `union`, `UNION`).
- **`depth:<bytes>;`**: Search only within the first N bytes of the payload.
- **`offset:<bytes>;`**: Skip N bytes before searching.
- **`distance:<bytes>;`** & **`within:<bytes>;`**: Relative modifiers (search within N bytes *after* the previous content match).
- **`pcre:"/<regex>/[flags]";`**: Perl-Compatible Regular Expression matching.

### 3.3 Protocol-Specific Modifiers
Inspects normalized protocol buffers instead of the raw packet:
- **`http_uri;`**: Searches strictly inside the decoded HTTP URL path.
- **`http_client_body;`**: Searches strictly inside POST data payloads.
- **`http_header;`**: Searches strictly inside HTTP request headers.
- **`http_method;`**: Matches the HTTP verb (`GET`, `POST`).
- **`itype:<num>;`** & **`icode:<num>;`**: Matches ICMP Type and Code numbers.
- **`flags:<flags>;`**: Matches TCP flags (e.g. `flags:S;` for SYN-only, `flags:FPU;` for Xmas).

### 3.4 Rate Limiting & Brute Force (`detection_filter`)
Triggers an alert only if an event occurs $N$ times within $M$ seconds:
```conf
detection_filter: track by_src, count 20, seconds 5;
```
*(Ideal for detecting port scans, SSH brute-forcing, and denial-of-service floods!)*

---

## 4. Four Real-World Detection Rules

Open `/etc/snort/rules/local.rules` on **ubuntu-srv**:
```bash
sudo nano /etc/snort/rules/local.rules
```

Add these four battle-tested rules:

```conf
# 1. ICMP Ping Detection
alert icmp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN ICMP Echo Request detected"; itype:8; icode:0; sid:1000001; rev:1;)

# 2. Inbound TCP Port Scan (20 SYNs within 5 seconds from same source)
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Potential TCP Port Scan Detected"; flags:S,12; detection_filter: track by_src, count 20, seconds 5; sid:1000002; rev:1;)

# 3. Web Attack: SQL Injection Attempt in URI
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"WEB-ATTACK SQL Injection UNION SELECT"; flow:to_server,established; content:"UNION"; nocase; http_uri; content:"SELECT"; nocase; http_uri; sid:1000003; rev:1;)

# 4. Sensitive Data Leak: Cleartext Password Submission
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"POLICY Cleartext Password in Web POST Data"; flow:to_server,established; http_method; content:"POST"; http_client_body; content:"password="; nocase; sid:1000004; rev:1;)
```

Save and exit.

---

## 5. 🎯 Mission: Test Your Detection Engineering

### Step 1: Validate Configuration Syntax
On **ubuntu-srv**:
```bash
sudo snort -T -c /etc/snort/snort.conf -i enp0s3
```
Ensure it returns: `Snort successfully validated the configuration!`

### Step 2: Run Snort Live
```bash
sudo snort -A console -c /etc/snort/snort.conf -i enp0s3
```

### Step 3: Trigger the Rules from Kali
Open a terminal on **Kali** and launch targeted tests:

```bash
# Test 1: Trigger Rule 1000001 (Ping)
ping -c 2 10.10.10.20

# Test 2: Trigger Rule 1000002 (Port Scan)
sudo nmap -sS -p 1-100 10.10.10.20

# Test 3: Trigger Rule 1000003 (SQL Injection)
curl -v "http://10.10.10.20/search.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users"

# Test 4: Trigger Rule 1000004 (Cleartext Password Submission)
curl -X POST http://10.10.10.20/login.html -d "user=admin&password=SuperSecretPassword"
```

### Step 4: Verify Alerts in Ubuntu Terminal
Look at your Ubuntu Server terminal:
You will see real-time alerts scrolling with the exact `msg` strings and SIDs!
```
[**] [1:1000001:1] SCAN ICMP Echo Request detected [**]
[Priority: 0] 10/16-17:20:15.123456 10.10.10.10 -> 10.10.10.20
[**] [1:1000002:1] SCAN Potential TCP Port Scan Detected [**]
[**] [1:1000003:1] WEB-ATTACK SQL Injection UNION SELECT [**]
[**] [1:1000004:1] POLICY Cleartext Password in Web POST Data [**]
```

---

## 💼 Business Corner: Detection Engineering as a Career
In modern cybersecurity organizations, **Detection Engineers** write, test, and tune detection logic:
- Writing rules directly into Git repositories (Infrastructure-as-Code).
- Using CI/CD testing pipelines: when a new rule is committed, automated tests replay historical benign and attack PCAPs against the rule.
- If the rule triggers on benign PCAPs, the pull request is rejected to **prevent False Positives**.
- Senior Detection Engineers command salaries ranging from **$120,000 to $180,000+** because well-tuned rules directly protect the company while keeping the SOC sane.

---

## 🧠 Knowledge Check
1. What range of Snort IDs (SIDs) is reserved strictly for custom local rules?
2. Why is using `http_uri` faster and more reliable than searching the entire raw packet payload with generic `content`?
3. How does the `detection_filter` option help detect brute-force attacks and port scans?
4. What does the `flow:to_server,established;` option verify before evaluating the rest of the rule options?

<details><summary>Answers</summary>

1. SIDs greater than or equal to `1,000,000`.
2. `http_uri` instructs the preprocessor to search only inside the normalized, URL-decoded path buffer, avoiding false positives in headers/cookies and improving inspection performance.
3. It sets a threshold: an alert is only generated if a specified number of matching packets occur from a source within a defined time window.
4. It ensures the rule only inspects established TCP sessions (after the 3-way handshake is completed) heading towards the server, ignoring spoofed or incomplete connection attempts.
</details>

---
⬅️ [02 Installing & Configuring Snort](02-installing-configuring-snort.md) | ➡️ [04 Detection Lab](04-detection-lab.md)
