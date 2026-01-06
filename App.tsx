
import React, { useState, useRef } from 'react';
import SettingsPanel from './components/SettingsPanel';
import LyricSectionCard from './components/LyricSectionCard';
import { generateLyrics, generateSongAudio } from './services/geminiService';
import { SongLyrics, GeneratorParams } from './types';

// Audio decoding utilities as per guidelines
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [lyrics, setLyrics] = useState<SongLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerate = async (params: GeneratorParams) => {
    setLoading(true);
    setError(null);
    stopAudio();
    try {
      const result = await generateLyrics(params);
      setLyrics(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to compose lyrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleCreateSong = async () => {
    if (!lyrics) return;
    setAudioLoading(true);
    setError(null);
    stopAudio();

    const fullText = lyrics.sections
      .map(s => s.lines.join('. '))
      .join('. ');

    try {
      const base64Audio = await generateSongAudio(fullText);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate song audio.');
    } finally {
      setAudioLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!lyrics) return;
    const text = lyrics.sections
      .map(s => `[${s.type}]\n${s.lines.join('\n')}`)
      .join('\n\n');
    navigator.clipboard.writeText(`${lyrics.title}\n\n${text}`);
    alert('Lyrics copied to clipboard!');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <i className="fa-solid fa-quill text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
              LyricLoom <span className="text-purple-500">AI</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">How it works</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4">
            <SettingsPanel onGenerate={handleGenerate} isLoading={loading} />
          </div>

          {/* Right Panel: Content */}
          <div className="lg:col-span-8 min-h-[600px]">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            {!lyrics && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
                <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                  <i className="fa-solid fa-pen-nib text-4xl text-slate-700"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-slate-300">Start Your Masterpiece</h3>
                  <p className="text-slate-500 max-w-sm mt-2">Adjust the settings on the left to begin weaving your song's story.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-music absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-purple-400"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium animate-pulse">Consulting the Muses...</h3>
                  <p className="text-slate-500">Finding the perfect rhyme scheme and rhythm.</p>
                </div>
              </div>
            )}

            {lyrics && !loading && (
              <div className="glass p-8 md:p-12 rounded-3xl animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/5">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-serif mb-2">{lyrics.title}</h2>
                    <p className="text-slate-400 italic">An original AI-woven composition</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={isPlaying ? stopAudio : handleCreateSong}
                      disabled={audioLoading}
                      className={`p-3 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
                        audioLoading ? 'bg-slate-800 opacity-50 cursor-not-allowed' : 
                        isPlaying ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                      }`}
                    >
                      {audioLoading ? (
                        <i className="fa-solid fa-spinner animate-spin"></i>
                      ) : isPlaying ? (
                        <i className="fa-solid fa-stop"></i>
                      ) : (
                        <i className="fa-solid fa-play"></i>
                      )}
                      {audioLoading ? 'Generating Song...' : isPlaying ? 'Stop Playing' : 'Create & Play Song'}
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
                      title="Copy to clipboard"
                    >
                      <i className="fa-regular fa-copy"></i>
                      Copy
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
                      title="Print lyrics"
                    >
                      <i className="fa-solid fa-print"></i>
                      Print
                    </button>
                  </div>
                </div>

                <div className="max-w-2xl">
                  {lyrics.sections.map((section, idx) => (
                    <LyricSectionCard 
                      key={idx} 
                      section={section} 
                      index={lyrics.sections.filter((s, i) => s.type === section.type && i < idx).length + 1} 
                    />
                  ))}
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-center">
                  <p className="text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} LyricLoom AI. Creative content generated by Gemini.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="mt-20 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
          <div className="text-sm">
            Powered by Google Gemini 2.5 & 3
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
