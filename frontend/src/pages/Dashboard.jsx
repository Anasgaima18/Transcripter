import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useToast } from "../components/ToastProvider";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import { StatsGrid } from "../components/StatsCard";
import { Container, Card, Button, Alert } from "../components/ui";

const PageWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0;
`;

const Sub = styled.p`
  color: #475569;
  margin: 0.25rem 0 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr;
  }

  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

const ListHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 640px) {
    padding: 0.75rem 1rem;
  }
`;

const ListBody = styled.div`
  max-height: 560px;
  overflow-y: auto;
  
  & > * + * {
    border-top: 1px solid #e2e8f0;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  @media (max-width: 640px) {
    max-height: 400px;
  }
`;

const ListItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 1rem 1.25rem;
  background: ${(p) => (p.$active ? "#f8fafc" : "transparent")};
  transition: all 0.2s ease;
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(0);
  }

  @media (max-width: 640px) {
    padding: 0.75rem 1rem;
  }
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
  gap: 0.5rem;

  @media (max-width: 640px) {
    font-size: 0.75rem;
    flex-wrap: wrap;
  }
`;

const ItemText = styled.div`
  margin-top: 0.25rem;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;

  @media (max-width: 640px) {
    font-size: 0.875rem;
    -webkit-line-clamp: 3;
  }
`;

const ItemFooter = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;

  @media (max-width: 640px) {
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;

const EmptyCard = styled.div`
  padding: 3rem;
  text-align: center;
`;

const Emoji = styled.div`
  font-size: 2rem;
  animation: bounce 1.5s infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const DetailTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #0f172a;

  @media (max-width: 640px) {
    font-size: 1.125rem;
  }
`;

const DetailMeta = styled.div`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #475569;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (max-width: 640px) {
    font-size: 0.75rem;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  color: #94a3b8;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s ease;
  border-radius: 0.25rem;

  &:hover {
    color: #475569;
    background: #f1f5f9;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DetailActions = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    
    button {
      width: 100%;
    }
  }
`;

const Dashboard = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transcriptionToDelete, setTranscriptionToDelete] = useState(null);

  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
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
  };

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
      window.URL.revokeObjectURL(url);
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
      <PageWrap>
        <Navbar />
        <Container style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
          <Skeleton.Dashboard />
        </Container>
      </PageWrap>
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
    <PageWrap>
      <Navbar />
      <Container style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <HeaderRow>
          <div>
            <Title>🎙️ My Transcriptions</Title>
            <Sub>Review and manage your recent audio transcriptions</Sub>
          </div>
          <Button onClick={() => navigate("/record")}>➕ New Recording</Button>
        </HeaderRow>

        {error && <Alert variant="danger">{error}</Alert>}
        {transcriptions.length > 0 && <StatsGrid stats={stats} />}

        {transcriptions.length === 0 ? (
          <EmptyCard as={Card}>
            <Emoji>🎤</Emoji>
            <h2 style={{ fontWeight: 600, color: "#0f172a", marginTop: "0.5rem" }}>No transcriptions yet</h2>
            <p style={{ color: "#475569" }}>Start recording to create your first transcription!</p>
            <div style={{ marginTop: "1rem" }}>
              <Button onClick={() => navigate("/record")}>Start Recording</Button>
            </div>
          </EmptyCard>
        ) : (
          <Grid>
            <Card style={{ padding: 0 }}>
              <ListHeader>
                <h2 style={{ margin: 0, fontWeight: 600 }}>
                  All Transcriptions ({transcriptions.length})
                </h2>
              </ListHeader>
              <ListBody>
                {transcriptions.map((t) => (
                  <ListItem
                    key={t._id}
                    $active={selectedTranscription?._id === t._id}
                    onClick={() => setSelectedTranscription(t)}
                  >
                    <ItemMeta>
                      <span>{formatDate(t.createdAt)}</span>
                      <span>{getLanguageName(t.detectedLanguage)}</span>
                    </ItemMeta>
                    <ItemText>{t.transcription}</ItemText>
                    <ItemFooter>
                      <span>⏱️ {formatDuration(t.duration)}</span>
                      <span>📝 {t.wordCount} words</span>
                    </ItemFooter>
                  </ListItem>
                ))}
              </ListBody>
            </Card>

            {selectedTranscription && (
              <Card style={{ padding: "1.5rem" }}>
                <DetailHeader>
                  <div>
                    <DetailTitle>Transcription Details</DetailTitle>
                    <DetailMeta>
                      <span>Date: {formatDate(selectedTranscription.createdAt)}</span>
                      <span>Language: {getLanguageName(selectedTranscription.detectedLanguage)}</span>
                      <span>Duration: {formatDuration(selectedTranscription.duration)}</span>
                      <span>Words: {selectedTranscription.wordCount}</span>
                    </DetailMeta>
                  </div>
                  <CloseButton onClick={() => setSelectedTranscription(null)}>✕</CloseButton>
                </DetailHeader>

                <div style={{ marginTop: "1rem" }}>
                  <h3 style={{ color: "#0f172a", fontWeight: 500, marginBottom: "0.5rem" }}>Full Transcription</h3>
                  <Card style={{ padding: "1rem", background: "#f8fafc" }}>
                    <p style={{ lineHeight: 1.7, color: "#1f2937", whiteSpace: "pre-wrap", margin: 0 }}>
                      {selectedTranscription.transcription}
                    </p>
                  </Card>
                </div>

                <DetailActions>
                  <Button variant="secondary" onClick={() => downloadTranscription(selectedTranscription)}>
                    📥 Download
                  </Button>
                  <Button variant="danger" onClick={() => openDeleteModal(selectedTranscription)}>
                    🗑️ Delete
                  </Button>
                </DetailActions>
              </Card>
            )}
          </Grid>
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
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this transcription?</p>
          {transcriptionToDelete && (
            <Card style={{ padding: "0.75rem", marginTop: "0.75rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0 }}>
                <strong>Preview:</strong> {transcriptionToDelete.transcription.substring(0, 100)}...
              </p>
            </Card>
          )}
          <p style={{ fontSize: "0.875rem", color: "#475569", marginTop: "0.75rem" }}>
            This action cannot be undone.
          </p>
        </Modal>
      </Container>
    </PageWrap>
  );
};

export default Dashboard;
