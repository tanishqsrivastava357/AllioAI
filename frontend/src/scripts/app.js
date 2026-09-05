(() => {
  "use strict";

  const sidebar = document.querySelector("#sidebar");
  const sidebarToggle = document.querySelector("#sidebarToggle");
  const mobileMenu = document.querySelector("#mobileMenu");
  const newChatButton = document.querySelector(".new-chat");
  const backdrop = document.querySelector("#sidebarBackdrop");
  const viewPanels = document.querySelectorAll("[data-view-panel]");
  const navItems = document.querySelectorAll("[data-view]");
  const homeComposer = document.querySelector("#homeComposer");
  const chatComposerSlot = document.querySelector("#chatComposerSlot");
  const homePrompt = document.querySelector("#homePrompt");
  const messages = document.querySelector("#messages");
  const chatTitle = document.querySelector("#chatTitle");
  const searchForm = document.querySelector("#workspaceSearch");
  const searchInput = document.querySelector("#searchInput");
  const searchResults = document.querySelector("#searchResults");
  const clearSearch = document.querySelector("#clearSearch");
  const accountButton = document.querySelector("#accountButton");
  const recentChatList = document.querySelector("#recentChatList");
  const accountName = document.querySelector("#accountName");
  const accountPlan = document.querySelector("#accountPlan");
  const welcomeName = document.querySelector("#welcomeName");
  const accountAvatar = document.querySelector("#accountAvatar");
  const modelSelect = document.querySelector("#modelSelect");
  const speechButton = document.querySelector("#speechButton");
  const speechStatus = document.querySelector("#speechStatus");
  const attachmentButton = document.querySelector("#attachmentButton");
  const attachmentInput = document.querySelector("#attachmentInput");
  const attachmentChip = document.querySelector("#attachmentChip");
  const attachmentName = document.querySelector("#attachmentName");
  const removeAttachment = document.querySelector("#removeAttachment");
  let recentChats = [];
  let activeConversationId = null;
  let authenticated = false;
  let selectedFile = null;
  let speechRecognition = null;
  let speechBaseText = "";
  let chatLoadVersion = 0;

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));

  const safeUrl = (value) => /^(https?:\/\/|data:image\/(?:png|jpeg|jpg|gif|webp);base64,)/i.test(value) ? value : "";

  const renderInlineMarkdown = (value) => {
    const tokens = [];
    const token = (html) => {
      tokens.push(html);
      return `@@TOKEN${tokens.length - 1}@@`;
    };
    let html = escapeHtml(value)
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+|data:image\/[^)\s]+)\)/gi, (_, alt, url) =>
        token(`<img class="message-image" src="${safeUrl(url)}" alt="${alt}">`))
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi, (_, label, url) =>
        token(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`))
      .replace(/(^|[\s(])(https?:\/\/[^\s<]+)/gi, (_, prefix, url) =>
        `${prefix}${token(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`)}`)
      .replace(/`([^`\n]+)`/g, (_, code) => token(`<code>${code}</code>`))
      .replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, bold, underlined) => `<strong>${bold || underlined}</strong>`)
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");
    return html.replace(/@@TOKEN(\d+)@@/g, (_, index) => tokens[Number(index)]);
  };

  const renderRichText = (value) => {
    if (window.marked?.parse && window.DOMPurify?.sanitize) {
      const rendered = window.marked.parse(String(value || ""), {
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
      });
      return window.DOMPurify.sanitize(rendered, {
        ALLOWED_TAGS: [
          "a", "b", "blockquote", "br", "code", "del", "em", "h1", "h2", "h3",
          "h4", "h5", "h6", "hr", "i", "img", "input", "li", "ol", "p", "pre",
          "strong", "table", "tbody", "td", "th", "thead", "tr", "ul"
        ],
        ALLOWED_ATTR: ["alt", "checked", "class", "disabled", "href", "rel", "target", "type", "src"],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["audio", "button", "embed", "form", "iframe", "object", "script", "style", "svg", "video"],
        FORBID_ATTR: ["style", "onerror", "onclick", "onload", "srcdoc"],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|data:image\/(?:png|jpeg|jpg|gif|webp);base64,)/i
      });
    }
    const codeBlocks = [];
    const source = String(value || "").replace(/\r\n?/g, "\n").trim();
    const escaped = escapeHtml(source).replace(/```([\w+-]*)\n?([\s\S]*?)```/g, (_, language, code) => {
      codeBlocks.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}` : ""}>${code.trim()}</code></pre>`);
      return `@@CODE${codeBlocks.length - 1}@@`;
    });
    const blocks = escaped.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    const html = [];
    blocks.forEach((block) => {
      if (/^@@CODE\d+@@$/.test(block)) {
        html.push(block);
      } else if (/^#{1,6}\s+/.test(block)) {
        const match = block.match(/^(#{1,6})\s+([\s\S]*)$/);
        html.push(`<h${match[1].length}>${renderInlineMarkdown(match[2])}</h${match[1].length}>`);
      } else if (/^\|?.+\|.+\n\|?\s*:?-+:?\s*(?:\|[-:\s]+)+\|?\n/.test(block)) {
        const rows = block.split("\n").filter(Boolean).map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
        const headings = rows.shift() || [];
        rows.shift();
        html.push(`<div class="message-table-wrap"><table><thead><tr>${headings.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headings.map((_, index) => `<td>${renderInlineMarkdown(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      } else if (/^(?:[-*+]\s+.+\n?)+$/.test(block)) {
        html.push(`<ul>${block.split("\n").filter(Boolean).map((line) => {
          const task = line.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
          return `<li>${task ? `<input class="message-task" type="checkbox" disabled${task[1].toLowerCase() === "x" ? " checked" : ""}>` : ""}${renderInlineMarkdown(task ? task[2] : line.replace(/^[-*+]\s+/, ""))}</li>`;
        }).join("")}</ul>`);
      } else if (/^(?:\d+\.\s+.+\n?)+$/.test(block)) {
        html.push(`<ol>${block.split("\n").filter(Boolean).map((line) => `<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`);
      } else if (/^(?:>\s?.+(?:\n|$))+/.test(block)) {
        html.push(`<blockquote>${renderInlineMarkdown(block.replace(/^>\s?/gm, ""))}</blockquote>`);
      } else if (/^([-*_])(?:\s*\1){2,}$/.test(block)) {
        html.push("<hr>");
      } else {
        html.push(`<p>${renderInlineMarkdown(block).replace(/\n/g, "<br>")}</p>`);
      }
    });
    return html.join("").replace(/@@CODE(\d+)@@/g, (_, index) => codeBlocks[Number(index)]);
  };

  const setSidebar = (open) => {
    sidebar.classList.toggle("expanded", open);
    sidebarToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-expanded", String(open));
  };

  sidebarToggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("expanded")));
  mobileMenu.addEventListener("click", () => setSidebar(true));
  backdrop.addEventListener("click", () => setSidebar(false));
  accountButton.addEventListener("click", () => setSidebar(true));

  const showView = (viewName) => {
    viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === viewName));
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
    if (viewName === "chat") chatComposerSlot.append(homeComposer);
    else document.querySelector(".home-view").append(homeComposer);
    if (window.matchMedia("(max-width: 760px)").matches) setSidebar(false);
  };

  newChatButton.addEventListener("click", () => {
    chatLoadVersion += 1;
    activeConversationId = null;
    chatTitle.textContent = "New chat";
    messages.replaceChildren();
    homePrompt.value = "";
    selectedFile = null;
    attachmentInput.value = "";
    attachmentChip.hidden = true;
    showView("chat");
    homePrompt.focus();
  });

  navItems.forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));

  const renderSearchResults = (query = "") => {
    const normalizedQuery = query.trim().toLowerCase();
    searchForm.classList.toggle("has-value", Boolean(normalizedQuery));
    if (!normalizedQuery) {
      searchResults.innerHTML = '<div class="search-empty"><strong>Find anything in your workspace</strong>Search recent chats or words from their messages.</div>';
      return;
    }
    const matches = recentChats.filter((chat) => `${chat.title} ${chat.preview}`.toLowerCase().includes(normalizedQuery));
    searchResults.innerHTML = "";
    if (!matches.length) {
      searchResults.innerHTML = `<div class="search-empty"><strong>No results found</strong>Try a different chat name or keyword.</div>`;
      return;
    }
    matches.forEach((chat) => {
      const result = document.createElement("button");
      result.className = "search-result";
      result.type = "button";
      result.innerHTML = `<span class="search-result-icon" aria-hidden="true">⌕</span><span class="search-result-copy"><span class="search-result-title"></span><span class="search-result-preview"></span></span>`;
      result.querySelector(".search-result-title").textContent = chat.title;
      result.querySelector(".search-result-preview").textContent = chat.preview;
      result.addEventListener("click", () => openChat(chat.title, "", chat.id));
      searchResults.append(result);
    });
  };

  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchForm.addEventListener("submit", (event) => event.preventDefault());
  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderSearchResults();
    searchInput.focus();
  });

  renderSearchResults();

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".mode-button").forEach((mode) => {
        const selected = mode === button;
        mode.classList.toggle("selected", selected);
        mode.setAttribute("aria-selected", String(selected));
      });
    });
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      homePrompt.value = button.dataset.prompt;
      homePrompt.focus();
    });

    attachmentButton.addEventListener("click", () => attachmentInput.click());
    attachmentInput.addEventListener("change", () => {
      selectedFile = attachmentInput.files[0] || null;
      attachmentName.textContent = selectedFile ? selectedFile.name : "";
      attachmentChip.hidden = !selectedFile;
      homePrompt.focus();
    });
    removeAttachment.addEventListener("click", () => {
      selectedFile = null;
      attachmentInput.value = "";
      attachmentChip.hidden = true;
      homePrompt.focus();
    });
  });

  const addMessage = (text, role, attachment = null) => {
    const wasNearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 96;
    const row = document.createElement("div");
    row.className = `message-row ${role === "user" ? "user-message" : "ai-message"}`;
    const message = document.createElement("article");
    message.className = "message-bubble";
    const meta = document.createElement("span");
    meta.className = "message-meta";
    meta.textContent = role === "user" ? "You" : "AllioAI";
    const actions = document.createElement("div");
    actions.className = "message-actions";
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => navigator.clipboard.writeText(text));
    actions.append(copyButton);
    if (role === "user") {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => {
        const editor = document.createElement("textarea");
        editor.className = "message-editor";
        editor.value = text;
        const controls = document.createElement("div");
        controls.className = "message-edit-controls";
        const save = document.createElement("button");
        save.type = "button";
        save.textContent = "Save";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "Cancel";
        save.addEventListener("click", () => {
          body.innerHTML = renderRichText(editor.value);
          actions.hidden = false;
          editor.replaceWith(body);
          controls.remove();
        });
        cancel.addEventListener("click", () => {
          editor.replaceWith(body);
          controls.remove();
          actions.hidden = false;
        });
        controls.append(save, cancel);
        body.replaceWith(editor);
        message.append(controls);
        actions.hidden = true;
        editor.focus();
      });
      actions.append(editButton);
    }
    const body = document.createElement("div");
    body.className = "message-body";
    if (attachment?.mimeType?.startsWith("image/")) {
      const preview = document.createElement("img");
      preview.className = "attachment-preview";
      preview.alt = attachment.name;
      preview.src = `data:${attachment.mimeType};base64,${attachment.data}`;
      body.append(preview);
    } else if (attachment) {
      const file = document.createElement("div");
      file.className = "attachment-file";
      file.textContent = `📎 ${attachment.name}`;
      body.append(file);
    }
    const content = document.createElement("div");
    content.innerHTML = renderRichText(text);
    body.append(content);
    message.append(meta, body, actions);
    row.append(message);
    messages.append(row);
    if (wasNearBottom || messages.children.length <= 1) {
      messages.scrollTop = messages.scrollHeight;
    }
  };

  const getAttachmentPayload = async () => {
    if (!selectedFile) return null;
    if (selectedFile.size > 3 * 1024 * 1024) {
      throw new Error("This file is too large. Please choose a file under 3 MB.");
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read the selected file."));
      reader.readAsDataURL(selectedFile);
    });
    const separator = dataUrl.indexOf(",");
    return {
      name: selectedFile.name,
      mimeType: selectedFile.type || "application/octet-stream",
      data: separator === -1 ? dataUrl : dataUrl.slice(separator + 1)
    };
  };

  const sendMessage = async (message, attachment = null) => {
    if (!message && !attachment) return;
    const visibleMessage = attachment ? `[Attached file: ${attachment.name}]${message ? `\n${message}` : ""}` : message;
    addMessage(message, "user", attachment);
    if (!authenticated) {
      addMessage("Please sign in to send messages.", "assistant");
      return;
    }
    try {
      if (!activeConversationId) {
        const conversationResponse = await fetch("/api/conversations", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: (message || attachment?.name || "New conversation").slice(0, 60) })
        });
        if (!conversationResponse.ok) {
          const errorData = await conversationResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Unable to create conversation.");
        }
        const conversationData = await conversationResponse.json();
        if (!conversationData.conversation || typeof conversationData.conversation.id !== "string") {
          throw new Error("The server returned an invalid conversation.");
        }
        activeConversationId = conversationData.conversation.id;
        chatTitle.textContent = conversationData.conversation.title;
      }
      const messageResponse = await fetch(`/api/conversations/${encodeURIComponent(activeConversationId)}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message || "Please analyze the attached file.", model: modelSelect.value, hasUpload: Boolean(attachment), attachment })
      });
      const responseText = await messageResponse.text();
      let messageData;
      try {
        messageData = JSON.parse(responseText);
      } catch {
        throw new Error(responseText.trim() || "The server returned an invalid response.");
      }
      if (!messageResponse.ok) throw new Error(messageData.error || "Unable to get an AI response.");
      if (messageData.assistantMessage) addMessage(messageData.assistantMessage.content, "assistant");
      await loadConversations();
    } catch (error) {
      console.error(error);
      addMessage(error.message, "assistant");
    }
  };

  const openChat = async (title, prompt, conversationId = null) => {
    const loadVersion = ++chatLoadVersion;
    chatTitle.textContent = title;
    messages.replaceChildren();
    activeConversationId = conversationId;
    if (conversationId) {
      const response = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load this conversation.");
      const data = await response.json();
      if (loadVersion !== chatLoadVersion) return;
      data.conversation.messages.forEach((message) => addMessage(message.content, message.role === "user" ? "user" : "assistant"));
    } else if (prompt) {
      addMessage(prompt, "user");
    }
    showView("chat");
    homePrompt.focus();
  };

  homeComposer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = homePrompt.value.trim();
    if (prompt || selectedFile) {
      let attachment;
      try {
        attachment = await getAttachmentPayload();
      } catch (error) {
        addMessage(error.message, "assistant");
        return;
      }
      if (!activeConversationId) await openChat("New chat", "");
      else showView("chat");
      await sendMessage(prompt, attachment);
      homePrompt.value = "";
      removeAttachment.click();
    }
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = navigator.language || "en-US";

    speechRecognition.addEventListener("start", () => {
      speechBaseText = homePrompt.value.trim();
      speechButton.classList.add("listening");
      speechButton.setAttribute("aria-pressed", "true");
      speechButton.setAttribute("aria-label", "Stop speech input");
      speechStatus.textContent = "Listening for speech.";
    });
    speechRecognition.addEventListener("result", (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      homePrompt.value = `${speechBaseText}${speechBaseText && transcript ? " " : ""}${transcript}`;
      homePrompt.dispatchEvent(new Event("input", { bubbles: true }));
    });
    speechRecognition.addEventListener("end", () => {
      speechButton.classList.remove("listening");
      speechButton.setAttribute("aria-pressed", "false");
      speechButton.setAttribute("aria-label", "Start speech input");
      speechStatus.textContent = "Speech input complete.";
      homePrompt.focus();
    });
    speechRecognition.addEventListener("error", (event) => {
      speechButton.classList.remove("listening");
      speechButton.setAttribute("aria-pressed", "false");
      speechButton.setAttribute("aria-label", "Start speech input");
      speechStatus.textContent = event.error === "not-allowed"
        ? "Microphone permission was denied."
        : "Speech input is unavailable right now.";
    });
    speechButton.addEventListener("click", () => {
      if (speechButton.getAttribute("aria-pressed") === "true") speechRecognition.stop();
      else speechRecognition.start();
    });
  } else {
    speechButton.disabled = true;
    speechButton.title = "Speech input is not supported in this browser.";
    speechStatus.textContent = "Speech input is not supported in this browser.";
  }

  document.querySelector("#upgradeButton").addEventListener("click", async () => {
    try {
      const response = await fetch("/api/auth/status", { credentials: "include" });
      if (!response.ok && response.status !== 401) throw new Error("Unable to verify sign-in status.");
      const data = await response.json();
      if (data.authenticated) {
        window.location.href = "billing.html";
        return;
      }
    } catch (error) {
      console.error(error);
    }
    window.localStorage.setItem("redirectAfterLogin", "billing.html");
    window.location.href = "signin.html";
  });

  const loadConversations = async () => {
    const response = await fetch("/api/conversations", { credentials: "include" });
    if (!response.ok) return;
    const data = await response.json();
    recentChats = await Promise.all(data.conversations.map(async (conversation) => {
      const detailResponse = await fetch(`/api/conversations/${encodeURIComponent(conversation.id)}`, { credentials: "include" });
      const detail = detailResponse.ok ? await detailResponse.json() : null;
      const lastMessage = detail && detail.conversation.messages.length ? detail.conversation.messages[detail.conversation.messages.length - 1].content : "No messages yet.";
      return { ...conversation, preview: lastMessage };
    }));
    recentChatList.replaceChildren();
    recentChats.forEach((chat) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.chat = chat.title;
      button.innerHTML = `<span></span><span aria-hidden="true">›</span>`;
      button.querySelector("span").textContent = chat.title;
      button.addEventListener("click", () => openChat(chat.title, "", chat.id));
      recentChatList.append(button);
    });
    renderSearchResults(searchInput.value);
  };

  const loadAccount = async () => {
    const response = await fetch("/api/auth/status", { credentials: "include" });
    if (!response.ok) {
      window.location.href = "signin.html";
      return;
    }
    const data = await response.json();
    authenticated = Boolean(data.authenticated);
    const user = data.user;
    const name = user.name || user.email || "there";
    const isPro = user.subscription === "pro";
    accountName.textContent = name;
    accountPlan.replaceChildren(document.createTextNode(isPro ? "Pro Plan" : "Free Plan · "));
    if (!isPro) {
      const upgradeLink = document.createElement("em");
      upgradeLink.textContent = "Upgrade";
      accountPlan.append(upgradeLink);
    }
    document.querySelector("#upgradeButton").hidden = isPro;
    welcomeName.textContent = name.split(" ")[0];
    accountAvatar.textContent = name.charAt(0).toUpperCase();
    await loadConversations();
  };

  loadAccount().catch((error) => {
    console.error(error);
    window.location.href = "signin.html";
  });
})();
