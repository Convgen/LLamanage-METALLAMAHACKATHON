import { useState, useEffect } from 'react';
import { FaBrain, FaSave, FaRobot, FaMicrophone, FaLanguage, FaTemperatureHigh } from 'react-icons/fa';
import { dbHelpers } from '../utils/supabaseClient';

function AIConfiguration({ userId }) {
  const [config, setConfig] = useState({
    systemPrompt: '',
    personality: 'professional',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // ElevenLabs default voice
    language: 'en',
    temperature: 0.7,
    maxTokens: 500,
    responseStyle: 'Balanced',
    enableRAG: true,
    enableTools: true
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // ElevenLabs voice options
  const voices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female, American)', language: 'English' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Male, American)', language: 'English' },
    { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy (Female, British)', language: 'English' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (Male, British)', language: 'English' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Female, American)', language: 'English' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Female, American)', language: 'English' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (Male, American)', language: 'English' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (Male, American)', language: 'English' },
    { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill (Male, American)', language: 'English' }
  ];

  const personalities = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-like tone' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' },
    { value: 'empathetic', label: 'Empathetic', description: 'Caring and understanding tone' },
    { value: 'concise', label: 'Concise', description: 'Brief and to-the-point responses' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive and thorough responses' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'tr', name: 'Turkish' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' }
  ];

  useEffect(() => {
    loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadConfiguration = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getAISettings(userId);
      
      if (error) {
        console.error('Error loading AI settings:', error);
        // Use defaults if no settings found
        const defaultPrompt = `You are a helpful medical tourism assistant for healthcare facilities. Your role is to:
- Answer patient questions about medical procedures, pricing, and facility information
- Schedule appointments and consultations
- Provide information in a clear, compassionate, and professional manner
- Handle inquiries from international patients in multiple languages
- Always prioritize patient safety and accurate medical information`;
        
        setConfig(prev => ({ ...prev, systemPrompt: defaultPrompt }));
      } else if (data) {
        // Load saved settings
        setConfig({
          systemPrompt: data.system_prompt || '',
          personality: data.personality || 'professional',
          voiceId: data.voice_id || 'EXAVITQu4vr4xnSDxMaL',
          language: data.language || 'en',
          temperature: parseFloat(data.temperature) || 0.7,
          maxTokens: parseInt(data.max_tokens) || 500,
          enableRAG: true,
          enableTools: true,
          responseStyle: data.response_style || 'Balanced'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading configuration:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    
    try {
      setSaveStatus('saving');
      
      const { error } = await dbHelpers.updateAISettings(userId, {
        systemPrompt: config.systemPrompt,
        personality: config.personality,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        voiceId: config.voiceId,
        language: config.language,
        responseStyle: config.responseStyle
      });
      
      if (error) {
        console.error('Error saving AI settings:', error);
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
      }
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: '#75FDA8' }}></div>
          <p style={{ color: '#FFFFFF' }}>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaBrain className="text-3xl" style={{ color: '#75FDA8' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>AI Configuration</h2>
            <p style={{ color: '#B0B0B0' }}>Customize your AI agent's behavior and voice</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: saveStatus === 'saved' ? '#27705D' : '#75FDA8',
            color: '#1F1F1F'
          }}
        >
          <FaSave />
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* System Prompt */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="flex items-center gap-2 mb-4">
          <FaRobot style={{ color: '#75FDA8' }} />
          <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>System Prompt</h3>
        </div>
        <p className="mb-4" style={{ color: '#B0B0B0' }}>
          Define how your AI agent should behave and respond to patients
        </p>
        <textarea
          value={config.systemPrompt}
          onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
          rows={8}
          className="w-full p-4 rounded-lg border-2 focus:outline-none transition-colors"
          style={{
            backgroundColor: '#2D2D2D',
            borderColor: '#27705D',
            color: '#FFFFFF'
          }}
          placeholder="Enter system prompt..."
        />
      </div>

      {/* Personality & Tone */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="flex items-center gap-2 mb-4">
          <FaBrain style={{ color: '#75FDA8' }} />
          <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Personality & Tone</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalities.map((personality) => (
            <button
              key={personality.value}
              onClick={() => setConfig({ ...config, personality: personality.value })}
              className="p-4 rounded-lg border-2 transition-all text-left"
              style={{
                backgroundColor: config.personality === personality.value ? '#2D2D2D' : 'transparent',
                borderColor: config.personality === personality.value ? '#75FDA8' : '#27705D',
                color: '#FFFFFF'
              }}
            >
              <div className="font-semibold mb-1">{personality.label}</div>
              <div className="text-sm" style={{ color: '#B0B0B0' }}>
                {personality.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Settings */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="flex items-center gap-2 mb-4">
          <FaMicrophone style={{ color: '#75FDA8' }} />
          <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Voice Settings (ElevenLabs)</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium" style={{ color: '#FFFFFF' }}>
              Voice Selection
            </label>
            <select
              value={config.voiceId}
              onChange={(e) => setConfig({ ...config, voiceId: e.target.value })}
              className="w-full p-3 rounded-lg border-2 focus:outline-none"
              style={{
                backgroundColor: '#2D2D2D',
                borderColor: '#27705D',
                color: '#FFFFFF'
              }}
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.language}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Language & Model Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
          <div className="flex items-center gap-2 mb-4">
            <FaLanguage style={{ color: '#75FDA8' }} />
            <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Primary Language</h3>
          </div>
          <select
            value={config.language}
            onChange={(e) => setConfig({ ...config, language: e.target.value })}
            className="w-full p-3 rounded-lg border-2 focus:outline-none"
            style={{
              backgroundColor: '#2D2D2D',
              borderColor: '#27705D',
              color: '#FFFFFF'
            }}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
          <div className="flex items-center gap-2 mb-4">
            <FaTemperatureHigh style={{ color: '#75FDA8' }} />
            <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>
              Temperature: {config.temperature}
            </h3>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between mt-2" style={{ color: '#B0B0B0' }}>
            <span className="text-sm">Focused</span>
            <span className="text-sm">Creative</span>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Advanced Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: '#FFFFFF' }}>Enable RAG (Document Search)</div>
              <div className="text-sm" style={{ color: '#B0B0B0' }}>
                Search uploaded documents for context
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, enableRAG: !config.enableRAG })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: config.enableRAG ? '#75FDA8' : '#27705D' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enableRAG ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: '#FFFFFF' }}>Enable AI Tools</div>
              <div className="text-sm" style={{ color: '#B0B0B0' }}>
                Allow AI to use calendar, tickets, and other tools
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, enableTools: !config.enableTools })}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: config.enableTools ? '#75FDA8' : '#27705D' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enableTools ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block mb-2 font-medium" style={{ color: '#FFFFFF' }}>
              Max Tokens per Response
            </label>
            <input
              type="number"
              min="100"
              max="2000"
              step="50"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              className="w-full p-3 rounded-lg border-2 focus:outline-none"
              style={{
                backgroundColor: '#2D2D2D',
                borderColor: '#27705D',
                color: '#FFFFFF'
              }}
            />
            <p className="text-sm mt-1" style={{ color: '#B0B0B0' }}>
              Higher values allow longer responses but cost more
            </p>
          </div>
        </div>
      </div>

      {/* Embed Widget Instructions */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#1F1F1F' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>
          📱 Embed Chat Widget on Your Website
        </h3>
        <p className="mb-4" style={{ color: '#B0B0B0' }}>
          Add this code snippet to your website to embed the AI chat widget. Patients can start conversations directly from your site.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium" style={{ color: '#FFFFFF' }}>
              HTML Embed Code
            </label>
            <div 
              className="p-4 rounded-lg font-mono text-sm overflow-x-auto"
              style={{ backgroundColor: '#2D2D2D', color: '#75FDA8' }}
            >
              <pre>{`<!-- Add this to your website's <body> tag -->
<div id="llamanage-chat"></div>
<script>
  (function() {
    const widget = document.createElement('iframe');
    widget.src = 'https://llamanage.daily.co/widget/${userId || 'YOUR_USER_ID'}';
    widget.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:9999;';
    document.getElementById('llamanage-chat').appendChild(widget);
  })();
</script>`}</pre>
            </div>
            <p className="text-sm mt-2" style={{ color: '#B0B0B0' }}>
              Copy this code and paste it before the closing {'</body>'} tag on your website
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium" style={{ color: '#FFFFFF' }}>
              🎙️ Voice Call Room (Daily.co)
            </label>
            <div 
              className="p-3 rounded-lg font-mono text-sm break-all"
              style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF' }}
            >
              {`https://${userId || 'your-facility'}.daily.co/[room-name]`}
            </div>
            <p className="text-sm mt-2" style={{ color: '#B0B0B0' }}>
              Voice call rooms are automatically created via Daily.co API when patients request consultations. Each room URL is dynamically generated and sent to the patient. Example: <code style={{ color: '#75FDA8' }}>https://llamanage.daily.co/patient-consultation-abc123</code>
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#2D2D2D' }}>
            <div style={{ color: '#75FDA8' }}>💡</div>
            <div>
              <div className="font-medium mb-1" style={{ color: '#FFFFFF' }}>
                How Voice Calls Work
              </div>
              <div className="text-sm space-y-1" style={{ color: '#B0B0B0' }}>
                <div>• Patient requests voice consultation from chat</div>
                <div>• Backend calls Daily.co API with <code style={{ color: '#75FDA8' }}>curl</code> to create unique room</div>
                <div>• System generates room URL: <code style={{ color: '#75FDA8' }}>llamanage.daily.co/[unique-id]</code></div>
                <div>• AI assistant joins with ElevenLabs voice (configured above)</div>
                <div>• Call is transcribed in real-time for HIPAA-compliant records</div>
                <div>• All conversations use your AI Configuration settings</div>
                <div>• Supports 50+ languages with natural speech synthesis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIConfiguration;
