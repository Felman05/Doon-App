import { useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';

export default function ChatbotPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionToken, setSessionToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { data: sessions = [] } = useQuery({
        queryKey: ['chatbot-sessions'],
        queryFn: async () => {
            const { data } = await api.get('/chatbot/sessions');
            return data.data ?? [];
        },
    });

    const suggestedPrompts = [
        'Best beaches in Batangas',
        'Budget trip for 2 in Laguna',
        'What to bring for hiking in Rizal',
        'Family-friendly spots in Cavite',
        'Hidden gems in Quezon',
    ];

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { type: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/chatbot', {
                message: input,
                session_token: sessionToken,
            });

            setMessages(prev => [...prev, { type: 'bot', content: data.data?.response || 'Sorry, I couldn\'t process that.' }]);
            if (data.data?.session_token) setSessionToken(data.data.session_token);
        } catch (error) {
            addToast?.('Failed to send message', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="g2">
            {/* Session history */}
            <div className="dc sr d1" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <div className="dc-title" style={{ marginBottom: '12px' }}>Sessions</div>
                <button onClick={() => { setMessages([]); setSessionToken(null); }} className="s-btn dark" style={{ width: '100%', marginBottom: '12px' }}>
                    ➕ New Chat
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => setSessionToken(session.token)}
                            style={{ fontSize: '12px', color: 'var(--i4)', padding: '8px', borderRadius: 'var(--r)', backgroundColor: 'var(--bg)', cursor: 'pointer' }}
                        >
                            {new Date(session.created_at).toLocaleDateString()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat interface */}
            <div className="dc sr d2" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                <div className="chat-wrap" style={{ flex: 1 }}>
                    {messages.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--i)', marginBottom: '8px' }}>Say hello!</div>
                            <p style={{ fontSize: '12px', color: 'var(--i4)', marginBottom: '20px' }}>I can help you plan your trip</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`chat-row ${msg.type === 'bot' ? 'b' : 'u'}`}>
                                {msg.type === 'bot' && <div className="chat-ava">🤖</div>}
                                <div className="chat-bub">{msg.content}</div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="chat-row b">
                            <div className="chat-ava">🤖</div>
                            <div className="chat-bub" style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ animation: 'bounce .6s infinite' }}>●</span>
                                <span style={{ animation: 'bounce .6s infinite', animationDelay: '0.2s' }}>●</span>
                                <span style={{ animation: 'bounce .6s infinite', animationDelay: '0.4s' }}>●</span>
                            </div>
                        </div>
                    )}
                </div>

                {messages.length === 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {suggestedPrompts.map(prompt => (
                            <button
                                key={prompt}
                                onClick={() => { setInput(prompt); }}
                                className="s-btn"
                                style={{ fontSize: '11px' }}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                <div className="chat-bar">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me anything..."
                        className="chat-in"
                    />
                    <button onClick={sendMessage} disabled={!input.trim()} className="chat-snd">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
