"use client";

import React, { useState, useEffect } from "react";
import { Key, CheckCircle, ExternalLink, X, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string, model: string) => void;
  currentKey: string;
  currentModel: string;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onKeySaved,
  currentKey,
  currentModel,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentKey);
  const [selectedModel, setSelectedModel] = useState(currentModel || "llama-3.3-70b-versatile");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setApiKey(currentKey);
    setSelectedModel(currentModel || "llama-3.3-70b-versatile");
  }, [currentKey, currentModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    localStorage.setItem("groq_api_key", trimmed);
    localStorage.setItem("groq_model", selectedModel);
    onKeySaved(trimmed, selectedModel);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem("groq_api_key");
    setApiKey("");
    onKeySaved("", selectedModel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010102]/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-[12px] border border-[#23252a] bg-[#0f1011] p-5 shadow-2xl text-[#f7f8f8]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 text-[#8a8f98] hover:text-white rounded-[4px] hover:bg-[#141516] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-[6px] bg-[#141516] border border-[#23252a] text-[#5e6ad2]">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f7f8f8]">Groq API Configuration</h3>
            <p className="text-[11px] text-[#8a8f98]">Ultra-low latency LPU inference</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 mb-4 rounded-[8px] bg-[#141516] border border-[#23252a] text-xs text-[#8a8f98]">
          Your API key is stored only in local storage and never logged.
        </div>

        {/* Input */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] mb-1">
              Groq API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full h-9 px-3 text-xs bg-[#141516] border border-[#23252a] rounded-[6px] text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] font-mono transition"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-[#62666d]">Need a key?</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e6ad2] hover:underline inline-flex items-center gap-1"
              >
                Free console.groq.com key
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] mb-1 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#5e6ad2]" />
              Model Architecture
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedModel("llama-3.3-70b-versatile")}
                className={`p-2.5 text-left rounded-[6px] border text-xs transition ${
                  selectedModel === "llama-3.3-70b-versatile"
                    ? "border-[#5e6ad2] bg-[#5e6ad2]/10 text-white"
                    : "border-[#23252a] bg-[#141516] text-[#8a8f98] hover:border-[#34343a]"
                }`}
              >
                <div className="font-semibold text-xs text-[#f7f8f8]">Llama 3.3 70B</div>
                <div className="text-[10px] text-[#8a8f98] mt-0.5">High-Precision Audit</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModel("llama-3.1-8b-instant")}
                className={`p-2.5 text-left rounded-[6px] border text-xs transition ${
                  selectedModel === "llama-3.1-8b-instant"
                    ? "border-[#5e6ad2] bg-[#5e6ad2]/10 text-white"
                    : "border-[#23252a] bg-[#141516] text-[#8a8f98] hover:border-[#34343a]"
                }`}
              >
                <div className="font-semibold text-xs text-[#f7f8f8]">Llama 3.1 8B</div>
                <div className="text-[10px] text-[#8a8f98] mt-0.5">Ultra Fast & Low Latency</div>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between pt-3.5 border-t border-[#23252a]">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-[#eb5757] hover:underline"
            >
              Clear Key
            </button>
          ) : (
            <span className="text-xs text-[#62666d]">No key active</span>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="min-w-[70px] text-xs"
            >
              {savedSuccess ? (
                <span className="flex items-center gap-1 text-[#34d399]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Saved
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
