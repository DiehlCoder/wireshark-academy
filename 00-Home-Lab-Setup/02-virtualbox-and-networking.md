# 00.02: VirtualBox Installation & Virtual Networking

**Level:** 🟢 Beginner | **Time:** 45 min | **XP:** 75

## 🎯 Learning Objectives
- Install VirtualBox and the Extension Pack
- Understand the VirtualBox network modes
- Create the lab network with GUI **and** CLI (`VBoxManage`)

---

## 1. Install VirtualBox

1. Enable **Intel VT-x / AMD-V (SVM)** in your BIOS/UEFI.
2. Download VirtualBox 7.x for Windows hosts: <https://www.virtualbox.org/wiki/Downloads>
3. Install with default options (accept the network driver warnings).
4. Download and install the **Extension Pack** of the **same version** (double-click the file).
5. Optional, recommended: add VirtualBox to your PATH so you can use `VBoxManage`:

```powershell
# PowerShell (as your normal user)
$env:Path += ";C:\Program Files\Oracle\VirtualBox"
VBoxManage --version
```

> ⚠️ **Hyper-V conflict:** If VMs are very slow or show a green turtle icon 🐢, Windows Hyper-V/WSL2/Memory Integrity is active. VirtualBox 7 can run on top of Hyper-V, but it is slower. For best performance: *Windows Features → disable "Hyper-V" and "Virtual Machine Platform"* (this breaks WSL2/Docker Desktop, so decide what you need).

---

## 2. VirtualBox Network Modes Explained

| Mode | VM ↔ VM | VM ↔ Host | VM → Internet | Visible on your LAN | Use in this course |
|---|---|---|---|---|---|
| **NAT** | ❌ | ❌ (port fwd only) | ✅ | ❌ | Updates (adapter 2) |
| **NAT Network** | ✅ | ❌ | ✅ | ❌ | Alternative lab network |
| **Bridged** | ✅ | ✅ | ✅ | ✅ ⚠️ | **Avoid** for attacks |
| **Internal Network** | ✅ | ❌ | ❌ | ❌ | ✅ **Main lab network** |
| **Host-only** | ✅ | ✅ | ❌ | ❌ | Optional: sniff from host Wireshark |
| **Not attached** | — | — | — | — | Simulate a cable unplug |

### Analogy
- **NAT** = each VM sits behind its own little home router
- **Internal Network** = a switch in a locked room with no uplink
- **Bridged** = the VM is plugged directly into your home router

---

## 3. Promiscuous Mode Settings

For each adapter on the Internal Network, *Settings → Network → Adapter 1 → Advanced → Promiscuous Mode*:

| Option | Effect |
|---|---|
| Deny | NIC only sees its own traffic + broadcasts |
| Allow VMs | NIC sees traffic of other VMs on the same internal network |
| **Allow All** | NIC sees everything (use this) |

---

## 4. 🎯 Mission: Prepare the Network via CLI

Internal networks are created automatically when the first VM is attached to the name `labnet`. You will attach VMs in the next worksheet. Here is the CLI version so you understand what the GUI does:

```powershell
# Attach adapter 1 of a VM to internal network "labnet" with promiscuous allow-all
VBoxManage modifyvm "kali" --nic1 intnet --intnet1 "labnet" --nicpromisc1 allow-all

# Adapter 2 = NAT for internet
VBoxManage modifyvm "kali" --nic2 nat

# Show the network config of a VM
VBoxManage showvminfo "kali" | Select-String "NIC"

# Temporarily "unplug" NAT during attack labs
VBoxManage controlvm "kali" setlinkstate2 off
VBoxManage controlvm "kali" setlinkstate2 on
```

> 💡 A ready-made script that configures all lab VMs is in [`resources/scripts/configure-lab-network.ps1`](../resources/scripts/configure-lab-network.ps1).

---

## 5. Optional: A Lab DHCP Server in VirtualBox
We use static IPs, but you *can* let VirtualBox hand out addresses on the internal network:

```powershell
VBoxManage dhcpserver add --network=labnet --server-ip=10.10.10.2 `
  --netmask=255.255.255.0 --lower-ip=10.10.10.100 --upper-ip=10.10.10.199 --enable
```
Leave it **disabled** for now. In Module 03 you will build your own DHCP server and analyze DORA.

---

## 🧠 Knowledge Check
1. Which network mode provides VM-to-VM traffic but no internet and no host access?
2. What `VBoxManage` option sets promiscuous mode on adapter 1?
3. Why do we turn off the NAT adapter during attack labs?

<details><summary>Answers</summary>

1. Internal Network.
2. `--nicpromisc1 allow-all`
3. It keeps captures free of internet noise (updates, telemetry), and it prevents accidental attack traffic from leaving the lab.
</details>

---
⬅️ [01 Lab Architecture](01-lab-architecture.md) | ➡️ [03 Building the VMs](03-building-the-vms.md)
