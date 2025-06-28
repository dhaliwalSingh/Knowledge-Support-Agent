# 🔎 AgentForce Knowledge Support Chat

This is a Salesforce-native AI chatbot application built using **Lightning Web Components (LWC)** and **AgentForce (Einstein GPT)**. The application allows users to chat with a custom AI agent powered by Salesforce's native language model, which uses real-time retrieval from **Knowledge Articles** to provide relevant, contextual answers.

## 🌟 Key Features

- 🔁 **Session-aware AI agent** that remembers context across messages
- 📚 **Retrieval-Augmented Generation (RAG)** using native `Knowledge__kav` articles
- 🧠 Intelligent, natural language Q&A with article citation support
- 📎 Related article links with clickable titles
- 💬 Fully responsive chat interface with rich formatting
- 💡 `New Conversation` button to reset session and chat history

## ⚙️ Technologies Used

| Stack | Tools |
|-------|-------|
| **Frontend** | Lightning Web Components (LWC) |
| **Backend** | Apex, Invocable.Action for AgentForce integration |
| **AI Agent** | Salesforce Agent Builder (AgentForce) |
| **Knowledge Base** | Native `Knowledge__kav` articles |
| **Formatting** | Rich HTML rendering + Markdown-style parsing in JS |

## 🏗️ Architecture

```plaintext
User ↔️ LWC Chat UI
        ↓
    Apex Class (AgentForceAgentCaller.cls)
        ↓
Salesforce AgentForce (Custom AI Agent)
        ↕
Knowledge__kav articles (retrieved natively using prompt + context)
