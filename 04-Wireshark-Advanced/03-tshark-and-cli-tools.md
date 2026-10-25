# 04.03: TShark & The Wireshark CLI Suite

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Use **TShark** (the terminal version of Wireshark) for headless analysis and automation
- Extract specific packet fields directly to CSV, TSV, and JSON for SIEM / Python ingestion
- Process multi-gigabyte PCAPs that would crash the Wireshark GUI
- Manipulate capture files with **capinfos**, **editcap**, and **mergecap**
- Write automated bash pipelines to hunt for IOCs (Indicators of Compromise)

---

## 1. Why TShark?

The Wireshark GUI is fantastic for interactive investigation. However, in enterprise and cloud environments:
- Servers are headless (no GUI/X11 installed).
- A 10 GB PCAP requires 40+ GB of RAM to render in the GUI and will likely freeze.
- Security Operations Centers (SOCs) need **automated pipelines** (cron jobs, SOAR playbooks) that extract fields and feed them into Python or SIEMs.

TShark is Wireshark's exact dissecting engine running directly in your terminal.

---

## 2. Core TShark Syntax & Flags

```bash
tshark -r <input_file> [options]
tshark -i <interface> [options]
```

| Flag | Meaning | Example |
|---|---|---|
| `-r <file>` | Read capture file | `tshark -r capture.pcapng` |
| `-i <int>` | Live capture on interface | `tshark -i eth0` |
| `-Y <filter>` | Apply **Display Filter** | `tshark -r cap.pcapng -Y "http"` |
| `-f <bpf>` | Apply **Capture Filter** (live) | `tshark -i eth0 -f "port 53"` |
| `-w <file>` | Write captured packets to file | `tshark -i eth0 -w live.pcapng` |
| `-c <count>` | Stop after N packets | `tshark -i eth0 -c 100` |
| `-n` | Disable all network name resolution | `tshark -r cap.pcapng -n` |
| `-q` | Quiet (suppress per-packet output; use with `-z`) | `tshark -r cap.pcapng -q -z io,phs` |
| `-z <stat>` | Run statistics module | `tshark -r cap.pcapng -z conv,ip` |

---

## 3. Extracting Custom Fields to CSV / JSON (`-T fields`)

This is TShark's greatest superpower: pulling specific protocol fields into clean, scriptable text:

```bash
tshark -r capture.pcapng \
  -Y "http.request" \
  -T fields \
  -e frame.number \
  -e ip.src \
  -e ip.dst \
  -e http.request.method \
  -e http.host \
  -e http.request.uri \
  -E header=y \
  -E separator=, \
  -E quote=d > web_requests.csv
```

### Explaining the Formatting Flags:
- `-T fields`: Activates field extraction mode.
- `-e <field_name>`: Specifies which field to extract (any Wireshark display filter field name).
- `-E header=y`: Prints column names on the first line.
- `-E separator=,`: Outputs standard CSV (can be `\t` for TSV).
- `-E quote=d`: Wraps strings in double quotes.

### Exporting directly to JSON:
```bash
tshark -r capture.pcapng -c 5 -T json > packets.json
```

---

## 4. The Wireshark CLI Companion Tools

Along with TShark, the Wireshark package installs four specialized CLI utilities:

### 4.1 `capinfos`: Instant File Metadata
Quickly inspects file characteristics without reading every packet into memory:
```bash
capinfos ~/packet-ninja/captures/02-first.pcapng
```
**Output provides:** File encapsulation, packet count, capture duration, average bit rate, average packet size, and SHA-256 hash.

### 4.2 `editcap`: The File Surgeon
Modifies and slices PCAP files:
```bash
# Extract only packets 100 through 500 into a new file:
editcap -r input.pcapng slice.pcapng 100-500

# Extract a specific 10-minute time window:
editcap -A "2026-10-16 14:00:00" -B "2026-10-16 14:10:00" full.pcapng incident_window.pcapng

# Deduplicate identical packets (common when capturing on multiple mirrored switch ports):
editcap -d input.pcapng deduplicated.pcapng

# Truncate packets to 96 bytes (strips payload for privacy/GDPR compliance):
editcap -s 96 full_payload.pcapng headers_only.pcapng
```

### 4.3 `mergecap`: The Combiner
Merges multiple chronological capture files into one unified file:
```bash
mergecap -w unified.pcapng capture_part1.pcapng capture_part2.pcapng
```

---

## 5. 🎯 Mission: TShark Automation Pipelines

On Kali, run these powerful one-liners against any capture file in your `~/packet-ninja/captures/` folder:

### Challenge 1: Find the Top 5 Queried DNS Domains
```bash
tshark -r ~/packet-ninja/captures/02-first.pcapng \
  -Y "dns.flags.response == 0" \
  -T fields -e dns.qry.name \
  | sort | uniq -c | sort -rn | head -5
```

### Challenge 2: Audit All HTTP User-Agent Strings
```bash
tshark -r ~/packet-ninja/captures/02-first.pcapng \
  -Y "http.user_agent" \
  -T fields -e ip.src -e http.user_agent \
  | sort -u
```
*(Notice how easily you can spot automated scripts like `curl`, `python-requests`, or `sqlmap`!)*

### Challenge 3: Extract All Distinct TLS SNI Domains
```bash
tshark -r ~/packet-ninja/captures/02-first.pcapng \
  -Y "tls.handshake.extensions_server_name" \
  -T fields -e tls.handshake.extensions_server_name \
  | sort -u
```

---

## 💼 Business Corner: Automated SOAR & SIEM Pipelines
Large enterprises capture terabytes of PCAP data daily at edge gateways using dedicated appliances (like Endace or Gigamon).

Instead of human analysts opening files manually:
1. When a SIEM (Splunk, Microsoft Sentinel) detects an alert on host `10.10.10.10`:
2. A SOAR playbook (Cortex XSOAR, Tines) triggers a background Python script.
3. The script calls `editcap` to carve the exact 5-minute capture window surrounding the alert timestamp.
4. The script calls `tshark` to parse out all destination IPs, DNS queries, and TLS SNIs into a JSON object.
5. The extracted indicators are automatically queried against VirusTotal and AlienVault OTX.
6. When the Tier-1 analyst opens the ticket 2 minutes later, the triage table is already filled with threat intelligence scores!

---

## 🧠 Knowledge Check
1. Which TShark flag specifies a display filter? Which flag specifies live interface capture filter?
2. How do you export source IP, destination IP, and destination port to a CSV file using TShark?
3. Which CLI tool can remove duplicate packets caused by overlapping SPAN ports?
4. How do you use `editcap` to remove sensitive application payloads before sharing a PCAP with an external vendor?

<details><summary>Answers</summary>

1. Display filter: `-Y "<filter>"`; Capture filter (live): `-f "<bpf>"`.
2. `tshark -r file.pcapng -T fields -e ip.src -e ip.dst -e tcp.dstport -E header=y -E separator=,`
3. `editcap -d <input> <output>`
4. Use the snaplen flag `-s 96` (`editcap -s 96 input.pcap output.pcap`), which keeps only the first 96 bytes (L2-L4 headers) and truncates the payload.
</details>

---
⬅️ [02 Streams & Object Extraction](02-streams-and-object-extraction.md) | ➡️ [04 Decrypting TLS](04-decrypting-tls.md)
