let conversations =
    JSON.parse(localStorage.getItem("conversations")) || [];

let currentChatId =
    localStorage.getItem("currentChatId") || null;

let currentController = null;


/* =========================
   ELEMENTS
========================= */

const chatContainer =
    document.getElementById("chatContainer");

const chatList =
    document.getElementById("chatList");

const chatForm =
    document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const chatTitle =
    document.getElementById("chatTitle");

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("openSidebar");


/* =========================
   SAVE
========================= */

function saveConversations() {

    localStorage.setItem(
        "conversations",
        JSON.stringify(conversations)
    );

    localStorage.setItem(
        "currentChatId",
        currentChatId || ""
    );
}


/* =========================
   CREATE CHAT
========================= */

function createChat() {

    const chat = {

        id: Date.now().toString(),

        title: "New Chat",

        messages: []

    };

    conversations.unshift(chat);

    currentChatId = chat.id;

    saveConversations();

    renderSidebar();

    renderMessages();

    messageInput.focus();
}


/* =========================
   CURRENT CHAT
========================= */

function getCurrentChat() {

    return conversations.find(
        chat => chat.id === currentChatId
    );
}


/* =========================
   SIDEBAR
========================= */

function renderSidebar() {

    chatList.innerHTML = "";

    conversations.forEach(chat => {

        const item =
            document.createElement("div");

        item.className = "chat-item";

        if (chat.id === currentChatId) {

            item.classList.add("active");

        }


        item.innerHTML = `

            <span class="chat-name">
                💬 ${escapeHTML(chat.title)}
            </span>

            <div class="chat-actions">

                <button
                    class="chat-action"
                    title="Rename"
                >
                    ✎
                </button>

                <button
                    class="chat-action delete-action"
                    title="Delete"
                >
                    🗑
                </button>

            </div>

        `;


        /* Open chat */

        item.querySelector(".chat-name")
            .onclick = () => {

                currentChatId = chat.id;

                saveConversations();

                renderSidebar();

                renderMessages();

            };


        /* Rename */

        item.querySelector(".chat-action")
            .onclick = (event) => {

                event.stopPropagation();

                renameChat(chat.id);

            };


        /* Delete */

        item.querySelector(".delete-action")
            .onclick = (event) => {

                event.stopPropagation();

                deleteChat(chat.id);

            };


        chatList.appendChild(item);

    });
}


/* =========================
   RENAME CHAT
========================= */

function renameChat(chatId) {

    const chat =
        conversations.find(
            chat => chat.id === chatId
        );

    if (!chat) {
        return;
    }


    const newName =
        prompt(
            "Enter a new name:",
            chat.title
        );


    if (
        newName === null ||
        !newName.trim()
    ) {
        return;
    }


    chat.title =
        newName.trim();


    saveConversations();

    renderSidebar();

    renderMessages();
}


/* =========================
   DELETE CHAT
========================= */

function deleteChat(chatId) {

    const chat =
        conversations.find(
            chat => chat.id === chatId
        );

    if (!chat) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${chat.title}"?`
        );


    if (!confirmed) {
        return;
    }


    conversations =
        conversations.filter(
            chat => chat.id !== chatId
        );


    if (currentChatId === chatId) {

        if (conversations.length > 0) {

            currentChatId =
                conversations[0].id;

        }

        else {

            currentChatId = null;

        }

    }


    saveConversations();


    if (!currentChatId) {

        createChat();

    }

    else {

        renderSidebar();

        renderMessages();

    }
}


/* =========================
   RENDER MESSAGES
========================= */

function renderMessages() {

    chatContainer.innerHTML = "";

    const chat = getCurrentChat();


    if (!chat || chat.messages.length === 0) {

        chatContainer.innerHTML = `

            <div class="welcome">

                <div class="welcome-icon">
                    ✦
                </div>

                <h1>
                    How can I help you?
                </h1>

                <p>
                    Ask anything and start a conversation.
                </p>

            </div>

        `;

        chatTitle.textContent =
            chat ? chat.title : "New Chat";

        return;
    }


    chat.messages.forEach(message => {

        addMessageToUI(
            message.role,
            message.content
        );

    });


    chatTitle.textContent =
        chat.title;

    scrollToBottom();
}


/* =========================
   ADD MESSAGE
========================= */

