# 00.03: Building the Lab VMs

**Level:** 🟢 Beginner | **Time:** 2–3 h | **XP:** 150

## 🎯 Learning Objectives
- Import/install Kali, Ubuntu Server, Metasploitable2 (and optionally Windows)
- Configure static IPs on Linux (nmcli, netplan, ifupdown) and Windows (netsh)
- Allow Wireshark captures as a non-root user

---

## 1. Downloads

| VM | Source | Notes |
|---|---|---|
| Kali Linux | <https://www.kali.org/get-kali/#kali-virtual-machines> → **VirtualBox** image (`.7z`) | Default login `kali` / `kali` |
| Ubuntu Server 24.04 LTS | <https://ubuntu.com/download/server> (ISO) | You create the user during install |
| Metasploitable 2 | <https://sourceforge.net/projects/metasploitable/> (`.zip` with `.vmdk`) | Login `msfadmin` / `msfadmin` |
| Windows 10/11 Enterprise Eval *(optional)* | <https://www.microsoft.com/evalcenter> | 90-day evaluation |

> ⚠️ Always verify the SHA256 checksums of downloaded images:
> ```powershell
> Get-FileHash .\kali-linux-*.7z -Algorithm SHA256
> ```

---

## 2. Kali Linux (10.10.10.10)

### 2.1 Import
1. Extract the `.7z` (with 7-Zip) and double-click the `.vbox` file. VirtualBox adds the VM.
2. Rename the VM to `kali`. Give it **4 GB RAM** and **2 CPUs**.
3. **Network:**
   - Adapter 1: *Internal Network*, Name `labnet`, Promiscuous **Allow All**
   - Adapter 2: *NAT*

### 2.2 Configure the static IP
Boot, log in, open a terminal:

```bash
# See your interfaces: eth0 = adapter 1 (labnet), eth1 = adapter 2 (NAT)
ip -br link

# Create a static connection for the lab interface
sudo nmcli con add type ethernet ifname eth0 con-name labnet \
  ipv4.method manual ipv4.addresses 10.10.10.10/24 \
  ipv4.never-default yes ipv6.method disabled
sudo nmcli con up labnet

# eth1 stays on DHCP (NAT) for internet
ip -br addr
```

Expected output (similar):
```
lo     UNKNOWN  127.0.0.1/8
eth0   UP       10.10.10.10/24
eth1   UP       10.0.3.15/24
```

### 2.3 Update and install the tools
```bash
sudo apt update && sudo apt -y full-upgrade
sudo apt -y install wireshark tshark nmap ncat netcat-traditional socat \
  tcpdump dsniff arping hping3 scapy python3-scapy curl dnsutils ftp telnet \
  smbclient whois
```

### 2.4 Capture without root (important!)
Running the Wireshark GUI as root is a security risk, because the dissectors parse untrusted input.
```bash
sudo dpkg-reconfigure wireshark-common   # choose <Yes>
sudo usermod -aG wireshark $USER
# Log out and back in (or reboot), then verify:
groups | grep wireshark
dumpcap -D                               # should list interfaces without sudo
```

### 2.5 Hosts file
```bash
sudo tee -a /etc/hosts <<'EOF'
10.10.10.10 kali kali.lab.local
10.10.10.20 ubuntu-srv srv.lab.local www.lab.local
10.10.10.30 metasploitable2 msf.lab.local
10.10.10.40 win-client win.lab.local
EOF
```

---

## 3. Ubuntu Server (10.10.10.20)

### 3.1 Create the VM
- New VM → Name `ubuntu-srv`, ISO = Ubuntu Server, Type Linux / Ubuntu 64-bit
- 2 GB RAM, 2 CPUs, 25 GB disk
- Adapter 1: Internal `labnet`, Allow All | Adapter 2: NAT
- During install: hostname `ubuntu-srv`, user e.g. `student`, ✅ **Install OpenSSH server**

### 3.2 Static IP with netplan
```bash
ip -br link        # usually enp0s3 (labnet) and enp0s8 (NAT)
sudo nano /etc/netplan/50-cloud-init.yaml   # the file name may differ: ls /etc/netplan
```
```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: false
      addresses: [10.10.10.20/24]
    enp0s8:
      dhcp4: true
```
```bash
sudo chmod 600 /etc/netplan/*.yaml
sudo netplan apply
ip -br addr
```

### 3.3 Install the lab services
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install apache2 vsftpd openssh-server dnsmasq tcpdump tshark \
  netcat-openbsd telnetd mailutils postfix
# Postfix prompt: choose "Local only", system mail name: lab.local
```

Create a simple website with a login form (used for credential-sniffing labs later):
```bash
sudo tee /var/www/html/login.html >/dev/null <<'EOF'
<!doctype html><html><head><title>Lab Intranet</title></head><body>
<h1>ACME Corp Intranet</h1>
<form method="POST" action="/login.html">
User: <input name="username"> Pass: <input type="password" name="password">
<button type="submit">Login</button></form></body></html>
EOF
# Allow POST on a static file for demo purposes (Apache returns 405 otherwise, which is fine, the creds are still on the wire!)
```

Copy the same `/etc/hosts` block from the Kali step to ubuntu-srv.

---

## 4. Metasploitable 2 (10.10.10.30)

> ⚠️ **Metasploitable2 must only ever have the Internal Network adapter. No NAT, no Bridged.**

1. Extract the zip. New VM → Name `metasploitable2`, Type Linux, Version *Ubuntu (32-bit)* or *Other Linux (32-bit)*, 512–1024 MB RAM.
2. Hard disk: **Use an existing virtual hard disk** → select `Metasploitable.vmdk`.
3. Network: Adapter 1 Internal `labnet`, Allow All. **Disable all other adapters.**
4. Boot and log in with `msfadmin` / `msfadmin`. Set the static IP:
```bash
sudo nano /etc/network/interfaces
```
```
auto eth0
iface eth0 inet static
    address 10.10.10.30
    netmask 255.255.255.0
```
```bash
sudo /etc/init.d/networking restart
ifconfig eth0
```

---

## 5. Windows Client (10.10.10.40) – Optional

1. New VM from the evaluation ISO. For Windows 11: enable **EFI**, **TPM 2.0** and Secure Boot (VirtualBox 7 supports these). Use 4 GB RAM, 2 CPUs, 50 GB disk.
2. Adapter 1: Internal `labnet`, Allow All. Add NAT temporarily if you need updates.
3. In an **admin** PowerShell:
```powershell
Get-NetAdapter
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.10.10.40 -PrefixLength 24
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 10.10.10.20
# Allow ping (ICMP echo) for lab exercises
New-NetFirewallRule -DisplayName "Lab ICMPv4" -Protocol ICMPv4 -IcmpType 8 -Direction Inbound -Action Allow
# Set the network profile to Private (enables file sharing/discovery)
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
```

---

## 🏆 Challenge (+25 XP)
Automate the Kali network config: write a bash script `lab-net.sh up|down` that brings the NAT interface (`eth1`) down for attack labs and up again for updates.

<details><summary>Possible solution</summary>

```bash
#!/usr/bin/env bash
case "$1" in
  up)   sudo ip link set eth1 up && sudo dhclient eth1 2>/dev/null || sudo nmcli dev connect eth1 ;;
  down) sudo nmcli dev disconnect eth1 ;;
  *)    echo "usage: $0 up|down"; exit 1 ;;
esac
ip -br addr
```
</details>

---
⬅️ [02 VirtualBox & Networking](02-virtualbox-and-networking.md) | ➡️ [04 Verification & Snapshots](04-verification-and-snapshots.md)
