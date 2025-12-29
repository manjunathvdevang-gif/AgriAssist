import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, Sparkles, User, Globe, Loader2, Volume2 } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Tab } from '../types';

const LANGUAGES = [
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
];

interface Message {
  role: 'user' | 'model' | 'function';
  text?: string;
  // We keep a simplified history for UI, but rely on the service to manage full context structure if needed
  parts?: any[]; 
}

interface ChatBotProps {
  onNavigate: (tab: Tab) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]); // Default to Kannada
  
  // We maintain the raw history for the API to ensure context (function calls) is preserved correctly
  const [apiHistory, setApiHistory] = useState<any[]>([
     { role: 'model', parts: [{ text: 'Namaskara! Naanu Agri-Sahayak. Krishi, marukatte, mathu beleya bagge naanu nimage sahaya madaballe.' }] }
  ]);
  
  // UI Messages just for display
  const [uiMessages, setUiMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaskara! Naanu Agri-Sahayak. Krishi, marukatte, mathu beleya bagge naanu nimage sahaya madaballe.' }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages, isOpen]);

  // Handle Voice Input
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang.code;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  // Text-to-Speech (TTS)
  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    
    // Cancel any current speaking
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang.code;
    
    // Improved Voice Selection Logic
    const voices = synth.getVoices();
    // 1. Try to find an exact match for the language code (e.g. kn-IN)
    let targetVoice = voices.find(v => v.lang === selectedLang.code);
    
    // 2. If not found, try to find a voice that matches the language base (e.g. kn)
    if (!targetVoice) {
        const baseLang = selectedLang.code.split('-')[0];
        targetVoice = voices.find(v => v.lang.startsWith(baseLang));
    }

    if (targetVoice) {
        utterance.voice = targetVoice;
    }

    synth.speak(utterance);
  };

  // Ensure voices are loaded (needed for Chrome)
  useEffect(() => {
     window.speechSynthesis.onvoiceschanged = () => {
         // Trigger re-render or just ensure voices are ready
     };
  }, []);

  // Process Tool Calls
  const handleToolCalls = async (functionCalls: any[], currentHistory: any[]) => {
      let nextHistory = [...currentHistory];
      
      // We append the assistant's response (which contained the function call) to history first
      // This is crucial for Gemini to know why we are sending a function response
      nextHistory.push({
          role: 'model',
          parts: functionCalls.map(fc => ({ functionCall: fc }))
      });

      for (const call of functionCalls) {
          const { name, args } = call;
          let result = {};

          if (name === 'navigate_to_screen') {
              const tabMap: Record<string, Tab> = {
                  'HOME': Tab.HOME,
                  'MARKETPLACE': Tab.MARKETPLACE,
                  'CROP_GUIDE': Tab.CROP_GUIDE,
                  'ALERTS': Tab.ALERTS,
                  'PROFILE': Tab.PROFILE
              };
              const tab = tabMap[args.screen];
              if (tab) {
                  onNavigate(tab);
                  result = { result: `Navigated to ${args.screen} successfully.` };
              } else {
                  result = { result: `Failed to navigate. Unknown screen.` };
              }
          } 
          else if (name === 'add_market_listing') {
              const profile = storageService.getProfile();
              const newListing = {
                id: Date.now(),
                name: profile.name,
                location: profile.location.split(',')[0],
                crop: args.crop,
                price: `₹${args.price}/q`,
                distance: '0 km'
              };
              storageService.addFarmerListing(newListing);
              result = { result: `Successfully listed ${args.crop} for ₹${args.price}/q.` };
          }

          // Send result back to Gemini
          // We call the API again with the function response
          const toolResponsePart = {
            functionResponse: {
                name: name,
                response: result
            }
          };

          // Recursive call to get the final text response after tool execution
          const response = await getChatResponse(
              nextHistory, 
              null, // No new user message
              selectedLang.label,
              toolResponsePart // Inject tool response
          );

          if (response.text) {
              setUiMessages(prev => [...prev, { role: 'model', text: response.text }]);
              speak(response.text); 
              
              // Update history with the tool response AND the final model text
              nextHistory.push({ role: 'function', parts: [toolResponsePart] });
              nextHistory.push({ role: 'model', parts: [{ text: response.text }] });
          }
      }
      
      setApiHistory(nextHistory);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setInputText('');
    setUiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Call API with current history
    const response = await getChatResponse(apiHistory, userMsg, selectedLang.label);
    
    // Update API History with the user's message now that it's processed
    const updatedHistory = [
        ...apiHistory, 
        { role: 'user', parts: [{ text: userMsg }] }
    ];

    if (response.functionCalls && response.functionCalls.length > 0) {
        // Handle Function Calls
        await handleToolCalls(response.functionCalls, updatedHistory);
    } else if (response.text) {
        // Normal Text Response
        setUiMessages(prev => [...prev, { role: 'model', text: response.text }]);
        setApiHistory([...updatedHistory, { role: 'model', parts: [{ text: response.text }] }]);
        
        // Auto-speak response
        speak(response.text || '');
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 animate-bounce-subtle"
        >
          <Sparkles size={24} />
          <span className="font-bold text-sm hidden sm:inline">Agri-Sahayak</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] sm:inset-auto sm:bottom-24 sm:right-4 sm:w-[380px] sm:h-[600px] flex flex-col bg-gray-50 sm:rounded-2xl shadow-2xl animate-slide-up border border-gray-100">
          
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-100 rounded-t-2xl flex flex-col gap-3 shadow-sm z-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <Sparkles size={20} className="text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Agri-Sahayak</h3>
                        <p className="text-[10px] text-green-600 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online • AI Assistant
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <Globe size={16} className="text-gray-400" />
                <select 
                    value={selectedLang.code}
                    onChange={(e) => {
                        const lang = LANGUAGES.find(l => l.code === e.target.value);
                        if (lang) setSelectedLang(lang);
                    }}
                    className="bg-transparent text-sm text-gray-700 font-medium outline-none w-full"
                >
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5] custom-scrollbar">
             {uiMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className="flex items-end gap-2 max-w-[85%]">
                        {msg.role === 'model' && (
                            <button 
                                onClick={() => msg.text && speak(msg.text)}
                                className="mb-1 p-1.5 bg-white text-primary-500 rounded-full shadow-sm border border-gray-100 hover:bg-primary-50 transition-colors"
                                title="Read aloud"
                            >
                                <Volume2 size={14} />
                            </button>
                        )}
                        <div 
                            className={`rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-primary-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                            }`}
                        >
                            {msg.text}
                        </div>
                     </div>
                 </div>
             ))}
             {loading && (
                 <div className="flex justify-start">
                     <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                         <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75"></div>
                         <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150"></div>
                     </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
              <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                  <button 
                    onClick={startListening}
                    className={`p-2 rounded-full transition-colors ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-primary-600 hover:bg-white shadow-sm'
                    }`}
                  >
                      <Mic size={20} />
                  </button>
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={`Type or Speak...`}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 max-h-24 py-2 resize-none"
                    rows={1}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || loading}
                    className="p-2 bg-primary-600 text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-primary-700 transition-colors"
                  >
                      <Send size={18} />
                  </button>
              </div>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;