import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useToast } from "../components/ToastProvider";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import { StatsGrid } from "../components/StatsCard";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";

const Dashboard = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transcriptionToDelete, setTranscriptionToDelete] = useState(null);

  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const fetchTranscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/transcriptions");
      setTranscriptions(data);
      if (data.length > 0) info(`Loaded ${data.length} transcription(s)`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch transcriptions";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [info, showError]);

  useEffect(() => {
    fetchTranscriptions();
  }, [fetchTranscriptions]);

  const openDeleteModal = (transcription) => {
    setTranscriptionToDelete(transcription);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!transcriptionToDelete) return;
    try {
      await api.delete(`/api/transcriptions/${transcriptionToDelete._id}`);
      setTranscriptions(transcriptions.filter(t => t._id !== transcriptionToDelete._id));
      if (selectedTranscription?._id === transcriptionToDelete._id)
        setSelectedTranscription(null);
      success("Transcription deleted successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete transcription";
      showError(errorMsg);
    } finally {
      setDeleteModalOpen(false);
      setTranscriptionToDelete(null);
    }
  };

  const downloadTranscription = (t) => {
    try {
      const text = `Transcription
Date: ${new Date(t.createdAt).toLocaleString()}
Language: ${t.detectedLanguage || "Unknown"}
Duration: ${formatDuration(t.duration || 0)}
Word Count: ${t.wordCount || 0}

${t.transcription}`;

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcription-${new Date(t.createdAt).toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      success("Transcription downloaded successfully!");
    } catch (error) {
      showError("Failed to download transcription. Please try again.");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguageName = (code) => {
    const languages = {
      "auto": "Auto-detected",
      "en-IN": "English (India)",
      "hi-IN": "Hindi",
      "bn-IN": "Bengali",
      "kn-IN": "Kannada",
      "ml-IN": "Malayalam",
      "mr-IN": "Marathi",
      "od-IN": "Odia",
      "pa-IN": "Punjabi",
      "ta-IN": "Tamil",
      "te-IN": "Telugu",
      "gu-IN": "Gujarati",
      "en-US": "English (US)",
      "en-GB": "English (UK)",
    };
    return languages[code] || code;
  };

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton.Dashboard />
      </div>
    );

  const totalTranscriptions = transcriptions.length;
  const totalWords = transcriptions.reduce((sum, t) => sum + (t.wordCount || 0), 0);
  const totalDuration = transcriptions.reduce((sum, t) => sum + (t.duration || 0), 0);
  const avgWords = totalTranscriptions > 0 ? Math.round(totalWords / totalTranscriptions) : 0;

  const stats = [
    { icon: "📝", title: "Total Transcriptions", value: totalTranscriptions, subtitle: "All time" },
    { icon: "💬", title: "Total Words", value: totalWords.toLocaleString(), subtitle: "Across all recordings" },
    { icon: "⏱️", title: "Total Duration", value: formatDuration(totalDuration), subtitle: "Recording time" },
    { icon: "📊", title: "Avg Words/Recording", value: avgWords, subtitle: "Per transcription" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">My Transcriptions</h1>
          <p className="text-gray-400 mt-1">Review and manage your recent audio transcriptions</p>
        </div>
        <PremiumButton onClick={() => navigate("/record")} variant="primary" className="shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <span className="mr-2">➕</span> New Recording
        </PremiumButton>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {transcriptions.length > 0 && <StatsGrid stats={stats} />}

      {transcriptions.length === 0 ? (
        <PremiumCard className="p-12 text-center border-dashed border-2 border-white/10 bg-[#0A0A23]/30">
          <div className="text-5xl mb-6 animate-float">🎤</div>
          <h2 className="text-2xl font-semibold text-white mb-2">No transcriptions yet</h2>
          <p className="text-gray-400 mb-8">Start recording to create your first transcription!</p>
          <PremiumButton onClick={() => navigate("/record")} variant="primary">
            Start Recording
          </PremiumButton>
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* List View */}
          <PremiumCard className="lg:col-span-1 overflow-hidden flex flex-col h-full p-0 border-white/5 bg-[#0A0A23]/50">
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="font-semibold text-white">All Transcriptions ({transcriptions.length})</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
              {transcriptions.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTranscription(t)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-all duration-300 border
                    ${selectedTranscription?._id === t._id
                      ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      : 'hover:bg-white/5 border-transparent hover:border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>{formatDate(t.createdAt)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5">
                      {getLanguageName(t.detectedLanguage)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white line-clamp-2 mb-2">
                    {t.transcription}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>⏱️ {formatDuration(t.duration)}</span>
                    <span>📝 {t.wordCount} words</span>
                  </div>
                </button>
              ))}
            </div>
          </PremiumCard>

          {/* Detail View */}
          <div className="lg:col-span-2 h-full">
            <AnimatePresence mode="wait">
              {selectedTranscription ? (
                <motion.div
                  key={selectedTranscription._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <PremiumCard className="h-full flex flex-col p-0 overflow-hidden border-white/5 bg-[#0A0A23]/50">
                    <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-white/5 backdrop-blur-md">
                      <div>
                        <h2 className="text-xl font-bold text-white">Transcription Details</h2>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                            📅 {formatDate(selectedTranscription.createdAt)}
                          </span>
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                            🌍 {getLanguageName(selectedTranscription.detectedLanguage)}
                          </span>
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                            ⏱️ {formatDuration(selectedTranscription.duration)}
                          </span>
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                            📝 {selectedTranscription.wordCount} words
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTranscription(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      <div className="bg-[#050511]/50 rounded-2xl p-6 border border-white/5 shadow-inner">
                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg font-light">
                          {selectedTranscription.transcription}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row justify-end gap-3 backdrop-blur-md">
                      <PremiumButton
                        variant="secondary"
                        onClick={() => downloadTranscription(selectedTranscription)}
                        className="w-full sm:w-auto"
                      >
                        📥 Download
                      </PremiumButton>
                      <PremiumButton
                        variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400 w-full sm:w-auto"
                        onClick={() => openDeleteModal(selectedTranscription)}
                      >
                        🗑️ Delete
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-gray-500 bg-[#0A0A23]/30 rounded-3xl border border-white/10 border-dashed"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4 opacity-50 animate-pulse">👈</div>
                    <p className="text-lg">Select a transcription to view details</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTranscriptionToDelete(null);
        }}
        title="Delete Transcription"
        footer={
          <>
            <PremiumButton variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="primary"
              className="bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-none"
              onClick={confirmDelete}
            >
              Delete
            </PremiumButton>
          </>
        }
      >
        <p className="text-gray-300 mb-4">Are you sure you want to delete this transcription?</p>
        {transcriptionToDelete && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-400 line-clamp-3 italic">
              "{transcriptionToDelete.transcription}"
            </p>
          </div>
        )}
        <p className="text-sm text-red-400 font-medium">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Dashboard;
