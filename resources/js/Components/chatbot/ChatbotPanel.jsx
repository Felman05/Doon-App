import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useChatbot from '../../hooks/useChatbot';

export default function ChatbotPanel() {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { messages, sendMessage, isLoading, error, retry, clearSession } = useChatbot();

    const suggestions = [
        "What's the weather in Batangas?",
        'Is it a good day to go to the beach?',
        'What are my saved places?',
        "What's in my itineraries?",
        'What should I pack for my next trip?',
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const submit = async (message) => {
        const trimmed = String(message || '').trim();
        if (!trimmed) {
            return;
        }

        setInput('');
        await sendMessage(trimmed);
    };

    return (
        <div className="chat-page-wrap">
            <button
                type="button"
                className="s-btn chat-new-btn"
                onClick={clearSession}
            >
                New Chat
            </button>

            {messages.length === 0 ? (
                <div className="chat-row b" style={{ marginBottom: '8px' }}>
                    <div className="chat-ava">🤖</div>
                    <div className="chat-bub chat-bubble-bot">Hi! I am Doon, your CALABARZON travel assistant. Where are you thinking of going? 🗺️</div>
                </div>
            ) : null}

            {messages.length === 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            className="s-btn"
                            onClick={() => submit(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            ) : null}

            <div className="chat-messages-area">
                {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`chat-row ${message.role === 'user' ? 'u' : 'b'}`}>
                        {message.role === 'assistant' ? <div className="chat-ava">🤖</div> : null}
                        <div className={`chat-bub ${message.role === 'assistant' ? 'chat-bubble-bot' : 'chat-bubble-user'}`}>
                            {message.role === 'assistant' ? (
                                <ReactMarkdown>{message.content || ''}</ReactMarkdown>
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading ? (
                    <div className="chat-row b">
                        <div className="chat-ava">🤖</div>
                        <div className="chat-bub" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="typing-dot">●</span>
                            <span className="typing-dot" style={{ animationDelay: '0.15s' }}>●</span>
                            <span className="typing-dot" style={{ animationDelay: '0.30s' }}>●</span>
                        </div>
                    </div>
                ) : null}

                <div ref={messagesEndRef} />
            </div>

            {error ? (
                <div style={{ color: '#b42318', fontSize: '12px', marginTop: '8px', marginBottom: '8px' }}>
                    Could not reach Doon AI. Please try again.
                    <button
                        type="button"
                        className="s-btn"
                        style={{ marginLeft: '8px' }}
                        onClick={retry}
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            <div className="chat-input-bar">
                <input
                    className="chat-in"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') submit(input);
                    }}
                    placeholder="Ask about destinations, weather, itineraries..."
                />
                <button type="button" className="chat-snd" onClick={() => submit(input)} disabled={isLoading}>Send</button>
            </div>
        </div>
    );
}
