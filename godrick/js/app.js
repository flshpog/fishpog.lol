// ============================================================================
// WRIGHT CHATBOT - FRONTEND APPLICATION (app.js)
// ============================================================================
// This file controls the entire user interface. It handles:
//   1. Capturing user input and displaying messages
//   2. Sending messages to the backend server
//   3. Receiving and displaying streaming responses in real-time
//   4. Rendering special "artifacts" (charts, HTML previews, SVG images)
//   5. Managing user authentication state (login/logout)
//   6. Loading and displaying conversation history
// ============================================================================

class WrightChat {
    // ========================================================================
    // CONSTRUCTOR - Runs when the app starts
    // ========================================================================
    constructor() {
        // --- STATE VARIABLES ---
        // These track the current state of the chat application
        this.messages = [];              // Array of all messages in current conversation
        this.currentChartId = 0;         // Counter for unique chart IDs
        this.charts = new Map();         // Map to store Chart.js instances (for cleanup)
        this.currentConversationId = null;  // ID of current conversation (null if new)
        this.conversations = [];         // List of user's saved conversations

        // --- DOM ELEMENT REFERENCES ---
        // We grab all the HTML elements we need to interact with
        // This makes it easy to reference them later without querying the DOM repeatedly
        this.elements = {
            // Main chat elements
            chatContainer: document.getElementById('chatContainer'),      // Scrollable chat area
            messagesContainer: document.getElementById('messages'),       // Where messages appear
            welcomeScreen: document.getElementById('welcomeScreen'),      // Initial welcome view
            messageInput: document.getElementById('messageInput'),        // Text input field
            sendBtn: document.getElementById('sendBtn'),                  // Send button
            newChatBtn: document.getElementById('newChatBtn'),            // New chat button

            // Authentication UI elements
            authButtons: document.getElementById('authButtons'),          // Login button container
            userMenu: document.getElementById('userMenu'),                // Logged-in user menu
            loginBtn: document.getElementById('loginBtn'),
            logoutBtn: document.getElementById('logoutBtn'),
            userAvatar: document.getElementById('userAvatar'),
            userName: document.getElementById('userName'),

            // Login/Signup modal elements
            authModal: document.getElementById('authModal'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalClose: document.getElementById('modalClose'),
            authTabs: document.querySelectorAll('.auth-tab'),
            loginForm: document.getElementById('loginForm'),
            signupForm: document.getElementById('signupForm'),
            loginError: document.getElementById('loginError'),
            signupError: document.getElementById('signupError'),

            // OAuth buttons (Google/GitHub login)
            googleLoginBtn: document.getElementById('googleLoginBtn'),
            githubLoginBtn: document.getElementById('githubLoginBtn'),

            // Sidebar conversation list
            conversationList: document.getElementById('conversationList'),

            // Settings modal elements
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            settingsModalOverlay: document.getElementById('settingsModalOverlay'),
            settingsModalClose: document.getElementById('settingsModalClose'),
            themeGrid: document.getElementById('themeGrid'),
            fontGrid: document.getElementById('fontGrid'),
            accentColorPicker: document.getElementById('accentColorPicker'),
            accentColorValue: document.getElementById('accentColorValue'),
            resetColorBtn: document.getElementById('resetColorBtn')
        };

        // --- INITIALIZE THE APP ---
        this.initializeEventListeners();  // Set up click handlers, etc.
        this.initializeAuth();            // Set up authentication
        this.initializeSettings();        // Set up theme/font settings
    }

    // ========================================================================
    // AUTHENTICATION METHODS
    // ========================================================================

    initializeAuth() {
        // When auth state changes (login/logout), update the UI
        authManager.onAuthChange = (user) => this.handleAuthChange(user);

        // Check if user is already logged in (from a previous session)
        if (authManager.user) {
            this.handleAuthChange(authManager.user);
        }
    }

    handleAuthChange(user) {
        // This runs whenever the user logs in or out
        if (user) {
            // --- USER LOGGED IN ---
            // Hide login button, show user menu
            this.elements.authButtons.classList.add('hidden');
            this.elements.userMenu.classList.remove('hidden');
            this.elements.userName.textContent = user.display_name || user.email;
            // Show first letter of name as avatar fallback
            this.elements.userAvatar.textContent = (user.display_name || user.email || 'U')[0].toUpperCase();

            // If user has a profile picture (from Google/GitHub OAuth), show it
            if (user.avatar_url) {
                this.elements.userAvatar.style.backgroundImage = `url(${user.avatar_url})`;
                this.elements.userAvatar.style.backgroundSize = 'cover';
                this.elements.userAvatar.textContent = '';
            }

            // Load user's saved conversations from the server
            this.loadConversations();
            // Load user's theme preferences
            this.loadUserPreferences();
            this.closeAuthModal();
        } else {
            // --- USER LOGGED OUT ---
            // Show login button, hide user menu
            this.elements.authButtons.classList.remove('hidden');
            this.elements.userMenu.classList.add('hidden');
            this.elements.userAvatar.style.backgroundImage = '';
            this.conversations = [];
            this.renderConversationList();
        }
    }

    // ========================================================================
    // EVENT LISTENERS - Connect user actions to code
    // ========================================================================

    initializeEventListeners() {
        // --- SEND MESSAGE ---
        // Click send button to send message
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

        // Press Enter to send (Shift+Enter for new line)
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();  // Prevent newline
                this.sendMessage();
            }
        });

        // Auto-resize the input textarea as user types
        this.elements.messageInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
            this.updateSendButton();  // Enable/disable send button based on content
        });

        // --- NEW CHAT ---
        this.elements.newChatBtn.addEventListener('click', () => this.newChat());

        // --- SUGGESTION BUTTONS ---
        // Quick prompts on the welcome screen
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.elements.messageInput.value = prompt;
                this.updateSendButton();
                this.sendMessage();
            });
        });

        // --- AUTHENTICATION MODAL ---
        this.elements.loginBtn?.addEventListener('click', () => this.openAuthModal());
        this.elements.modalOverlay?.addEventListener('click', () => this.closeAuthModal());
        this.elements.modalClose?.addEventListener('click', () => this.closeAuthModal());
        this.elements.logoutBtn?.addEventListener('click', () => this.logout());

        // Switch between Login and Signup tabs
        this.elements.authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
        });

        // Form submissions
        this.elements.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.signupForm?.addEventListener('submit', (e) => this.handleSignup(e));

        // OAuth login buttons (Google/GitHub)
        this.elements.googleLoginBtn?.addEventListener('click', () => authManager.loginWithGoogle());
        this.elements.githubLoginBtn?.addEventListener('click', () => authManager.loginWithGithub());

        // --- SETTINGS MODAL ---
        this.elements.settingsBtn?.addEventListener('click', () => this.openSettingsModal());
        this.elements.settingsModalOverlay?.addEventListener('click', () => this.closeSettingsModal());
        this.elements.settingsModalClose?.addEventListener('click', () => this.closeSettingsModal());
    }

    initializeSettings() {
        // Theme selection
        this.elements.themeGrid?.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                themeManager.applyTheme(btn.dataset.theme);
            });
        });

        // Font selection
        this.elements.fontGrid?.querySelectorAll('.font-option').forEach(btn => {
            btn.addEventListener('click', () => {
                themeManager.applyFont(btn.dataset.font);
            });
        });

        // Accent color picker
        this.elements.accentColorPicker?.addEventListener('input', (e) => {
            themeManager.applyAccentColor(e.target.value);
            if (this.elements.accentColorValue) {
                this.elements.accentColorValue.textContent = e.target.value;
            }
        });

        // Reset color button
        this.elements.resetColorBtn?.addEventListener('click', () => {
            themeManager.resetAccentColor();
        });

        // Set up server sync for logged-in users
        themeManager.onPreferencesChange = async (prefs) => {
            if (authManager.isLoggedIn()) {
                try {
                    await fetch(`${API_URL}/api/auth/preferences`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            ...authManager.getAuthHeader()
                        },
                        body: JSON.stringify({ preferences: prefs })
                    });
                } catch (error) {
                    console.error('Error saving preferences to server:', error);
                }
            }
        };
    }

    openSettingsModal() {
        this.elements.settingsModal?.classList.remove('hidden');
    }

    closeSettingsModal() {
        this.elements.settingsModal?.classList.add('hidden');
    }

    openAuthModal() {
        this.elements.authModal?.classList.remove('hidden');
    }

    closeAuthModal() {
        this.elements.authModal?.classList.add('hidden');
        this.elements.loginError.textContent = '';
        this.elements.signupError.textContent = '';
    }

    switchAuthTab(tab) {
        this.elements.authTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        this.elements.loginForm.classList.toggle('hidden', tab !== 'login');
        this.elements.signupForm.classList.toggle('hidden', tab !== 'signup');
        this.elements.loginError.textContent = '';
        this.elements.signupError.textContent = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await authManager.login(email, password);
        } catch (error) {
            this.elements.loginError.textContent = error.message;
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            await authManager.register(email, password, name);
        } catch (error) {
            this.elements.signupError.textContent = error.message;
        }
    }

    logout() {
        authManager.logout();
        this.newChat();
    }

    async loadUserPreferences() {
        if (!authManager.isLoggedIn()) return;

        try {
            const response = await fetch(`${API_URL}/api/auth/preferences`, {
                headers: authManager.getAuthHeader()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.preferences && Object.keys(data.preferences).length > 0) {
                    themeManager.applyPreferences(data.preferences);
                }
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    async loadConversations() {
        if (!authManager.isLoggedIn()) return;

        try {
            const response = await fetch(`${API_URL}/api/conversations`, {
                headers: authManager.getAuthHeader()
            });

            if (response.ok) {
                const data = await response.json();
                this.conversations = data.conversations;
                this.renderConversationList();
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    renderConversationList() {
        if (!this.elements.conversationList) return;

        // Clear existing items except the template
        this.elements.conversationList.innerHTML = '';

        if (!authManager.isLoggedIn()) {
            this.elements.conversationList.innerHTML = `
                <div class="history-item active">
                    <span>Current conversation</span>
                </div>
            `;
            return;
        }

        if (this.conversations.length === 0) {
            this.elements.conversationList.innerHTML = `
                <div class="history-empty">No saved conversations</div>
            `;
            return;
        }

        this.conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = `history-item ${conv.id === this.currentConversationId ? 'active' : ''}`;
            item.innerHTML = `
                <span class="history-title">${this.escapeHtml(conv.title)}</span>
                <button class="history-delete" title="Delete conversation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;

            item.querySelector('.history-title').addEventListener('click', () => {
                this.loadConversation(conv.id);
            });

            item.querySelector('.history-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteConversation(conv.id);
            });

            this.elements.conversationList.appendChild(item);
        });
    }

    async loadConversation(conversationId) {
        if (!authManager.isLoggedIn()) return;

        try {
            const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
                headers: authManager.getAuthHeader()
            });

            if (response.ok) {
                const data = await response.json();
                this.currentConversationId = conversationId;
                this.messages = data.conversation.messages.map(m => ({
                    role: m.role,
                    content: m.content
                }));

                // Render messages
                this.elements.messagesContainer.innerHTML = '';
                this.elements.welcomeScreen.style.display = 'none';

                data.conversation.messages.forEach(msg => {
                    this.addMessage(msg.role, msg.content);
                });

                // Update active state in list
                this.renderConversationList();
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    }

    async deleteConversation(conversationId) {
        if (!authManager.isLoggedIn()) return;
        if (!confirm('Delete this conversation?')) return;

        try {
            const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: authManager.getAuthHeader()
            });

            if (response.ok) {
                this.conversations = this.conversations.filter(c => c.id !== conversationId);
                if (this.currentConversationId === conversationId) {
                    this.newChat();
                }
                this.renderConversationList();
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateSendButton() {
        const hasText = this.elements.messageInput.value.trim().length > 0;
        this.elements.sendBtn.disabled = !hasText;
    }

    newChat() {
        this.messages = [];
        this.currentConversationId = null;
        this.elements.messagesContainer.innerHTML = '';
        this.elements.welcomeScreen.style.display = 'flex';
        this.elements.messageInput.value = '';
        this.updateSendButton();

        // Destroy all charts
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        this.currentChartId = 0;

        // Update conversation list
        this.renderConversationList();
    }

    // ========================================================================
    // CORE CHAT FUNCTIONALITY - Sending and receiving messages
    // ========================================================================

    async sendMessage() {
        // Get the message text and remove extra whitespace
        const content = this.elements.messageInput.value.trim();
        if (!content) return;  // Don't send empty messages

        // Hide the welcome screen (first message hides it)
        this.elements.welcomeScreen.style.display = 'none';

        // Display the user's message in the chat
        this.addMessage('user', content);
        // Add to our internal message array (this gets sent to the API)
        this.messages.push({ role: 'user', content });

        // Clear the input field
        this.elements.messageInput.value = '';
        this.elements.messageInput.style.height = 'auto';
        this.updateSendButton();

        // Create a placeholder for the AI's response (shows typing indicator)
        const assistantMessageId = this.addMessage('assistant', '', true);

        try {
            // Stream the response from the server (this is where the magic happens!)
            await this.streamResponse(assistantMessageId);
        } catch (error) {
            console.error('Error:', error);
            this.updateMessage(assistantMessageId, 'Sorry, I encountered an error. Please try again.');
        }
    }

    addMessage(role, content, isStreaming = false) {
        const messageId = `msg-${Date.now()}-${Math.random()}`;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.id = messageId;

        const avatar = role === 'user' ? 'Y' : 'W';
        const name = role === 'user' ? 'You' : 'Wright';

        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar ${role}">${avatar}</div>
                <div class="message-name">${name}</div>
            </div>
            <div class="message-content" id="${messageId}-content">
                ${isStreaming ? '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>' : this.formatContent(content)}
            </div>
        `;

        this.elements.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        return messageId;
    }

    updateMessage(messageId, content) {
        const contentDiv = document.getElementById(`${messageId}-content`);
        if (contentDiv) {
            contentDiv.innerHTML = this.formatContent(content);
            this.processArtifacts(contentDiv);
        }
    }

    formatContent(content) {
        if (!content) return '';

        // Use marked.js to parse markdown
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        return marked.parse(content);
    }

    // ========================================================================
    // ARTIFACT PROCESSING - Special content types (Charts, HTML, SVG)
    // ========================================================================
    // When Claude outputs special code blocks (chart-data, html-preview, svg-image),
    // we detect them and replace the raw code with interactive rendered content.
    // This is what makes Wright special - it can generate visual artifacts!

    processArtifacts(contentDiv) {
        // Process each type of special artifact
        this.processChartData(contentDiv);    // Interactive charts
        this.processHtmlPreviews(contentDiv); // Live HTML previews
        this.processSvgImages(contentDiv);    // Vector graphics
    }

    // --- CHART PROCESSING ---
    // Finds ```chart-data blocks and renders them as interactive Chart.js charts
    processChartData(contentDiv) {
        // Find all code blocks marked as "chart-data"
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-chart-data');

        codeBlocks.forEach(codeBlock => {
            try {
                // Parse the JSON inside the code block
                const jsonText = codeBlock.textContent;
                const chartData = JSON.parse(jsonText);

                // Create a container for the chart
                const chartId = `chart-${this.currentChartId++}`;
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                chartContainer.innerHTML = `
                    ${chartData.title ? `<div class="chart-title">${chartData.title}</div>` : ''}
                    <div class="chart-wrapper">
                        <canvas id="${chartId}"></canvas>
                    </div>
                `;

                // Replace the code block with the chart container
                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(chartContainer, preElement);

                // Render the actual chart using Chart.js
                this.renderChart(chartId, chartData);
            } catch (error) {
                console.error('Error parsing chart data:', error);
            }
        });
    }

    // --- HTML PREVIEW PROCESSING ---
    // Finds ```html-preview blocks and renders them in sandboxed iframes
    processHtmlPreviews(contentDiv) {
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-html-preview');

        codeBlocks.forEach(codeBlock => {
            try {
                const htmlContent = codeBlock.textContent;

                // Create an artifact container with header and iframe
                const artifactContainer = document.createElement('div');
                artifactContainer.className = 'artifact-container html-artifact';
                artifactContainer.innerHTML = `
                    <div class="artifact-header">
                        <span class="artifact-type">HTML Preview</span>
                        <button class="artifact-expand-btn" title="Open in new tab">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="artifact-content">
                        <iframe sandbox="allow-scripts" class="html-preview-frame"></iframe>
                    </div>
                `;

                // Replace the code block with the artifact container
                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(artifactContainer, preElement);

                // Load the HTML into the iframe using srcdoc (safer than src)
                const iframe = artifactContainer.querySelector('iframe');
                iframe.srcdoc = htmlContent;

                // "Open in new tab" button
                const expandBtn = artifactContainer.querySelector('.artifact-expand-btn');
                expandBtn.addEventListener('click', () => {
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(htmlContent);
                    newWindow.document.close();
                });
            } catch (error) {
                console.error('Error processing HTML preview:', error);
            }
        });
    }

    // --- SVG IMAGE PROCESSING ---
    // Finds ```svg-image blocks and renders them as inline SVG with download option
    processSvgImages(contentDiv) {
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-svg-image');

        codeBlocks.forEach(codeBlock => {
            try {
                const svgContent = codeBlock.textContent;

                // Create an artifact container with the SVG rendered inline
                const artifactContainer = document.createElement('div');
                artifactContainer.className = 'artifact-container svg-artifact';
                artifactContainer.innerHTML = `
                    <div class="artifact-header">
                        <span class="artifact-type">SVG Image</span>
                        <button class="artifact-download-btn" title="Download SVG">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="artifact-content svg-content">
                        ${svgContent}
                    </div>
                `;

                // Replace the code block with the artifact container
                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(artifactContainer, preElement);

                // Download button - creates a blob and triggers download
                const downloadBtn = artifactContainer.querySelector('.artifact-download-btn');
                downloadBtn.addEventListener('click', () => {
                    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'wright-image.svg';
                    a.click();
                    URL.revokeObjectURL(url);  // Clean up the blob URL
                });
            } catch (error) {
                console.error('Error processing SVG image:', error);
            }
        });
    }

    renderChart(chartId, chartData) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
        }

        const chart = new Chart(ctx, {
            type: chartData.type || 'line',
            data: chartData.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#efefef' }
                    },
                    tooltip: {
                        backgroundColor: '#2d2d2d',
                        titleColor: '#efefef',
                        bodyColor: '#efefef',
                        borderColor: '#3d3d3d',
                        borderWidth: 1
                    }
                },
                scales: chartData.type !== 'pie' && chartData.type !== 'doughnut' ? {
                    x: {
                        ticks: { color: '#b4b4b4' },
                        grid: { color: '#3d3d3d' }
                    },
                    y: {
                        ticks: { color: '#b4b4b4' },
                        grid: { color: '#3d3d3d' }
                    }
                } : {},
                ...chartData.options
            }
        });

        this.charts.set(chartId, chart);
    }

    // ========================================================================
    // STREAMING RESPONSE - Real-time message reception using Server-Sent Events
    // ========================================================================
    // This method receives the AI's response word-by-word as it's being generated.
    // Instead of waiting for the entire response, we update the UI in real-time.
    // This creates the "typing" effect you see in ChatGPT and Claude.

    async streamResponse(messageId) {
        // Set up request headers (include auth token if logged in)
        const headers = {
            'Content-Type': 'application/json',
            ...authManager.getAuthHeader()  // Adds "Authorization: Bearer <token>" if logged in
        };

        // --- STEP 1: Send the request to our backend ---
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages: this.messages,              // Full conversation history
                conversationId: this.currentConversationId  // null for new conversations
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // --- STEP 2: Set up streaming reader ---
        // The response body is a stream, not a single blob of text
        const reader = response.body.getReader();
        const decoder = new TextDecoder();  // Converts bytes to text
        let accumulatedText = '';  // Build up the full response

        // --- STEP 3: Read the stream chunk by chunk ---
        while (true) {
            // Read the next chunk from the stream
            const { done, value } = await reader.read();

            if (done) break;  // Stream finished

            // Decode the bytes into text
            const chunk = decoder.decode(value, { stream: true });
            // SSE format: each message is on its own line
            const lines = chunk.split('\n');

            // --- STEP 4: Process each SSE message ---
            for (const line of lines) {
                // SSE messages start with "data: "
                if (line.startsWith('data: ')) {
                    try {
                        // Parse the JSON after "data: "
                        const data = JSON.parse(line.slice(6));

                        if (data.type === 'text') {
                            // --- NEW TEXT CHUNK ---
                            // Add to accumulated text and update the UI
                            accumulatedText += data.content;
                            this.updateMessage(messageId, accumulatedText);
                            this.scrollToBottom();  // Keep scrolled to bottom
                        } else if (data.type === 'done') {
                            // --- RESPONSE COMPLETE ---
                            // Get the final full text and update
                            const fullText = data.message.content[0].text;
                            this.updateMessage(messageId, fullText);
                            // Add to our message history for context in future messages
                            this.messages.push({ role: 'assistant', content: fullText });

                            // If this was a new conversation, save the ID for future messages
                            if (data.conversationId && !this.currentConversationId) {
                                this.currentConversationId = data.conversationId;
                                this.loadConversations();  // Refresh sidebar
                            }
                        } else if (data.type === 'error') {
                            console.error('Stream error:', data.error);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
    }

    scrollToBottom() {
        this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WrightChat();
});
