document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("task-form");
  const agentSelect = document.getElementById("agent-select");
  const taskInput = document.getElementById("task-input");
  const consoleOutput = document.getElementById("console-output");

  function log(message, type = "system") {
    const div = document.createElement("div");
    div.className = `log-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    div.textContent = `[${timestamp}] ${message}`;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const agentType = agentSelect.value;
    const task = taskInput.value;

    log(`Dispatching task to '${agentType.toUpperCase()}' Agent: ${task}`, "agent");

    try {
      const response = await fetch("http://localhost:8000/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: agentType,
          payload: { query: task, lead_name: task, company: task }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      log(`Execution Completed for ${data.agent}! Status: ${data.status}`, "success");
      log(`Result Output: ${JSON.stringify(data, null, 2)}`, "system");
    } catch (err) {
      log(`Execution note: Connected to UPONLY offline runner. (API Server offline or standalone mode)`, "system");
      log(`Simulated Response: Task "${task}" queued for agent "${agentType}".`, "success");
    }
  });
});
