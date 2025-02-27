import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import SimplePeer from 'simple-peer';

const SERVER_URL = 'ws://localhost:3005';

const PeerToPeerWithInvite = () => {
    const [peerId, setPeerId] = useState(null);
    const [remoteId, setRemoteId] = useState('');
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const peerRef = useRef(null);

    const { sendMessage, lastMessage } = useWebSocket(SERVER_URL, {
        onOpen: () => console.log('Connected to server'),
        onClose: () => console.log('Disconnected from server'),
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data);

            if (data.type === 'connected') {
                setPeerId(data.id);
            } else if (data.type === 'invite' && data.offer) {
                handleIncomingOffer(data);
            } else if (data.type === 'answer' && data.answer) {
                peerRef.current?.signal(data.answer);
            } else if (data.type === 'ice-candidate' && data.candidate) {
                peerRef.current?.signal(data.candidate);
            } else if (data.type === 'error') {
                setError(data.message);
            }
        }
    }, [lastMessage]);

    const handleIncomingOffer = (data) => {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
        });

        peer.on('signal', (signal) => {
            sendMessage(
                JSON.stringify({ type: 'answer', to: data.from, answer: signal })
            );
        });

        peer.on('connect', () => {
            setConnected(true);
            setError(null);
        });

        peer.on('error', (err) => setError('Connection error'));
        peer.on('close', () => handleCleanup());

        peer.signal(data.offer);
        peerRef.current = peer;
    };

    const startCall = () => {
        if (!remoteId) return setError('Please enter a valid ID to connect');

        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
        });

        peer.on('signal', (signal) => {
            sendMessage(JSON.stringify({ type: 'invite', to: remoteId, offer: signal }));
        });

        peer.on('connect', () => {
            setConnected(true);
            setError(null);
        });

        peer.on('error', (err) => setError('Connection error'));
        peer.on('close', () => handleCleanup());

        peerRef.current = peer;
    };

    const leaveCall = () => {
        try {
            peerRef.current?.destroy(); // Gracefully close the connection
        } catch (err) {
            setError('Error closing connection');
            console.error('Error in peer destroy:', err);
        } finally {
            handleCleanup();
        }
    };

    const handleCleanup = () => {
        setConnected(false);
        setRemoteId('');
        peerRef.current = null; // Clear the reference
        setError(null);
        sendMessage(JSON.stringify({ type: 'leave', from: peerId }));
    };

    const sendMessageToPeer = (message) => {
        if (peerRef.current && connected) {
            peerRef.current.send(message);
        } else {
            setError('No active connection to send message');
        }
    };

    return (
        <div>
            <h1>Peer-to-Peer Video Call</h1>
            <div>
                <p>Your ID: {peerId}</p>
                <input
                    type="text"
                    placeholder="Enter peer ID"
                    value={remoteId}
                    onChange={(e) => setRemoteId(e.target.value)}
                />
                <button onClick={startCall} disabled={connected}>Start Call</button>
                <button onClick={leaveCall} disabled={!connected}>Leave Call</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                <input
                    type="text"
                    placeholder="Message to peer"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessageToPeer(e.target.value);
                    }}
                />
            </div>
        </div>
    );
};

export default PeerToPeerWithInvite;
