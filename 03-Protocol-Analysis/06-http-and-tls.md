# 03.06: HTTP & TLS (Transport Layer Security)

**Level:** 🟡 Intermediate | **Time:** 2 h | **XP:** 200

## 🎯 Learning Objectives
- Dissect the structure of HTTP/1.1 requests and responses (Methods, Headers, Status Codes)
- Understand the evolution from HTTP/1.1 to HTTP/2 and HTTP/3 (QUIC over UDP)
- Trace the TLS 1.2 vs. TLS 1.3 cryptographic handshake at the packet level
- Extract domain intelligence using Server Name Indication (SNI) and X.509 certificates
- Understand Perfect Forward Secrecy (PFS) and enterprise TLS inspection architectures

---

## 1. HTTP/1.1 Architecture (RFC 9112)

HTTP (Hypertext Transfer Protocol) is an application-layer, text-based, stateless protocol running on **TCP port 80**.

### 1.1 The HTTP Request Format
```http
GET /login.html HTTP/1.1
Host: 10.10.10.20
User-Agent: curl/7.88.1
Accept: */*

```
Every request ends with an empty line (CRLF CRLF = `\r\n\r\n`).

| Method | Idempotent? | Typical Use |
|---|---|---|
| **GET** | Yes | Retrieve resource (no side effects) |
| **POST** | No | Submit data (forms, logins, file uploads) |
| **HEAD** | Yes | Same as GET, but returns headers only |
| **PUT / PATCH**| Yes / No | Create or modify resource |
| **DELETE** | Yes | Remove resource |
| **OPTIONS** | Yes | Query server capabilities / CORS preflight |

### 1.2 The HTTP Response Format
```http
HTTP/1.1 200 OK
Date: Mon, 16 Oct 2026 15:30:00 GMT
Server: Apache/2.4.58 (Ubuntu)
Content-Type: text/html; charset=UTF-8
Content-Length: 245

<!doctype html>...
```

### Status Code Families:
- **1xx (Informational):** `101 Switching Protocols` (e.g. upgrading to WebSocket)
- **2xx (Success):** `200 OK`, `201 Created`, `204 No Content`
- **3xx (Redirection):** `301 Moved Permanently`, `302 Found`, `304 Not Modified`
- **4xx (Client Errors):** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
- **5xx (Server Errors):** `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`

---

## 2. HTTP/2 and HTTP/3 (QUIC)

| Feature | HTTP/1.1 | HTTP/2 (RFC 7540) | HTTP/3 (RFC 9114) |
|---|---|---|---|
| **Transport** | TCP (port 80/443) | TCP (port 443 with TLS ALPN) | **UDP (port 443 via QUIC)** |
| **Format** | Cleartext ASCII | Binary framing | Binary framing |
| **Multiplexing** | Head-of-line blocking | Multiple streams per TCP connection | Independent streams (no TCP HoL) |
| **Header Compression** | None | HPACK | QPACK |
| **Wireshark Display** | `http` | `http2` | `quic` / `http3` |

---

## 3. TLS (Transport Layer Security) 1.2 vs. 1.3

TLS encrypts application data (e.g., HTTP over TLS = HTTPS on **TCP port 443**).

### 3.1 TLS 1.2 Handshake (2 Round-Trip Times - 2 RTT)
```
Client                                                 Server
   ├────────── Client Hello (Ciphers, SNI) ──────────────►
   │◄───────── Server Hello (Chosen Cipher) ──────────────┤
   │◄───────── Certificate (X.509 Chain) ─────────────────┤
   │◄───────── Server Key Exchange (ECDHE parameters) ────┤
   │◄───────── Server Hello Done ─────────────────────────┤
   ├────────── Client Key Exchange ───────────────────────►
   ├────────── [Change Cipher Spec] + Finished ───────────►
   │◄───────── [Change Cipher Spec] + Finished ───────────┤
   ═══════════ ENCRYPTED APPLICATION DATA ═════════════════
```

### 3.2 TLS 1.3 Handshake (1 RTT - Modern Standard, RFC 8446)
TLS 1.3 eliminates obsolete insecure algorithms (MD5, SHA-1, RC4, DES, static RSA) and cuts handshake latency in half:
```
Client                                                 Server
   ├────────── Client Hello (Key Share + SNI) ───────────►
   │◄───────── Server Hello (Key Share chosen) ───────────┤
   │◄───────── {Encrypted Extensions} ────────────────────┤
   │◄───────── {Certificate} ─────────────────────────────┤
   │◄───────── {Certificate Verify} ──────────────────────┤
   │◄───────── {Finished} ────────────────────────────────┤
   ├────────── {Finished} ────────────────────────────────►
   ═══════════ ENCRYPTED APPLICATION DATA ═════════════════
```
*(Items inside `{braces}` are already encrypted using keys derived from the Client and Server Hello key shares!)*

