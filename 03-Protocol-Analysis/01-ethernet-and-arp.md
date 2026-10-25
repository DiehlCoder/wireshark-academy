# 03.01: Ethernet II & ARP (Address Resolution Protocol)

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Dissect an Ethernet II frame field-by-field in Wireshark
- Understand MAC address architecture (OUI, I/G bit, U/L bit)
- Analyze the complete ARP Request/Reply lifecycle and Gratuitous ARP
- Identify how ARP poisoning works at Layer 2
- Understand enterprise defenses like DAI (Dynamic ARP Inspection)

---

## 1. Ethernet II Frame Architecture

Ethernet (IEEE 802.3 / Ethernet II) is the standard Layer 2 protocol of local area networks.

```
┌──────────────────┬─────────────────┬───────────┬───────────────────┬─────────┐
│ Destination MAC  │   Source MAC    │ EtherType │      Payload      │   FCS   │
│     (6 bytes)    │    (6 bytes)    │ (2 bytes) │ (46 - 1500 bytes) │ (4 bytes│
└──────────────────┴─────────────────┴───────────┴───────────────────┴─────────┘
```

> 💡 **Why does Wireshark not display the Preamble, SFD, or FCS?**
> - **Preamble & SFD (Start of Frame Delimiter):** 8 bytes of alternating bits (`101010...10101011`) used by physical PHY clock synchronization. Stripped by the NIC hardware before reaching the OS driver.
> - **FCS (Frame Check Sequence / CRC-32):** Stripped by default if the frame is valid. If a frame has a bad CRC, the NIC silently drops it before Wireshark ever gets it (unless specialized forensic NICs or TAP hardware are used).

### 1.1 MAC Address Anatomy (48 Bits / 6 Octets)
Example: `08:00:27:11:22:33`

```
  ┌─────────────── OUI (24 bits) ──────────────┐ ┌─── NIC Specific (24 bits) ──┐
  │  0  0  0  0  1  0  0  0 : 0  0  0  0  0 ... │ │  0  0  0  1  0  0  0  1 ... │
  └────────────────────────┬───┬───────────────┘ └─────────────────────────────┘
                           │   └── b0: I/G bit (0 = Individual / Unicast, 1 = Group / Multicast)
                           └────── b1: U/L bit (0 = Universally Unique, 1 = Locally Administered)
```

- **OUI (Organizationally Unique Identifier):** Assigned by IEEE (e.g. `08:00:27` = Oracle VirtualBox, `00:0c:29` = VMware, `b8:27:eb` = Raspberry Pi).
- **Locally Administered Bit:** When software (like MAC spoofers or privacy features in iOS/Android/Windows) randomizes your MAC, this bit is set to `1`.

---

## 2. ARP: The Glue Between Layer 2 and Layer 3

IPv4 routers and hosts communicate using IP addresses, but local Ethernet switches only understand MAC addresses. **ARP (RFC 826)** resolves an unknown MAC address for a known target IP address.

### 2.1 The ARP Cycle
1. **Host A (10.10.10.10)** needs to send a packet to **Host B (10.10.10.20)**.
2. Host A checks its local ARP cache (`ip neigh`). If empty, it broadcasts:
   - **ARP Request:** *"Who has 10.10.10.20? Tell 10.10.10.10"*
   - **Destination MAC:** `ff:ff:ff:ff:ff:ff` (Broadcast)
   - Every machine on the switch receives this frame.
3. **Host B** recognizes its own IP and replies:
   - **ARP Reply:** *"10.10.10.20 is at 08:00:27:bb:bb:bb"*
   - **Destination MAC:** `08:00:27:aa:aa:aa` (Unicast directly to Host A)
4. Host A updates its ARP cache and transmits the queued IP packet.

### 2.2 ARP Packet Header Structure
```
Field                      Size (bytes)   Description
Hardware Type (HTYPE)      2              1 for Ethernet
Protocol Type (PTYPE)      2              0x0800 for IPv4
Hardware Address Length    1              6 (MAC length in bytes)
Protocol Address Length    1              4 (IPv4 length in bytes)
Opcode                     2              1 = Request, 2 = Reply
Sender MAC (SHA)           6              Sender's physical MAC
Sender IP (SPA)            4              Sender's logical IPv4
Target MAC (THA)           6              Zeroed in Request, Receiver's MAC in Reply
Target IP (TPA)            4              Target host's IPv4
```

