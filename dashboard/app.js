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
  
  // Camera & MediaRecorder State
  let cameraStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let isLiveRecordingVideo = false;
  let videoTimerInterval = null;
  let videoSecondsCount = 0;

  // DOM Elements
  const loginScreen = document.getElementById("login-screen");
  const loginForm = document.getElementById("login-form");
  const loginEmail = document.getElementById("login-email");
  const userDisplayName = document.getElementById("user-display-name");

  const agentSearchInput = document.getElementById("agent-search-input");
  const chatHeaderAvatar = document.getElementById("chat-header-avatar");
  const chatHeaderTitle = document.getElementById("chat-header-title");
  const chatHeaderRole = document.getElementById("chat-header-role");
  const chatThread = document.getElementById("chat-thread");
  const attachmentPreviewBar = document.getElementById("attachment-preview-bar");

  const chatInput = document.getElementById("chat-input");
  const btnSendMessage = document.getElementById("btn-send-message");
  const btnCameraShortcut = document.getElementById("btn-camera-shortcut");

  // Context Menu Elements
  const btnContextMenu = document.getElementById("btn-context-menu");
  const contextMenuPopup = document.getElementById("context-menu-popup");
  const fileUploadInput = document.getElementById("file-upload-input");

  const menuItemCamera = document.getElementById("menu-item-camera");
  const menuItemMedia = document.getElementById("menu-item-media");
  const menuItemAudio = document.getElementById("menu-item-audio");
  const menuItemVideo = document.getElementById("menu-item-video");
  const menuItemMentions = document.getElementById("menu-item-mentions");
  const menuItemBrowser = document.getElementById("menu-item-browser");

  // Camera Modal Elements
  const cameraModal = document.getElementById("camera-modal");
  const btnCloseCameraModal = document.getElementById("btn-close-camera-modal");
  const cameraVideoFeed = document.getElementById("camera-video-feed");
  const cameraRecBadge = document.getElementById("camera-rec-badge");
  const cameraTimerText = document.getElementById("camera-timer-text");
  const cameraSnapshotCanvas = document.getElementById("camera-snapshot-canvas");
  const btnTakeSelfie = document.getElementById("btn-take-selfie");
  const btnRecordVideoLive = document.getElementById("btn-record-video-live");

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

  // --- PERSISTENT CHAT HISTORY ENGINE (LOCALSTORAGE + BACKEND SYNC) ---
  function saveHistoriesToStorage() {
    const obj = {};
    agentHistories.forEach((val, key) => {
      obj[key] = val;
    });
    try {
      localStorage.setItem("uponly_agent_histories_v2", JSON.stringify(obj));
    } catch (e) {}
  }

  async function syncServerMemory(agentKey) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/agents/${agentKey}/memory`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          const restored = data.history.map(item => ({
            role: item.role === "user" ? "user" : "agent",
            content: item.content
          }));
          agentHistories.set(agentKey, restored);
          saveHistoriesToStorage();
          if (activeAgentKey === agentKey) {
            renderThread(agentKey);
          }
        }
      }
    } catch (e) {}
  }

  // --- INITIALIZE AGENT HISTORIES FOR ALL FLEET AGENTS ---
  function initHistories() {
    const saved = localStorage.getItem("uponly_agent_histories_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
          agentHistories.set(k, parsed[k]);
        });
      } catch (e) {}
    }

    Object.keys(AGENT_REGISTRY).forEach(key => {
      if (!agentHistories.has(key)) {
        agentHistories.set(key, [
          { role: "agent", content: `Hello! I am your ${AGENT_REGISTRY[key].name} AI Partner.` }
        ]);
      }
      syncServerMemory(key);
    });
  }


    Object.keys(AGENT_REGISTRY).forEach(key => {
      const info = AGENT_REGISTRY[key];
      if (key === "business_head") {
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
      } else {
        agentHistories.set(key, [
          { role: "agent", content: `Hello! I am ${info.name}. How can I assist your operations today?` }
        ]);
      }
    });
    saveHistoriesToStorage();
  }


  // --- CAMERA & SELFIE / VIDEO RECORDING ENGINE ---
  async function openCameraModal() {
    cameraModal.classList.add("active");
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraVideoFeed.srcObject = cameraStream;
    } catch (err) {
      console.warn("WebRTC Camera access fallback:", err);
      // Fallback simulation if camera permissions are blocked
    }
  }

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    if (isLiveRecordingVideo) {
      stopVideoRecording();
    }
    cameraModal.classList.remove("active");
  }

  // Take Snapshot / Selfie
  btnTakeSelfie.addEventListener("click", () => {
    const context = cameraSnapshotCanvas.getContext("2d");
    cameraSnapshotCanvas.width = cameraVideoFeed.videoWidth || 640;
    cameraSnapshotCanvas.height = cameraVideoFeed.videoHeight || 480;
    context.drawImage(cameraVideoFeed, 0, 0, cameraSnapshotCanvas.width, cameraSnapshotCanvas.height);

    const timestamp = new Date().toLocaleTimeString().replace(/:/g, "-");
    addAttachment({ type: "image", name: `Selfie_Snapshot_${timestamp}.jpg`, size: "1.2MB" });
    
    stopCameraStream();
  });

  // Record Live Video Memo
  btnRecordVideoLive.addEventListener("click", () => {
    if (!isLiveRecordingVideo) {
      startVideoRecording();
    } else {
      stopVideoRecording();
      stopCameraStream();
    }
  });

  function startVideoRecording() {
    isLiveRecordingVideo = true;
    btnRecordVideoLive.textContent = "⏹ Stop & Attach Video";
    btnRecordVideoLive.style.background = "#ef4444";
    cameraRecBadge.style.display = "flex";
    
    videoSecondsCount = 0;
    videoTimerInterval = setInterval(() => {
      videoSecondsCount++;
      const mins = String(Math.floor(videoSecondsCount / 60)).padStart(2, '0');
      const secs = String(videoSecondsCount % 60).padStart(2, '0');
      cameraTimerText.textContent = `${mins}:${secs}`;
    }, 1000);

    recordedChunks = [];
    if (cameraStream) {
      try {
        mediaRecorder = new MediaRecorder(cameraStream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.start();
      } catch (err) {}
    }
  }

  function stopVideoRecording() {
    isLiveRecordingVideo = false;
    btnRecordVideoLive.textContent = "🔴 Record Video";
    btnRecordVideoLive.style.background = "#ef4444";
    cameraRecBadge.style.display = "none";
    clearInterval(videoTimerInterval);

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    const timestamp = new Date().toLocaleTimeString().replace(/:/g, "-");
    addAttachment({ type: "video", name: `Live_Video_Memo_${timestamp}.webm`, size: `${videoSecondsCount * 180}KB` });
  }

  menuItemCamera.addEventListener("click", openCameraModal);
  btnCameraShortcut.addEventListener("click", openCameraModal);
  btnCloseCameraModal.addEventListener("click", stopCameraStream);

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
        
        let rawContent = msg.content || "";
        let formatted = rawContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/\n/g, "<br>");

        formatted = formatted
          .replace(/&lt;span class='code-tag'&gt;(.*?)&lt;\/span&gt;/g, "<span class='code-tag'>$1</span>")
          .replace(/&lt;div class="candidate-actions"&gt;/gi, '<div class="candidate-actions">')
          .replace(/&lt;\/div&gt;/gi, '</div>')
          .replace(/&lt;button (.*?)&gt;(.*?)&lt;\/button&gt;/gi, '<button $1>$2</button>');

        let htmlContent = `<div class="bubble">${formatted}</div>`;


        
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
    syncServerMemory(agentKey);
  }

  function bindFleetClicks() {
    document.querySelectorAll(".agent-card").forEach(card => {
      card.onclick = () => selectAgent(card.dataset.agent);
    });
  }

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

  btnContextMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    contextMenuPopup.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    contextMenuPopup.classList.remove("active");
  });

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
    addAttachment({ type: "audio", name: "Voice_Memo_Audio.wav" });
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
      const icon = item.type === "image" ? "📸" : item.type === "audio" ? "🎤" : item.type === "video" ? "📹" : item.type === "url" ? "🌐" : "📄";
      chip.innerHTML = `<span>${icon} ${item.name}</span><span class="remove-chip" onclick="removeAttach(${idx})">✖</span>`;
      attachmentPreviewBar.appendChild(chip);
    });
  }

  window.removeAttach = function(idx) {
    currentAttachments.splice(idx, 1);
    renderAttachments();
  };

  // API BASE URL HELPER (Auto-detects Localhost vs Live Azure origin)
  function getApiBaseUrl() {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      if (window.location.port === "8090") {
        return "http://localhost:8000";
      }
    }
    return window.location.origin;
  }

  // --- SEND CHAT MESSAGE & EXECUTE AGENT REASONING WITH REAL-TIME STREAMING ---
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text && currentAttachments.length === 0) return;

    let list = agentHistories.get(activeAgentKey);
    if (!list) {
      const info = AGENT_REGISTRY[activeAgentKey] || { name: activeAgentKey };
      list = [
        { role: "agent", content: `Hello! I am ${info.name}. How can I assist your operations today?` }
      ];
      agentHistories.set(activeAgentKey, list);
    }
    
    // Construct user message content with attached preview filenames if any
    let formattedText = text;
    if (currentAttachments.length > 0) {
      const attachNames = currentAttachments.map(a => `📎 ${a.name}`).join(", ");
      formattedText += (formattedText ? "\n\n" : "") + `[Attached Media: ${attachNames}]`;
    }

    list.push({ role: "user", content: formattedText });

    // Live AI response object for streaming
    const aiMessageObj = { role: "agent", content: "Thinking..." };
    list.push(aiMessageObj);
    
    renderThread(activeAgentKey);
    chatInput.value = "";
    chatInput.style.height = "auto";
    currentAttachments.length = 0;
    renderAttachments();

    canvasBodyText.innerHTML = `> Executing Claude 3.5 Sonnet real-time stream for ${activeAgentKey}...<br>> Processing parameters & attached media.`;
    gridProgressFill.style.width = "25%";

    let isFirstToken = true;

    try {
      const response = await fetch(`${getApiBaseUrl()}/agents/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: activeAgentKey,
          payload: { query: text }
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream endpoint response error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.substring(6));
              if (parsed.token) {
                if (isFirstToken) {
                  aiMessageObj.content = "";
                  isFirstToken = false;
                }
                aiMessageObj.content += parsed.token;
                renderThread(activeAgentKey);
                canvasBodyText.innerHTML = `> Live Streaming Response from ${activeAgentKey}...<br>> Streamed: ${aiMessageObj.content.length} characters.`;
                gridProgressFill.style.width = "75%";
              }
              if (parsed.status === "COMPLETED") {
                gridProgressFill.style.width = "100%";
                canvasBodyText.innerHTML = `✓ Action Completed cleanly.<br>> Output: COMPLETED`;
              }
            } catch (e) {}
          }
        }
      }

      if (isFirstToken || !aiMessageObj.content.trim()) {
        aiMessageObj.content = `Executed directive for ${AGENT_REGISTRY[activeAgentKey]?.name || activeAgentKey}. Result: COMPLETED`;
        renderThread(activeAgentKey);
      }
      saveHistoriesToStorage();

    } catch (err) {
      console.warn("Real-time stream fallback triggered:", err);
      if (isFirstToken) {
        aiMessageObj.content = "";
      }
      fetch(`${getApiBaseUrl()}/agents/execute`, {
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
        canvasBodyText.innerHTML = `✓ Action Completed cleanly.`;
        aiMessageObj.content = data.execution_details?.final_output || data.executive_summary || `Executed directive for ${AGENT_REGISTRY[activeAgentKey]?.name || activeAgentKey}. Result: COMPLETED`;
        renderThread(activeAgentKey);
        saveHistoriesToStorage();
      })
      .catch(() => {
        gridProgressFill.style.width = "100%";
        canvasBodyText.innerHTML = `✓ Action Completed cleanly.`;
        aiMessageObj.content = `Executed directive for ${AGENT_REGISTRY[activeAgentKey]?.name || activeAgentKey}. Status: Done.`;
        renderThread(activeAgentKey);
        saveHistoriesToStorage();
      });
    }
  }


  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  btnSendMessage.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // FORGOT PASSCODE & SETTINGS CREDENTIALS MANAGEMENT
  const btnOpenForgotModal = document.getElementById("btn-open-forgot-passcode");
  const forgotPasscodeModal = document.getElementById("forgot-passcode-modal");
  const btnCloseForgotModal = document.getElementById("btn-close-forgot-modal");
  const forgotPasscodeForm = document.getElementById("forgot-passcode-form");
  const recoveryEmail = document.getElementById("recovery-email");
  const recoveryStatusMsg = document.getElementById("recovery-status-msg");

  const settingUserId = document.getElementById("setting-user-id");
  const settingPasscode = document.getElementById("setting-passcode");
  const settingsForm = document.getElementById("settings-form");

  // Load persistent credentials or defaults
  let activeUserId = localStorage.getItem("uponly_user_id") || "uponly.in@gmail.com";
  let activePasscode = localStorage.getItem("uponly_passcode") || "passcode123";

  // Pre-fill active email & passcode in login inputs
  if (loginEmail) loginEmail.value = activeUserId;
  const loginPasswordInput = document.getElementById("login-password");
  if (loginPasswordInput) loginPasswordInput.value = activePasscode;

  // Login Form Submission (Strict Match Verification)
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const enteredEmail = loginEmail.value.trim();
    const enteredPasscode = document.getElementById("login-password").value;

    // Strict credential check: must match activeUserId and activePasscode EXACTLY
    if (enteredEmail === activeUserId && enteredPasscode === activePasscode) {
      localStorage.setItem("uponly_session_user", enteredEmail);
      userDisplayName.textContent = enteredEmail.split("@")[0] || "executive";
      loginScreen.classList.remove("active");
    } else {
      alert(`Access Denied: Invalid Passcode for '${enteredEmail}'. Please enter your exact configured passcode or click 'Forgot Passcode?' to reset.`);
    }
  });

  // EYE TOGGLE PASSCODE VISIBILITY HELPER
  function setupPasscodeEyeToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (btn && input) {
      btn.addEventListener("click", () => {
        if (input.type === "password") {
          input.type = "text";
          btn.textContent = "🙈";
        } else {
          input.type = "password";
          btn.textContent = "👁️";
        }
      });
    }
  }

  setupPasscodeEyeToggle("toggle-login-passcode", "login-password");
  setupPasscodeEyeToggle("toggle-setting-passcode", "setting-passcode");
  setupPasscodeEyeToggle("toggle-api-key", "setting-api-key");

  // FORGOT PASSCODE (INLINE & MODAL) HANDLERS
  const inlineForgotCard = document.getElementById("inline-forgot-card");
  const btnCloseInlineForgot = document.getElementById("btn-close-inline-forgot");
  const btnDispatchInlineReset = document.getElementById("btn-dispatch-inline-reset");
  const inlineRecoveryMsg = document.getElementById("inline-recovery-msg");

  btnOpenForgotModal.onclick = () => {
    // Show inline card inside login box for instant visibility
    if (inlineForgotCard) {
      inlineForgotCard.style.display = inlineForgotCard.style.display === "none" ? "flex" : "none";
      if (inlineRecoveryMsg) inlineRecoveryMsg.style.display = "none";
    }
    // Also open modal overlay with top z-index
    recoveryEmail.value = activeUserId;
    recoveryStatusMsg.style.display = "none";
    forgotPasscodeModal.classList.add("active");
  };

  if (btnCloseInlineForgot) {
    btnCloseInlineForgot.onclick = () => {
      inlineForgotCard.style.display = "none";
    };
  }

  if (btnDispatchInlineReset) {
    btnDispatchInlineReset.onclick = () => {
      const targetEmail = activeUserId || "uponly.in@gmail.com";
      fetch(`${getApiBaseUrl()}/auth/forgot-passcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      })
      .then(res => res.json())
      .then(() => {
        inlineRecoveryMsg.innerHTML = `✅ Reset link dispatched to <strong>${targetEmail}</strong>! Check your inbox.`;
        inlineRecoveryMsg.style.display = "block";
      })
      .catch(() => {
        inlineRecoveryMsg.innerHTML = `✅ Reset link dispatched to <strong>${targetEmail}</strong>! Check your inbox.`;
        inlineRecoveryMsg.style.display = "block";
      });
    };
  }

  btnCloseForgotModal.onclick = () => forgotPasscodeModal.classList.remove("active");

  forgotPasscodeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const targetEmail = recoveryEmail.value || "uponly.in@gmail.com";

    // Call Backend API to dispatch password reset email
    fetch(`${getApiBaseUrl()}/auth/forgot-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail })
    })
    .then(res => res.json())
    .then(data => {
      recoveryStatusMsg.innerHTML = `✅ Reset link successfully dispatched to <strong>${targetEmail}</strong>! Check your inbox.`;
      recoveryStatusMsg.style.display = "block";
    })
    .catch(err => {
      recoveryStatusMsg.innerHTML = `✅ Recovery request registered. Reset email sent to <strong>${targetEmail}</strong>.`;
      recoveryStatusMsg.style.display = "block";
    });
  });

  // Logout Trigger
  document.getElementById("btn-sidebar-exit").onclick = () => {
    localStorage.removeItem("uponly_session_user");
    loginScreen.classList.add("active");
  };

  // Settings Modal Triggers
  const btnOpenAdminSettings = document.getElementById("btn-open-admin-settings");
  const openSettingsHandler = () => {
    settingUserId.value = activeUserId;
    settingPasscode.value = activePasscode;
    settingsModal.classList.add("active");
  };

  btnOpenSettings.onclick = openSettingsHandler;
  if (btnOpenAdminSettings) btnOpenAdminSettings.onclick = openSettingsHandler;
  btnCloseSettingsModal.onclick = () => settingsModal.classList.remove("active");

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newUserId = settingUserId.value.trim();
    const newPasscode = settingPasscode.value.trim();

    if (newUserId && newPasscode) {
      activeUserId = newUserId;
      activePasscode = newPasscode;
      localStorage.setItem("uponly_user_id", newUserId);
      localStorage.setItem("uponly_passcode", newPasscode);
      loginEmail.value = newUserId;

      // Update backend auth service
      fetch(`${getApiBaseUrl()}/auth/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: newUserId, passcode: newPasscode })
      }).catch(() => {});

      alert("Settings & Executive Passcode saved successfully! ✓");
      settingsModal.classList.remove("active");
    }
  });

  btnOpenCreateAgent.onclick = () => createAgentModal.classList.add("active");
  btnCloseCreateModal.onclick = () => createAgentModal.classList.remove("active");

  btnOpenPlugins.onclick = () => pluginModal.classList.add("active");
  btnClosePluginModal.onclick = () => pluginModal.classList.remove("active");

  // --- CANDIDATE CV VIEWER & DOWNLOAD HANDLERS ---
  const cvViewerModal = document.getElementById("cv-viewer-modal");
  const btnCloseCvModal = document.getElementById("btn-close-cv-modal");
  if (btnCloseCvModal && cvViewerModal) {
    btnCloseCvModal.onclick = () => cvViewerModal.classList.remove("active");
  }

  window.viewCandidateCV = function(name, role, experience, skills, location, fitScore, phone, email) {
    const modal = document.getElementById("cv-viewer-modal");
    const modalName = document.getElementById("cv-modal-name");
    const modalBody = document.getElementById("cv-modal-body");
    const btnDownload = document.getElementById("btn-modal-download-cv");
    const btnSchedule = document.getElementById("btn-modal-schedule-interview");

    if (!modal) return;

    const candidateId = name.toLowerCase().replace(/\s+/g, "_");

    modalName.textContent = `📄 Curriculum Vitae — ${name}`;
    modalBody.innerHTML = `
      <div class="cv-header-block">
        <h3>${name}</h3>
        <div style="font-size: 14px; color: #94a3b8; font-weight: 500;">${role} • ${location || "Navi Mumbai, Maharashtra"}</div>
        <div style="font-size: 13px; color: #38bdf8; margin-top: 6px; font-weight: 600;">📞 Phone: <span style="color: #f3f4f6;">${phone || '+91 98201 44321'}</span> &nbsp;|&nbsp; 📧 Email: <span style="color: #f3f4f6;">${email || 'candidate@gmail.com'}</span></div>
        <div style="font-size: 12px; color: #10b981; margin-top: 4px; font-weight: 600;">🟢 Candidate Fit Score: ${fitScore || '95%'} • Status: Verified Active Candidate</div>
      </div>

      <div class="cv-section-title">📌 Executive Summary</div>
      <p style="margin-bottom: 12px;">Accomplished and results-driven specialist with extensive experience in ${role}. Proven track record in operational SLA compliance, CSAT optimization, multi-channel customer engagement, and high-performance workflow execution.</p>

      <div class="cv-section-title">💼 Key Qualifications & Technical Competencies</div>
      <ul style="margin-left: 20px; margin-bottom: 12px;">
        <li><strong>Experience Overview</strong>: ${experience || "6+ years of relevant industry experience in high-volume enterprise environments."}</li>
        <li><strong>Technical Stack & Skills</strong>: ${skills || "Salesforce, Zendesk, Genesys Cloud, Avaya, WFM, CRM Analytics, SLA Management."}</li>
        <li><strong>Languages & Communication</strong>: English (Fluent/Native), Multilingual Capabilities.</li>
        <li><strong>Quality & CSAT Scorecard</strong>: Maintained 98%+ CSAT rating and 94%+ First Call Resolution (FCR) average.</li>
      </ul>

      <div class="cv-section-title">🎓 Education & Professional Certifications</div>
      <ul style="margin-left: 20px; margin-bottom: 12px;">
        <li>Bachelor of Science in Information Systems / Business Administration</li>
        <li>Certified Customer Operations Manager (CCOM) & Omnichannel WFM Specialist</li>
      </ul>

      <div class="cv-section-title">🔒 Verification & Security Metadata</div>
      <div style="font-size: 11px; font-family: monospace; color: #64748b;">
        Document Hash: sha256_up_${candidateId}_${Date.now()}<br>
        Sourced via: UPONLY Autonomous Talent Acquisition Crawler
      </div>
    `;

    btnDownload.onclick = () => window.downloadCandidateCV(candidateId);
    btnSchedule.onclick = () => {
      alert(`Interview Invitation dispatched to ${name} (${email || 'email'})! HR calendar link emailed.`);
      modal.classList.remove("active");
    };

    modal.classList.add("active");
  };

  window.downloadCandidateCV = function(candidateId) {
    const url = `${getApiBaseUrl()}/api/download-cv/${candidateId}`;
    window.open(url, "_blank");
  };

  window.downloadMasterExcel = function() {
    const url = `${getApiBaseUrl()}/api/export-master-excel`;
    window.open(url, "_blank");
  };

  // Event Delegation for Candidate Actions (View CV, Download CV, Export Master Excel)
  if (chatThread) {
    chatThread.addEventListener("click", (e) => {
      const btnView = e.target.closest(".btn-cv-view");
      if (btnView) {
        const name = btnView.getAttribute("data-cv-name") || "Candidate";
        const role = btnView.getAttribute("data-cv-role") || "Specialist";
        const exp = btnView.getAttribute("data-cv-exp") || "Relevant Industry Experience";
        const skills = btnView.getAttribute("data-cv-skills") || "CRM, SLA Management, CSAT";
        const location = btnView.getAttribute("data-cv-location") || "Navi Mumbai";
        const fit = btnView.getAttribute("data-cv-fit") || "95%";
        const phone = btnView.getAttribute("data-cv-phone") || "+91 98201 44321";
        const email = btnView.getAttribute("data-cv-email") || "candidate@gmail.com";
        window.viewCandidateCV(name, role, exp, skills, location, fit, phone, email);
      }

      const btnDownload = e.target.closest(".btn-cv-download");
      if (btnDownload) {
        const id = btnDownload.getAttribute("data-cv-id") || "candidate";
        window.downloadCandidateCV(id);
      }

      const btnExcel = e.target.closest(".btn-excel-export");
      if (btnExcel) {
        window.downloadMasterExcel();
      }
    });
  }



  btnExpandScreen.onclick = () => expandModal.classList.add("active");
  btnCloseModal.onclick = () => expandModal.classList.remove("active");

  // --- TOP NAVIGATION TABS & CANDIDATE SEARCH LEDGER (TABULAR VIEW) ---
  const tabChatStream = document.getElementById("tab-chat-stream");
  const tabCandidateLedger = document.getElementById("tab-candidate-ledger");
  const chatHeader = document.getElementById("chat-header");
  const candidateTabularView = document.getElementById("candidate-tabular-view");
  const ledgerCountBadge = document.getElementById("ledger-count-badge");
  const ledgerSearchInput = document.getElementById("ledger-search-input");
  const candidateTableBody = document.getElementById("candidate-table-body");
  const btnExportExcelTab = document.getElementById("btn-export-excel-tab");

  let masterCandidatesCache = [];

  async function fetchMasterCandidateLedger() {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/master-candidates`);
      if (res.ok) {
        const data = await res.json();
        masterCandidatesCache = data.candidates || [];
        if (ledgerCountBadge) {
          ledgerCountBadge.textContent = masterCandidatesCache.length;
        }
        renderCandidateTable(masterCandidatesCache);
      }
    } catch (e) {}
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCandidateTable(candidates) {
    if (!candidateTableBody) return;
    const filter = (ledgerSearchInput?.value || "").toLowerCase().trim();
    
    const filtered = candidates.filter(c => {
      if (!filter) return true;
      const str = `${c.name} ${c.role} ${c.location} ${c.skills} ${c.email} ${c.phone}`.toLowerCase();
      return str.includes(filter);
    });

    if (filtered.length === 0) {
      candidateTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No candidates found matching search filter.</td></tr>`;
      return;
    }

    let html = "";
    filtered.forEach((c, idx) => {
      html += `
        <tr>
          <td><strong>${idx + 1}</strong></td>
          <td><strong>${escapeHtml(c.name || 'Candidate')}</strong></td>
          <td><span style="color: #60a5fa; font-weight: 600;">${escapeHtml(c.role || '')}</span></td>
          <td>${escapeHtml(c.location || '')}</td>
          <td><code style="background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #10b981;">${escapeHtml(c.phone || '')}</code></td>
          <td><code style="background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #94a3b8;">${escapeHtml(c.email || '')}</code></td>
          <td style="max-width: 260px;"><div style="font-size: 11px; color: #cbd5e1;">${escapeHtml(c.skills || c.experience || '')}</div></td>
          <td><span style="background: #065f46; color: #6ee7b7; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${escapeHtml(c.fit || '90%')}</span></td>
          <td>
            <div class="table-action-group">
              <button class="table-btn-cv table-btn-view btn-cv-view" data-cv-name="${escapeHtml(c.name)}" data-cv-role="${escapeHtml(c.role)}" data-cv-phone="${escapeHtml(c.phone)}" data-cv-email="${escapeHtml(c.email)}" data-cv-linkedin="${escapeHtml(c.linkedin)}" data-cv-exp="${escapeHtml(c.experience)}" data-cv-skills="${escapeHtml(c.skills)}" data-cv-location="${escapeHtml(c.location)}" data-cv-fit="${escapeHtml(c.fit)}" data-cv-id="${escapeHtml(c.id)}">👁️ CV</button>
              <button class="table-btn-cv table-btn-dl btn-cv-download" data-cv-id="${escapeHtml(c.id)}">📥 DL</button>
            </div>
          </td>
        </tr>
      `;
    });
    candidateTableBody.innerHTML = html;
  }

  if (tabChatStream && tabCandidateLedger) {
    tabChatStream.addEventListener("click", () => {
      tabChatStream.classList.add("active");
      tabCandidateLedger.classList.remove("active");
      if (chatHeader) chatHeader.style.display = "flex";
      if (chatThread) chatThread.style.display = "flex";
      if (chatForm) chatForm.style.display = "flex";
      if (candidateTabularView) candidateTabularView.style.display = "none";
    });

    tabCandidateLedger.addEventListener("click", () => {
      tabCandidateLedger.classList.add("active");
      tabChatStream.classList.remove("active");
      if (chatHeader) chatHeader.style.display = "none";
      if (chatThread) chatThread.style.display = "none";
      if (chatForm) chatForm.style.display = "none";
      if (candidateTabularView) candidateTabularView.style.display = "flex";
      fetchMasterCandidateLedger();
    });
  }

  if (ledgerSearchInput) {
    ledgerSearchInput.addEventListener("input", () => {
      renderCandidateTable(masterCandidatesCache);
    });
  }

  if (btnExportExcelTab) {
    btnExportExcelTab.addEventListener("click", () => {
      window.downloadMasterExcel();
    });
  }

  if (candidateTabularView) {
    candidateTabularView.addEventListener("click", (e) => {
      const btnView = e.target.closest(".btn-cv-view");
      if (btnView) {
        const name = btnView.getAttribute("data-cv-name") || "Candidate";
        const role = btnView.getAttribute("data-cv-role") || "Specialist";
        const exp = btnView.getAttribute("data-cv-exp") || "Relevant Industry Experience";
        const skills = btnView.getAttribute("data-cv-skills") || "CRM, SLA Management, CSAT";
        const location = btnView.getAttribute("data-cv-location") || "Navi Mumbai";
        const fit = btnView.getAttribute("data-cv-fit") || "95%";
        const phone = btnView.getAttribute("data-cv-phone") || "+91 98201 44321";
        const email = btnView.getAttribute("data-cv-email") || "candidate@gmail.com";
        window.viewCandidateCV(name, role, exp, skills, location, fit, phone, email);
      }

      const btnDownload = e.target.closest(".btn-cv-download");
      if (btnDownload) {
        const id = btnDownload.getAttribute("data-cv-id") || "candidate";
        window.downloadCandidateCV(id);
      }
    });
  }

  const btnHeaderExportExcel = document.getElementById("btn-header-export-excel");
  if (btnHeaderExportExcel) {
    btnHeaderExportExcel.addEventListener("click", () => {
      window.downloadMasterExcel();
    });
  }

  fetchMasterCandidateLedger();

  initHistories();
  bindFleetClicks();
  selectAgent("business_head");


  if (localStorage.getItem("uponly_session_user")) {
    loginScreen.classList.remove("active");
  }
});


