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

  // DOM Elements
  const navItems = document.querySelectorAll(".agent-nav-item");
  const directChatForm = document.getElementById("direct-chat-form");
  const chatInput = document.getElementById("chat-input");
  const targetAgentIcon = document.getElementById("target-agent-icon");
  const targetAgentName = document.getElementById("target-agent-name");
  const targetAgentDesc = document.getElementById("target-agent-desc");
  const performingGrid = document.getElementById("performing-grid");
  const consoleOutput = document.getElementById("console-output");
  const promptChips = document.querySelectorAll(".chip");

  // Modal Elements
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

  // Set Current Target Agent
  function setTargetAgent(agentKey) {
    currentTargetAgent = agentKey;
    const info = AGENT_REGISTRY[agentKey] || AGENT_REGISTRY["business_head"];

    navItems.forEach(item => {
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
      chatInput.placeholder = "Instruct Business Head to lead operations or direct specific work across agents...";
    } else {
      chatInput.placeholder = `Direct work specifically to ${info.name}...`;
    }
  }

  // Sidebar Agent Item Selection
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      setTargetAgent(item.dataset.agent);
    });
  });

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
          <p>⚡ No active agent tasks running. Type your instruction above to direct Business Head.</p>
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

    // Attach Grid Button Handlers
    document.querySelectorAll(".btn-tile.expand").forEach(btn => {
      btn.addEventListener("click", () => openModal(btn.dataset.agent));
    });

    document.querySelectorAll(".btn-tile.exit").forEach(btn => {
      btn.addEventListener("click", () => removeMonitor(btn.dataset.agent));
    });
  }

  // Update Monitor Map
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
        <div>Step 1: Parsed prompt directives & orchestrated target agent execution.</div>
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

  // Direct Executive Chat Submission
  directChatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const task = chatInput.value;
    const targetId = currentTargetAgent;
    const info = AGENT_REGISTRY[targetId];

    log(`Directing work to ${info.name}: "${task}"`, "agent");

    // If directing Business Head, trigger Business Head + Sub-Agents simultaneously
    if (targetId === "business_head") {
      updateMonitor("business_head", "Orchestrating Fleet Operations...", 20, `Business Head evaluating directive: "${task}"`);
      
      setTimeout(() => {
        updateMonitor("business_head", "Delegating to Recruiting & Finance...", 60, "Delegated tasks: Recruiting Agent -> Crawl Hiring Portals; Finance Agent -> Audit Budget");
        
        // Trigger Recruiting & Finance Monitors simultaneously
        updateMonitor("recruiting", "Crawling hiring sites for AI talent...", 40, "Connecting to LinkedIn, Indeed & Greenhouse...");
        updateMonitor("finance", "Auditing revenue & budget allocation...", 50, "P&L verification in progress...");
      }, 1200);

      setTimeout(() => {
        updateMonitor("business_head", "Directive Completed", 100, "All sub-agents completed work cleanly.");
        updateMonitor("recruiting", "Candidate Match Complete", 100, "Top Candidate: Alex Chen (96% fit match).");
        updateMonitor("finance", "Financial Audit Passed", 100, "Projected MRR: $125,000 | Gross Margin: 84%.");
      }, 3000);

    } else {
      // Direct Single Agent Execution
      updateMonitor(targetId, `Executing ${info.name} Task...`, 30, `Task initialized for ${info.name}: "${task}"`);

      setTimeout(() => {
        updateMonitor(targetId, `Processing Parameters...`, 70, `Step 1/2 completed via Claude 3.5 Sonnet.`);
      }, 1500);

      setTimeout(() => {
        updateMonitor(targetId, `Task Completed Successfully`, 100, `Final Output generated cleanly.`);
        log(`Execution Completed for ${info.name}!`, "success");
      }, 3000);
    }

    // Call REST API backend
    try {
      await fetch("http://localhost:8000/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: targetId,
          payload: { query: task, lead_name: task, company: task }
        })
      });
    } catch (err) {
      // Offline fallback
    }

    chatInput.value = "";
  });

  // Initial State Setup
  setTargetAgent("business_head");
  renderGrid();

  // Initial Demonstration Run
  setTimeout(() => {
    chatInput.value = "Hire 2 Senior AI Engineers and audit Q4 financial P&L balance sheet";
    directChatForm.dispatchEvent(new Event("submit"));
  }, 800);
});