function addMessageToUI(role, content) {

    const message =
        document.createElement("div");

    message.className =
        `message ${
            role === "user"
                ? "user-message"
                : "ai-message"
        }`;


    if (role === "user") {

        message.innerHTML = `

            <div class="bubble user-bubble">

                ${escapeHTML(content)}

            </div>

            <div class="avatar user-avatar">
                U
            </div>

        `;

    }

    else {

        message.innerHTML = `

            <div class="avatar ai-avatar">
                AI
            </div>

            <div class="ai-content">

                <div class="bubble ai-bubble markdown-content">

                    ${renderMarkdown(content)}

                </div>

                <button
                    class="copy-button"
                >
                    Copy
                </button>

            </div>

        `;


        const copyButton =
            message.querySelector(
                ".copy-button"
            );


        copyButton.onclick = () => {

            copyResponse(copyButton);

        };

    }


    chatContainer.appendChild(message);

    addCodeCopyButtons(message);
}


/* =========================
   MARKDOWN
========================= */

function renderMarkdown(content) {

    if (typeof marked === "undefined") {

        return escapeHTML(content);

    }


    return marked.parse(content);
}


/* =========================
   CODE COPY
========================= */

function addCodeCopyButtons(message) {

    const codeBlocks =
        message.querySelectorAll(
            ".markdown-content pre"
        );


    codeBlocks.forEach(pre => {

        const button =
            document.createElement("button");

        button.className =
            "code-copy-button";

        button.textContent =
            "Copy code";


        button.onclick = async () => {

            const code =
                pre.querySelector("code");


            if (!code) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    code.innerText
                );

                button.textContent =
                    "Copied!";


                setTimeout(() => {

                    button.textContent =
                        "Copy code";

                }, 1500);

            }

            catch {

                button.textContent =
                    "Failed";

            }

        };


        pre.appendChild(button);

    });
}


/* =========================
   SEND MESSAGE
========================= */

chatForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const text =
            messageInput.value.trim();


        if (!text) {
            return;
        }


        if (!currentChatId) {
            createChat();
        }


        const chat =
            getCurrentChat();


        chat.messages.push({

            role: "user",

            content: text

        });


        if (chat.messages.length === 1) {

            chat.title =
                text.length > 30
                    ? text.substring(0, 30) + "..."
                    : text;

        }


        messageInput.value = "";

        autoGrowTextarea();


        renderSidebar();

        renderMessages();


        sendButton.disabled = false;

        sendButton.textContent = "■";


        showLoading();


        currentController =
            new AbortController();


        try {

            const response =
                await fetch("/chat", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        messages:
                            chat.messages

                    }),

                    signal:
                        currentController.signal

                });


            const result =
                await response.json();


            if (result.success) {

                chat.messages.push({

                    role: "assistant",

                    content: result.message

                });

            }

            else {

                chat.messages.push({

                    role: "assistant",

                    content:
                        "⚠️ " + result.message

                });

            }

        }

        catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                /* Request was stopped */

                chat.messages.push({

                    role: "assistant",

                    content:
                        "⏹ Generation stopped."

                });

            }

            else {

                chat.messages.push({

                    role: "assistant",

                    content:
                        "⚠️ Could not connect to the server."

                });

            }

        }


        currentController = null;

        removeLoading();

        saveConversations();

        renderMessages();

        renderSidebar();

        sendButton.disabled = false;

        sendButton.textContent = "↑";

    }
);


/* =========================
   STOP GENERATING
========================= */

sendButton.addEventListener(
    "click",
    function(event) {

        if (
            currentController &&
            !currentController.signal.aborted
        ) {

            event.preventDefault();

            currentController.abort();

        }

    }
);


/* =========================
   ENTER TO SEND
========================= */

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            chatForm.requestSubmit();

        }

    }
);


/* =========================
   AUTO GROW TEXTAREA
========================= */

messageInput.addEventListener(
    "input",
    autoGrowTextarea
);


function autoGrowTextarea() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            150
        ) + "px";
}


/* =========================
   NEW CHAT
========================= */

document
    .getElementById("newChat")
    .addEventListener(
        "click",
        createChat
    );


/* =========================
   CLEAR CURRENT CHAT
========================= */

document
    .getElementById("clearChat")
    .addEventListener(
        "click",
        function() {

            const chat =
                getCurrentChat();


            if (!chat) {
                return;
            }


            const confirmed =
                confirm(
                    "Clear this conversation?"
                );


            if (!confirmed) {
                return;
            }


            chat.messages = [];

            chat.title = "New Chat";


            saveConversations();

            renderSidebar();

            renderMessages();

        }
    );


/* =========================
   CLEAR ALL
========================= */

function clearAllConversations() {

    if (!conversations.length) {
        return;
    }


    const confirmed =
        confirm(
            "Delete all conversations?"
        );


    if (!confirmed) {
        return;
    }


    conversations = [];

    currentChatId = null;


    saveConversations();

    createChat();
}


/* =========================
   COPY RESPONSE
========================= */

