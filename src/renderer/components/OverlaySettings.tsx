import { useState } from 'react';
import { useDraftStore } from '../../shared/store';
import {
  OverlayTheme,
  DEFAULT_OVERLAY_THEME,
  OVERLAY_PRESETS,
} from '../../shared/types';

const FONT_OPTIONS = [
  { label: 'Segoe UI', value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  { label: 'Arial', value: "'Arial', Helvetica, sans-serif" },
  { label: 'Arial Black', value: "'Arial Black', 'Arial', sans-serif" },
  { label: 'Georgia', value: "'Georgia', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
  { label: 'Verdana', value: "'Verdana', sans-serif" },
  { label: 'Impact', value: "'Impact', sans-serif" },
  { label: 'Rajdhani (Esports)', value: "'Rajdhani', 'Segoe UI', sans-serif" },
  { label: 'Orbitron (Futuristic)', value: "'Orbitron', 'Segoe UI', sans-serif" },
  { label: 'Inter', value: "'Inter', 'Helvetica', sans-serif" },
];

export default function OverlaySettings() {
  const draft = useDraftStore((state) => state.draft);
  const setOverlayTheme = useDraftStore((state) => state.setOverlayTheme);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'fonts' | 'sizes' | 'colors'>('presets');

  if (!draft) return null;

  const theme: OverlayTheme = draft.overlayTheme || { ...DEFAULT_OVERLAY_THEME };

  const updateTheme = (updates: Partial<OverlayTheme>) => {
    setOverlayTheme({ ...theme, ...updates, preset: 'custom' });
  };

  const applyPreset = (presetName: string) => {
    const preset = OVERLAY_PRESETS[presetName];
    if (preset) {
      setOverlayTheme({ ...DEFAULT_OVERLAY_THEME, ...preset, preset: presetName });
    }
  };

  const presetList = Object.keys(OVERLAY_PRESETS);

  const ColorInput = ({ label, value, field }: { label: string; value: string; field: keyof OverlayTheme }) => (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-gray-300 flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith('rgba') || value.startsWith('#') ? (value.startsWith('#') ? value : '#ffffff') : '#ffffff'}
          onChange={(e) => updateTheme({ [field]: e.target.value })}
          className="w-8 h-8 rounded cursor-pointer border border-gray-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => updateTheme({ [field]: e.target.value })}
          className="input-field w-40 text-xs font-mono"
        />
      </div>
    </div>
  );

  const SizeSlider = ({ label, value, field, min, max }: { label: string; value: number; field: keyof OverlayTheme; min: number; max: number }) => (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-300 w-32">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => updateTheme({ [field]: Number(e.target.value) })}
        className="flex-1 accent-blue-500"
      />
      <span className="text-sm font-mono text-gray-400 w-12 text-right">{value}px</span>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-3 rounded-lg font-medium transition-colors text-gray-300 hover:bg-gray-800 flex items-center gap-2"
      >
        🎨 Overlay Theme
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="p-6 flex flex-col h-full" style={{ overflow: 'hidden' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Overlay Theme</h3>
                <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                  Current: {theme.preset || 'custom'}
                </span>
              </div>

              {/* Tab navigation */}
              <div className="flex gap-1 mb-4 bg-gray-800 rounded-lg p-1">
                {(['presets', 'fonts', 'sizes', 'colors'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'presets' ? '🎭 Presets' : tab === 'fonts' ? '🔤 Fonts' : tab === 'sizes' ? '📐 Sizes' : '🎨 Colors'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                {/* Presets Tab */}
                {activeTab === 'presets' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 mb-3">Choose a preset theme. You can customize further in the other tabs.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {presetList.map((name) => {
                        const p = { ...DEFAULT_OVERLAY_THEME, ...OVERLAY_PRESETS[name] };
                        return (
                          <div
                            key={name}
                            onClick={() => applyPreset(name)}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                              theme.preset === name
                                ? 'border-blue-500 ring-2 ring-blue-500/30'
                                : 'border-gray-700 hover:border-gray-500'
                            }`}
                          >
                            {/* Preview strip */}
                            <div
                              className="p-4 text-center"
                              style={{
                                background: `linear-gradient(135deg, ${p.backgroundColor}, ${p.backgroundGradientEnd})`,
                                fontFamily: p.fontFamily,
                              }}
                            >
                              <div style={{ color: p.headerColor, fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                ON THE CLOCK
                              </div>
                              <div style={{ color: p.textColor, fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>
                                Team Name
                              </div>
                              <div style={{ color: p.timerColor, fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '2px' }}>
                                5:00
                              </div>
                              <div className="flex justify-center gap-1 mt-2">
                                <span style={{ background: p.tagBackground, color: p.tagTextColor, fontSize: '9px', padding: '1px 6px', borderRadius: '8px' }}>
                                  tag
                                </span>
                                <span style={{ background: p.tagBackground, color: p.tagTextColor, fontSize: '9px', padding: '1px 6px', borderRadius: '8px' }}>
                                  tag
                                </span>
                              </div>
                            </div>
                            <div className="bg-gray-800 px-3 py-2 text-center">
                              <span className="text-sm font-medium capitalize">{name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fonts Tab */}
                {activeTab === 'fonts' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Body Font</label>
                      <select
                        value={theme.fontFamily}
                        onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                        className="input-field w-full"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <div className="mt-2 p-3 bg-gray-800 rounded text-center" style={{ fontFamily: theme.fontFamily }}>
                        <span className="text-lg">Preview: Player Name</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Header Font</label>
                      <select
                        value={theme.headerFontFamily}
                        onChange={(e) => updateTheme({ headerFontFamily: e.target.value })}
                        className="input-field w-full"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <div className="mt-2 p-3 bg-gray-800 rounded text-center" style={{ fontFamily: theme.headerFontFamily }}>
                        <span className="text-lg font-bold">Preview: HEADER TEXT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sizes Tab */}
                {activeTab === 'sizes' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400 mb-2">Adjust font sizes for overlay elements (in pixels)</p>
                    <SizeSlider label="Headers" value={theme.headerSize} field="headerSize" min={16} max={64} />
                    <SizeSlider label="Team Name" value={theme.titleSize} field="titleSize" min={20} max={80} />
                    <SizeSlider label="Body Text" value={theme.bodySize} field="bodySize" min={10} max={32} />
                    <SizeSlider label="Tags" value={theme.tagSize} field="tagSize" min={8} max={20} />
                    <SizeSlider label="Timer" value={theme.timerSize} field="timerSize" min={24} max={120} />

                    {/* Live preview */}
                    <div className="mt-4 p-4 rounded-lg border border-gray-700" style={{
                      background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.backgroundGradientEnd})`,
                      fontFamily: theme.fontFamily,
                    }}>
                      <div style={{ fontSize: `${theme.headerSize * 0.6}px`, color: theme.headerColor, fontWeight: 'bold', fontFamily: theme.headerFontFamily, textAlign: 'center' }}>
                        HEADER
                      </div>
                      <div style={{ fontSize: `${theme.titleSize * 0.6}px`, color: theme.textColor, fontWeight: 'bold', textAlign: 'center', marginTop: '4px' }}>
                        Team Name
                      </div>
                      <div style={{ fontSize: `${theme.timerSize * 0.5}px`, color: theme.timerColor, fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center' }}>
                        5:00
                      </div>
                      <div style={{ fontSize: `${theme.bodySize * 0.8}px`, color: theme.textColor, textAlign: 'center' }}>
                        Player Name
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        <span style={{ background: theme.tagBackground, color: theme.tagTextColor, fontSize: `${theme.tagSize}px`, padding: '1px 6px', borderRadius: '8px' }}>
                          forward
                        </span>
                        <span style={{ background: theme.tagBackground, color: theme.tagTextColor, fontSize: `${theme.tagSize}px`, padding: '1px 6px', borderRadius: '8px' }}>
                          female
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Colors Tab */}
                {activeTab === 'colors' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 mb-2">Customize overlay colors. Use hex codes or rgba values.</p>
                    <ColorInput label="Background" value={theme.backgroundColor} field="backgroundColor" />
                    <ColorInput label="Gradient End" value={theme.backgroundGradientEnd} field="backgroundGradientEnd" />
                    <ColorInput label="Panel BG" value={theme.panelBackground} field="panelBackground" />
                    <ColorInput label="Text" value={theme.textColor} field="textColor" />
                    <ColorInput label="Headers" value={theme.headerColor} field="headerColor" />
                    <ColorInput label="Accent" value={theme.accentColor} field="accentColor" />
                    <ColorInput label="Timer" value={theme.timerColor} field="timerColor" />
                    <ColorInput label="Tag BG" value={theme.tagBackground} field="tagBackground" />
                    <ColorInput label="Tag Text" value={theme.tagTextColor} field="tagTextColor" />
                    <ColorInput label="Borders" value={theme.borderColor} field="borderColor" />

                    {/* Live preview */}
                    <div className="mt-2 p-4 rounded-lg" style={{
                      background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.backgroundGradientEnd})`,
                      fontFamily: theme.fontFamily,
                      border: `2px solid ${theme.borderColor}`,
                    }}>
                      <div className="p-3 rounded" style={{ background: theme.panelBackground }}>
                        <div style={{ color: theme.headerColor, fontSize: '14px', fontWeight: 'bold' }}>ON THE CLOCK</div>
                        <div style={{ color: theme.textColor, fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>Team Name</div>
                        <div style={{ color: theme.timerColor, fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>5:00</div>
                        <div style={{ color: theme.accentColor, fontSize: '12px', marginTop: '4px' }}>Pick #1</div>
                        <div className="flex gap-1 mt-2">
                          <span style={{ background: theme.tagBackground, color: theme.tagTextColor, fontSize: '10px', padding: '2px 8px', borderRadius: '8px' }}>tag</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setOverlayTheme({ ...DEFAULT_OVERLAY_THEME });
                  }}
                  className="button-secondary text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 button-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
