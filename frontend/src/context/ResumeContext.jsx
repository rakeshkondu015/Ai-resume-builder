import React, { createContext, useState } from 'react';
import api from '../utils/api';

export const ResumeContext = createContext();

const initialResumeContent = {
  personalInfo: {
    name: 'Candidate Name',
    title: 'Software Engineer',
    email: 'candidate@example.com',
    phone: '+1 234 567 8901',
    location: 'San Francisco, CA',
    website: 'linkedin.com/in/candidate',
    summary: 'Detail-oriented professional with a strong foundation in modern technology stacks.'
  },
  education: [
    {
      institution: 'Tech University',
      degree: 'B.S. in Computer Science',
      startDate: '2020',
      endDate: '2024',
      description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering.'
    }
  ],
  experience: [
    {
      company: 'Innovate Solutions',
      role: 'Junior Engineer',
      startDate: '2024-06',
      endDate: 'Present',
      description: 'Collaborated on developing microservices and optimized frontend rendering performance by 20%.'
    }
  ],
  projects: [
    {
      name: 'AI Resume SaaS',
      description: 'A React & Spring Boot SaaS product leveraging Mistral AI to improve text.',
      link: 'github.com/candidate/resume-builder'
    }
  ],
  skills: ['Java', 'Spring Boot', 'React', 'JavaScript', 'SQL', 'Git', 'REST APIs'],
  languages: ['English (Native)', 'Spanish (Conversational)'],
  certifications: [
    {
      name: 'Oracle Certified Java SE Developer',
      issuer: 'Oracle',
      date: '2024'
    }
  ]
};

export const ResumeProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResume = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/resumes/${id}`);
      const parsedResume = { ...res.data, content: JSON.parse(res.data.content) };
      setCurrentResume(parsedResume);
      return parsedResume;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createResume = async (title, templateId = 'modern') => {
    setLoading(true);
    try {
      const payload = {
        title,
        templateId,
        content: JSON.stringify(initialResumeContent),
      };
      const res = await api.post('/api/resumes', payload);
      const parsed = { ...res.data, content: JSON.parse(res.data.content) };
      setResumes((prev) => [...prev, parsed]);
      return parsed;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (id, title, templateId, content) => {
    try {
      const payload = {
        title,
        templateId,
        content: JSON.stringify(content),
      };
      const res = await api.put(`/api/resumes/${id}`, payload);
      const parsed = { ...res.data, content: JSON.parse(res.data.content) };
      setCurrentResume(parsed);
      setResumes((prev) => prev.map((r) => (r.id === id ? parsed : r)));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  const deleteResume = async (id) => {
    try {
      await api.delete(`/api/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (currentResume?.id === id) {
        setCurrentResume(null);
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const fetchCoverLetters = async () => {
    try {
      const res = await api.get('/api/ai/cover-letters');
      setCoverLetters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateCoverLetter = async (title, jobDescription, resumeText) => {
    try {
      const res = await api.post('/api/ai/cover-letter', {
        title,
        jobDescription,
        resumeContent: resumeText,
      });
      setCoverLetters((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const deleteCoverLetter = async (id) => {
    try {
      await api.delete(`/api/ai/cover-letters/${id}`);
      setCoverLetters((prev) => prev.filter((cl) => cl.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getAiImprovement = async (type, text, jobTitle) => {
    try {
      const res = await api.post('/api/ai/suggest', { type, text, jobTitle });
      return res.data.result;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        currentResume,
        setCurrentResume,
        coverLetters,
        loading,
        fetchResumes,
        fetchResume,
        createResume,
        saveResume,
        deleteResume,
        fetchCoverLetters,
        generateCoverLetter,
        deleteCoverLetter,
        getAiImprovement,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};
