# 05.04: The Nmap Scripting Engine (NSE)

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Master the **Nmap Scripting Engine (NSE)** architecture and Lua script execution
- Navigate the 14 script categories (`default`, `vuln`, `auth`, `safe`, `discovery`...)
- Audit real-world vulnerabilities (EternalBlue MS17-010, vsftpd backdoor, SSL/TLS ciphers)
- Inspect NSE application-layer payloads on the wire in Wireshark
- Pass arguments to scripts via `--script-args`

---

## 1. What is the NSE?

Nmap is not just a port scanner; it is a full-featured vulnerability assessment and network automation engine. 

The **Nmap Scripting Engine (NSE)** embeds an ultra-fast Lua interpreter. It ships with over **600 scripts** stored in `/usr/share/nmap/scripts/`.

### What NSE Scripts Can Do:
1. **Network Discovery:** Enumerate Active Directory shares, NFS exports, and SNMP communities.
2. **Vulnerability Detection:** Check if a server is vulnerable to critical CVEs without crashing it.
3. **Exploitation & Backdoor Verification:** Verify if known remote code execution bugs are exploitable.
4. **Authentication Auditing:** Test for default credentials (`admin/admin`, anonymous FTP, blank sa passwords).

---

## 2. Script Categories

Scripts belong to one or more functional categories:

| Category | Description | Safe for Production? |
|---|---|---|
| **`default`** | Fast, high-value, safe scripts executed via `-sC` or `-A`. | ✅ Yes |
| **`safe`** | Designed not to crash services or consume excessive bandwidth. | ✅ Yes |
| **`discovery`**| Queries registries, SNMP, DNS, and directories for network layout. | ✅ Yes |
| **`vuln`** | Scans for specific known CVEs (e.g. Heartbleed, EternalBlue). | ⚠️ Usually safe |
| **`auth`** | Audits authentication mechanisms (e.g. anonymous access). | ⚠️ May trigger account lockouts! |
| **`intrusive`**| High risk of crashing unstable systems or triggering IDS alerts. | ❌ Avoid without permission |
| **`dos`** | Tests for Denial of Service vulnerabilities (may crash target). | ❌ Lab / Maintenance only |
| **`exploit`** | Actively attempts to exploit a vulnerability. | ❌ Only on authorized targets |
| **`malware`** | Tests for known botnets, backdoors, and rootkits. | ✅ Yes |

---

## 3. NSE Execution Syntax

```bash
# 1. Run default scripts (equivalent to -sC):
sudo nmap -sC 10.10.10.20

# 2. Run all vulnerability detection scripts:
sudo nmap --script vuln 10.10.10.30

# 3. Run a specific script by name:
sudo nmap --script ftp-anon -p 21 10.10.10.30

# 4. Run scripts using wildcards (e.g. all SMB vulnerability scripts):
sudo nmap --script "smb-vuln-*" -p 445 10.10.10.30

# 5. Pass custom arguments to scripts:
sudo nmap --script http-form-brute --script-args "http-form-brute.path=/login.html" 10.10.10.20

# 6. View built-in documentation for a script:
nmap --script-help ssl-enum-ciphers
```

---

## 4. Top NSE Scripts for Security Auditing

| Script Name | Purpose | Target Service |
|---|---|---|
| **`ssl-enum-ciphers`** | Audits TLS ciphers, grades server security (A through F), highlights deprecated SSLv3 / RC4. | Port 443 |
| **`http-enum`** | Enumerates web directories, backup files, and administrative portals. | Port 80 / 8080 |
| **`smb-vuln-ms17-010`** | Checks for the EternalBlue vulnerability (WannaCry exploit). | Port 445 |
| **`ftp-vsftpd-backdoor`** | Detects the infamous `:)` smiley backdoor in vsftpd 2.3.4. | Port 21 |
| **`dns-zone-transfer`** | Attempts full AXFR zone transfer against DNS nameservers. | Port 53 |
| **`nfs-showmount`** | Discovers open NFS network storage shares. | Port 2049 |

---

## 5. 🎯 Mission: Audit Metasploitable2 with NSE

### Step 1: Detect Anonymous FTP & Backdoor
1. On Kali, start Wireshark on `eth0`, filter: `tcp.port == 21`.
2. Run FTP audit scripts against Metasploitable2:
   ```bash
   sudo nmap --script ftp-anon,ftp-vsftpd-backdoor -p 21 10.10.10.30
   ```
3. Look at terminal output:
   - Does `ftp-anon` report `Anonymous FTP login allowed`?
   - Does `ftp-vsftpd-backdoor` report `VULNERABLE: vsFTPd version 2.3.4 backdoor`?
4. In Wireshark:
   - Notice how Nmap sent `USER msfadmin:)` and `PASS ...` across the wire to test the backdoor signature!

### Step 2: Audit TLS Ciphers on Ubuntu Server
1. In terminal, run:
   ```bash
   sudo nmap --script ssl-enum-ciphers -p 443 10.10.10.20
   ```
2. Inspect the output:
   - Nmap lists every supported cipher suite (e.g. `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`).
   - Notice Nmap assigns a cryptographic grade (e.g., `Grade: A`).

---

## 💼 Business Corner: Compliance Auditing without Commercial Costs
Commercial vulnerability scanners like Tenable Nessus, Rapid7 InsightVM, and Qualys cost enterprises between **€15,000 and €100,000+ annually**.

While large enterprises utilize commercial scanners for dashboarding and reporting, skilled security engineers use Nmap NSE for rapid, targeted audits:
- **Pre-deployment Verification:** DevOps teams integrate Nmap NSE into GitLab CI / GitHub Actions pipelines. If a newly built Docker container exposes unpatched vulnerabilities or weak TLS ciphers, the CI build automatically fails before deploying to production!
- **Third-Party Risk Assessment:** Verifying vendor security claims without purchasing expensive external licenses.

---

## 🧠 Knowledge Check
1. What programming language powers the Nmap Scripting Engine?
2. Which flag is a shortcut to execute all `default` category scripts?
3. What is the risk of running the `dos` or `exploit` script categories in a production network?
4. How do you pass custom usernames and passwords to an NSE script?

<details><summary>Answers</summary>

1. Lua.
2. `-sC`.
3. They are intrusive and may crash critical production servers, databases, or network switches, causing costly outages.
4. Using the `--script-args` flag (e.g., `--script-args user=admin,pass=secret`).
</details>

---
⬅️ [03 Service & OS Detection](03-service-and-os-detection.md) | ➡️ [05 Timing, Evasion & Output](05-timing-evasion-output.md)
