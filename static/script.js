/* =========================
   STORAGE
========================= */

let conversations =
    JSON.parse(localStorage.getItem("conversations")) || [];

let currentChatId =
    localStorage.getItem("currentChatId") || null;

let currentController = null;


/* =========================
   ELEMENTS
========================= */

const chatContainer = document.getElementById("chatContainer");
const chatList = document.getElementById("chatList");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatTitle = document.getElementById("chatTitle");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("openSidebar");
const newChatButton = document.getElementById("newChat");
const clearChatButton = document.getElementById("clearChat");
const clearAllButton = document.getElementById("clearAll");
const themeToggle = document.getElementById("themeToggle");
const searchChats = document.getElementById("searchChats");
const exportTxt = document.getElementById("exportTxt");
const exportJson = document.getElementById("exportJson");


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

    renderChatList();
    renderCurrentChat();
}


/* =========================
   GET CURRENT CHAT
========================= */

function getCurrentChat() {

    return conversations.find(
        chat => chat.id === currentChatId
    );
}


/* =========================
   OPEN CHAT
========================= */

function openChat(id) {

    currentChatId = id;

    saveConversations();

    renderChatList();
    renderCurrentChat();
}


/* =========================
   RENDER CHAT LIST
========================= */

function renderChatList(filter = "") {

    chatList.innerHTML = "";

    const filtered =
        conversations.filter(chat =>
            chat.title
                .toLowerCase()
                .includes(filter.toLowerCase())
        );

    filtered.forEach(chat => {

        const item = document.createElement("div");

        item.className = "chat-item";

        if (chat.id === currentChatId) {
            item.classList.add("active");
        }

        const title = document.createElement("div");

        title.className = "chat-item-title";
        title.textContent = chat.title;

        const actions = document.createElement("div");

        actions.className = "chat-actions";


        const renameButton =
            document.createElement("button");

        renameButton.textContent = "✎";
        renameButton.title = "Rename";

        renameButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                renameChat(chat.id);
            }
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent = "×";
        deleteButton.title = "Delete";

        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                deleteChat(chat.id);
            }
        );


        actions.appendChild(renameButton);
        actions.appendChild(deleteButton);

        item.appendChild(title);
        item.appendChild(actions);


        item.addEventListener(
            "click",
            () => openChat(chat.id)
        );


        chatList.appendChild(item);
    });
}


/* =========================
   RENAME CHAT
========================= */

function renameChat(id) {

    const chat =
        conversations.find(
            chat => chat.id === id
        );

    if (!chat) return;


    const newTitle =
        prompt(
            "Enter a new chat name:",
            chat.title
        );


    if (
        newTitle &&
        newTitle.trim()
    ) {

        chat.title = newTitle.trim();

        saveConversations();

        renderChatList();

        if (id === currentChatId) {

            chatTitle.textContent =
                chat.title;
        }
    }
}


/* =========================
   DELETE CHAT
========================= */

function deleteChat(id) {

    const confirmed =
        confirm("Delete this chat?");

    if (!confirmed) return;


    conversations =
        conversations.filter(
            chat => chat.id !== id
        );


    if (currentChatId === id) {

        if (conversations.length > 0) {

            currentChatId =
                conversations[0].id;

        } else {

            currentChatId = null;
        }
    }


    saveConversations();

    renderChatList();
    renderCurrentChat();
}


/* =========================
   RENDER CURRENT CHAT
========================= */

function renderCurrentChat() {

    const chat = getCurrentChat();

    chatContainer.innerHTML = "";


    if (!chat) {

        chatTitle.textContent = "New Chat";

        showWelcome();

        return;
    }


    chatTitle.textContent = chat.title;


    if (chat.messages.length === 0) {

        showWelcome();

        return;
    }


    chat.messages.forEach(message => {

        addMessageToUI(
            message.role,
            message.content,
            false
        );

    });


    scrollToBottom();
}


/* =========================
   WELCOME
========================= */