async function copyResponse(button) {

    const bubble =
        button
            .closest(".ai-content")
            .querySelector(".ai-bubble");


    try {

        await navigator.clipboard.writeText(
            bubble.innerText
        );


        button.textContent =
            "Copied!";


        setTimeout(() => {

            button.textContent =
                "Copy";

        }, 1500);

    }

    catch {

        button.textContent =
            "Failed";

    }
}


/* =========================
   SEARCH CHATS
========================= */

function searchChats(query) {

    const search =
        query.trim().toLowerCase();


    document
        .querySelectorAll(".chat-item")
        .forEach(item => {

            const text =
                item
                    .querySelector(".chat-name")
                    .textContent
                    .toLowerCase();


            item.style.display =
                !search || text.includes(search)
                    ? "flex"
                    : "none";

        });
}


/* =========================
   EXPORT TXT
========================= */

function exportChatTXT() {

    const chat =
        getCurrentChat();


    if (
        !chat ||
        chat.messages.length === 0
    ) {

        alert("There is no conversation to export.");

        return;
    }


    let content =
        `My AI - ${chat.title}\n`;

    content +=
        "==============================\n\n";


    chat.messages.forEach(message => {

        const role =
            message.role === "user"
                ? "You"
                : "AI";


        content +=
            `${role}:\n`;

        content +=
            `${message.content}\n\n`;

    });


    downloadFile(
        content,
        `${safeFileName(chat.title)}.txt`,
        "text/plain"
    );
}


/* =========================
   EXPORT JSON
========================= */

function exportChatJSON() {

    const chat =
        getCurrentChat();


    if (
        !chat ||
        chat.messages.length === 0
    ) {

        alert("There is no conversation to export.");

        return;
    }


    const content =
        JSON.stringify(
            chat,
            null,
            2
        );


    downloadFile(
        content,
        `${safeFileName(chat.title)}.json`,
        "application/json"
    );
}


/* =========================
   DOWNLOAD FILE
========================= */

function downloadFile(
    content,
    fileName,
    type
) {

    const blob =
        new Blob(
            [content],
            { type }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = fileName;

    link.click();


    URL.revokeObjectURL(url);
}


/* =========================
   SAFE FILE NAME
========================= */

function safeFileName(name) {

    return name
        .replace(/[<>:"/\\|?*]/g, "_")
        .substring(0, 80);
}


/* =========================
   LOADING
========================= */

function showLoading() {

    removeLoading();


    const message =
        document.createElement("div");

    message.className =
        "message ai-message";

    message.id =
        "loadingMessage";


    message.innerHTML = `

        <div class="avatar ai-avatar">
            AI
        </div>

        <div class="bubble ai-bubble loading-bubble">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    chatContainer.appendChild(message);

    scrollToBottom();
}


function removeLoading() {

    const loading =
        document.getElementById(
            "loadingMessage"
        );


    if (loading) {
        loading.remove();
    }
}


/* =========================
   THEME
========================= */

document
    .getElementById("themeToggle")
    .addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "light"
            );


            const isLight =
                document.body.classList.contains(
                    "light"
                );


            this.textContent =
                isLight
                    ? "🌙 Dark Mode"
                    : "☀ Light Mode";


            localStorage.setItem(
                "theme",
                isLight
                    ? "light"
                    : "dark"
            );

        }
    );


if (
    localStorage.getItem("theme")
    === "light"
) {

    document.body.classList.add("light");


    document.getElementById(
        "themeToggle"
    ).textContent =
        "🌙 Dark Mode";
}


/* =========================
   SIDEBAR TOGGLE
========================= */

menuButton.addEventListener(
    "click",
    function() {

        sidebar.classList.toggle(
            "hidden"
        );

    }
);


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}

/* =========================
   SEARCH INPUT
========================= */

document
    .getElementById("searchChats")
    .addEventListener(
        "input",
        function() {

            searchChats(this.value);

        }
    );


/* =========================
   EXPORT BUTTONS
========================= */

document
    .getElementById("exportTxt")
    .addEventListener(
        "click",
        exportChatTXT
    );


document
    .getElementById("exportJson")
    .addEventListener(
        "click",
        exportChatJSON
    );


/* =========================
   CLEAR ALL BUTTON
========================= */

document
    .getElementById("clearAll")
    .addEventListener(
        "click",
        clearAllConversations
    );
/* =========================
   INITIAL LOAD
========================= */

if (!currentChatId) {

    createChat();

}

else {

    const existingChat =
        getCurrentChat();


    if (!existingChat) {

        createChat();

    }

    else {

        renderSidebar();

        renderMessages();

    }

}