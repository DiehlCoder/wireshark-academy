# 02.02: Capturing Traffic Like a Pro

**Level:** 🟢 Beginner | **Time:** 1 h | **XP:** 75

## 🎯 Learning Objectives
- Choose the right capture point
- Understand promiscuous vs. monitor mode, snaplen and ring buffers
- Capture with dumpcap/tcpdump and stream remote captures into Wireshark
- Avoid dropped packets and giant files

---

## 1. Where Do You Capture? (Capture Point Strategy)

| Question you need to answer | Best capture point |
|---|---|
| "Is the client sending the request at all?" | On the client |
| "Does the request reach the server?" | On the server (or the switch port in front of it) |
| "Is the firewall dropping it?" | On **both sides** of the firewall, then compare |
| "What leaves our network?" | At the Internet edge (inside the firewall, before NAT) |

> 💡 **Golden rule:** If in doubt, capture at **both ends** at the same time. Comparing them tells you exactly where packets disappear or get modified.

---

## 2. Capture Modes

| Mode | Meaning |
|---|---|
| **Normal** | The NIC passes only frames for its own MAC + broadcast/multicast |
| **Promiscuous** | The NIC passes **all** frames it sees on the wire (default in Wireshark) |
| **Monitor (rfmon)** | Wi-Fi only: capture raw 802.11 frames from all networks without associating |

Check promiscuous mode on Linux: `ip link show eth0` → look for `PROMISC`.

---

## 3. Capture Options (Ctrl+K)

| Option | What it does | Recommendation |
|---|---|---|
| **Interface** | Where to capture | `eth0` (labnet) on Kali |
| **Capture filter** | BPF filter applied in the kernel *before* saving. Dropped packets are gone forever | Use only when the volume forces you to |
| **Promiscuous** | Enable promiscuous mode | ✅ On |
| **Snaplen** | Max bytes saved per packet | Default 262144 (= full). Use `-s 96` to save headers only (privacy/GDPR, smaller files) |
| **Output → File** | Write directly to disk | ✅ For anything longer than a few minutes |
| **Ring buffer** | Rotate N files of size X | ✅ For long-running captures |
| **Stop conditions** | Stop after N packets/MB/seconds | Prevents filling the disk |
| **Buffer size** | Kernel buffer (MB) | Increase (e.g. 64 MB) if you see dropped packets |

---

## 4. Command-Line Capturing

### 4.1 dumpcap (lightest, best for long captures)
```bash
dumpcap -D                                   # list interfaces
dumpcap -i eth0 -w ~/packet-ninja/captures/test.pcapng -a duration:60
# Ring buffer: 10 files x 100 MB, oldest gets overwritten
dumpcap -i eth0 -b filesize:102400 -b files:10 -w ~/packet-ninja/captures/ring.pcapng
```
(`filesize` is in **kB**.)

### 4.2 tcpdump (available on almost every Linux/Unix box)
```bash
sudo tcpdump -D                              # list interfaces
sudo tcpdump -i eth0 -n                      # live, no name resolution
sudo tcpdump -i eth0 -nn -c 20 port 80       # 20 packets, numeric ports too
sudo tcpdump -i eth0 -w out.pcap             # write to a file
tcpdump -r out.pcap -nn 'tcp[tcpflags] & tcp-syn != 0'   # read + filter
sudo tcpdump -i eth0 -A port 21              # ASCII payload (FTP creds!)
sudo tcpdump -i eth0 -G 3600 -w 'cap-%Y%m%d-%H%M.pcap'   # new file every hour
```

### 4.3 Remote capture: stream from ubuntu-srv into Kali's Wireshark 🔥
```bash
# On Kali (requires SSH access to ubuntu-srv and sudo rights there)
ssh student@10.10.10.20 "sudo tcpdump -i enp0s3 -U -s0 -w - 'not port 22'" | wireshark -k -i -
```
- `-U` = flush every packet, `-w -` = write pcap to stdout, `not port 22` = don't capture your own SSH session (that would loop forever!)
- Tip: allow passwordless sudo for tcpdump on the server, or run as root.

---

## 5. Dropped Packets & Performance

| Symptom | Cause | Fix |
|---|---|---|
| "Dropped: 1234" in the status bar | Kernel buffer overflow | Bigger buffer, capture filter, use dumpcap instead of the GUI |
| Wireshark GUI freezes | Too many packets in RAM | Capture to ring buffer files, analyze later |
| Huge files | Full payload capture | Snaplen, capture filter, rotate files |
| Missing TCP segments ("ACKed unseen segment") | Drops at SPAN or capture host | Use a TAP, check the SPAN oversubscription |

> ⚠️ **Never** run the Wireshark GUI for days on a busy link. Use `dumpcap` with a ring buffer and open the files later.

---

## 6. 🎯 Mission: Capture Three Ways
1. **GUI:** Capture 30 s on `eth0` while running `ping 10.10.10.30`. Save as `02-gui.pcapng`.
2. **dumpcap:** ring buffer with 3 files of 1 MB each. Generate traffic with:
   ```bash
   for i in $(seq 1 200); do curl -s http://10.10.10.20/ >/dev/null; done
   ls -lh ~/packet-ninja/captures/ring*   # how many files exist? why only 3?
   ```
3. **Remote:** stream ubuntu-srv's interface into Kali's Wireshark using SSH (section 4.3), then browse `http://10.10.10.20` from Kali.

🏆 **Challenge (+25 XP):** use `capinfos` to compare the three files (packet count, duration, average packet size).

---

## 💼 Business Corner
- **Privacy/GDPR:** Packet captures contain personal data (IPs, emails, passwords). In the EU you need a **legal basis**, **purpose limitation** and **retention limits**. In Germany the **works council (Betriebsrat)** often has to approve monitoring tools (§87 BetrVG). Snaplen and capture filters support **data minimisation**.
- **Chain of custody:** for forensic captures, hash the file right after capture (`sha256sum file.pcapng`) and document who captured what, where and when.

---

## 🧠 Knowledge Check
1. Capture filter vs. display filter: which one permanently discards packets?
2. What does `-b filesize:102400 -b files:10` do?
3. Why do we exclude port 22 when capturing remotely over SSH?
4. Where do you capture to prove a firewall drops traffic?

<details><summary>Answers</summary>

1. The capture filter.
2. A ring buffer of 10 files × ~100 MB. When the 11th would be created, the oldest is deleted.
3. Otherwise the capture would include its own SSH stream, creating a feedback loop of ever-growing traffic.
4. On both sides of the firewall at the same time.
</details>

---
⬅️ [01 Interface Tour](01-install-and-interface.md) | ➡️ [03 Capture Filters (BPF)](03-capture-filters-bpf.md)


