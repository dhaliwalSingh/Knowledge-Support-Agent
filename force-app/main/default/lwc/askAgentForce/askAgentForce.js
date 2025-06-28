import { LightningElement, track } from 'lwc';
import callAgent from '@salesforce/apex/AgentForceAgentCaller.invokeKnowledgeSupportAgent';

export default class AskAgentLWC extends LightningElement {
    @track userQuestion = '';
    @track chatHistory = [];
    @track isLoading = false;
    messageId = 0;
    @track currentSessionId = null;

    connectedCallback() {
        this.addMessage('Hello! How can I assist you today?', 'agent', 'Hello! How can I assist you today?');
    }

    handleChange(event) {
        this.userQuestion = event.target.value;
    }

    async handleAsk() {
        const question = this.userQuestion?.trim();
        if (!question) return;

        this.addMessage(question, 'user', question);
        this.userQuestion = '';
        this.isLoading = true;

        try {
            const res = await callAgent({
                userQuestion: question,
                sessionId: this.currentSessionId
            });

            let agentResponseText = res.agentResponse || 'Agent did not return a response.';
            let botReturnedSessionId = res.sessionId;

            // 🔍 Try to extract .value from JSON if present
            let extractedText = agentResponseText;
            try {
                const parsed = JSON.parse(agentResponseText);
                if (parsed && parsed.value) {
                    extractedText = parsed.value;
                }
            } catch (e) {
                console.warn('Non-JSON response. Using raw agent text.');
            }

            // ✅ Format the response
            const formattedAgentResponse = this.formatAgentResponse(extractedText);

            // 🧠 Save updated sessionId
            if (botReturnedSessionId && botReturnedSessionId !== this.currentSessionId) {
                this.currentSessionId = botReturnedSessionId;
                console.log('Using new session ID from bot:', this.currentSessionId);
            }

            this.addMessage(formattedAgentResponse, 'agent', extractedText);

        } catch (error) {
            console.error('Error calling agent:', error);
            const fallback = '⚠️ Something went wrong while contacting the agent.';
            this.addMessage(fallback, 'agent', fallback);
        } finally {
            this.isLoading = false;
        }
    }

    addMessage(htmlContent, sender, rawText) {
        const emoji = sender === 'agent' ? '🤖 ' : '👤 ';
        const newMsg = {
            id: ++this.messageId,
            text: rawText,
            htmlContent: emoji + htmlContent,
            senderClass: sender === 'user' ? 'msg-user' : 'msg-agent'
        };

        this.chatHistory = [...this.chatHistory, newMsg];

        requestAnimationFrame(() => {
            const chatBubble = this.template.querySelector(`[data-id="${newMsg.id}"]`);
            if (chatBubble) {
                chatBubble.innerHTML = newMsg.htmlContent;

                const chatWindow = this.template.querySelector('.chat-window');
                if (chatWindow) {
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            }
        });
    }

    handleNewConversation() {
        this.chatHistory = [];
        this.userQuestion = '';
        this.currentSessionId = null;
        this.addMessage('New conversation started. How can I help you?', 'agent', 'New conversation started. How can I help you?');
    }

    formatAgentResponse(text) {
        if (!text) return '';

        let html = text.replace(/\\n/g, '\n');

        // Headings ending with colon
        html = html.replace(/^(.+?):$/gm, '<b>$1:</b>');

        // Bullet points
        html = html.replace(/^- (.*)$/gm, '<li>• $1</li>');
        html = html.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        // Links
        html = html.replace(/https?:\/\/[^\s)]+/g, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });

        // Line wrapping
        html = html.split('\n').map(line => {
            if (line.trim().startsWith('<ul>') || line.trim().startsWith('<li>')) {
                return line;
            }
            return line.trim() !== '' ? `<p>${line.trim()}</p>` : '';
        }).join('');

        return html;
    }
}