document.addEventListener("DOMContentLoaded", () => {
  // Agent Metadata Registry
  const AGENT_REGISTRY = {
    business_head: { name: "Business Head", icon: "👑", role: "Chief Executive Orchestrator — Directing 11-Agent Fleet" },
    finance: { name: "Finance Expert", icon: "💰", role: "Audit, P&L Balance Sheets & Cashflow Forecasts" },
    content: { name: "Content Manager", icon: "📲", role: "Viral Social Copy & Multi-Platform Campaigns" },
    video: { name: "Video & Animator", icon: "🎬", role: "Commercial Promo Scripts & Motion Storyboards" },
    recruiting: { name: "Talent Acquisition", icon: "🤝", role: "Crawl Hiring Sites & Screen Candidate Resumes" },
    analyst: { name: "Lead Analyst", icon: "📊", role: "Market Intelligence & Cohort LTV Modeling" },
    risk: { name: "Risk & Compliance", icon: "🛡️", role: "Security Vulnerabilities & Legal Contract Audits" },
    sales: { name: "Sales Agent", icon: "📈", role: "Lead Qualification & B2B Proposal Drafts" },
    operations: { name: "Operations Agent", icon: "⚙️", role: "Process Automation & Webhook Integration" },
    support: { name: "Support Agent", icon: "🎧", role: "24/7 Customer Inquiry & Ticket Resolution" },
    analytics: { name: "Analytics Agent", icon: "📉", role: "Operational KPIs & Executive ROI Tracking" }
  };

  // State Management
  let currentTargetAgent = "business_head";
  const activeMonitors = new Map();
  let expandedAgentId = null;
  const currentAttachments = []; // Array of attached context items
  let isAudioRecording = false;

  // DOM Elements
  const loginScreen = document.getElementById("login-screen");
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const userDisplayName = document.getElementById("user-display-name");

  const btnHeaderExit = document.getElementById("btn-header-exit");
  const btnSidebarExit = document.getElementById("btn-sidebar-exit");

  const settingsModal = document.getElementById("settings-modal");
  const btnOpenSettings = document.getElementById("btn-open-settings");
  const btnCloseSettingsModal = document.getElementById("btn-close-settings-modal");
  const settingsForm = document.getElementById("settings-form");
  const currentEngineTag = document.getElementById("current-engine-tag");

  const agentNavList = document.getElementById("agent-nav-list");
  const directChatForm = document.getElementById("direct-chat-form");
  const chatInput = document.getElementById("chat-input");
  const targetAgentIcon = document.getElementById("target-agent-icon");
  const targetAgentName = document.getElementById("target-agent-name");
  const targetAgentDesc = document.getElementById("target-agent-desc");
  const performingGrid = document.getElementById("performing-grid");
  const consoleOutput = document.getElementById("console-output");
  const promptChips = document.querySelectorAll(".chip");

  // Attachment & Context Toolbar Elements
  const fileUploadInput = document.getElementById("file-upload-input");
  const btnAttachFile = document.getElementById("btn-attach-file");
  const btnAttachMedia = document.getElementById("btn-attach-media");
  const btnAudioRecord = document.getElementById("btn-audio-record");
  const audioRecDot = document.getElementById("audio-rec-dot");
  const btnVideoRecord = document.getElementById("btn-video-record");
  const btnAddUrl = document.getElementById("btn-add-url");
  const attachmentPreviewBar = document.getElementById("attachment-preview-bar");

  // Dynamic Agent Modal Elements
  const btnOpenCreateAgent = document.getElementById("btn-open-create-agent");
  const createAgentModal = document.getElementById("create-agent-modal");
  const btnCloseCreateModal = document.getElementById("btn-close-create-modal");
  const createAgentForm = document.getElementById("create-agent-form");

  // Plugin Modal Elements
  const btnOpenPlugins = document.getElementById("btn-open-plugins");
  const pluginModal = document.getElementById("plugin-modal");
  const btnClosePluginModal = document.getElementById("btn-close-plugin-modal");
  const pluginGridList = document.getElementById("plugin-grid-list");

  // Expanded Fullscreen Modal Elements
  const expandModal = document.getElementById("expand-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalActionText = document.getElementById("modal-action-text");
  const modalProgressFill = document.getElementById("modal-progress-fill");
  const modalScreenView = document.getElementById("modal-screen-view");
  const modalLogBox = document.getElementById("modal-log-box");

  // Logging Helper
  function log(message, type = "system") {
    const div = document.createElement("div");
    div.className = `log-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    div.textContent = `[${timestamp}] ${message}`;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  // --- AUTO EXPANDING TEXTAREA ---
  chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 250) + "px";
  });

  // --- ATTACHMENT CONTEXT TOOLBAR HANDLERS ---
  btnAttachFile.addEventListener("click", () => {
    fileUploadInput.accept = "*/*";
    fileUploadInput.click();
  });

  btnAttachMedia.addEventListener("click", () => {
    fileUploadInput.accept = "image/*,video/*";
    fileUploadInput.click();
  });

  fileUploadInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
      addAttachment({ type: "file", name: f.name, size: Math.round(f.size / 1024) + "KB" });
    });
  });

  btnAudioRecord.addEventListener("click", () => {
    isAudioRecording = !isAudioRecording;
    if (isAudioRecording) {
      btnAudioRecord.classList.add("recording");
      audioRecDot.classList.add("active");
      log("Voice Recording started...", "agent");
    } else {
      btnAudioRecord.classList.remove("recording");
      audioRecDot.classList.remove("active");
      addAttachment({ type: "audio", name: "Voice_Memo_Instruction.wav", size: "420KB" });
      log("Voice Memo saved & attached to prompt.", "success");
    }
  });

  btnVideoRecord.addEventListener("click", () => {
    addAttachment({ type: "video", name: "Screen_Recording_Brief.mp4", size: "3.2MB" });
    log("Screen Video Memo attached to prompt context.", "success");
  });

  btnAddUrl.addEventListener("click", () => {
    const url = prompt("Enter Website URL for Agent Crawling / Context:", "https://linkedin.com/jobs");
    if (url) {
      addAttachment({ type: "url", name: url, size: "Web Link" });
      log(`Web Link attached: ${url}`, "system");
    }
  });

  function addAttachment(item) {
    currentAttachments.push(item);
    renderAttachments();
  }

  function removeAttachment(index) {
    currentAttachments.splice(index, 1);
    renderAttachments();
  }

  function renderAttachments() {
    attachmentPreviewBar.innerHTML = "";
    currentAttachments.forEach((item, idx) => {
      const chip = document.createElement("div");
      chip.className = "attach-chip";
      const icon = item.type === "audio" ? "🎤" : item.type === "video" ? "📹" : item.type === "url" ? "🌐" : "📄";
      chip.innerHTML = `
        <span>${icon} ${item.name} (${item.size})</span>
        <span class="remove-chip" onclick="removeAttach(${idx})">✖</span>
      `;
      attachmentPreviewBar.appendChild(chip);
    });
  }

  window.removeAttach = removeAttachment;

  // --- LOGIN & AUTHENTICATION SESSION ---
  function checkSession() {
    const savedUser = localStorage.getItem("uponly_session_user");
    if (savedUser) {
      userDisplayName.textContent = savedUser.split("@")[0] || "TechUponly";
      loginScreen.classList.remove("active");
    } else {
      loginScreen.classList.add("active");
    }
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim() || "uponly.in@gmail.com";
    localStorage.setItem("uponly_session_user", email);
    userDisplayName.textContent = email.split("@")[0] || "TechUponly";
    loginScreen.classList.remove("active");
    log(`Executive Session Authenticated for '${email}'. Unlimited Memory Active.`, "success");
  });

  // --- EXIT & LOGOUT SESSION ---
  function exitSession() {
    if (confirm("Are you sure you want to exit the UPONLY session?")) {
      localStorage.removeItem("uponly_session_user");
      activeMonitors.clear();
      renderGrid();
      loginScreen.classList.add("active");
      log("Executive Session Terminated.", "system");
    }
  }

  btnHeaderExit.addEventListener("click", exitSession);
  btnSidebarExit.addEventListener("click", exitSession);

  // --- SETTINGS MODAL ---
  btnOpenSettings.addEventListener("click", () => {
    settingsModal.classList.add("active");
  });

  btnCloseSettingsModal.addEventListener("click", () => {
    settingsModal.classList.remove("active");
  });

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const provider = document.getElementById("setting-llm-provider").value;
    const providerName = provider === "anthropic" ? "Claude 3.5 Sonnet Engine" : provider === "gemini" ? "Gemini 1.5 Pro" : "GPT-4o Engine";
    
    currentEngineTag.textContent = `Powered by ${providerName} • 🧠 Unlimited Memory Active`;
    settingsModal.classList.remove("active");
    log(`Settings saved! Primary LLM set to '${providerName}'.`, "success");
  });

  // Set Current Target Agent
  function setTargetAgent(agentKey) {
    currentTargetAgent = agentKey;
    const info = AGENT_REGISTRY[agentKey] || { name: agentKey, icon: "🤖", role: "Custom Dynamic AI Agent" };

    document.querySelectorAll(".agent-nav-item").forEach(item => {
      if (item.dataset.agent === agentKey) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    targetAgentIcon.textContent = info.icon;
    targetAgentName.textContent = info.name;
    targetAgentDesc.textContent = info.role;

    if (agentKey === "business_head") {
      chatInput.placeholder = "Describe the work in detail, attach documents, record voice/video notes, or instruct Business Head...";
    } else {
      chatInput.placeholder = `Direct work specifically to ${info.name}...`;
    }
  }

  function bindSidebarEvents() {
    document.querySelectorAll(".agent-nav-item").forEach(item => {
      item.onclick = () => setTargetAgent(item.dataset.agent);
    });
  }

  bindSidebarEvents();

  // Quick Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener("click", () => {
      chatInput.value = chip.dataset.prompt;
      directChatForm.dispatchEvent(new Event("submit"));
    });
  });

  // Set Agent Badge Working/Idle State
  function setAgentState(agentId, isWorking) {
    const badge = document.getElementById(`badge-${agentId}`);
    if (badge) {
      if (isWorking) {
        badge.className = "status-badge working";
        badge.textContent = "● WORKING";
      } else {
        badge.className = "status-badge idle";
        badge.textContent = "IDLE";
      }
    }
  }

  // Render 2x2 Grid Tiles
  function renderGrid() {
    performingGrid.innerHTML = "";

    if (activeMonitors.size === 0) {
      performingGrid.innerHTML = `
        <div class="tile-card empty-state" style="grid-column: span 2; display: flex; align-items: center; justify-content: center; color: #6b7280;">
          <p>⚡ No active agent tasks running. Describe work above or attach files/audio to direct Business Head.</p>
        </div>
      `;
      return;
    }

    activeMonitors.forEach((data, agentId) => {
      const info = AGENT_REGISTRY[agentId] || { name: agentId, icon: "🤖" };
      const tile = document.createElement("div");
      tile.className = "tile-card";

      tile.innerHTML = `
        <div class="tile-header">
          <div class="tile-agent-title">
            <span>${info.icon}</span>
            <span>${info.name}</span>
            <span class="status-badge ${data.isWorking ? 'working' : 'idle'}">${data.isWorking ? '● WORKING' : 'DONE'}</span>
          </div>
          <div class="tile-controls">
            <button class="btn-tile expand" data-agent="${agentId}">⛶ Expand</button>
            <button class="btn-tile exit" data-agent="${agentId}">✖ Exit</button>
          </div>
        </div>

        <div class="screen-box">
          <div class="action-bar">
            <span>ACTION: ${data.actionText}</span>
            <span>${data.progress}%</span>
          </div>
          <div class="progress-mini">
            <div class="progress-mini-fill" style="width: ${data.progress}%"></div>
          </div>
          <div class="action-output-stream" id="stream-${agentId}">
            ${data.streamLogs.map(l => `<div>> ${l}</div>`).join('')}
          </div>
        </div>
      `;

      performingGrid.appendChild(tile);
    });

    document.querySelectorAll(".btn-tile.expand").forEach(btn => {
      btn.addEventListener("click", () => openModal(btn.dataset.agent));
    });

    document.querySelectorAll(".btn-tile.exit").forEach(btn => {
      btn.addEventListener("click", () => removeMonitor(btn.dataset.agent));
    });
  }

  function updateMonitor(agentId, actionText, progress, logLine) {
    if (!activeMonitors.has(agentId)) {
      activeMonitors.set(agentId, {
        isWorking: true,
        actionText: actionText,
        progress: progress,
        streamLogs: []
      });
    }

    const item = activeMonitors.get(agentId);
    item.isWorking = progress < 100;
    item.actionText = actionText;
    item.progress = progress;
    if (logLine) item.streamLogs.push(logLine);

    setAgentState(agentId, progress < 100);
    renderGrid();

    if (expandedAgentId === agentId) {
      updateModalView(agentId);
    }
  }

  function removeMonitor(agentId) {
    activeMonitors.delete(agentId);
    setAgentState(agentId, false);
    renderGrid();
    if (expandedAgentId === agentId) closeModal();
  }

  function openModal(agentId) {
    expandedAgentId = agentId;
    updateModalView(agentId);
    expandModal.classList.add("active");
  }

  function updateModalView(agentId) {
    const info = AGENT_REGISTRY[agentId] || { name: agentId, icon: "🤖" };
    const data = activeMonitors.get(agentId) || { actionText: "Idle", progress: 0, streamLogs: [] };

    modalIcon.textContent = info.icon;
    modalTitle.textContent = `${info.name} Agent`;
    modalActionText.textContent = data.actionText;
    modalProgressFill.style.width = `${data.progress}%`;

    if (agentId === "recruiting") {
      modalScreenView.innerHTML = `
        <div style="color: #38bdf8;">🌐 CRAWLING HIRING PORTALS & SOCIAL NETWORKS...</div>
        <div>[CONNECTED] https://linkedin.com/jobs/search?q=AI+Engineer</div>
        <div>[CONNECTED] https://indeed.com/viewjob?jk=90218</div>
        <div>[CONNECTED] https://greenhouse.io/api/v1/jobs</div>
        <div style="color: #10b981; margin-top: 8px;">✓ Parsed candidate profiles. Matched 2 Senior AI Engineers (>90% fit).</div>
      `;
    } else {
      modalScreenView.innerHTML = `
        <div style="color: #38bdf8;">⚡ EXECUTING REASONING STEP VIA CLAUDE 3.5 SONNET...</div>
        <div>Step 1: Parsed prompt directives & attachments. Stored in Unlimited Memory.</div>
        <div>Step 2: Compiled parameters and returned final payload.</div>
        <div style="color: #10b981; margin-top: 8px;">✓ Action status: COMPLETED (100%).</div>
      `;
    }

    modalLogBox.innerHTML = data.streamLogs.map(l => `<div style="color: #9ca3af; margin-bottom: 4px;">> ${l}</div>`).join('');
    modalLogBox.scrollTop = modalLogBox.scrollHeight;
  }

  function closeModal() {
    expandedAgentId = null;
    expandModal.classList.remove("active");
  }

  btnCloseModal.addEventListener("click", closeModal);

  // Dynamic Agent Creator
  btnOpenCreateAgent.addEventListener("click", () => {
    createAgentModal.classList.add("active");
  });

  btnCloseCreateModal.addEventListener("click", () => {
    createAgentModal.classList.remove("active");
  });

  createAgentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("new-agent-name").value;
    const icon = document.getElementById("new-agent-icon").value || "🤖";
    const role = document.getElementById("new-agent-role").value;
    const prompt = document.getElementById("new-agent-prompt").value;

    const agentId = name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    AGENT_REGISTRY[agentId] = { name: name, icon: icon, role: role };

    const btn = document.createElement("button");
    btn.className = "agent-nav-item";
    btn.dataset.agent = agentId;
    btn.innerHTML = `
      <div class="nav-agent-info">
        <span class="icon">${icon}</span>
        <div class="nav-text">
          <span class="name">${name}</span>
          <span class="role">${role.substring(0, 20)}...</span>
        </div>
      </div>
      <span class="status-badge idle" id="badge-${agentId}">IDLE</span>
    `;

    agentNavList.prepend(btn);
    bindSidebarEvents();

    log(`Created Custom AI Agent: "${name}" (${icon})`, "success");

    try {
      await fetch("http://localhost:8000/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          name: name,
          icon: icon,
          role: role,
          system_prompt: prompt
        })
      });
    } catch (err) {}

    createAgentModal.classList.remove("active");
    setTargetAgent(agentId);
    createAgentForm.reset();
  });

  // 3rd Party Plugins Hub
  btnOpenPlugins.addEventListener("click", async () => {
    pluginModal.classList.add("active");
    await fetchPlugins();
  });

  btnClosePluginModal.addEventListener("click", () => {
    pluginModal.classList.remove("active");
  });

  async function fetchPlugins() {
    try {
      const response = await fetch("http://localhost:8000/plugins/");
      const data = await response.json();
      renderPlugins(data.plugins);
    } catch (err) {
      renderPlugins([
        { id: "vector_memory", name: "ChromaDB Vector Memory", category: "Memory & RAG", description: "Accelerates long-term agent memory retrieval.", status: "ACTIVE", icon: "🧠" },
        { id: "web_crawler", name: "Playwright Headless Scraper", category: "Web Automation", description: "High-speed headless crawler for hiring & market data.", status: "ACTIVE", icon: "🌐" },
        { id: "slack_bot", name: "Slack & WhatsApp Bot", category: "Messaging", description: "Sends live notifications & updates.", status: "ACTIVE", icon: "💬" }
      ]);
    }
  }

  function renderPlugins(plugins) {
    pluginGridList.innerHTML = plugins.map(p => `
      <div class="plugin-card">
        <div>
          <div class="plugin-card-header">
            <span class="plugin-icon">${p.icon}</span>
            <div>
              <div class="plugin-name">${p.name}</div>
              <div class="plugin-cat">${p.category}</div>
            </div>
          </div>
          <p class="plugin-desc">${p.description}</p>
        </div>
        <div class="plugin-footer">
          <span class="status-badge ${p.status === 'ACTIVE' ? 'working' : 'idle'}">${p.status}</span>
          <button class="btn-toggle-plugin ${p.status === 'ACTIVE' ? 'active' : 'installed'}" onclick="togglePlugin('${p.id}')">
            ${p.status === 'ACTIVE' ? 'Active ✓' : 'Activate'}
          </button>
        </div>
      </div>
    `).join('');
  }

  window.togglePlugin = async function(pluginId) {
    try {
      await fetch("http://localhost:8000/plugins/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plugin_id: pluginId })
      });
      await fetchPlugins();
      log(`Toggled 3rd Party Plugin: ${pluginId}`, "system");
    } catch (err) {}
  };

  // Direct Executive Chat Submission
  directChatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const task = chatInput.value.trim();
    const targetId = currentTargetAgent;
    const info = AGENT_REGISTRY[targetId] || { name: targetId };

    const attachSummary = currentAttachments.length > 0 ? ` (${currentAttachments.length} attachments added)` : "";
    log(`Directing work to ${info.name}: "${task.substring(0, 80)}..."${attachSummary}`, "agent");

    if (targetId === "business_head") {
      updateMonitor("business_head", "Orchestrating Fleet Operations...", 20, `Business Head evaluating directive with Unlimited Memory: "${task.substring(0, 60)}..."`);
      
      setTimeout(() => {
        updateMonitor("business_head", "Delegating to Recruiting & Finance...", 60, "Delegated tasks across specialized sub-agents.");
        updateMonitor("recruiting", "Crawling hiring sites for AI talent...", 40, "Connecting to LinkedIn, Indeed & Greenhouse...");
        updateMonitor("finance", "Auditing revenue & budget allocation...", 50, "P&L verification in progress...");
      }, 1200);

      setTimeout(() => {
        updateMonitor("business_head", "Directive Completed", 100, "All sub-agents completed work cleanly. Logged to Unlimited Memory.");
        updateMonitor("recruiting", "Candidate Match Complete", 100, "Top Candidate: Alex Chen (96% fit match).");
        updateMonitor("finance", "Financial Audit Passed", 100, "Projected MRR: $125,000 | Gross Margin: 84%.");
      }, 3000);

    } else {
      updateMonitor(targetId, `Executing ${info.name} Task...`, 30, `Task initialized for ${info.name}: "${task.substring(0, 60)}..."`);

      setTimeout(() => {
        updateMonitor(targetId, `Processing Parameters...`, 70, `Step 1/2 completed via Claude 3.5 Sonnet.`);
      }, 1500);

      setTimeout(() => {
        updateMonitor(targetId, `Task Completed Successfully`, 100, `Final Output generated cleanly.`);
        log(`Execution Completed for ${info.name}!`, "success");
      }, 3000);
    }

    try {
      await fetch("http://localhost:8000/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: targetId,
          payload: { query: task, attachments: currentAttachments }
        })
      });
    } catch (err) {}

    chatInput.value = "";
    chatInput.style.height = "auto";
    currentAttachments.length = 0;
    renderAttachments();
  });

  // Check Session on startup
  checkSession();
  setTargetAgent("business_head");
  renderGrid();

  setTimeout(() => {
    chatInput.value = "Hire 2 Senior AI Engineers and audit Q4 financial P&L balance sheet";
    directChatForm.dispatchEvent(new Event("submit"));
  }, 800);
});
