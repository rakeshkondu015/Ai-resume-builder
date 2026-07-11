import React, { useContext, useState, useEffect } from 'react';
import { ResumeContext } from '../context/ResumeContext';
import { Sparkles, FileText, Trash2, Copy, Download, ClipboardCheck, ArrowRight, CornerDownRight } from 'lucide-react';

const CoverLetterGenerator = () => {
  const { resumes, fetchResumes, coverLetters, fetchCoverLetters, generateCoverLetter, deleteCoverLetter } = useContext(ResumeContext);
  const [title, setTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResumes();
    fetchCoverLetters();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !jobDescription.trim()) return;

    setLoading(true);
    setCurrentLetter(null);

    // Try to get resume content to feed into AI
    let resumeText = '';
    if (selectedResumeId) {
      const selectedResume = resumes.find(r => r.id === parseInt(selectedResumeId));
      if (selectedResume) {
        resumeText = JSON.stringify(selectedResume.content);
      }
    }

    const letter = await generateCoverLetter(title, jobDescription, resumeText);
    setLoading(false);
    if (letter) {
      setCurrentLetter(letter);
    }
  };

  const handleCopy = () => {
    if (!currentLetter) return;
    navigator.clipboard.writeText(currentLetter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentLetter) return;
    const element = document.createElement("a");
    const file = new Blob([currentLetter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentLetter.title.replace(/\s+/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this cover letter?')) {
      await deleteCoverLetter(id);
      if (currentLetter?.id === id) {
        setCurrentLetter(null);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem 2rem' }}>
      <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles style={{ color: 'var(--color-accent)' }} />
          AI Cover Letter Generator
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate customized, role-tailored cover letters in seconds utilizing Mistral AI.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: History & Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Generation Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Draft Cover Letter</h2>

            <form onSubmit={handleGenerate}>
              <div className="input-group">
                <label className="input-label" htmlFor="cl-title">Document Title</label>
                <input
                  id="cl-title"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Google Front-End Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="resume-select">Select Alignment Resume (Optional)</label>
                <select
                  id="resume-select"
                  className="input-field"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                >
                  <option value="">No alignment (AI will write general letter)</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="job-desc">Job Description / Prompt</label>
                <textarea
                  id="job-desc"
                  className="input-field"
                  rows={6}
                  placeholder="Paste the target job description or company requirements here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '120px' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {loading ? 'Generating...' : (
                  <>
                    <Sparkles size={16} />
                    Generate Letter
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Cover Letter History List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'Outfit' }}>Saved Letters</h2>
            {coverLetters.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem' }}>No cover letters generated yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {coverLetters.map((cl) => (
                  <div
                    key={cl.id}
                    onClick={() => setCurrentLetter(cl)}
                    className="glass-panel"
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderLeft: currentLetter?.id === cl.id ? '3px solid var(--color-accent)' : '1px solid var(--border-glass)',
                      background: currentLetter?.id === cl.id ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} style={{ color: 'var(--color-accent)' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cl.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(cl.id, e)}
                      className="btn-danger"
                      style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Viewer / Workspace */}
        <div style={{ gridColumn: 'span 2' }}>
          {loading && (
            <div className="glass-panel animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-glass)',
                borderTop: '4px solid var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem'
              }}></div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Analyzing Job Role...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mistral AI is weaving candidate insights and position specs.</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {!loading && !currentLetter && (
            <div className="glass-panel" style={{
              padding: '6rem 2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              borderStyle: 'dashed'
            }}>
              <FileText size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: 'var(--text-dim)' }} />
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Cover Letter Selected</h3>
              <p style={{ fontSize: '0.9rem' }}>Fill in the form to generate a letter, or select a saved letter from history.</p>
            </div>
          )}

          {!loading && currentLetter && (
            <div className="glass-card animate-slide-up" style={{ padding: '2.5rem', background: 'var(--bg-glass-hover)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{currentLetter.title}</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Generated on {new Date(currentLetter.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                    {copied ? <ClipboardCheck size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>

              {/* Cover Letter Content Body */}
              <div style={{ position: 'relative' }}>
                <textarea
                  className="input-field"
                  value={currentLetter.content}
                  onChange={(e) => setCurrentLetter({ ...currentLetter, content: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '450px',
                    fontFamily: 'Courier, monospace',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    resize: 'vertical'
                  }}
                  placeholder="Cover letter contents..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
