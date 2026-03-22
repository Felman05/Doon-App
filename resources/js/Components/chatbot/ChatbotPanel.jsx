import { useEffect, useRef, useState } from 'react';
import useChatbot from '../../hooks/useChatbot';

const SESSION_KEY = 'doon_chat_session_token';

export default function ChatbotPanel() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionToken, setSessionToken] = useState(localStorage.getItem(SESSION_KEY) || '');
    const [lastMessage, setLastMessage] = useState('');
    const bottomRef = useRef(null);
    const chatMutation = useChatbot();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatMutation.isPending]);

    const send = async (message) => {
        const trimmed = message.trim();
        if (!trimmed) return;

        setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
        setInput('');
        setLastMessage(trimmed);

        try {
            const data = await chatMutation.mutateAsync({ message: trimmed, sessionToken });
            if (data.session_token) {
                localStorage.setItem(SESSION_KEY, data.session_token);
                setSessionToken(data.session_token);
            }
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'I cannot answer right now. Please retry.' }]);
        }
    };

    return (
        <div className="chat-wrap">
            <div className="chat-msgs">
                {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`chat-row ${message.role === 'user' ? 'u' : 'b'}`}>
                        {message.role === 'assistant' ? <div className="chat-ava">🤖</div> : null}
                        <div className="chat-bub">{message.content}</div>
                    </div>
                ))}
                {chatMutation.isPending ? <div className="chat-row b"><div className="chat-ava">🤖</div><div className="chat-bub">...</div></div> : null}
                <div ref={bottomRef} />
            </div>
            <div className="chat-bar">
                <input
                    className="chat-in"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') send(input);
                    }}
                    placeholder="Ask about destinations, weather, itineraries..."
                />
                <button type="button" className="chat-snd" onClick={() => send(input)}>Send</button>
                {chatMutation.isError ? <button type="button" className="s-btn" onClick={() => send(lastMessage)}>Retry</button> : null}
            </div>
        </div>
    );
}
