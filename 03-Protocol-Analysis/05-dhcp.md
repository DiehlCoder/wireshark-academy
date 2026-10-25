# 03.05: DHCP (Dynamic Host Configuration Protocol)

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Dissect the complete 4-step DHCP **DORA** lifecycle (Discover, Offer, Request, ACK)
- Inspect critical DHCP Options (Mask, Gateway, DNS, Lease Time, Hostname)
- Understand the technical mechanics of **Rogue DHCP** and **DHCP Starvation** attacks
- Configure switch-level defense: **DHCP Snooping**

---

## 1. What is DHCP? (RFC 2131)

DHCP automates network configuration for client devices. It builds on the older BOOTP protocol:
- **Client Port:** `UDP 68`
- **Server Port:** `UDP 67`
- Uses broadcasts (`255.255.255.255`) because an unconfigured client does not have an IP address yet!

---

## 2. The DORA Process Step-by-Step

```
Client (Unconfigured)                                  DHCP Server (10.10.10.20)
       │                                                          │
  [D]  ├────── DHCP Discover (Src: 0.0.0.0, Dst: 255.255.255.255) ────────► (Broadcast)
       │                                                          │
  [O]  │◄───── DHCP Offer (Your IP: 10.10.10.150) ────────────────┤ (Broadcast or Unicast)
       │                                                          │
  [R]  ├────── DHCP Request (Accepting 10.10.10.150) ─────────────► (Broadcast)
       │                                                          │
  [A]  │◄───── DHCP ACK (Confirming lease + options) ─────────────┤ (Broadcast or Unicast)
       │                                                          │
```

### 2.1 The Four Stages:
1. **DHCP Discover:**
   - **Source IP:** `0.0.0.0` | **Destination IP:** `255.255.255.255`
   - Client announces its MAC address and requests network configuration.
2. **DHCP Offer:**
   - Server reserves an IP address from its pool and sends an offer (`Your (Client) IP Address: yiaddr`).
3. **DHCP Request:**
   - Client chooses an offer and broadcasts its selection. Broadcasting lets other DHCP servers on the subnet know their offers were declined so they can return reserved IPs to their pools.
4. **DHCP ACK:**
   - Server confirms the lease, providing:
     - IP Address & Subnet Mask
     - Default Gateway (Router)
     - DNS Server(s)
     - Lease Duration (e.g. 86400 seconds = 24 hours)

### 2.2 Other DHCP Message Types:
- **DHCP NAK:** Server rejects a client's request (e.g. client moved to a different subnet and requested an invalid IP).
- **DHCP Decline:** Client discovers offered IP is already in use (via ARP check) and declines it.
- **DHCP Release:** Client voluntarily gives up its IP address upon clean shutdown.

---

## 3. Important DHCP Options

The DHCP payload structure ends with an **Options** list formatted as `Type-Length-Value (TLV)`:

| Option # | Name | Description |
|---|---|---|
| **53** | DHCP Message Type | `1`=Discover, `2`=Offer, `3`=Request, `4`=Decline, `5`=ACK, `6`=NAK, `7`=Release |
| **1** | Subnet Mask | e.g. `255.255.255.0` |
| **3** | Router | Default Gateway IP address |
| **6** | Domain Name Server | List of DNS resolver IPs |
| **12** | Host Name | Client sends its computer name (great for OSINT & SOC inventory!) |
| **51** | IP Address Lease Time | Duration of the lease in seconds |
| **54** | Server Identifier | IP address of the responding DHCP server |
| **121** | Classless Static Route | Injects custom static routes into client routing table (often abused by malware!) |

---

## 4. Rogue DHCP & Starvation Attacks

### 4.1 DHCP Starvation (Denial of Service)
An attacker floods the network with thousands of DHCP Discover requests using spoofed, randomized MAC addresses. The DHCP server exhausts its entire pool of available IP addresses. Legitimate new devices cannot join the network.

### 4.2 Rogue DHCP Server (Man-in-the-Middle)
Once legitimate servers are starved (or simply by racing to respond faster), the attacker spins up a rogue DHCP server. When clients send a Discover, the rogue server replies with:
- Client IP: Valid subnet IP
- **Default Gateway (Option 3): Attacker's IP**
- **DNS Server (Option 6): Attacker's IP**

All client internet and intranet traffic is immediately routed through the attacker's machine!

---

## 5. 🎯 Mission: Capture Real DORA in the Lab

### Step 1: Configure a Lab DHCP Server on Ubuntu
On **ubuntu-srv**:
```bash
# Add a test DHCP range to dnsmasq
sudo tee -a /etc/dnsmasq.conf >/dev/null <<'EOF'
dhcp-range=10.10.10.100,10.10.10.150,255.255.255.0,12h
dhcp-option=option:router,10.10.10.20
dhcp-option=option:dns-server,10.10.10.20
EOF

sudo systemctl restart dnsmasq
sudo systemctl status dnsmasq
```

### Step 2: Capture DORA from Kali
1. On Kali, start Wireshark on `eth0`, filter: `dhcp || bootp`.
2. In terminal, release and renew a DHCP lease on a virtual dummy interface or request a lease:
   ```bash
   sudo dhclient -r -v eth0    # Release current lease (if any)
   sudo dhclient -v -1 eth0    # Perform DORA request
   ```
3. Stop capture. You will see the complete `Discover ➔ Offer ➔ Request ➔ ACK` chain.
4. Expand packet 4 (DHCP ACK) in the details pane:
   - Expand `Bootstrap Protocol (ACK)` ➔ `Options`.
   - Locate `Option: (53) DHCP Message Type (ACK)`.
   - Locate `Option: (3) Router`.
   - Locate `Option: (51) IP Address Lease Time`.

---

## 💼 Business Corner: DHCP Logs in Incident Response
In enterprise environments with laptops moving between offices, Wi-Fi access points, and remote VPNs, IP addresses are dynamic. 

When a SOC receives an alert:
> *"Alert: Host `10.50.12.84` attempted SQL Injection against the finance database at 14:22:05 UTC"*

The analyst cannot simply ask "who is 10.50.12.84?" because an hour later, that IP belongs to a different laptop!
The analyst must query the centralized **DHCP Server Logs / IPAM** for the exact timestamp:
- Look up `10.50.12.84` at `14:22:05 UTC` ➔ reveals **MAC Address** `3c:22:fb:89:12:34` and **Option 12 (Hostname)** `LAPTOP-MKTG-SARAH`.
- Query Active Directory for Sarah's user account and isolate the specific machine.

Without centralized DHCP auditing, forensic IP attribution is impossible.

---

## 🧠 Knowledge Check
1. What UDP ports do DHCP clients and servers use?
2. What are the 4 stages of the standard DHCP lease lifecycle?
3. Which DHCP option specifies the Default Gateway?
4. How does an enterprise switch configured with **DHCP Snooping** stop Rogue DHCP attacks?

<details><summary>Answers</summary>

1. Client uses UDP port 68; Server uses UDP port 67.
2. Discover, Offer, Request, ACK (DORA).
3. Option 3 (Router).
4. DHCP Snooping designates switch ports as either "Trusted" (uplinks to authorized DHCP servers) or "Untrusted" (regular user access ports). Any DHCP Offer or ACK message received on an untrusted port is immediately dropped.
</details>

---
⬅️ [04 UDP & DNS](04-udp-and-dns.md) | ➡️ [06 HTTP & TLS](06-http-and-tls.md)
