import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResumeContext } from '../context/ResumeContext';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Save, Download, Sparkles, Plus, Trash2, ChevronLeft, 
  User, Briefcase, GraduationCap, Code, Folder, Award, AlertCircle, Check
} from 'lucide-react';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentResume, fetchResume, saveResume, getAiImprovement, loading } = useContext(ResumeContext);

  const [activeTab, setActiveTab] = useState('personal');
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('modern');
  const [content, setContent] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [aiJobTitle, setAiJobTitle] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  
  const previewRef = useRef();

  useEffect(() => {
    const loadResume = async () => {
      const data = await fetchResume(id);
      if (data) {
        setTitle(data.title);
        setTemplateId(data.templateId);
        setContent(data.content);
      } else {
        navigate('/');
      }
    };
    loadResume();
  }, [id]);

  if (!content) return null;

  const handleFieldChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayFieldChange = (section, index, field, value) => {
    setContent(prev => {
      const updatedArray = [...prev[section]];
      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value
      };
      return {
        ...prev,
        [section]: updatedArray
      };
    });
  };

  const addItem = (section, defaultObj) => {
    setContent(prev => ({
      ...prev,
      [section]: [...prev[section], defaultObj]
    }));
  };

  const removeItem = (section, index) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].filter((_, idx) => idx !== index)
    }));
  };

  const handleSkillsChange = (newSkills) => {
    setContent(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const handleSave = async () => {
    setSaveStatus('Saving...');
    const res = await saveResume(id, title, templateId, content);
    if (res.success) {
      setSaveStatus('All changes saved.');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Save failed.');
    }
  };

  // AI Helpers
  const handleAiSummary = async () => {
    const context = content.personalInfo.summary;
    if (!context) {
      alert('Please write a brief summary draft or list your keywords first!');
      return;
    }
    setAiLoading(true);
    const suggestion = await getAiImprovement('summary', context, aiJobTitle);
    setAiLoading(false);
    if (suggestion) {
      handleFieldChange('personalInfo', 'summary', suggestion);
    }
  };

  const handleAiImproveBullet = async (index) => {
    const currentBullet = content.experience[index].description;
    if (!currentBullet) {
      alert('Please input a basic sentence first!');
      return;
    }
    setAiLoading(true);
    const improved = await getAiImprovement('improve', currentBullet, aiJobTitle);
    setAiLoading(false);
    if (improved) {
      handleArrayFieldChange('experience', index, 'description', improved);
    }
  };

  const handleAiSuggestSkills = async () => {
    if (!aiJobTitle) {
      alert('Please enter a target job title first!');
      return;
    }
    setAiLoading(true);
    const result = await getAiImprovement('ats', content.skills.join(', '), aiJobTitle);
    setAiLoading(false);
    if (result) {
      const parsed = result.split(',').map(s => s.trim()).filter(Boolean);
      setSuggestedSkills(parsed);
    }
  };

  // PDF Trigger
  const handleDownloadPdf = async () => {
    try {
      setSaveStatus('Generating PDF...');
      const previewHtml = previewRef.current.innerHTML;

      // Wrap in printable body template
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
                color: #2c3e50;
                font-size: 10.5pt;
                line-height: 1.5;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
              }
              h1, h2, h3, h4 {
                margin: 0 0 10px 0;
                color: #1a252f;
              }
              a {
                color: #6366f1;
                text-decoration: none;
              }
              /* Layout-specific injection styling matching React templates */
              .resume-container { width: 100%; max-width: 800px; margin: 0 auto; background: white; }
              
              /* Modern Template styles */
              .header-modern { border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 15px; }
              .header-modern h1 { color: #6366f1; font-size: 26pt; text-transform: uppercase; margin-bottom: 4px; }
              
              /* Classic Template styles */
              .header-classic { border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 15px; text-align: center; }
              .header-classic h1 { color: #06b6d4; font-size: 26pt; margin-bottom: 4px; }
              
              /* Creative Template styles */
              .header-creative { border-bottom: 2px solid #d946ef; padding-bottom: 12px; margin-bottom: 15px; }
              .header-creative h1 { color: #d946ef; font-size: 26pt; margin-bottom: 4px; }
              
              /* Minimalist Template styles */
              .header-minimalist { border-bottom: 1px solid #111111; padding-bottom: 12px; margin-bottom: 15px; }
              .header-minimalist h1 { color: #111111; font-size: 24pt; margin-bottom: 4px; }

              .section-title { 
                font-size: 12pt; 
                text-transform: uppercase; 
                margin-top: 18px; 
                margin-bottom: 8px; 
                font-weight: bold; 
                border-bottom: 1px solid #e2e8f0; 
                padding-bottom: 4px; 
              }
              .modern-section { border-left: 3px solid #6366f1; padding-left: 10px; margin-left: -13px; }
              .classic-section { border-left: 3px solid #06b6d4; padding-left: 10px; margin-left: -13px; }
              .creative-section { border-left: 3px solid #d946ef; padding-left: 10px; margin-left: -13px; }
              .minimalist-section { border-left: 3px solid #111111; padding-left: 10px; margin-left: -13px; }
              
              .sub-title { font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 2px; }
              .date-range { font-weight: normal; color: #7f8c8d; font-size: 9.5pt; }
              .text-muted { color: #7f8c8d; font-size: 9.5pt; margin-bottom: 6px; }
              .skills-flex { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
              .skill-item { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 9pt; }
              .bullets { margin-top: 5px; padding-left: 20px; }
              .bullet-item { margin-bottom: 4px; }
            </style>
          </head>
          <body>
            <div class="resume-container">
              ${previewHtml}
            </div>
          </body>
        </html>
      `;

      const response = await api.post('/api/pdf/generate', { html: fullHtml }, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}_Resume.pdf`;
      link.click();
      setSaveStatus('PDF Export Complete.');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('PDF Generation failed.');
    }
  };

  // Live previews styling helper
  const getThemeColor = () => {
    switch (templateId) {
      case 'classic': return 'var(--color-secondary)';
      case 'creative': return 'var(--color-accent)';
      case 'minimalist': return 'var(--text-main)';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <div style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Workspace Header toolbar */}
      <div className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
            <ChevronLeft size={16} />
            Back
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-glass)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              padding: '0.25rem 0.5rem',
              outline: 'none',
              width: '260px'
            }}
          />
        </div>

        {/* Global Job Targeting & Loaders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
            <input
              type="text"
              placeholder="Target Job Role (e.g. Lead Dev)"
              value={aiJobTitle}
              onChange={(e) => setAiJobTitle(e.target.value)}
              className="input-field"
              style={{ padding: '0.4rem 0.75rem', width: '220px', fontSize: '0.85rem' }}
            />
          </div>

          <button onClick={handleSave} className="btn-secondary">
            <Save size={16} />
            Save Draft
          </button>

          <button onClick={handleDownloadPdf} className="btn-primary">
            <Download size={16} />
            Export PDF
          </button>

          {saveStatus && <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>{saveStatus}</span>}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Editing forms */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '680px', borderRadius: 'var(--radius-lg)' }}>
          {/* Tab Selection Row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { id: 'personal', label: 'Personal', icon: <User size={14} /> },
              { id: 'experience', label: 'Work', icon: <Briefcase size={14} /> },
              { id: 'education', label: 'Education', icon: <GraduationCap size={14} /> },
              { id: 'projects', label: 'Projects', icon: <Folder size={14} /> },
              { id: 'skills', label: 'Skills', icon: <Code size={14} /> },
              { id: 'certifications', label: 'Awards/Lang', icon: <Award size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn-secondary"
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  border: activeTab === tab.id ? `1px solid ${getThemeColor()}` : '1px solid var(--border-glass)',
                  background: activeTab === tab.id ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
                  color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content Switch */}
          {activeTab === 'personal' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={content.personalInfo.name}
                    onChange={(e) => handleFieldChange('personalInfo', 'name', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Job Title Headline</label>
                  <input
                    type="text"
                    className="input-field"
                    value={content.personalInfo.title}
                    onChange={(e) => handleFieldChange('personalInfo', 'title', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={content.personalInfo.email}
                    onChange={(e) => handleFieldChange('personalInfo', 'email', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    value={content.personalInfo.phone}
                    onChange={(e) => handleFieldChange('personalInfo', 'phone', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    value={content.personalInfo.location}
                    onChange={(e) => handleFieldChange('personalInfo', 'location', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Website / LinkedIn</label>
                  <input
                    type="text"
                    className="input-field"
                    value={content.personalInfo.website}
                    onChange={(e) => handleFieldChange('personalInfo', 'website', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ margin: 0 }}>Professional Summary</label>
                  <button 
                    onClick={handleAiSummary} 
                    className="btn-secondary" 
                    type="button"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.25rem', borderColor: 'var(--color-accent)' }}
                    disabled={aiLoading}
                  >
                    <Sparkles size={12} style={{ color: 'var(--color-accent)' }} />
                    AI Improve Summary
                  </button>
                </div>
                <textarea
                  className="input-field"
                  rows={4}
                  value={content.personalInfo.summary}
                  onChange={(e) => handleFieldChange('personalInfo', 'summary', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Work Experience</h3>
                <button
                  type="button"
                  onClick={() => addItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '' })}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} />
                  Add Position
                </button>
              </div>

              {content.experience.map((exp, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                  <button
                    onClick={() => removeItem('experience', idx)}
                    className="btn-danger"
                    style={{ position: 'absolute', top: '15px', right: '15px', padding: '0.35rem' }}
                  >
                    <Trash2 size={14} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Company Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={exp.company}
                        onChange={(e) => handleArrayFieldChange('experience', idx, 'company', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Job Title / Role</label>
                      <input
                        type="text"
                        className="input-field"
                        value={exp.role}
                        onChange={(e) => handleArrayFieldChange('experience', idx, 'role', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Start Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="MM/YYYY"
                        value={exp.startDate}
                        onChange={(e) => handleArrayFieldChange('experience', idx, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">End Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Present or MM/YYYY"
                        value={exp.endDate}
                        onChange={(e) => handleArrayFieldChange('experience', idx, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="input-label" style={{ margin: 0 }}>Description & Achievements</label>
                      <button 
                        onClick={() => handleAiImproveBullet(idx)} 
                        className="btn-secondary" 
                        type="button"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.25rem', borderColor: 'var(--color-accent)' }}
                        disabled={aiLoading}
                      >
                        <Sparkles size={12} style={{ color: 'var(--color-accent)' }} />
                        AI Boost Bullet
                      </button>
                    </div>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleArrayFieldChange('experience', idx, 'description', e.target.value)}
                      placeholder="e.g. Lead development of React front-end dashboard..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Education</h3>
                <button
                  type="button"
                  onClick={() => addItem('education', { institution: '', degree: '', startDate: '', endDate: '', description: '' })}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} />
                  Add Education
                </button>
              </div>

              {content.education.map((edu, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                  <button
                    onClick={() => removeItem('education', idx)}
                    className="btn-danger"
                    style={{ position: 'absolute', top: '15px', right: '15px', padding: '0.35rem' }}
                  >
                    <Trash2 size={14} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Institution</label>
                      <input
                        type="text"
                        className="input-field"
                        value={edu.institution}
                        onChange={(e) => handleArrayFieldChange('education', idx, 'institution', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Degree / Major</label>
                      <input
                        type="text"
                        className="input-field"
                        value={edu.degree}
                        onChange={(e) => handleArrayFieldChange('education', idx, 'degree', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Start Year</label>
                      <input
                        type="text"
                        className="input-field"
                        value={edu.startDate}
                        onChange={(e) => handleArrayFieldChange('education', idx, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">End Year</label>
                      <input
                        type="text"
                        className="input-field"
                        value={edu.endDate}
                        onChange={(e) => handleArrayFieldChange('education', idx, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description / Honors</label>
                    <input
                      type="text"
                      className="input-field"
                      value={edu.description}
                      onChange={(e) => handleArrayFieldChange('education', idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Personal Projects</h3>
                <button
                  type="button"
                  onClick={() => addItem('projects', { name: '', description: '', link: '' })}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} />
                  Add Project
                </button>
              </div>

              {content.projects.map((proj, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                  <button
                    onClick={() => removeItem('projects', idx)}
                    className="btn-danger"
                    style={{ position: 'absolute', top: '15px', right: '15px', padding: '0.35rem' }}
                  >
                    <Trash2 size={14} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Project Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={proj.name}
                        onChange={(e) => handleArrayFieldChange('projects', idx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Project Link</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="github.com/project"
                        value={proj.link}
                        onChange={(e) => handleArrayFieldChange('projects', idx, 'link', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Project Description</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleArrayFieldChange('projects', idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Skills Inventory</h3>

              {/* AI Skill Suggester box */}
              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-accent)' }}>
                  <Sparkles size={14} />
                  AI Skill & Keyword Recommendations
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Analyze your target role to identify key professional keywords to clear ATS filters.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleAiSuggestSkills}
                    className="btn-primary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))' }}
                    disabled={aiLoading}
                  >
                    Generate Recommendations
                  </button>
                </div>

                {suggestedSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {suggestedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          if (!content.skills.includes(skill)) {
                            handleSkillsChange([...content.skills, skill]);
                          }
                        }}
                        style={{
                          fontSize: '0.75rem',
                          background: content.skills.includes(skill) ? 'var(--color-success)' : 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        {skill}
                        {content.skills.includes(skill) ? <Check size={10} /> : <Plus size={10} />}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Keywords List (comma separated or enter/add)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Java, Python, React, Agile"
                  value={content.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value.split(',').map(s => s.trim()))}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {content.skills.map((skill, idx) => skill && (
                  <span
                    key={idx}
                    className="badge badge-free"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textTransform: 'none' }}
                  >
                    {skill}
                    <Trash2
                      size={10}
                      onClick={() => handleSkillsChange(content.skills.filter(s => s !== skill))}
                      style={{ cursor: 'pointer', color: 'var(--color-danger)' }}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Certifications</h3>
                  <button
                    type="button"
                    onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={12} />
                    Add Cert
                  </button>
                </div>
                {content.certifications?.map((cert, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', position: 'relative' }}>
                    <button
                      onClick={() => removeItem('certifications', idx)}
                      className="btn-danger"
                      style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.25rem' }}
                    >
                      <Trash2 size={12} />
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Cert Name"
                        value={cert.name}
                        onChange={(e) => handleArrayFieldChange('certifications', idx, 'name', e.target.value)}
                        style={{ padding: '0.5rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Issuer"
                        value={cert.issuer}
                        onChange={(e) => handleArrayFieldChange('certifications', idx, 'issuer', e.target.value)}
                        style={{ padding: '0.5rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Year"
                        value={cert.date}
                        onChange={(e) => handleArrayFieldChange('certifications', idx, 'date', e.target.value)}
                        style={{ padding: '0.5rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Languages</h3>
                  <button
                    type="button"
                    onClick={() => setContent(prev => ({ ...prev, languages: [...(prev.languages || []), ''] }))}
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={12} />
                    Add Lang
                  </button>
                </div>
                {content.languages?.map((lang, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. English (Native)"
                      value={lang}
                      onChange={(e) => {
                        const updated = [...content.languages];
                        updated[idx] = e.target.value;
                        setContent(prev => ({ ...prev, languages: updated }));
                      }}
                      style={{ padding: '0.5rem' }}
                    />
                    <button
                      onClick={() => setContent(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }))}
                      className="btn-danger"
                      style={{ padding: '0.5rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live preview canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Template Selection Toolbar */}
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Aesthetic Layout:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['modern', 'classic', 'creative', 'minimalist'].map(style => (
                <button
                  key={style}
                  onClick={() => setTemplateId(style)}
                  className="btn-secondary"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    borderColor: templateId === style ? getThemeColor() : 'var(--border-glass)',
                    textTransform: 'capitalize'
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Actual preview canvas simulating paper */}
          <div 
            ref={previewRef}
            className="glass-panel"
            style={{
              background: '#ffffff',
              color: '#2c3e50',
              padding: '2.5rem',
              borderRadius: 'var(--radius-md)',
              minHeight: '740px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              lineHeight: '1.5',
              fontSize: '14px'
            }}
          >
            {/* Conditional render templates */}
            
            {/* Header Layout */}
            <div className={`header-${templateId}`} style={{
              borderBottom: `2px solid ${
                templateId === 'modern' ? '#6366f1' :
                templateId === 'classic' ? '#06b6d4' :
                templateId === 'creative' ? '#d946ef' : '#111111'
              }`,
              paddingBottom: '12px',
              marginBottom: '15px',
              textAlign: templateId === 'classic' ? 'center' : 'left'
            }}>
              <h1 style={{
                color: 
                  templateId === 'modern' ? '#6366f1' :
                  templateId === 'classic' ? '#06b6d4' :
                  templateId === 'creative' ? '#d946ef' : '#111111',
                fontSize: '28px',
                fontWeight: 'bold',
                textTransform: templateId === 'modern' ? 'uppercase' : 'none',
                margin: '0 0 4px 0'
              }}>
                {content.personalInfo.name}
              </h1>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#34495e', marginBottom: '8px' }}>
                {content.personalInfo.title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: templateId === 'classic' ? 'center' : 'flex-start', fontSize: '12px', color: '#7f8c8d' }}>
                {content.personalInfo.email && <span>{content.personalInfo.email}</span>}
                {content.personalInfo.phone && <span>• {content.personalInfo.phone}</span>}
                {content.personalInfo.location && <span>• {content.personalInfo.location}</span>}
                {content.personalInfo.website && <span>• {content.personalInfo.website}</span>}
              </div>
            </div>

            {/* Summary */}
            {content.personalInfo.summary && (
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#34495e' }}>{content.personalInfo.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {content.experience.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h3 className={`${templateId}-section`} style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  borderLeft: `3px solid ${
                    templateId === 'modern' ? '#6366f1' :
                    templateId === 'classic' ? '#06b6d4' :
                    templateId === 'creative' ? '#d946ef' : '#111111'
                  }`,
                  paddingLeft: '8px',
                  marginLeft: '-11px'
                }}>
                  Experience
                </h3>
                {content.experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                      <span>{exp.role} - <span style={{ fontWeight: 500, color: '#7f8c8d' }}>{exp.company}</span></span>
                      <span style={{ fontWeight: 'normal', color: '#7f8c8d', fontSize: '12px' }}>
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    {exp.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#555' }}>{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {content.education.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h3 className={`${templateId}-section`} style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  borderLeft: `3px solid ${
                    templateId === 'modern' ? '#6366f1' :
                    templateId === 'classic' ? '#06b6d4' :
                    templateId === 'creative' ? '#d946ef' : '#111111'
                  }`,
                  paddingLeft: '8px',
                  marginLeft: '-11px'
                }}>
                  Education
                </h3>
                {content.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                      <span>{edu.degree}</span>
                      <span style={{ fontWeight: 'normal', color: '#7f8c8d', fontSize: '12px' }}>
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d', fontStyle: 'italic' }}>{edu.institution}</div>
                    {edu.description && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#555' }}>{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {content.projects.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h3 className={`${templateId}-section`} style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  borderLeft: `3px solid ${
                    templateId === 'modern' ? '#6366f1' :
                    templateId === 'classic' ? '#06b6d4' :
                    templateId === 'creative' ? '#d946ef' : '#111111'
                  }`,
                  paddingLeft: '8px',
                  marginLeft: '-11px'
                }}>
                  Projects
                </h3>
                {content.projects.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                      <span>{proj.name}</span>
                      {proj.link && <span style={{ fontWeight: 'normal', color: '#6366f1', fontSize: '12px' }}>{proj.link}</span>}
                    </div>
                    {proj.description && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#555' }}>{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {content.skills.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h3 className={`${templateId}-section`} style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  borderLeft: `3px solid ${
                    templateId === 'modern' ? '#6366f1' :
                    templateId === 'classic' ? '#06b6d4' :
                    templateId === 'creative' ? '#d946ef' : '#111111'
                  }`,
                  paddingLeft: '8px',
                  marginLeft: '-11px'
                }}>
                  Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {content.skills.map((skill, idx) => skill && (
                    <span 
                      key={idx} 
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications and Languages row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {content.certifications && content.certifications.length > 0 && (
                <div>
                  <h3 className={`${templateId}-section`} style={{
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '4px',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    borderLeft: `3px solid ${
                      templateId === 'modern' ? '#6366f1' :
                      templateId === 'classic' ? '#06b6d4' :
                      templateId === 'creative' ? '#d946ef' : '#111111'
                    }`,
                    paddingLeft: '8px',
                    marginLeft: '-11px'
                  }}>
                    Certifications
                  </h3>
                  {content.certifications.map((c, i) => (
                    <div key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold' }}>{c.name}</span> - {c.issuer} ({c.date})
                    </div>
                  ))}
                </div>
              )}

              {content.languages && content.languages.length > 0 && (
                <div>
                  <h3 className={`${templateId}-section`} style={{
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '4px',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    borderLeft: `3px solid ${
                      templateId === 'modern' ? '#6366f1' :
                      templateId === 'classic' ? '#06b6d4' :
                      templateId === 'creative' ? '#d946ef' : '#111111'
                    }`,
                    paddingLeft: '8px',
                    marginLeft: '-11px'
                  }}>
                    Languages
                  </h3>
                  {content.languages.map((l, i) => (
                    <div key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
