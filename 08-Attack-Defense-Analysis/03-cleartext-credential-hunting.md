# 08.03: Cleartext Credential Hunting & Packet Forensics

**Level:** 🔴 Advanced | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Master the Wireshark display filter cookbook for hunting plaintext credentials
- Decode HTTP Basic Authentication (`http.authorization`) Base64 strings automatically
- Harvest credentials from FTP, Telnet, HTTP POST, SMTP, and SNMP traffic
- Automate network credential extraction using TShark one-liners
- Justify the business mandate for end-to-end transport encryption under PCI DSS

---

## 1. Why Cleartext Credentials Still Exist

Despite decades of encryption advocacy, security analysts constantly find unencrypted authentication credentials in enterprise captures:
- Internal developer and testing environments ("We only use HTTPS in production").
- Embedded network devices, IP security cameras, printers, and smart PDUs.
- Legacy industrial SCADA / ICS controllers on manufacturing floors.
- Misconfigured microservices communicating over plaintext HTTP within cloud Kubernetes clusters.

If an attacker establishes an internal foothold or poisons ARP on a subnet, any cleartext authentication is instantly compromised.

---

## 2. The Credential Hunter's Display Filter Cookbook

| Protocol | Filter Expression | What It Extracts |
|---|---|---|
| **HTTP Basic Auth** | `http.authorization` | Base64-encoded `user:password` headers |
| **HTTP Web Forms** | `http.request.method == "POST" && (http contains "password" \|\| http contains "passwd")` | Form-encoded passwords in request bodies |
| **FTP** | `ftp.request.command in {"USER", "PASS"}` | Plaintext FTP username and password |
| **Telnet** | `telnet` | Interactive terminal keystrokes (use *Follow TCP Stream*) |
| **POP3 / IMAP** | `pop.request.command == "PASS" \|\| imap.request contains "LOGIN"` | Email account credentials |
| **SMTP Auth** | `smtp.req.command == "AUTH"` | Mail server login attempts |
| **SNMP v1/v2c** | `snmp.community` | Network equipment management community strings |
| **Database** | `mysql.user` | Unencrypted MySQL database authentications |

---

## 3. Dissecting HTTP Basic Authentication

HTTP Basic Authentication transmits credentials in the `Authorization` request header:
```http
Authorization: Basic YWRtaW46U3VwZXJTZWNyZXQxMjM=
```

> ⚠️ **The Base64 Myth:** Base64 is **encoding**, NOT encryption! Base64 provides zero confidentiality and can be decoded by any machine in nanoseconds.

In Wireshark:
1. When you select a packet containing `http.authorization`, expand `Hypertext Transfer Protocol` in the details pane.
2. Locate `Authorization: Basic ...`
3. Expand `Credentials:` ➔ **Wireshark automatically decodes the Base64 string** and displays the cleartext username and password directly!

---

## 4. 🎯 Mission: The Credential Harvest Drill

We will generate multiple unencrypted authentication sessions from Kali to the lab targets, capture the traffic in Wireshark, and extract all credentials!

### Step 1: Start Live Capture
On **Kali**, start Wireshark on `eth0`, filter: `http || ftp`.

### Step 2: Generate Authentication Traffic
In Kali terminal, execute these three authentication events:

```bash
# Event 1: HTTP Basic Authentication Header
curl -v -u "cfo_robert:GoldVault2026!" http://10.10.10.20/

# Event 2: HTTP Form POST Submission
curl -X POST http://10.10.10.20/login.html \
  -d "username=admin_sarah&password=UnbreakablePass456!"

# Event 3: FTP Authentication on Metasploitable2
printf "USER database_backup\r\nPASS SecretDBPass789!\r\nQUIT\r\n" | nc -vn 10.10.10.30 21
```

### Step 3: Harvest in Wireshark
1. Stop capture in Wireshark.
2. **Harvest HTTP Basic Auth:**
   - Filter: `http.authorization`.
   - Expand `Hypertext Transfer Protocol` ➔ `Credentials`.
   - Record the extracted username and password in your journal.
3. **Harvest Web Form POST:**
   - Filter: `http.request.method == "POST"`.
   - Expand `HTML Form URL Encoded` at the bottom of the details pane.
   - Read the exact fields `username` and `password`.
4. **Harvest FTP Credentials:**
   - Filter: `ftp.request.command in {"USER", "PASS"}`.
   - Look at the `Info` column: verify both `USER database_backup` and `PASS SecretDBPass789!` are visible.

---

## 5. Automated TShark Credential Harvester

You can extract cleartext credentials directly from any PCAP file from the terminal without opening the GUI:

```bash
# Extract all HTTP Basic Auth strings and decode from Base64:
tshark -r ~/packet-ninja/captures/02-first.pcapng \
  -Y "http.authorization" \
  -T fields -e http.authorization \
  | awk '{print $2}' | base64 -d 2>/dev/null; echo ""

# Extract all FTP credentials to clean log:
tshark -r ~/packet-ninja/captures/02-first.pcapng \
  -Y 'ftp.request.command in {"USER","PASS"}' \
  -T fields -e ip.src -e ftp.request.command -e ftp.request.arg
```

---

## 💼 Business Corner: Regulatory Mandates (PCI DSS & GDPR)
Under **PCI DSS (Payment Card Industry Data Security Standard) Requirement 8.3**:
> *"All authentication credentials (passwords, tokens, keys) must be rendered unreadable during transmission using strong cryptography (TLS 1.2+ with approved ciphers)."*

If a security auditor captures a single unencrypted password traversing an internal corporate network:
- The organization automatically **fails its annual PCI DSS audit**.
- The business may be fined between **€5,000 and €100,000 per month** by payment card brands (Visa, Mastercard) until remediation is verified.
- The company risks having its credit card processing privileges revoked entirely, shutting down e-commerce operations.

---

## 🧠 Knowledge Check
1. Why is HTTP Basic Authentication considered insecure when transmitted over standard HTTP?
2. What display filter isolates HTTP POST form submissions containing the string "password"?
3. Is Base64 an encryption algorithm? Explain why.
4. How do you extract and decode HTTP Authorization headers from a PCAP using TShark?

<details><summary>Answers</summary>

1. It encodes credentials using Base64 without encryption; any network sniffer or proxy between the client and server can trivially decode the username and password.
2. `http.request.method == "POST" && http contains "password"`.
3. No. Base64 is a binary-to-text encoding scheme. It requires no secret key to decode and provides zero confidentiality.
4. `tshark -r file.pcap -Y "http.authorization" -T fields -e http.authorization | awk '{print $2}' | base64 -d`.
</details>

---
⬅️ [02 Detecting Scans & DoS](02-detecting-scans-floods-dos.md) | ➡️ [04 Malware & C2 Traffic Analysis](04-malware-c2-traffic-analysis.md)
