class GodrickChat {
    constructor() {
        this.messages = [];
        this.currentChartId = 0;
        this.charts = new Map();

        this.elements = {
            chatContainer: document.getElementById('chatContainer'),
            messagesContainer: document.getElementById('messages'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            newChatBtn: document.getElementById('newChatBtn')
        };

        this.initializeEventListeners();
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
    }

    updateSendButton() {
        const hasText = this.elements.messageInput.value.trim().length > 0;
        this.elements.sendBtn.disabled = !hasText;
    }

    newChat() {
        this.messages = [];
        this.elements.messagesContainer.innerHTML = '';
        this.elements.welcomeScreen.style.display = 'flex';
        this.elements.messageInput.value = '';
        this.updateSendButton();

        // Destroy all charts
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        this.currentChartId = 0;
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

        const avatar = role === 'user' ? 'Y' : 'G';
        const name = role === 'user' ? 'You' : 'Godrick';

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
            this.processChartData(contentDiv);
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

    processChartData(contentDiv) {
        // Find all code blocks with chart-data language
        const codeBlocks = contentDiv.querySelectorAll('pre code.language-chart-data');

        codeBlocks.forEach(codeBlock => {
            try {
                const jsonText = codeBlock.textContent;
                const chartData = JSON.parse(jsonText);

                // Create chart container
                const chartId = `chart-${this.currentChartId++}`;
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                chartContainer.innerHTML = `
                    ${chartData.title ? `<div class="chart-title">${chartData.title}</div>` : ''}
                    <div class="chart-wrapper">
                        <canvas id="${chartId}"></canvas>
                    </div>
                `;

                // Replace the code block with the chart
                const preElement = codeBlock.parentElement;
                preElement.parentElement.replaceChild(chartContainer, preElement);

                // Render chart
                this.renderChart(chartId, chartData);
            } catch (error) {
                console.error('Error parsing chart data:', error);
            }
        });
    }

    renderChart(chartId, chartData) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
        }

        // Create new chart with dark theme
        const chart = new Chart(ctx, {
            type: chartData.type || 'line',
            data: chartData.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#efefef'
                        }
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
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: this.messages
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
                            // Final update
                            const fullText = data.message.content[0].text;
                            this.updateMessage(messageId, fullText);
                            this.messages.push({ role: 'assistant', content: fullText });
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
    new GodrickChat();
});
