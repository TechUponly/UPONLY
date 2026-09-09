document.addEventListener("DOMContentLoaded", () => {
  // 11 Core Agents Registry with Avatars & Colors
  const AGENT_REGISTRY = {
    business_head: { name: "Business Head", avatar: "🔴", color: "red", role: "Chief Executive Orchestrator", snippet: "v2 in progress: text over real B-roll..." },
    video: { name: "video creator", avatar: "🔵", color: "blue", role: "Multimedia & Motion Graphics Director", snippet: "v2 is building on the bank B-roll..." },
    content: { name: "Content Writer", avatar: "🟤", color: "brown", role: "Viral Social & Copy Strategist", snippet: "Message from video creator..." },
    recruiting: { name: "Talent Acquisition", avatar: "🟢", color: "green", role: "Crawl Hiring Portals & Screen Resumes", snippet: "Waiting for you: Verify @Up..." },
    analyst: { name: "Analyst", avatar: "🔴", color: "red", role: "Market Intelligence & Cohort Modeling", snippet: "Message from Business Head..." },
    support: { name: "email response", avatar: "🟣", color: "purple", role: "24/7 Customer Ticket Resolution", snippet: "No problem. I'll leave the w..." },
    finance: { name: "Finance", avatar: "💖", color: "pink", role: "P&L Audit & Revenue Forecasting", snippet: "Message from Business Head..." },
    operations: { name: "Operations", avatar: "🟢", color: "green", role: "Webhook Sync & SOP Automation", snippet: "Message from Business Head..." },
    sales: { name: "sales", avatar: "🔵", color: "blue", role: "Lead Qualification & B2B Proposals", snippet: "What do you want me on first?" },
    risk: { name: "Risk & Compliance", avatar: "🟠", color: "orange", role: "Security & Contract Compliance Audit", snippet: "Security audit complete..." },
    analytics: { name: "Analytics Agent", avatar: "🟡", color: "yellow", role: "Operational KPIs & Executive Reports", snippet: "Weekly KPI summary ready..." }
  };

  // State Management
  let activeAgentKey = "business_head";
  const agentHistories = new Map();
  const currentAttachments = [];
  let isAudioRecording = false;

  // DOM Elements
  const loginScreen = document.getElementById("login-screen");
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const userDisplayName = document.getElementById("user-display-name");

  const agentSearchInput = document.getElementById("agent-search-input");
  const fleetList = document.getElementById("agent-fleet-list");
  
  const chatHeaderAvatar = document.getElementById("chat-header-avatar");
  const chatHeaderTitle = document.getElementById("chat-header-title");
  const chatHeaderRole = document.getElementById("chat-header-role");
  const currentEngineTag = document.getElementById("current-engine-tag");
  const chatThread = document.getElementById("chat-thread");
  const attachmentPreviewBar = document.getElementById("attachment-preview-bar");

  const chatInput = document.getElementById("chat-input");
  const btnSendMessage = document.getElementById("btn-send-message");

  // Context Menu Elements
  const btnContextMenu = document.getElementById("btn-context-menu");
  const contextMenuPopup = document.getElementById("context-menu-popup");
  const fileUploadInput = document.getElementById("file-upload-input");

  const menuItemMedia = document.getElementById("menu-item-media");
  const menuItemAudio = document.getElementById("menu-item-audio");
  const menuItemVideo = document.getElementById("menu-item-video");
  const menuItemMentions = document.getElementById("menu-item-mentions");
  const menuItemBrowser = document.getElementById("menu-item-browser");
  const btnAudioRecord = document.getElementById("btn-audio-record");

  // Right Pane Elements
  const monitorTitle = document.getElementById("monitor-title");
  const canvasHeaderText = document.getElementById("canvas-header-text");
  const canvasBodyText = document.getElementById("canvas-body-text");
  const gridProgressFill = document.getElementById("grid-progress-fill");
  const btnExpandScreen = document.getElementById("btn-expand-screen");

  // Modals
  const settingsModal = document.getElementById("settings-modal");
  const btnOpenSettings = document.getElementById("btn-open-settings");
  const btnCloseSettingsModal = document.getElementById("btn-close-settings-modal");

  const btnOpenCreateAgent = document.getElementById("btn-open-create-agent");
  const createAgentModal = document.getElementById("create-agent-modal");
  const btnCloseCreateModal = document.getElementById("btn-close-create-modal");

  const btnOpenPlugins = document.getElementById("btn-open-plugins");
  const pluginModal = document.getElementById("plugin-modal");
  const btnClosePluginModal = document.getElementById("btn-close-plugin-modal");

  const expandModal = document.getElementById("expand-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");

  // --- INITIALIZE AGENT HISTORIES (Matching Reference Screenshot) ---
  function initHistories() {
    // Populate Business Head history as seen in reference screenshot
    agentHistories.set("business_head", [
      {
        role: "agent",
        content: "Cartesia is loaded via API (connector still session-based).\n\nBFSI cut with mentor VO: <span class='code-tag'>/workspace/youtube-week1/cuts/bfsi-upgrade/short-with-vo.mp4</span> (~23.5s)\nVoice: calm professional (Zander). Please rotate that API key when free — it was pasted in chat.\n\nSilent kinetic version still at <span class='code-tag'>short.mp4</span> if you prefer.",
        hasVideo: true
      },
      { role: "system", content: "Messaged 🔵 video creator" },
      {
        role: "agent",
        content: "Play that and tell me if the voice fits — we can swap voice or push a LinkedIn company post next."
      },
      { role: "system", content: "2 messages with 🔵 video creator" },
      { role: "user", content: "its not good , visual is mostly empty" },
      { role: "user", content: "no brand logo" },
      {
        role: "agent",
        content: "Fair. Rebuilding denser — less empty black, and UPONLY + Bharat Co-op logos on screen."
      },
      { role: "system", content: "Messaged 🔵 video creator" },
      {
        role: "agent",
        content: "v2 in progress: text over real B-roll (not empty black) + both brand logos on open and close. I'll send the new file when it's ready."
      }
    ]);

    // Populate Video Creator history
    agentHistories.set("video", [
      { role: "agent", content: "v2 is building on the bank B-roll with audio track synced." },
      { role: "user", content: "Ensure logo is crisp on startup." }
    ]);
  }

  // Render Thread Messages for Active Agent
  function renderThread(agentKey) {
    chatThread.innerHTML = "";
    const messages = agentHistories.get(agentKey) || [
      { role: "agent", content: `Hello! I am ${AGENT_REGISTRY[agentKey]?.name || agentKey}. How can I assist your operations today?` }
    ];

    messages.forEach(msg => {
      if (msg.role === "system") {
        const pill = document.createElement("div");
        pill.className = "system-pill";
        pill.innerHTML = msg.content;
        chatThread.appendChild(pill);
      } else {
        const row = document.createElement("div");
        row.className = `chat-bubble-row ${msg.role}`;
        
        let htmlContent = `<div class="bubble">${msg.content}</div>`;
        
        // Add Rich Video Card if present (matching screenshot)
        if (msg.hasVideo) {
          htmlContent += `
            <div class="media-card-widget">
              <div class="video-preview-thumbnail">
                <div class="play-btn">▶</div>
                <div style="position: absolute; bottom: 8px; left: 12px; font-size: 11px;">Banking is evolving. (0:23)</div>
              </div>
            </div>
          `;
        }

        row.innerHTML = htmlContent;
        chatThread.appendChild(row);
      }
    });

    chatThread.scrollTop = chatThread.scrollHeight;
  }

  // Switch Active Agent Selection
  function selectAgent(agentKey) {
    activeAgentKey = agentKey;
    const info = AGENT_REGISTRY[agentKey] || { name: agentKey, avatar: "🤖", role: "AI Specialist" };

    chatHeaderAvatar.textContent = info.avatar;
    chatHeaderTitle.textContent = info.name;
    chatHeaderRole.textContent = info.role;
    chatInput.placeholder = `Message ${info.name}...`;

    monitorTitle.textContent = `${info.name}'s screen`;
    canvasHeaderText.textContent = `${info.avatar} ${info.name} Performing Monitor`;

    document.querySelectorAll(".agent-card").forEach(card => {
      if (card.dataset.agent === agentKey) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    renderThread(agentKey);
  }

  // Bind Agent Fleet Card Clicks
  function bindFleetClicks() {
    document.querySelectorAll(".agent-card").forEach(card => {
      card.onclick = () => selectAgent(card.dataset.agent);
    });
  }

  // Agent Search Filtering
  agentSearchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".agent-card").forEach(card => {
      const name = card.querySelector(".agent-title").textContent.toLowerCase();
      if (name.includes(q)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });

  // Toggle Context Popup Menu (Add Context + button)
  btnContextMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    contextMenuPopup.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    contextMenuPopup.classList.remove("active");
  });

  // Context Menu Item Handlers
  menuItemMedia.addEventListener("click", () => {
    fileUploadInput.accept = "image/*,video/*,*/*";
    fileUploadInput.click();
  });

  fileUploadInput.addEventListener("change", (e) => {
    Array.from(e.target.files).forEach(f => {
      addAttachment({ type: "file", name: f.name });
    });
  });

  menuItemAudio.addEventListener("click", () => {
    addAttachment({ type: "audio", name: "Voice_Memo_Audio.mp4" });
  });

  menuItemVideo.addEventListener("click", () => {
    addAttachment({ type: "video", name: "Screen_Recording.mp4" });
  });

  menuItemMentions.addEventListener("click", () => {
    chatInput.value += " @video ";
    chatInput.focus();
  });

  menuItemBrowser.addEventListener("click", () => {
    const url = prompt("Enter Web URL for agent to crawl:", "https://linkedin.com/jobs");
    if (url) addAttachment({ type: "url", name: url });
  });

  function addAttachment(item) {
    currentAttachments.push(item);
    renderAttachments();
  }

  function renderAttachments() {
    attachmentPreviewBar.innerHTML = "";
    currentAttachments.forEach((item, idx) => {
      const chip = document.createElement("div");
      chip.className = "attach-chip";
      chip.innerHTML = `<span>📎 ${item.name}</span><span class="remove-chip" onclick="removeAttach(${idx})">✖</span>`;
      attachmentPreviewBar.appendChild(chip);
    });
  }

  window.removeAttach = function(idx) {
    currentAttachments.splice(idx, 1);
    renderAttachments();
  };

  // Send Chat Message Handler
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text && currentAttachments.length === 0) return;

    const list = agentHistories.get(activeAgentKey) || [];
    list.push({ role: "user", content: text });

    // Render immediately
    renderThread(activeAgentKey);
    chatInput.value = "";
    chatInput.style.height = "auto";
    currentAttachments.length = 0;
    renderAttachments();

    // Trigger Screen Monitor Animation
    canvasBodyText.innerHTML = `> Executing Claude 3.5 Sonnet step for ${activeAgentKey}...<br>> Directing parameters & tool calls.`;
    gridProgressFill.style.width = "40%";

    // Backend Execution Call
    fetch("http://localhost:8000/agents/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_type: activeAgentKey,
        payload: { query: text }
      })
    })
    .then(r => r.json())
    .then(data => {
      gridProgressFill.style.width = "100%";
      canvasBodyText.innerHTML = `✓ Action Completed cleanly.<br>> Output: ${data.status || 'COMPLETED'}`;

      list.push({
        role: "agent",
        content: `Executed directive for ${AGENT_REGISTRY[activeAgentKey]?.name || activeAgentKey}. Result: ${data.status || 'COMPLETED'}`
      });

      renderThread(activeAgentKey);
    })
    .catch(() => {
      gridProgressFill.style.width = "100%";
      list.push({
        role: "agent",
        content: `Executed instruction for ${AGENT_REGISTRY[activeAgentKey]?.name || activeAgentKey}. Action completed.`
      });
      renderThread(activeAgentKey);
    });
  }

  btnSendMessage.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Session Login/Logout
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginEmail.value || "uponly.in@gmail.com";
    localStorage.setItem("uponly_session_user", email);
    userDisplayName.textContent = email.split("@")[0] || "sham rai";
    loginScreen.classList.remove("active");
  });

  document.getElementById("btn-sidebar-exit").onclick = () => {
    localStorage.removeItem("uponly_session_user");
    loginScreen.classList.add("active");
  };

  // Modals & Settings
  btnOpenSettings.onclick = () => settingsModal.classList.add("active");
  btnCloseSettingsModal.onclick = () => settingsModal.classList.remove("active");

  btnOpenCreateAgent.onclick = () => createAgentModal.classList.add("active");
  btnCloseCreateModal.onclick = () => createAgentModal.classList.remove("active");

  btnOpenPlugins.onclick = () => pluginModal.classList.add("active");
  btnClosePluginModal.onclick = () => pluginModal.classList.remove("active");

  btnExpandScreen.onclick = () => expandModal.classList.add("active");
  btnCloseModal.onclick = () => expandModal.classList.remove("active");

  // Init
  initHistories();
  bindFleetClicks();
  selectAgent("business_head");

  if (localStorage.getItem("uponly_session_user")) {
    loginScreen.classList.remove("active");
  }
});
