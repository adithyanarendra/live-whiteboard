import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // replace with ngrok if deployed

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.6;
        canvas.style.border = '1px solid black';

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctxRef.current = ctx;

        socket.on('draw', ({ x, y, type }) => {
            if (type === 'begin') ctxRef.current.beginPath();
            ctxRef.current.lineTo(x, y);
            ctxRef.current.stroke();
        });

        socket.on('clear', () => {
            ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
        });
    }, []);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        setDrawing(true);
        socket.emit('draw', { x: offsetX, y: offsetY, type: 'begin' });
    };

    const draw = ({ nativeEvent }) => {
        if (!drawing) return;
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
        socket.emit('draw', { x: offsetX, y: offsetY, type: 'draw' });
    };

    const stopDrawing = () => {
        setDrawing(false);
        ctxRef.current.closePath();
    };

    const clearCanvas = () => {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        socket.emit('clear');
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            <button onClick={clearCanvas} style={{ marginTop: '10px' }}>
                Clear
            </button>
        </div>
    );
};

export default Whiteboard;