function showWelcome() {

    const welcome =
        document.createElement("div");

    welcome.className = "welcome";

    welcome.innerHTML = `

        <div class="welcome-icon">
            ✦
        </div>

        <h1>
            How can I help you?
        </h1>

        <p>
            Ask anything and start a conversation.
        </p>

    `;

    chatContainer.appendChild(welcome);
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   MARKDOWN
========================= */

function renderMarkdown(content) {

    if (typeof marked !== "undefined") {

        return marked.parse(content);
    }

    return escapeHTML(content)
        .replace(/\n/g, "<br>");
}


/* =========================
   ADD MESSAGE
========================= */

function addMessageToUI(
    role,
    content,
    scroll = true
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${role === "user" ? "user" : "ai"}`;


    const messageContent =
        document.createElement("div");

    messageContent.className =
        "message-content";


    if (role === "user") {

        messageContent.innerHTML =
            escapeHTML(content)
                .replace(/\n/g, "<br>");

    } else {

        messageContent.innerHTML =
            renderMarkdown(content);

        addCodeCopyButtons(messageContent);
    }


    if (role === "assistant") {

        const header =
            document.createElement("div");

        header.className = "message-header";

        header.innerHTML = `

            <div class="message-avatar">
                ✦
            </div>

            CHAT DPT

        `;

        message.appendChild(header);
    }


    message.appendChild(messageContent);

    chatContainer.appendChild(message);


    if (scroll) {
        scrollToBottom();
    }


    return message;
}


/* =========================
   CODE COPY
========================= */

function addCodeCopyButtons(container) {

    const blocks =
        container.querySelectorAll("pre");


    blocks.forEach(pre => {

        const wrapper =
            document.createElement("div");

        wrapper.className = "code-block";


        pre.parentNode.insertBefore(
            wrapper,
            pre
        );


        wrapper.appendChild(pre);


        const button =
            document.createElement("button");

        button.className =
            "copy-code-button";

        button.textContent = "Copy";


        button.addEventListener(
            "click",
            async () => {

                const code =
                    pre.innerText;

                await navigator.clipboard.writeText(
                    code
                );

                button.textContent = "Copied!";


                setTimeout(
                    () => {

                        button.textContent = "Copy";

                    },
                    1500
                );
            }
        );


        wrapper.appendChild(button);
    });
}


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


/* =========================
   SEND MESSAGE
========================= */

chatForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const text =
            messageInput.value.trim();


        if (!text) return;


        if (!currentChatId) {
            createChat();
        }


        const chat =
            getCurrentChat();


        if (!chat) return;


        if (chat.messages.length === 0) {

            chat.title =
                text.substring(0, 30);

            chatTitle.textContent =
                chat.title;
        }


        chat.messages.push({

            role: "user",

            content: text
        });


        saveConversations();

        renderChatList();


        addMessageToUI(
            "user",
            text
        );


        messageInput.value = "";

        autoGrow();


        sendButton.disabled = true;

        showLoading();


        currentController =
            new AbortController();


        try {

            const response =
                await fetch(
                    "/chat",
                    {

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
                    }
                );


            const data =
                await response.json();


            removeLoading();


            if (!data.success) {

                addMessageToUI(
                    "assistant",
                    data.message
                );

                return;
            }


            chat.messages.push({

                role: "assistant",

                content: data.message
            });


            saveConversations();


            addMessageToUI(
                "assistant",
                data.message
            );


        } catch (error) {

            removeLoading();


            if (
                error.name !== "AbortError"
            ) {

                addMessageToUI(
                    "assistant",
                    "Something went wrong. Please try again."
                );
            }


        } finally {

            sendButton.disabled = false;

            currentController = null;
        }

    }
);


/* =========================
   LOADING
========================= */

function showLoading() {

    const loading =
        document.createElement("div");

    loading.className = "message ai";

    loading.id = "loadingMessage";


    loading.innerHTML = `

        <div class="message-header">

            <div class="message-avatar">
                ✦
            </div>

            CHAT DPT

        </div>

        <div class="typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    chatContainer.appendChild(loading);

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
   NEW CHAT
========================= */

newChatButton.addEventListener(
    "click",
    () => {

        createChat();

    }
);


/* =========================
   CLEAR CURRENT CHAT
========================= */

clearChatButton.addEventListener(
    "click",
    () => {

        const chat =
            getCurrentChat();


        if (!chat) return;


        const confirmed =
            confirm("Clear this chat?");


        if (!confirmed) return;


        chat.messages = [];

        saveConversations();

        renderCurrentChat();
    }
);


/* =========================
   CLEAR ALL
========================= */

clearAllButton.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm("Delete all chats?");


        if (!confirmed) return;


        conversations = [];

        currentChatId = null;

        saveConversations();

        renderChatList();

        renderCurrentChat();
    }
);


/* =========================
   SEARCH
========================= */

searchChats.addEventListener(
    "input",
    () => {

        renderChatList(
            searchChats.value
        );

    }
);


/* =========================
   THEME
========================= */

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );


        themeToggle.textContent =
            isDark
                ? "☀ Light Mode"
                : "🌙 Dark Mode";

    }
);


/* =========================
   LOAD THEME
========================= */

function loadTheme() {

    const theme =
        localStorage.getItem("theme");


    if (theme === "dark") {

        document.body.classList.add("dark");

        themeToggle.textContent =
            "☀ Light Mode";
    }
}


/* =========================
   SIDEBAR TOGGLE
========================= */

menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle("hidden");

    }
);


/* =========================
   AUTO GROW
========================= */

function autoGrow() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            160
        ) + "px";
}


messageInput.addEventListener(
    "input",
    autoGrow
);


/* =========================
   ENTER TO SEND
========================= */

messageInput.addEventListener(
    "keydown",
    event => {

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
   EXPORT TXT
========================= */

exportTxt.addEventListener(
    "click",
    () => {

        const chat =
            getCurrentChat();


        if (
            !chat ||
            chat.messages.length === 0
        ) {

            alert(
                "There is no chat to export."
            );

            return;
        }


        let text =
            `CHAT DPT - ${chat.title}\n\n`;


        chat.messages.forEach(message => {

            const sender =
                message.role === "user"
                    ? "You"
                    : "CHAT DPT";


            text +=
                `${sender}:\n${message.content}\n\n`;

        });


        downloadFile(
            text,
            `${chat.title}.txt`,
            "text/plain"
        );

    }
);


/* =========================
   EXPORT JSON
========================= */

exportJson.addEventListener(
    "click",
    () => {

        const chat =
            getCurrentChat();


        if (!chat) {

            alert(
                "There is no chat to export."
            );

            return;
        }


        const json =
            JSON.stringify(
                chat,
                null,
                2
            );


        downloadFile(
            json,
            `${chat.title}.json`,
            "application/json"
        );

    }
);


/* =========================
   DOWNLOAD
========================= */

function downloadFile(
    content,
    filename,
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

    link.download = filename;

    link.click();


    URL.revokeObjectURL(url);
}


/* =========================
   INITIALIZE
========================= */

function initialize() {

    loadTheme();

    sidebar.classList.add("hidden");


    if (conversations.length === 0) {

        createChat();

    } else {

        if (
            !currentChatId ||
            !conversations.some(
                chat => chat.id === currentChatId
            )
        ) {

            currentChatId =
                conversations[0].id;
        }


        renderChatList();

        renderCurrentChat();

        saveConversations();
    }


    autoGrow();
}


initialize();