/**
 * Packet Ninja Academy - Main Application Logic
 * Pure Vanilla JavaScript (ES6+), Zero External Dependencies.
 */

(function () {
  'use strict';

  // State Management
  const STORAGE_KEY = 'packet_ninja_completed_worksheets';
  let completedWorksheets = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  let currentModuleId = 'mod-00';
  let currentWorksheetId = 'w-00-01';
  let activeDifficulty = 'all';

  // Wireshark Simulator State
  let selectedPacketId = 1;
  let activeDisplayFilter = '';

  // Handshake Simulator State
  let handshakeStep = 0;
  const handshakeSteps = [
    {
      step: 1,
      sender: 'Kali (Client)',
      receiver: 'Ubuntu (Server)',
      packet: 'SYN',
      seq: 'Seq=0 (ISN)',
      ack: 'Ack=0',
      clientState: 'SYN_SENT',
      serverState: 'LISTEN',
      flyerPos: '75%',
      flyerColor: '#9d4edd',
      desc: 'Step 1: Client initiates the connection by transmitting a TCP segment with the SYN (Synchronize) control flag set to synchronize initial sequence numbers.'
    },
    {
      step: 2,
      sender: 'Ubuntu (Server)',
      receiver: 'Kali (Client)',
      packet: 'SYN, ACK',
      seq: 'Seq=0',
      ack: 'Ack=1 (Client ISN + 1)',
      clientState: 'SYN_SENT',
      serverState: 'SYN_RCVD',
      flyerPos: '25%',
      flyerColor: '#00e5ff',
      desc: 'Step 2: Server responds with SYN-ACK, acknowledging the client’s sequence number (+1) and sending its own initial sequence number.'
    },
    {
      step: 3,
      sender: 'Kali (Client)',
      receiver: 'Ubuntu (Server)',
      packet: 'ACK',
      seq: 'Seq=1',
      ack: 'Ack=1 (Server ISN + 1)',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED',
      flyerPos: '75%',
      flyerColor: '#00ff9d',
      desc: 'Step 3: Client acknowledges the server’s SYN-ACK. The TCP 3-way handshake is now ESTABLISHED! Application data transfer can begin.'
    },
    {
      step: 4,
      sender: 'Kali (Client)',
      receiver: 'Ubuntu (Server)',
      packet: 'HTTP GET /',
      seq: 'Seq=1 (Len=140)',
      ack: 'Ack=1',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED',
      flyerPos: '75%',
      flyerColor: '#ffb703',
      desc: 'Step 4: Client transmits an HTTP GET request inside the established TCP session payload.'
    },
    {
      step: 5,
      sender: 'Ubuntu (Server)',
      receiver: 'Kali (Client)',
      packet: 'HTTP 200 OK',
      seq: 'Seq=1 (Len=850)',
      ack: 'Ack=141',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED',
      flyerPos: '25%',
      flyerColor: '#86efac',
      desc: 'Step 5: Server replies with HTTP 200 OK and web page HTML payload, acknowledging the received request bytes.'
    },
    {
      step: 6,
      sender: 'Kali (Client)',
      receiver: 'Ubuntu (Server)',
      packet: 'FIN, ACK',
      seq: 'Seq=141',
      ack: 'Ack=851',
      clientState: 'FIN_WAIT_1',
      serverState: 'CLOSE_WAIT',
      flyerPos: '75%',
      flyerColor: '#ff0055',
      desc: 'Step 6: Graceful Teardown. Client transmits a FIN packet to close the socket.'
    }
  ];

  // Exam State
  let examCurrentIndex = 0;
  let examUserAnswers = [];

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    renderSidebar();
    updateXpDisplay();
    loadModule(currentModuleId, currentWorksheetId);
    setupEventListeners();
    setupWiresharkDissector();
    setupCidrCalc();
    setupSnortBuilder();
  }

  // =========================================================================
  // XP & RANK SYSTEM
  // =========================================================================

  function calculateTotalXp() {
    let total = 0;
    window.COURSE_DATA.modules.forEach(m => {
      m.worksheets.forEach(w => {
        if (completedWorksheets.has(w.id)) {
          total += w.xp;
        }
      });
    });
    return total;
  }

  function getRank(xp) {
    const ranks = window.COURSE_DATA.ranks;
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (xp >= ranks[i].minXp) {
        return ranks[i];
      }
    }
    return ranks[0];
  }

  function updateXpDisplay() {
    const xp = calculateTotalXp();
    const rank = getRank(xp);

    const xpLabel = document.getElementById('user-xp-count');
    const rankLabel = document.getElementById('user-rank-name');
    const rankAvatar = document.getElementById('user-rank-avatar');
    const xpFill = document.getElementById('user-xp-bar');

    if (xpLabel) xpLabel.textContent = `${xp} XP`;
    if (rankLabel) rankLabel.textContent = `${rank.icon} ${rank.name}`;
    if (rankAvatar) rankAvatar.textContent = rank.icon;

    // Calculate next rank threshold
    const nextRank = window.COURSE_DATA.ranks.find(r => r.minXp > xp);
    if (nextRank && xpFill) {
      const pct = Math.min(100, Math.round((xp / nextRank.minXp) * 100));
      xpFill.style.width = `${pct}%`;
    } else if (xpFill) {
      xpFill.style.width = '100%';
    }
  }

  function toggleWorksheetComplete(wsId) {
    if (completedWorksheets.has(wsId)) {
      completedWorksheets.delete(wsId);
      showToast('Worksheet marked incomplete', 'info');
    } else {
      completedWorksheets.add(wsId);
      showToast('🎉 +XP Earned! Great job!', 'success');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedWorksheets)));
    updateXpDisplay();
    renderSidebar();
    renderWorksheetTabs(currentModuleId);
    updateCompleteButtonState(wsId);
  }

  function showToast(msg, type = 'success') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-box';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${type === 'success' ? '⚡' : 'ℹ️'}</span> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // SIDEBAR RENDERER
  // =========================================================================

  function renderSidebar() {
    const list = document.getElementById('module-nav-list');
    if (!list) return;

    list.innerHTML = '';
    const modules = window.COURSE_DATA.modules.filter(m => {
      if (activeDifficulty === 'all') return true;
      return m.levelClass === activeDifficulty;
    });

    modules.forEach(m => {
      const li = document.createElement('li');
      li.className = `module-nav-item ${m.id === currentModuleId ? 'active' : ''}`;
      li.dataset.moduleId = m.id;

      // Count completed
      const completedCount = m.worksheets.filter(w => completedWorksheets.has(w.id)).length;
      const totalCount = m.worksheets.length;
      const isAllDone = completedCount === totalCount && totalCount > 0;

      li.innerHTML = `
        <div class="module-item-left">
          <span class="module-badge-num">${m.num}</span>
          <div class="module-title-box">
            <div class="title">${m.icon} ${m.title}</div>
            <div class="meta">
              <span class="badge badge-${m.levelClass}">${m.level}</span>
              <span>• ${m.estTime}</span>
            </div>
          </div>
        </div>
        <div class="module-progress-circle" title="${completedCount}/${totalCount} completed">
          ${isAllDone ? '✅' : `${completedCount}/${totalCount}`}
        </div>
      `;

      li.addEventListener('click', () => {
        loadModule(m.id);
      });

      list.appendChild(li);
    });
  }

  // =========================================================================
  // MODULE & WORKSHEET VIEWPORT
  // =========================================================================

  function loadModule(modId, targetWsId = null) {
    currentModuleId = modId;
    const mod = window.COURSE_DATA.modules.find(m => m.id === modId);
    if (!mod) return;

    // Select first worksheet if not specified
    if (!targetWsId) {
      targetWsId = mod.worksheets[0]?.id || '';
    }
    currentWorksheetId = targetWsId;

    // Render Hero Card
    const heroContainer = document.getElementById('module-hero-container');
    if (heroContainer) {
      heroContainer.innerHTML = `
        <div class="module-hero">
          <div class="module-hero-top">
            <div class="module-hero-title-group">
              <div class="module-hero-icon">${mod.icon}</div>
              <div class="module-hero-heading">
                <h2>Module ${mod.num}: ${mod.title}</h2>
                <div class="module-tags">
                  <span class="badge badge-${mod.levelClass}">${mod.level}</span>
                  <span class="badge" style="background: rgba(0, 229, 255, 0.1); color: var(--cyan); border: 1px solid var(--cyan);">⏱️ ${mod.estTime}</span>
                  <span class="badge" style="background: rgba(157, 78, 221, 0.15); color: #d8b4fe; border: 1px solid var(--purple);">💎 ${mod.totalXp} XP Available</span>
                </div>
              </div>
            </div>
          </div>
          <p class="desc">${mod.description}</p>
        </div>
      `;
    }

    renderWorksheetTabs(modId);
    renderWorksheetContent(modId, currentWorksheetId);
    renderSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderWorksheetTabs(modId) {
    const container = document.getElementById('worksheet-tabs-bar');
    if (!container) return;

    const mod = window.COURSE_DATA.modules.find(m => m.id === modId);
    if (!mod) return;

    container.innerHTML = '';
    mod.worksheets.forEach(w => {
      const btn = document.createElement('button');
      const isDone = completedWorksheets.has(w.id);
      btn.className = `worksheet-tab-btn ${w.id === currentWorksheetId ? 'active' : ''} ${isDone ? 'completed' : ''}`;
      btn.innerHTML = `
        <span class="check-status">${isDone ? '✓' : ''}</span>
        <span>${w.title}</span>
      `;
      btn.addEventListener('click', () => {
        currentWorksheetId = w.id;
        renderWorksheetTabs(modId);
        renderWorksheetContent(modId, w.id);
      });
      container.appendChild(btn);
    });
  }

  function renderWorksheetContent(modId, wsId) {
    const container = document.getElementById('worksheet-body-container');
    if (!container) return;

    const mod = window.COURSE_DATA.modules.find(m => m.id === modId);
    if (!mod) return;
    const ws = mod.worksheets.find(w => w.id === wsId);
    if (!ws) return;

    const isDone = completedWorksheets.has(ws.id);

    // Objectives HTML
    const objectivesHtml = ws.objectives && ws.objectives.length > 0 ? `
      <div class="objectives-card">
        <h4>🎯 Learning Objectives</h4>
        <ul>
          ${ws.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    // Mission HTML
    const missionHtml = ws.mission ? `
      <div class="mission-card">
        <h4>⚔️ Mission: ${ws.mission.title}</h4>
        <ol>
          ${ws.mission.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>
    ` : '';

    // Knowledge Check HTML
    const quizHtml = ws.knowledgeCheck ? `
      <div class="quiz-card" id="quiz-${ws.id}">
        <h4>🧠 Knowledge Check</h4>
        <div class="quiz-question">${ws.knowledgeCheck.question}</div>
        <div class="quiz-options">
          ${ws.knowledgeCheck.options.map((opt, idx) => `
            <button class="quiz-option-btn" data-index="${idx}">${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-explanation" id="quiz-exp-${ws.id}">
          <strong>💡 Explanation:</strong> ${ws.knowledgeCheck.explanation}
        </div>
      </div>
    ` : '';

    // Find next / prev worksheets
    const wsIdx = mod.worksheets.findIndex(w => w.id === wsId);
    const prevWs = wsIdx > 0 ? mod.worksheets[wsIdx - 1] : null;
    const nextWs = wsIdx < mod.worksheets.length - 1 ? mod.worksheets[wsIdx + 1] : null;

    container.innerHTML = `
      <article class="worksheet-content">
        <header class="worksheet-header">
          <h3>${ws.title}</h3>
          <span class="xp-pill">+${ws.xp} XP</span>
        </header>

        ${objectivesHtml}

        <div class="worksheet-body">
          ${ws.content}
        </div>

        ${missionHtml}
        ${quizHtml}

        <footer class="worksheet-footer">
          <div>
            ${prevWs ? `<button class="btn btn-secondary" id="btn-prev-ws">← Previous (${prevWs.title.split(':')[0]})</button>` : ''}
          </div>
          <div>
            <button class="complete-toggle-btn ${isDone ? 'completed' : ''}" id="btn-toggle-complete">
              <span>${isDone ? '✔ Completed' : 'Mark as Completed'}</span>
              <span>(+${ws.xp} XP)</span>
            </button>
          </div>
          <div>
            ${nextWs ? `<button class="btn btn-primary" id="btn-next-ws">Next (${nextWs.title.split(':')[0]}) →</button>` : ''}
          </div>
        </footer>
      </article>
    `;

    // Hook quiz buttons
    if (ws.knowledgeCheck) {
      const qCard = document.getElementById(`quiz-${ws.id}`);
      const expBox = document.getElementById(`quiz-exp-${ws.id}`);
      if (qCard) {
        qCard.querySelectorAll('.quiz-option-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const picked = parseInt(e.target.dataset.index, 10);
            const correct = ws.knowledgeCheck.correct;

            qCard.querySelectorAll('.quiz-option-btn').forEach((b, i) => {
              b.disabled = true;
              if (i === correct) b.classList.add('correct');
              else if (i === picked) b.classList.add('wrong');
            });

            if (expBox) expBox.style.display = 'block';
            if (picked === correct) {
              showToast('Correct! Great technical intuition! 🎯', 'success');
            } else {
              showToast('Incorrect — review the explanation below!', 'info');
            }
          });
        });
      }
    }

    // Hook Next / Prev buttons
    const btnPrev = document.getElementById('btn-prev-ws');
    if (btnPrev && prevWs) {
      btnPrev.addEventListener('click', () => {
        currentWorksheetId = prevWs.id;
        renderWorksheetTabs(modId);
        renderWorksheetContent(modId, prevWs.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const btnNext = document.getElementById('btn-next-ws');
    if (btnNext && nextWs) {
      btnNext.addEventListener('click', () => {
        currentWorksheetId = nextWs.id;
        renderWorksheetTabs(modId);
        renderWorksheetContent(modId, nextWs.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Hook Complete Toggle Button
    const btnToggle = document.getElementById('btn-toggle-complete');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        toggleWorksheetComplete(ws.id);
      });
    }
  }

  function updateCompleteButtonState(wsId) {
    const btn = document.getElementById('btn-toggle-complete');
    if (!btn) return;
    const isDone = completedWorksheets.has(wsId);
    if (isDone) {
      btn.classList.add('completed');
      btn.querySelector('span:first-child').textContent = '✔ Completed';
    } else {
      btn.classList.remove('completed');
      btn.querySelector('span:first-child').textContent = 'Mark as Completed';
    }
  }

  // =========================================================================
  // INTERACTIVE WIRESHARK DISSECTOR & FILTER ENGINE
  // =========================================================================

  function setupWiresharkDissector() {
    renderPacketList();

    // Filter input
    const filterInput = document.getElementById('ws-filter-input');
    const filterApply = document.getElementById('ws-filter-apply');
    const filterClear = document.getElementById('ws-filter-clear');

    if (filterInput) {
      filterInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          activeDisplayFilter = filterInput.value.trim().toLowerCase();
          renderPacketList();
        }
      });
    }

    if (filterApply && filterInput) {
      filterApply.addEventListener('click', () => {
        activeDisplayFilter = filterInput.value.trim().toLowerCase();
        renderPacketList();
      });
    }

    if (filterClear && filterInput) {
      filterClear.addEventListener('click', () => {
        filterInput.value = '';
        activeDisplayFilter = '';
        renderPacketList();
      });
    }

    // Filter preset chips
    document.querySelectorAll('.ws-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter || chip.textContent.trim();
        if (filterInput) {
          filterInput.value = filter;
          activeDisplayFilter = filter.toLowerCase();
          renderPacketList();
        }
      });
    });
  }

  function matchPacketFilter(pkt, filter) {
    if (!filter) return true;
    const f = filter.toLowerCase();

    if (f === 'http') return pkt.protocol.toLowerCase() === 'http';
    if (f === 'tcp') return pkt.protocol.toLowerCase() === 'tcp';
    if (f === 'udp') return pkt.protocol.toLowerCase() === 'udp';
    if (f === 'arp') return pkt.protocol.toLowerCase() === 'arp';
    if (f === 'dns') return pkt.protocol.toLowerCase() === 'dns';

    if (f.includes('syn')) return pkt.info.includes('SYN');
    if (f.includes('post')) return pkt.info.includes('POST');
    if (f.includes('10.10.10.20')) return pkt.source === '10.10.10.20' || pkt.dest === '10.10.10.20';
    if (f.includes('10.10.10.30')) return pkt.source === '10.10.10.30' || pkt.dest === '10.10.10.30';

    // General text match
    return (
      pkt.protocol.toLowerCase().includes(f) ||
      pkt.source.toLowerCase().includes(f) ||
      pkt.dest.toLowerCase().includes(f) ||
      pkt.info.toLowerCase().includes(f)
    );
  }

  function renderPacketList() {
    const tbody = document.getElementById('ws-packet-tbody');
    if (!tbody) return;

    const filtered = window.COURSE_DATA.pcapFrames.filter(p => matchPacketFilter(p, activeDisplayFilter));
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">No packets match display filter "${activeDisplayFilter}"</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = `ws-packet-row ${p.id === selectedPacketId ? 'selected' : ''}`;
      tr.dataset.packetId = p.id;

      let protoClass = 'proto-tcp';
      if (p.protocol === 'HTTP') protoClass = 'proto-http';
      else if (p.protocol === 'DNS') protoClass = 'proto-dns';
      else if (p.protocol === 'ARP') protoClass = 'proto-arp';

      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.time}</td>
        <td>${p.source}</td>
        <td>${p.dest}</td>
        <td class="${protoClass}"><strong>${p.protocol}</strong></td>
        <td>${p.length}</td>
        <td>${p.info}</td>
      `;

      tr.addEventListener('click', () => {
        selectedPacketId = p.id;
        renderPacketList();
        renderPacketDetails(p);
      });

      tbody.appendChild(tr);
    });

    // Select current packet or first
    const activePkt = filtered.find(p => p.id === selectedPacketId) || filtered[0];
    if (activePkt) {
      renderPacketDetails(activePkt);
    }
  }

  function renderPacketDetails(pkt) {
    const detailsPane = document.getElementById('ws-details-tree');
    const hexPane = document.getElementById('ws-hex-dump');

    if (detailsPane) {
      detailsPane.innerHTML = `
        <div class="ws-tree-item">${pkt.details.frame}</div>
        <div class="ws-tree-item">${pkt.details.ethernet}</div>
        <div class="ws-tree-item">${pkt.details.ip}</div>
        <div class="ws-tree-item">${pkt.details.transport}</div>
        <div class="ws-tree-item" style="color: #86efac; white-space: pre-wrap;">${pkt.details.app}</div>
      `;
    }

    if (hexPane) {
      hexPane.textContent = pkt.hex;
    }
  }

  // =========================================================================
  // TCP 3-WAY HANDSHAKE SIMULATOR
  // =========================================================================

  function renderHandshakeStep(idx) {
    if (idx < 0) idx = 0;
    if (idx >= handshakeSteps.length) idx = handshakeSteps.length - 1;
    handshakeStep = idx;

    const data = handshakeSteps[idx];
    const flyer = document.getElementById('hs-flyer');
    const stepLabel = document.getElementById('hs-step-label');
    const descBox = document.getElementById('hs-desc');
    const clientState = document.getElementById('hs-client-state');
    const serverState = document.getElementById('hs-server-state');

    if (flyer) {
      flyer.textContent = `${data.packet} (${data.seq})`;
      flyer.style.left = data.flyerPos;
      flyer.style.background = data.flyerColor;
    }

    if (stepLabel) stepLabel.textContent = `Step ${data.step} of ${handshakeSteps.length}: ${data.packet}`;
    if (descBox) descBox.textContent = data.desc;
    if (clientState) clientState.textContent = data.clientState;
    if (serverState) serverState.textContent = data.serverState;
  }

  // =========================================================================
  // CIDR & SUBNET CALCULATOR
  // =========================================================================

  function setupCidrCalc() {
    const ipInput = document.getElementById('calc-ip');
    const prefixInput = document.getElementById('calc-prefix');
    const btnCalc = document.getElementById('calc-btn');

    function calculate() {
      const ip = (ipInput?.value || '10.10.10.0').trim();
      const prefix = parseInt(prefixInput?.value || '24', 10);

      const parts = ip.split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(isNaN) || prefix < 0 || prefix > 32) return;

      // Netmask
      let maskInt = 0;
      for (let i = 0; i < prefix; i++) {
        maskInt |= (1 << (31 - i));
      }
      maskInt = maskInt >>> 0;

      const maskParts = [
        (maskInt >>> 24) & 255,
        (maskInt >>> 16) & 255,
        (maskInt >>> 8) & 255,
        maskInt & 255
      ];
      const netmaskStr = maskParts.join('.');

      // Wildcard
      const wildcardStr = maskParts.map(p => 255 - p).join('.');

      // IP Int
      const ipInt = (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0);
      const netInt = (ipInt & maskInt) >>> 0;
      const bcastInt = (netInt | (~maskInt >>> 0)) >>> 0;

      const netStr = [(netInt >>> 24) & 255, (netInt >>> 16) & 255, (netInt >>> 8) & 255, netInt & 255].join('.');
      const bcastStr = [(bcastInt >>> 24) & 255, (bcastInt >>> 16) & 255, (bcastInt >>> 8) & 255, bcastInt & 255].join('.');

      let firstHostStr = 'N/A';
      let lastHostStr = 'N/A';
      let usableHosts = 0;

      if (prefix === 31) {
        usableHosts = 2; // Point-to-point RFC 3021
        firstHostStr = netStr;
        lastHostStr = bcastStr;
      } else if (prefix === 32) {
        usableHosts = 1;
        firstHostStr = netStr;
        lastHostStr = netStr;
      } else {
        usableHosts = Math.pow(2, 32 - prefix) - 2;
        const firstInt = netInt + 1;
        const lastInt = bcastInt - 1;
        firstHostStr = [(firstInt >>> 24) & 255, (firstInt >>> 16) & 255, (firstInt >>> 8) & 255, firstInt & 255].join('.');
        lastHostStr = [(lastInt >>> 24) & 255, (lastInt >>> 16) & 255, (lastInt >>> 8) & 255, lastInt & 255].join('.');
      }

      // Update table
      setRes('res-netmask', netmaskStr);
      setRes('res-wildcard', wildcardStr);
      setRes('res-network', `${netStr}/${prefix}`);
      setRes('res-broadcast', bcastStr);
      setRes('res-hosts', usableHosts.toLocaleString());
      setRes('res-range', `${firstHostStr} – ${lastHostStr}`);
    }

    function setRes(id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    if (btnCalc) btnCalc.addEventListener('click', calculate);
    if (ipInput) ipInput.addEventListener('input', calculate);
    if (prefixInput) prefixInput.addEventListener('change', calculate);
    calculate();
  }

  // =========================================================================
  // SNORT 3 RULE GENERATOR
  // =========================================================================

  function setupSnortBuilder() {
    const actionEl = document.getElementById('snort-action');
    const protoEl = document.getElementById('snort-proto');
    const srcIpEl = document.getElementById('snort-src-ip');
    const srcPortEl = document.getElementById('snort-src-port');
    const dstIpEl = document.getElementById('snort-dst-ip');
    const dstPortEl = document.getElementById('snort-dst-port');
    const msgEl = document.getElementById('snort-msg');
    const contentEl = document.getElementById('snort-content');
    const sidEl = document.getElementById('snort-sid');
    const outputEl = document.getElementById('snort-rule-output');

    function updateRule() {
      const action = actionEl?.value || 'alert';
      const proto = protoEl?.value || 'tcp';
      const srcIp = srcIpEl?.value || '$EXTERNAL_NET';
      const srcPort = srcPortEl?.value || 'any';
      const dstIp = dstIpEl?.value || '$HOME_NET';
      const dstPort = dstPortEl?.value || '80';
      const msg = msgEl?.value || 'WEB-ATTACK Potential SQL Injection';
      const content = contentEl?.value || 'UNION SELECT';
      const sid = sidEl?.value || '1000001';

      const rule = `${action} ${proto} ${srcIp} ${srcPort} -> ${dstIp} ${dstPort} (\n    msg:"${msg}";\n    flow:to_server,established;\n    content:"${content}";\n    nocase;\n    sid:${sid};\n    rev:1;\n    classtype:web-application-attack;\n)`;

      if (outputEl) outputEl.textContent = rule;
    }

    [actionEl, protoEl, srcIpEl, srcPortEl, dstIpEl, dstPortEl, msgEl, contentEl, sidEl].forEach(el => {
      if (el) el.addEventListener('input', updateRule);
    });

    const btnCopy = document.getElementById('snort-copy-btn');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (outputEl) {
          navigator.clipboard.writeText(outputEl.textContent);
          showToast('Snort rule copied to clipboard! 📋', 'success');
        }
      });
    }

    updateRule();
  }

  // =========================================================================
  // INTERACTIVE EXAM SIMULATOR
  // =========================================================================

  function setupExam() {
    examCurrentIndex = 0;
    examUserAnswers = new Array(window.COURSE_DATA.examQuestions.length).fill(null);
    renderExamQuestion();
  }

  function renderExamQuestion() {
    const qContainer = document.getElementById('exam-question-box');
    const qCounter = document.getElementById('exam-progress-counter');
    const total = window.COURSE_DATA.examQuestions.length;
    const currentQ = window.COURSE_DATA.examQuestions[examCurrentIndex];

    if (!qContainer || !currentQ) return;

    if (qCounter) qCounter.textContent = `Question ${examCurrentIndex + 1} of ${total}`;

    const selectedAns = examUserAnswers[examCurrentIndex];

    qContainer.innerHTML = `
      <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 1.25rem;">${currentQ.q}</h4>
      <div class="quiz-options">
        ${currentQ.options.map((opt, i) => `
          <button class="quiz-option-btn ${selectedAns === i ? 'correct' : ''}" data-ans-idx="${i}">
            ${String.fromCharCode(65 + i)}. ${opt}
          </button>
        `).join('')}
      </div>
    `;

    qContainer.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const picked = parseInt(e.target.dataset.ansIdx, 10);
        examUserAnswers[examCurrentIndex] = picked;
        renderExamQuestion();
      });
    });

    // Button states
    const btnPrev = document.getElementById('exam-btn-prev');
    const btnNext = document.getElementById('exam-btn-next');
    const btnSubmit = document.getElementById('exam-btn-submit');

    if (btnPrev) btnPrev.style.display = examCurrentIndex > 0 ? 'inline-flex' : 'none';
    if (btnNext) btnNext.style.display = examCurrentIndex < total - 1 ? 'inline-flex' : 'none';
    if (btnSubmit) btnSubmit.style.display = examCurrentIndex === total - 1 ? 'inline-flex' : 'none';
  }

  function gradeExam() {
    let score = 0;
    const total = window.COURSE_DATA.examQuestions.length;

    window.COURSE_DATA.examQuestions.forEach((q, idx) => {
      if (examUserAnswers[idx] === q.correct) {
        score++;
      }
    });

    const pct = Math.round((score / total) * 100);
    const passed = pct >= 80;

    const modalBody = document.querySelector('#modal-exam .modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">${passed ? '🏆' : '📚'}</div>
          <h2 style="font-size: 1.8rem; color: #fff; margin-bottom: 0.5rem;">
            ${passed ? 'Congratulations, Certified Packet Ninja!' : 'Examination Attempt Complete'}
          </h2>
          <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Your Score: <strong style="color: ${passed ? 'var(--emerald)' : 'var(--amber)'}; font-size: 1.3rem;">${score} / ${total} (${pct}%)</strong>
          </p>
          <p style="max-width: 500px; margin: 0 auto 2rem; color: #cbd5e1;">
            ${passed 
              ? 'You demonstrated comprehensive mastery across TCP/IP architecture, Wireshark dissection, Nmap scanning mechanics, and Snort IDS rule logic.' 
              : 'Passing score is 80%. Review Modules 02, 03, and 07, then retake the exam to earn your certificate!'}
          </p>
          <button class="btn btn-primary" onclick="window.closeAllModals()">Close Examination</button>
        </div>
      `;
    }

    if (passed) {
      showToast('🎉 Final Exam Passed! Certified Packet Ninja Rank Awarded!', 'success');
    }
  }

  // =========================================================================
  // GLOSSARY SEARCH MODAL
  // =========================================================================

  function renderGlossary(filterCategory = 'all', searchQuery = '') {
    const list = document.getElementById('glossary-list');
    if (!list) return;

    let items = window.COURSE_DATA.glossary;
    if (filterCategory !== 'all') {
      items = items.filter(g => g.category.toLowerCase() === filterCategory.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
    }

    list.innerHTML = items.map(g => `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 0.6rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <strong style="color: var(--cyan); font-size: 0.95rem;">${g.term}</strong>
          <span class="badge" style="background: rgba(157, 78, 221, 0.2); color: #d8b4fe;">${g.category}</span>
        </div>
        <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5;">${g.def}</p>
      </div>
    `).join('');
  }

  // =========================================================================
  // GLOBAL SEARCH ENGINE
  // =========================================================================

  function setupSearch() {
    const searchInput = document.getElementById('global-search-input');
    const resultsOverlay = document.getElementById('search-results-overlay');
    if (!searchInput || !resultsOverlay) return;

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        resultsOverlay.style.display = 'none';
        return;
      }

      const results = [];

      window.COURSE_DATA.modules.forEach(m => {
        m.worksheets.forEach(w => {
          if (w.title.toLowerCase().includes(q) || (w.content && w.content.toLowerCase().includes(q))) {
            results.push({
              title: w.title,
              moduleTitle: `Module ${m.num}: ${m.title}`,
              moduleId: m.id,
              wsId: w.id
            });
          }
        });
      });

      if (results.length === 0) {
        resultsOverlay.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No lessons found matching "${q}"</div>`;
      } else {
        resultsOverlay.innerHTML = results.slice(0, 8).map(r => `
          <div class="search-result-item" data-mod-id="${r.moduleId}" data-ws-id="${r.wsId}">
            <div class="item-title">${r.title}</div>
            <div class="item-module">${r.moduleTitle}</div>
          </div>
        `).join('');

        resultsOverlay.querySelectorAll('.search-result-item').forEach(el => {
          el.addEventListener('click', () => {
            const mId = el.dataset.modId;
            const wId = el.dataset.wsId;
            loadModule(mId, wId);
            resultsOverlay.style.display = 'none';
            searchInput.value = '';
          });
        });
      }

      resultsOverlay.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsOverlay.contains(e.target)) {
        resultsOverlay.style.display = 'none';
      }
    });
  }

  // =========================================================================
  // EVENT LISTENERS & MODAL HANDLERS
  // =========================================================================

  function setupEventListeners() {
    setupSearch();

    // Difficulty filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeDifficulty = pill.dataset.filter || 'all';
        renderSidebar();
      });
    });

    // Modals
    window.openModal = function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('active');
    };

    window.closeAllModals = function () {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    };

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', window.closeAllModals);
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) window.closeAllModals();
      });
    });

    // Top action buttons
    document.getElementById('nav-btn-dissector')?.addEventListener('click', () => window.openModal('modal-dissector'));
    document.getElementById('nav-btn-handshake')?.addEventListener('click', () => {
      window.openModal('modal-handshake');
      renderHandshakeStep(0);
    });
    document.getElementById('nav-btn-calc')?.addEventListener('click', () => window.openModal('modal-calc'));
    document.getElementById('nav-btn-snort')?.addEventListener('click', () => window.openModal('modal-snort'));
    document.getElementById('nav-btn-glossary')?.addEventListener('click', () => {
      window.openModal('modal-glossary');
      renderGlossary();
    });
    document.getElementById('nav-btn-cheatsheet')?.addEventListener('click', () => window.openModal('modal-cheatsheet'));
    document.getElementById('nav-btn-exam')?.addEventListener('click', () => {
      setupExam();
      window.openModal('modal-exam');
    });

    // Handshake buttons
    document.getElementById('hs-btn-prev')?.addEventListener('click', () => renderHandshakeStep(handshakeStep - 1));
    document.getElementById('hs-btn-next')?.addEventListener('click', () => renderHandshakeStep(handshakeStep + 1));
    document.getElementById('hs-btn-reset')?.addEventListener('click', () => renderHandshakeStep(0));

    // Exam buttons
    document.getElementById('exam-btn-prev')?.addEventListener('click', () => {
      if (examCurrentIndex > 0) {
        examCurrentIndex--;
        renderExamQuestion();
      }
    });

    document.getElementById('exam-btn-next')?.addEventListener('click', () => {
      if (examCurrentIndex < window.COURSE_DATA.examQuestions.length - 1) {
        examCurrentIndex++;
        renderExamQuestion();
      }
    });

    document.getElementById('exam-btn-submit')?.addEventListener('click', gradeExam);

    // Glossary category filter
    const glossFilter = document.getElementById('glossary-category-select');
    const glossSearch = document.getElementById('glossary-search-input');
    if (glossFilter) {
      glossFilter.addEventListener('change', () => {
        renderGlossary(glossFilter.value, glossSearch?.value || '');
      });
    }
    if (glossSearch) {
      glossSearch.addEventListener('input', () => {
        renderGlossary(glossFilter?.value || 'all', glossSearch.value);
      });
    }
  }

})();
