'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR since model-viewer requires browser APIs
const ModelViewerAR = dynamic(
  () => import('@/components/ModelViewerAR'),
  { ssr: false }
);

// Sample models — replace with your own .glb URLs
const SAMPLE_MODELS = [
  {
    id: 'sofa',
    name: 'Modern Sofa',
    url: '/AR_VR/thumbs/sofa1.glb',
    placement: 'floor' as const,
  },
  {
    id: 'table',
    name: 'Dining Table',
    url: '/AR_VR/thumbs/dining_table1.glb',
    placement: 'floor' as const,
  },
  {
    id: 'lamp',
    name: 'Floor Lamp',
    url: '/AR_VR/thumbs/lamp1.glb',
    placement: 'floor' as const,
  },
];

export default function ARViewerPage() {
  const [selectedModel, setSelectedModel] = useState(SAMPLE_MODELS[0]);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [message, ...prev].slice(0, 5));
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d9eefb, #c7e9ff)',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'rgba(200,230,255,0.26)',
            backdropFilter: 'blur(6px)',
            borderRadius: '12px',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(15,23,42,0.04)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#05203a',
                margin: 0,
              }}
            >
              AR Model Viewer
            </h1>
            <p style={{ fontSize: '13px', color: '#35506a', margin: '2px 0 0' }}>
              Tap the camera icon to place in your space
            </p>
          </div>
        </header>

        {/* Model viewer */}
        <div style={{ marginBottom: '20px' }}>
          <ModelViewerAR
            key={selectedModel.id}
            glbUrl={selectedModel.url}
            alt={selectedModel.name}
            arPlacement={selectedModel.placement}
            height="60vh"
            onLoad={() => addLog(`✅ Model loaded: ${selectedModel.name}`)}
            onArActivated={() => addLog('📱 AR mode activated')}
            onArNotSupported={() =>
              addLog('⚠️ AR is not supported on this device')
            }
          />
        </div>

        {/* Model selector */}
        <div
          style={{
            background: 'rgba(215,238,255,0.22)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(10,25,40,0.02)',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#053049',
              margin: '0 0 12px',
            }}
          >
            Select a model
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {SAMPLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  background:
                    selectedModel.id === model.id
                      ? 'linear-gradient(90deg, #1f7bff, #4aa3ff)'
                      : 'rgba(255,255,255,0.7)',
                  color:
                    selectedModel.id === model.id ? 'white' : '#08304a',
                  boxShadow:
                    selectedModel.id === model.id
                      ? '0 6px 20px rgba(43,124,255,0.18)'
                      : 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* Event log */}
        {log.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#08304a',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '6px' }}>
              Event Log
            </strong>
            {log.map((entry, i) => (
              <div key={i} style={{ padding: '2px 0' }}>
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}