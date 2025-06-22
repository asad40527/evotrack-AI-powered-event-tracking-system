import { ApiService } from '../../services/apiService';

export function initializeChatbot() {
    const CHATBOT_CONTAINER_ID = 'chatbot-box';
    const MAX_MESSAGE_LENGTH = 500;
    const DEBOUNCE_DELAY = 300;

    const container = document.getElementById(CHATBOT_CONTAINER_ID);
    if (!container) {
        console.error(`Chatbot container not found (${CHATBOT_CONTAINER_ID})`);
        return;
    }

    const toggleButton = document.getElementById('chatbot-toggle');
    const closeButton = document.getElementById('chatbot-close');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const charCounter = document.getElementById('char-counter');
    const clearHistoryBtn = document.getElementById('clear-history');
    const generateReportBtn = document.getElementById('generate-report');
    const sendReportNowBtn = document.getElementById('send-report-email'); // NEW

    let isProcessing = false;
    let typingInterval;
    let debounceTimer;

    function init() {
        setupEventListeners();
        addWelcomeMessage();
        updateCharCounter();
        messagesContainer.setAttribute('aria-live', 'polite');
        messagesContainer.setAttribute('aria-atomic', 'false');
    }

    function setupEventListeners() {
        toggleButton?.addEventListener('click', toggleChatbot);
        closeButton?.addEventListener('click', () => container.classList.add('hidden'));
        sendBtn?.addEventListener('click', handleSendMessage);
        clearHistoryBtn?.addEventListener('click', clearChatHistory);
        generateReportBtn?.addEventListener('click', handleGenerateReport);
        sendReportNowBtn?.addEventListener('click', handleSendReportNow);

        input?.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                updateCharCounter();
                sendBtn.disabled = input.value.trim().length === 0 || isProcessing;
            }, DEBOUNCE_DELAY);
        });

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    async function handleSendMessage() {
        const userMessage = input.value.trim();
        if (!userMessage || isProcessing) return;

        input.value = '';
        sendBtn.disabled = true;
        updateCharCounter();

        await processUserMessage(userMessage);
    }

    async function processUserMessage(userMessage) {
        isProcessing = true;
        input.disabled = true;

        addMessage(userMessage, 'user');
        showTypingIndicator();

        try {
            const response = await ApiService.sendChatMessage(userMessage);
            hideTypingIndicator();

            const botText = response?.botResponse || "Sorry, I couldn't process that.";
            addMessage(botText, 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            hideTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        } finally {
            isProcessing = false;
            input.disabled = false;
            input.focus();
        }
    }

    async function handleGenerateReport() {
        if (isProcessing) return;

        isProcessing = true;
        showTypingIndicator();
        addMessage("Generating report, please wait...", "user");

        try {
            const response = await ApiService.generateAnalyticsReport();
            hideTypingIndicator();

            const reportText = response?.report || "Unable to generate report.";
            const messageEl = addMessage(reportText, 'bot');

            addDownloadButton(messageEl, reportText);
        } catch (error) {
            hideTypingIndicator();
            addMessage("Failed to generate report. Please try again later.", 'bot');
        } finally {
            isProcessing = false;
        }
    }

    async function handleSendReportNow() {
        if (isProcessing) return;

        const email = prompt("Enter your email to receive the report:");
        if (!email || !email.includes('@')) {
            addMessage("Invalid email address.", "bot");
            return;
        }

        isProcessing = true;
        showTypingIndicator();
        addMessage(`Sending report to ${email}...`, 'user');

        try {
            const response = await ApiService.sendReportToEmail(email);
            hideTypingIndicator();

            if (response.success) {
                addMessage(`✅ Report has been emailed to ${email}.`, 'bot');
            } else {
                addMessage("❌ Failed to send the report.", 'bot');
            }
        } catch (err) {
            console.error(err);
            hideTypingIndicator();
            addMessage("Something went wrong. Could not send the report.", 'bot');
        } finally {
            isProcessing = false;
        }
    }

    async function clearChatHistory() {
        if (isProcessing) return;
        try {
            await ApiService.clearChatHistory();
            messagesContainer.innerHTML = ''; // Clear chat on frontend immediately
            addWelcomeMessage();
        } catch (error) {
            console.error('Error clearing history:', error);
            addMessage("Could not clear history right now.", 'bot');
        }
    }

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `
            max-w-[80%] p-3 rounded-lg
            ${sender === 'user'
                ? 'bg-gray-100 dark:bg-gray-700 ml-auto'
                : 'bg-indigo-100 dark:bg-gray-700 mr-auto'}
            transition-all duration-200
        `;
        messageElement.innerHTML = `
            <span class="font-medium">${sender === 'user' ? 'You' : 'Assistant'}:</span>
            <p class="mt-1 whitespace-pre-line">${text}</p>
        `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageElement;
    }

    function addDownloadButton(afterElement, text) {
        const button = document.createElement('button');
        button.textContent = '⬇️ Download Report as PDF';
        button.className = 'mt-2 text-xs text-indigo-600 hover:underline';
        button.onclick = () => downloadTextAsPDF(text);
        afterElement.appendChild(button);
    }

    function downloadTextAsPDF(text) {
        const wrapper = document.createElement('div');

        const formattedContent = text
            .replace(/^(#+)(.*)/gm, (match, hashes, content) => {
                const level = hashes.length;
                return `<h${level} style="color:#4f46e5; margin-top:1.2em;">${content.trim()}</h${level}>`;
            })
            .replace(/\b(positive|negative|neutral)\b/gi, (match) => {
                const color = match.toLowerCase() === 'positive' ? 'green' :
                              match.toLowerCase() === 'negative' ? 'red' : 'gray';
                return `<strong style="color:${color}; text-transform:capitalize;">${match}</strong>`;
            })
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code style="background:#f3f3f3;padding:2px 4px;border-radius:4px;">$1</code>');

        wrapper.innerHTML = `
            <div style="
                font-family: 'Segoe UI', Arial, sans-serif;
                padding: 30px;
                color: #333;
                max-width: 800px;
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="src/images/logo/logo.svg" alt="Logo" width="100" style="margin-bottom: 10px;" />
                    <h1 style="color:#1e40af; font-size: 24px; margin: 0;">Weekly Analytics Report</h1>
                    <p style="color: #6b7280; font-size: 12px;">Generated by EvoBot Assistant</p>
                    <hr style="margin-top: 15px;">
                </div>
                <div style="font-size: 13px; line-height: 1.7; text-align: justify;">
                    ${formattedContent}
                </div>
            </div>
        `;

        const opt = {
            margin: 0.3,
            filename: 'analytics-report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(wrapper).set(opt).save();
    }

    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        let dots = 0;
        typingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            typingIndicator.textContent = 'Assistant is typing' + '.'.repeat(dots);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 500);
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
        clearInterval(typingInterval);
    }

    function updateCharCounter() {
        const length = input.value.length;
        charCounter.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
        charCounter.classList.toggle('hidden', length === 0);
    }

    function toggleChatbot() {
        container.classList.toggle('hidden');
        if (!container.classList.contains('hidden')) {
            input.focus();
        }
    }

    function addWelcomeMessage() {
        addMessage("Hello! I'm your AI assistant. How can I help you today?", 'bot');
    }

    init();

    return () => {
        clearInterval(typingInterval);
        clearTimeout(debounceTimer);
    };
}