---

## 4. What Analysts Can Still See in Encrypted Traffic

Even when HTTPS payload is encrypted, valuable metadata remains visible on the wire:

### 4.1 Server Name Indication (SNI)
In the cleartext **Client Hello** packet, the client specifies which hostname it wants:
- **Field:** `tls.handshake.extensions_server_name`
- **Forensic Value:** Reveals exactly which domain the user or malware is contacting (`cdn.evil-botnet.top`) before encryption begins!
*(Note: Encrypted Client Hello / ECH is emerging to encrypt SNI, but is not yet universally deployed).*

### 4.2 X.509 Server Certificate
In TLS 1.2, the certificate is sent in cleartext:
- **Common Name (CN)** & **Subject Alternative Names (SAN)**
- **Issuer / CA Name** (e.g. Let's Encrypt vs. DigiCert vs. Self-Signed)
- **Validity Dates** (Expired certificates or certificates created 10 minutes ago by attackers)

---

## 5. 🎯 Mission: Capture Cleartext HTTP vs Encrypted TLS

### Step 1: Sniff Cleartext Credentials
1. On Kali, start Wireshark on `eth0`, filter: `http`.
2. Post credentials to the Ubuntu intranet:
   ```bash
   curl -X POST http://10.10.10.20/login.html \
     -H "User-Agent: Mozilla/5.0 (Kali-Analyst)" \
     -d "username=cfo_alice&password=Winter2026Password!&token=88129"
   ```
3. In Wireshark:
   - Click the `POST /login.html` packet.
   - Right-click ➔ **Follow ➔ HTTP Stream**.
   - Note how the request, User-Agent, and credentials are completely visible in plaintext.

### Step 2: Inspect Encrypted TLS Metadata
1. On Kali, generate a TLS connection to an external site or local HTTPS server:
   ```bash
   curl -vk https://10.10.10.20/ 2>/dev/null || curl -sI https://www.google.com >/dev/null
   ```
2. Filter: `tls.handshake.type == 1`.
3. Expand: `TLSv1.3 Record Layer` ➔ `Handshake Protocol: Client Hello`.
4. Locate `Extension: server_name (len=...)` and expand `Server Name Indication extension`.
   - What hostname appears in the `Server Name:` field?

---

## 💼 Business Corner: Enterprise TLS Inspection (SSL Decryption)
Over **85% of corporate network traffic** and over **70% of malware communications** are now encrypted via TLS. 

If a company does not inspect encrypted traffic, their multi-million-euro Next-Gen Firewalls (Palo Alto, Fortinet) and Intrusion Detection Systems (Snort, Suricata) are effectively blind.

### How Corporate TLS Decryption (MITM) Works:
1. The company installs a private Enterprise Root CA certificate on all employee laptops via Active Directory Group Policy (GPO) or MDM.
2. When an employee browses to `https://bank.com`:
   - The corporate firewall intercepts the connection.
   - The firewall negotiates an encrypted TLS session with `bank.com` on the internet.
   - The firewall generates a **dynamic certificate** for `bank.com` signed by the corporate Enterprise Root CA, and establishes a separate encrypted TLS session with the employee's laptop.
   - The firewall inspects the unencrypted plaintext traffic inside memory for malware, credit card leaks (DLP), and exploits.

> ⚠️ **Compliance & Privacy Warning:** Under GDPR and German labour law (§88 TKG / §206 StGB), corporate TLS inspection **must** configure exclusion bypass lists for sensitive categories (Banking, Healthcare, Personal Webmail, Union websites).

---

## 🧠 Knowledge Check
1. Which HTTP status code family indicates a server-side error?
2. What major architectural advantage does TLS 1.3 provide over TLS 1.2 regarding handshake speed?
3. Where in an encrypted TLS session can a security analyst find the target website domain name in cleartext?
4. Why does Perfect Forward Secrecy (PFS) prevent decrypting past traffic even if an attacker later steals the server's private RSA key?

<details><summary>Answers</summary>

1. 5xx (e.g. 500 Internal Server Error, 502 Bad Gateway).
2. TLS 1.3 reduces the handshake to a single round-trip (1-RTT) compared to 2-RTT in TLS 1.2.
3. In the Client Hello packet inside the Server Name Indication (SNI) extension (`tls.handshake.extensions_server_name`).
4. PFS uses ephemeral Diffie-Hellman key exchange (ECDHE). Unique session keys are negotiated per session and discarded immediately after. The server's private RSA key is only used for authentication, not for data encryption.
</details>

---
⬅️ [05 DHCP](05-dhcp.md) | ➡️ [07 Legacy & Enterprise Protocols](07-legacy-and-enterprise-protocols.md)
