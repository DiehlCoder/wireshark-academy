# 04.04: Decrypting HTTPS & TLS in Wireshark

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 150

## 🎯 Learning Objectives
- Understand why traditional RSA private key decryption fails against modern TLS 1.2 and 1.3
- Master the **Pre-Master Secret (SSLKEYLOGFILE)** session decryption technique
- Configure Wireshark and TShark to decrypt TLS application data in real-time
- Inspect decrypted HTTP/1.1 and HTTP/2 payloads, headers, and credentials
- Apply TLS decryption ethically during application testing and incident forensics

---

## 1. The Decryption Dilemma: Why RSA Keys No Longer Work

In legacy TLS (prior to modern ciphers), clients used the server's public RSA certificate to encrypt the symmetric session key. If an analyst had the server's private RSA key file (`server.key`), Wireshark could decrypt all past and present traffic.

### Why this died: Perfect Forward Secrecy (PFS)
Modern TLS 1.2 and all TLS 1.3 connections enforce **Diffie-Hellman (ECDHE)** key exchange:
- The server's RSA/ECDSA key is used **strictly for authentication (signing)**.
- A unique, temporary symmetric encryption key is calculated in memory for each individual connection.
- **Even if you possess the server's private key, you CANNOT decrypt Diffie-Hellman traffic!**

---

## 2. The Modern Solution: The `SSLKEYLOGFILE` Standard

Major operating systems, web browsers (Chrome, Firefox, Edge), and developer tools (`curl`, Python `requests`, Go) support an environment variable called **`SSLKEYLOGFILE`**.

When set, the client library writes the symmetric session keys (`CLIENT_RANDOM <32-byte-hex> <48-byte-secret>`) into a designated text file upon establishing each TLS handshake.

```
┌─────────────────┐  1. Generates Session Keys
│ Chrome / curl   ├──────────────────────────────┐
└────────┬────────┘                              ▼
         │ 2. Sends Encrypted Packets     ┌────────────────────────┐
         │                                │ /tmp/sslkeys.log       │
         ▼                                └──────────────┬─────────┘
┌─────────────────┐                                      │ 3. Reads Keys
│ Live Network    │                                      │
└────────┬────────┘                                      ▼
         │                                ┌────────────────────────┐
         └───────────────────────────────►│ Wireshark Engine       │
                                          │ Decrypts on the fly!   │
                                          └────────────────────────┘
```

---

## 3. Configuring Wireshark for TLS Decryption

1. Open Wireshark.
2. Go to: **Edit ➔ Preferences ➔ Protocols ➔ TLS** (in older versions: *SSL*).
3. Find the field: **(Pre)-Master-Secret log filename**.
4. Click **Browse...** and select your keylog file path (e.g., `/tmp/sslkeys.log` or `C:\lab\sslkeys.log`).
5. Click **OK**.

As soon as a PCAP is loaded alongside this key log, Wireshark decrypts all matching TLS streams automatically!

---

## 4. 🎯 Mission: Capture and Decrypt a Live TLS Session

We will configure `curl` to dump its TLS secrets, capture the encrypted packets in Wireshark, feed the key log to Wireshark, and watch the encrypted ciphertext magically transform into readable HTTP!

### Step 1: Prepare the Key Log Environment
On **Kali**:
```bash
# Set the environment variable for your terminal session
export SSLKEYLOGFILE=/tmp/sslkeys.log
rm -f /tmp/sslkeys.log
touch /tmp/sslkeys.log
```

### Step 2: Configure Wireshark
1. Launch Wireshark on Kali: `wireshark &`
2. Open *Edit ➔ Preferences ➔ Protocols ➔ TLS*.
3. In *(Pre)-Master-Secret log filename*, type: `/tmp/sslkeys.log`.
4. Click **OK**.
5. Start live capture on `eth0` with display filter: `http || tls`.

### Step 3: Generate TLS Web Traffic
In the same terminal where `SSLKEYLOGFILE` is exported:
```bash
curl -vk https://10.10.10.20/login.html 2>/dev/null || curl -sI https://httpbin.org/get >/dev/null

# Inspect the generated keys
cat /tmp/sslkeys.log | head -4
```
You will see entries starting with `CLIENT_RANDOM` followed by hexadecimal strings.

### Step 4: Verify Decryption in Wireshark
Look at the Wireshark packet list:
1. Initially, packets on port 443 show protocol `TLSv1.3` or `TLSv1.2` with `Application Data`.
2. With the key log loaded, Wireshark adds a **Decrypted TLS** tab at the bottom of the Packet Bytes pane!
3. Look at the Protocol column: you will now see **`HTTP`** (or `HTTP2`) appear on port 443!
4. Right-click the decrypted HTTP packet ➔ **Follow ➔ HTTP Stream**.
   - You can now read the complete decrypted headers, HTML response, and cookies!

---

## 5. Decrypting from the Command Line with TShark

You can run automated headless decryption using TShark's `-o` preference override flag:

```bash
tshark -r encrypted_traffic.pcapng \
  -o "tls.keylog_file:/tmp/sslkeys.log" \
  -Y "http.request" \
  -T fields -e ip.dst -e http.request.method -e http.request.uri
```

---

## 💼 Business Corner: Application Performance & API Auditing
In corporate software development and application security testing, TLS decryption via `SSLKEYLOGFILE` is the gold standard for debugging:
- **API Troubleshooting:** Developers can inspect exact JSON payloads transmitted over HTTPS without modifying backend server code or installing intrusive software proxies.
- **Malware Analysis:** Reverse engineers run malware inside a sandbox where `SSLKEYLOGFILE` is injected into the Windows process. The resulting PCAP reveals the malware's unencrypted C2 commands, configuration files, and downloaded second-stage payloads.

---

## 🧠 Knowledge Check
1. Why does possessing the server's private RSA key fail to decrypt modern TLS 1.3 traffic?
2. What environment variable instructs modern browsers and `curl` to write session keys to disk?
3. What is the line prefix format used in a standard NSS SSL key log file?
4. How do you instruct TShark on the CLI to use a key log file for decryption?

<details><summary>Answers</summary>

1. Modern TLS uses Diffie-Hellman Ephemeral (ECDHE) key exchange, ensuring Perfect Forward Secrecy. Temporary session keys are never transmitted over the wire and cannot be derived from the server's long-term private key.
2. `SSLKEYLOGFILE`.
3. `CLIENT_RANDOM <client-random-hex> <master-secret-hex>`.
4. `-o "tls.keylog_file:/path/to/keyfile.log"`
</details>

---
⬅️ [03 TShark & CLI Tools](03-tshark-and-cli-tools.md) | ➡️ [05 Performance Troubleshooting](05-performance-troubleshooting.md)
