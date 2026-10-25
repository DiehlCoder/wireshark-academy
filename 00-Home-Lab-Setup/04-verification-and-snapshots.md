# 00.04: Lab Verification & Snapshots

**Level:** 🟢 Beginner | **Time:** 30 min | **XP:** 75

## 🎯 Learning Objectives
- Verify connectivity between all VMs
- Prove that promiscuous sniffing works (your first capture! 🎉)
- Create clean snapshots so you can always roll back

---

## 1. Connectivity Matrix

From **Kali**:
```bash
for ip in 10.10.10.20 10.10.10.30 10.10.10.40; do
  ping -c 2 -W 1 $ip >/dev/null && echo "✅ $ip reachable" || echo "❌ $ip unreachable"
done
```

Fill in the matrix in your journal:

| From \ To | kali | ubuntu-srv | msf2 | win |
|---|---|---|---|---|
| kali | — | | | |
| ubuntu-srv | | — | | |
| msf2 | | | — | |

### Troubleshooting
| Symptom | Likely Cause | Fix |
|---|---|---|
| `Destination Host Unreachable` | Wrong subnet/IP or the adapter is not on `labnet` | `ip addr`, check the VM network settings (the name is case-sensitive!) |
| Linux pings work, Windows doesn't | Windows Firewall blocks ICMP | Add the ICMP rule (see 00.03) |
| No interface `eth0` | Adapter 1 is disabled | Enable it in the VM settings |
| Kali has no internet | NAT adapter down / default route missing | `nmcli dev connect eth1`, `ip route` |

---

## 2. 🎯 Mission: Prove Promiscuous Sniffing Works

Goal: Kali captures a ping **between ubuntu-srv and metasploitable2**, traffic that is not addressed to Kali.

1. On **Kali**:
```bash
sudo ip link set eth0 promisc on      # Wireshark does this automatically, too
tcpdump -i eth0 -n icmp
```
2. On **ubuntu-srv**:
```bash
ping -c 4 10.10.10.30
```
3. Back on Kali you should see:
```
IP 10.10.10.20 > 10.10.10.30: ICMP echo request, id 1, seq 1, length 64
IP 10.10.10.30 > 10.10.10.20: ICMP echo reply, id 1, seq 1, length 64
```

✅ If you see this, your lab works like a real SPAN port. If you see nothing, re-check **Promiscuous Mode = Allow All** on *all* VMs' adapter 1.

---

## 3. Snapshots: Your Undo Button

Shut down each VM and create a snapshot named `00-clean-baseline`.

```powershell
VBoxManage snapshot "kali"            take "00-clean-baseline" --description "Fresh install, static IP, tools"
VBoxManage snapshot "ubuntu-srv"      take "00-clean-baseline"
VBoxManage snapshot "metasploitable2" take "00-clean-baseline"

# Restore later (VM must be powered off):
VBoxManage snapshot "kali" restore "00-clean-baseline"
VBoxManage snapshot "kali" list
```

> 💡 **Pro habit:** Take a snapshot **before** every module with a risky change (Snort install, ARP spoofing, exploitation).

---

## 4. Lab Journal Setup

Create a working directory on Kali that you will use throughout the course:
```bash
mkdir -p ~/packet-ninja/{captures,notes,scripts,reports,snort}
cd ~/packet-ninja
echo "# Analyst Journal - started $(date -I)" > notes/journal.md
```
Copy the course's [`resources/scripts`](../resources/scripts) folder into `~/packet-ninja/scripts` (via a shared folder, `scp`, or `git clone` if you have the course in a repo).

---

## ✅ Module 00 Completion Checklist
- [ ] All VMs boot and have the correct static IPs
- [ ] Kali can ping every VM
- [ ] Kali sniffs ubuntu-srv ↔ msf2 traffic
- [ ] `dumpcap -D` works without sudo on Kali
- [ ] Snapshots `00-clean-baseline` exist
- [ ] `~/packet-ninja` folder structure created

🎉 **Module 00 complete: +350 XP.** Your rank is still 🐟 Packet Plankton, but not for long.

---
⬅️ [03 Building the VMs](03-building-the-vms.md) | ➡️ [Module 01: Networking Fundamentals](../01-Networking-Fundamentals/01-what-is-a-network.md)
