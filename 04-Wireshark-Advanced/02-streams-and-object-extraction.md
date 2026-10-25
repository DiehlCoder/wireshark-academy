# 04.02: Following Streams & Reconstructing Files (Object Extraction)

**Level:** 🟡 Intermediate | **Time:** 1.5 h | **XP:** 100

## 🎯 Learning Objectives
- Reconstruct complete application-layer conversations using **Follow Stream** (TCP, UDP, TLS, HTTP)
- Switch stream representation modes (ASCII, Hex Dump, Raw bytes)
- Carve transferred files, documents, and malware binaries directly from captures using **Export Objects**
- Verify reconstructed file integrity using cryptographic hashes (SHA-256)
- Understand the forensic role of network file extraction in Data Loss Prevention (DLP)

---

## 1. The "Follow Stream" Engine

Raw network captures present data chopped into 1500-byte packets out-of-order. The **Follow Stream** feature reassembles and orders all TCP segments or UDP datagrams in a conversation into a unified, human-readable transcript.

### 1.1 How to Follow a Stream
1. Select any packet belonging to the conversation.
2. Right-click ➔ **Follow** ➔ **TCP Stream** (or `Ctrl + Alt + Shift + T`).
3. Wireshark automatically sets the display filter to `tcp.stream eq <index>` and opens the stream viewer.

```
┌─────────────────────────── Follow TCP Stream ───────────────────────────┐
│ GET /secret_contract.pdf HTTP/1.1                                       │  <-- Red = Client Request
│ Host: 10.10.10.20                                                       │
│ User-Agent: curl/7.88.1                                                 │
│                                                                         │
│ HTTP/1.1 200 OK                                                         │  <-- Blue = Server Response
│ Content-Type: application/pdf                                           │
│ Content-Length: 14205                                                   │
│                                                                         │
│ %PDF-1.5 ... [binary data]                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ Show data as: [ ASCII ▼ ]    Entire conversation (14,520 bytes)          │
│ Find: [ password         ]   Filter out this stream                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Representation Options:
- **ASCII:** Default text view (ideal for HTTP, SMTP, FTP, Telnet).
- **Hex Dump:** Shows hex offsets, hex bytes, and ASCII side-by-side (ideal for binary protocols or custom malware beacons).
- **Raw:** Displays raw hexadecimal digits without spaces or offsets. You can save this directly as a binary file!

---

## 2. Extracting Transferred Files (Export Objects)

When users download files from a web server or transfer files across an SMB share, the file data travels inside the packet payloads. Wireshark includes built-in file carvers under **File ➔ Export Objects**.

### Supported Protocols:
| Exporter | Menu Path | Use Case |
|---|---|---|
| **HTTP** | *File ➔ Export Objects ➔ HTTP* | Web downloads, images, PDF documents, malware payloads, JavaScript |
| **SMB** | *File ➔ Export Objects ➔ SMB* | Files copied over Windows shares (`\\server\c$\malware.exe`) |
| **IMF** | *File ➔ Export Objects ➔ IMF* | Internet Message Format: complete `.eml` emails and email attachments |
| **TFTP** | *File ➔ Export Objects ➔ TFTP* | Router and switch backup configurations, PXE boot images |
| **DICOM** | *File ➔ Export Objects ➔ DICOM* | Medical imaging (CT scans, X-Rays) in hospital networks |

---

## 3. 🎯 Mission: Carve a File from a Live Capture

We will host a secret file on Ubuntu Server, download it from Kali, capture the raw packets, extract the file inside Wireshark, and prove that the carved file is a 100% bit-for-bit exact match to the original.

### Step 1: Create a Test File on Ubuntu Server
On **ubuntu-srv**:
```bash
# Create a dummy confidential document
sudo tee /var/www/html/confidential_report.txt <<'EOF'
=== TOP SECRET ACME CORP ACQUISITION PLAN ===
Projected Cost: €45,000,000
Target Acquisition: CyberSec GmbH
Authorized by: Board of Directors
Timestamp: 2026-10-16
EOF

# Calculate its SHA-256 hash on the server
sha256sum /var/www/html/confidential_report.txt
```
*(Copy the resulting hash into your journal!)*

### Step 2: Download the File from Kali while Sniffing
On **Kali**:
1. Start Wireshark on `eth0`, filter: `http`.
2. In terminal, download the document:
   ```bash
   curl -O http://10.10.10.20/confidential_report.txt
   ```
3. Stop capture.

### Step 3: Extract the Object
1. In Wireshark, go to **File ➔ Export Objects ➔ HTTP...**
2. The *HTTP object list* window appears:
   - You will see `confidential_report.txt` listed with its size and Content-Type (`text/plain`).
3. Click the file row, click **Save**, and save it as `~/packet-ninja/captures/carved_report.txt`.
4. In Kali terminal, verify its integrity:
   ```bash
   cat ~/packet-ninja/captures/carved_report.txt
   sha256sum ~/packet-ninja/captures/carved_report.txt
   ```
5. **Compare the hashes:** The SHA-256 checksum of your carved file from Wireshark matches the server hash character-for-character!

---

## 4. Manual Carving with `binwalk` & `foremost`

If traffic uses a proprietary or non-standard protocol where Wireshark's built-in object exporter doesn't automatically parse the file, analysts use external forensic carvers against the PCAP directly:

```bash
# Install forensic file carvers on Kali
sudo apt install -y binwalk foremost

# Extract all embedded JPEG, PNG, PDF, and ZIP files directly from PCAP
foremost -t all -i ~/packet-ninja/captures/02-first.pcapng -o ~/packet-ninja/captures/carved_output/

# List extracted artifacts
ls -la ~/packet-ninja/captures/carved_output/
```

---

## 💼 Business Corner: Data Loss Prevention (DLP) & Incident Forensics
When an insider threat steals sensitive intellectual property or customer records before leaving a company, they often upload files to personal cloud storage or paste them into web forums.

### Legal Admissibility of Carved Files:
In court proceedings or regulatory breach notifications (GDPR Article 33):
1. The forensics team must prove that the extracted file was not altered during analysis.
2. The PCAP file is cryptographically hashed upon capture (`sha256sum incident.pcapng`).
3. When the document is extracted from the PCAP, its SHA-256 hash is compared against the company's internal file repository.
4. If the hashes match, the company has undeniable cryptographic evidence of what data left the network, who sent it, and when.

---

## 🧠 Knowledge Check
1. What is the difference between inspecting individual packets in the Packet List and using **Follow TCP Stream**?
2. Which protocols have built-in Object Exporters in Wireshark?
3. In the Follow TCP Stream window, what do the Red and Blue text colors represent?
4. If you carve a downloaded executable from a PCAP, why is comparing its SHA-256 hash critical before running it in a sandbox?

<details><summary>Answers</summary>

1. Inspecting packets shows segmented, fragmented data chunks with transport headers. Follow TCP Stream reassembles all payloads in sequence, strips TCP/IP headers, and displays the unified application layer dialogue.
2. HTTP, SMB, IMF (email), TFTP, and DICOM.
3. Red represents traffic sent from the client to the server; Blue represents traffic sent from the server back to the client.
4. To verify that no packets were dropped or corrupted during capture, ensuring the reconstructed binary is identical to the file actually delivered over the wire.
</details>

---
⬅️ [01 Statistics & I/O Graphs](01-statistics-and-io-graphs.md) | ➡️ [03 TShark & CLI Tools](03-tshark-and-cli-tools.md)
