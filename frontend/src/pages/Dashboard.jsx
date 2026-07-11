import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeContext } from '../context/ResumeContext';
import { AuthContext } from '../context/AuthContext';
import { FilePlus, FileEdit, Trash2, Calendar, FileText, Sparkles, Award } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { resumes, fetchResumes, createResume, deleteResume, coverLetters, fetchCoverLetters } = useContext(ResumeContext);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('modern');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
    fetchCoverLetters();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const newResume = await createResume(newTitle, newTemplate);
    setCreating(false);
    if (newResume) {
      navigate(`/builder/${newResume.id}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await deleteResume(id);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem 2rem' }}>
      {/* Greeting Banner */}
      <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
          Welcome back, <span style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{user?.name}</span>!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Build, optimize, and customize your professional resumes with AI assistance.</p>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--color-primary-glow)',
            color: 'var(--color-primary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{resumes.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Resumes</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--color-accent-glow)',
            color: 'var(--color-accent)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{coverLetters.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>AI Cover Letters</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--color-warning)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.subscription} PLAN</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Subscription Status</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Create Resume Card */}
        <div className="glass-card animate-slide-up" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FilePlus size={22} style={{ color: 'var(--color-primary)' }} />
            Create New Resume
          </h2>

          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label className="input-label" htmlFor="title">Resume Title</label>
              <input
                id="title"
                type="text"
                className="input-field"
                placeholder="e.g. Software Engineer 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="template">Select Template Style</label>
              <select
                id="template"
                className="input-field"
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
              >
                <option value="modern">Modern Professional (Indigo Accent)</option>
                <option value="classic">Classic Editorial (Teal Accent)</option>
                <option value="creative">Creative Designer (Purple Accent)</option>
                <option value="minimalist">Minimalist Elegant (Black & White)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={creating}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            >
              {creating ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>
        </div>

        {/* Resumes List */}
        <div style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Resumes</h2>
          {resumes.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <FileText size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: 'var(--text-dim)' }} />
              <p>You haven't created any resumes yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Use the builder card to create your first resume workspace!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => navigate(`/builder/${resume.id}`)}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass)'
                    }}>
                      <FileText size={20} style={{ color: 'var(--color-secondary)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{resume.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          Edited {new Date(resume.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="badge badge-free" style={{ fontSize: '0.65rem' }}>
                          {resume.templateId} template
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/${resume.id}`);
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                      title="Edit Resume"
                    >
                      <FileEdit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(resume.id, e)}
                      className="btn-danger"
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                      title="Delete Resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
