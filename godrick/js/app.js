class WrightChat {
    constructor() {
        this.messages = [];
        this.currentChartId = 0;
        this.charts = new Map();
        this.currentConversationId = null;
        this.conversations = [];

        this.elements = {
            chatContainer: document.getElementById('chatContainer'),
            messagesContainer: document.getElementById('messages'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            newChatBtn: document.getElementById('newChatBtn'),
            // Auth elements
            authButtons: document.getElementById('authButtons'),
            userMenu: document.getElementById('userMenu'),
            loginBtn: document.getElementById('loginBtn'),
            logoutBtn: document.getElementById('logoutBtn'),
            userAvatar: document.getElementById('userAvatar'),
            userName: document.getElementById('userName'),
            // Modal elements
            authModal: document.getElementById('authModal'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalClose: document.getElementById('modalClose'),
            authTabs: document.querySelectorAll('.auth-tab'),
            loginForm: document.getElementById('loginForm'),
            signupForm: document.getElementById('signupForm'),
            loginError: document.getElementById('loginError'),
            signupError: document.getElementById('signupError'),
            // OAuth buttons
            googleLoginBtn: document.getElementById('googleLoginBtn'),
            githubLoginBtn: document.getElementById('githubLoginBtn'),
            // Conversation list
            conversationList: document.getElementById('conversationList')
        };

        this.initializeEventListeners();
        this.initializeAuth();
    }

    initializeAuth() {
        // Set up auth state change callback
        authManager.onAuthChange = (user) => this.handleAuthChange(user);

        // Check if already logged in
        if (authManager.user) {
            this.handleAuthChange(authManager.user);
        }
    }

    handleAuthChange(user) {
        if (user) {
            // Logged in
            this.elements.authButtons.classList.add('hidden');
            this.elements.userMenu.classList.remove('hidden');
            this.elements.userName.textContent = user.display_name || user.email;
            this.elements.userAvatar.textContent = (user.display_name || user.email || 'U')[0].toUpperCase();

            if (user.avatar_url) {
                this.elements.userAvatar.style.backgroundImage = `url(${user.avatar_url})`;
                this.elements.userAvatar.style.backgroundSize = 'cover';
                this.elements.userAvatar.textContent = '';
            }

            // Load conversations
            this.loadConversations();
            this.closeAuthModal();
        } else {
            // Logged out
            this.elements.authButtons.classList.remove('hidden');
            this.elements.userMenu.classList.add('hidden');
            this.elements.userAvatar.style.backgroundImage = '';
            this.conversations = [];
            this.renderConversationList();
        }
    }

    initializeEventListeners() {
        // Send button click
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

        // Enter to send (Shift+Enter for new line)
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.elements.messageInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
            this.updateSendButton();
        });

        // New chat button
        this.elements.newChatBtn.addEventListener('click', () => this.newChat());

        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.elements.messageInput.value = prompt;
                this.updateSendButton();
                this.sendMessage();
            });
        });

        // Auth modal
        this.elements.loginBtn?.addEventListener('click', () => this.openAuthModal());
        this.elements.modalOverlay?.addEventListener('click', () => this.closeAuthModal());
        this.elements.modalClose?.addEventListener('click', () => this.closeAuthModal());
        this.elements.logoutBtn?.addEventListener('click', () => this.logout());

        // Auth tabs
        this.elements.authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
        });

        // Login form
        this.elements.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));

        // Signup form
        this.elements.signupForm?.addEventListener('submit', (e) => this.handleSignup(e));

        // OAuth buttons
        this.elements.googleLoginBtn?.addEventListener('click', () => authManager.loginWithGoogle());
        this.elements.githubLoginBtn?.addEventListener('click', () => authManager.loginWithGithub());
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

    async sendMessage() {
        const content = this.elements.messageInput.value.trim();
        if (!content) return;

        // Hide welcome screen
        this.elements.welcomeScreen.style.display = 'none';

        // Add user message
        this.addMessage('user', content);
        this.messages.push({ role: 'user', content });

        // Clear input
        this.elements.messageInput.value = '';
        this.elements.messageInput.style.height = 'auto';
        this.updateSendButton();

        // Add assistant message placeholder
        const assistantMessageId = this.addMessage('assistant', '', true);

        try {
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

    processArtifacts(contentDiv) {
        // Process chart-data artifacts
        this.processChartData(contentDiv);
        // Process HTML preview artifacts
        this.processHtmlPreviews(contentDiv);
        // Process SVG image artifacts
        this.processSvgImages(contentDiv);
    }

    processChartData(contentDiv) {
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-chart-data');

        codeBlocks.forEach(codeBlock => {
            try {
                const jsonText = codeBlock.textContent;
                const chartData = JSON.parse(jsonText);

                const chartId = `chart-${this.currentChartId++}`;
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                chartContainer.innerHTML = `
                    ${chartData.title ? `<div class="chart-title">${chartData.title}</div>` : ''}
                    <div class="chart-wrapper">
                        <canvas id="${chartId}"></canvas>
                    </div>
                `;

                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(chartContainer, preElement);

                this.renderChart(chartId, chartData);
            } catch (error) {
                console.error('Error parsing chart data:', error);
            }
        });
    }

    processHtmlPreviews(contentDiv) {
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-html-preview');

        codeBlocks.forEach(codeBlock => {
            try {
                const htmlContent = codeBlock.textContent;

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

                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(artifactContainer, preElement);

                const iframe = artifactContainer.querySelector('iframe');
                iframe.srcdoc = htmlContent;

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

    processSvgImages(contentDiv) {
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-svg-image');

        codeBlocks.forEach(codeBlock => {
            try {
                const svgContent = codeBlock.textContent;

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

                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(artifactContainer, preElement);

                const downloadBtn = artifactContainer.querySelector('.artifact-download-btn');
                downloadBtn.addEventListener('click', () => {
                    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'wright-image.svg';
                    a.click();
                    URL.revokeObjectURL(url);
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

    async streamResponse(messageId) {
        const headers = {
            'Content-Type': 'application/json',
            ...authManager.getAuthHeader()
        };

        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages: this.messages,
                conversationId: this.currentConversationId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === 'text') {
                            accumulatedText += data.content;
                            this.updateMessage(messageId, accumulatedText);
                            this.scrollToBottom();
                        } else if (data.type === 'done') {
                            const fullText = data.message.content[0].text;
                            this.updateMessage(messageId, fullText);
                            this.messages.push({ role: 'assistant', content: fullText });

                            // Update conversation ID if new conversation was created
                            if (data.conversationId && !this.currentConversationId) {
                                this.currentConversationId = data.conversationId;
                                this.loadConversations(); // Refresh list
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