---

## 3. Gratuitous ARP (GARP) & Security Flaws

An ARP packet sent where **Sender IP == Target IP** is called a **Gratuitous ARP**.
Legitimate uses:
- Announce a new IP address to the network to detect IP conflicts.
- Update switch CAM tables when a cluster fails over to a secondary node (e.g. VRRP / CARP).

### The Inherent Flaw: ARP is Stateless and Unauthenticated
Any host will accept and cache an ARP Reply **even if it never sent an ARP Request**!
An attacker on the local network can broadcast:
*"10.10.10.1 (Gateway) is at <Attacker's MAC>"*
All hosts on the subnet update their ARP table and send their internet traffic straight to the attacker. This is **ARP Spoofing / Poisoning** (examined in depth in Module 08).

---

## 4. 🎯 Mission: Capture and Inspect Real ARP Traffic

### Step 1: Clear the ARP Cache
On **Kali**:
```bash
# Check current table
ip neigh

# Flush the ARP cache for the lab interface
sudo ip neigh flush dev eth0
ip neigh
```

### Step 2: Capture the ARP Conversation
1. Open Wireshark on Kali, listen on `eth0`, and set display filter: `arp`.
2. In terminal, ping ubuntu-srv:
   ```bash
   ping -c 1 10.10.10.20
   ```
3. Stop capture. You will see two ARP frames:
   - Packet 1: `Who has 10.10.10.20? Tell 10.10.10.10` (Opcode 1, Dst MAC `ff:ff:ff:ff:ff:ff`)
   - Packet 2: `10.10.10.20 is at 08:00:27:...` (Opcode 2, Dst MAC = Kali's MAC)

### Step 3: Verify the Details Pane
Expand the `Address Resolution Protocol` header in Wireshark:
- Note the `Opcode: request (1)`
- Verify `Target MAC: 00:00:00:00:00:00` in the request (unknown yet).
- In the reply, notice `Opcode: reply (2)` and that Target MAC is now your MAC.

---

## 💼 Business Corner: Enterprise Layer 2 Security
Why do enterprise switches cost thousands of euros while unmanaged home switches cost €25?
Enterprise switches (Cisco Catalyst, Aruba, Juniper) include hardware ASICs that protect against ARP and Layer 2 attacks:

- **DHCP Snooping:** The switch monitors DHCP leases and builds a binding database of `(MAC, IP, Switch Port, VLAN)`.
- **DAI (Dynamic ARP Inspection):** The switch intercepts every ARP packet on untrusted ports. If the IP/MAC pairing does not match the DHCP Snooping database, the switch drops the packet and logs a security violation.
- **Port Security:** Restricts the number of MAC addresses allowed on an access switch port (prevents MAC flooding attacks).

Without DAI, any employee or visitor plugging a laptop into an office Ethernet jack can intercept the entire floor's network traffic using ARP spoofing.

---

## 🧠 Knowledge Check
1. What is the EtherType value for ARP in an Ethernet II frame?
2. Why is an ARP Request sent to `ff:ff:ff:ff:ff:ff` while the Reply is unicast?
3. What is a Gratuitous ARP and why do high-availability firewalls send them during a failover?
4. What switch feature prevents unauthorized ARP spoofing on corporate LANs?

<details><summary>Answers</summary>

1. `0x0806`.
2. The sender doesn't know which physical port or MAC holds the target IP, so it must query all devices in the broadcast domain. The replier already knows the sender's MAC from the request, so it sends the reply directly (unicast).
3. A Gratuitous ARP is an ARP broadcast where sender IP equals target IP. HA firewalls send it so that all switches and endpoints immediately update their MAC tables to point the default gateway IP to the standby node's MAC.
4. Dynamic ARP Inspection (DAI), paired with DHCP Snooping.
</details>

---
⬅️ [Module 02 Cheat Sheet](../02-Wireshark-Foundations/cheatsheet.md) | ➡️ [02 IP & ICMP](02-ip-and-icmp.md)
