import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  role: 'user' | 'coach';
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export function useChatSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) { setSessions([]); setActiveId(null); return; }
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setSessions(data.map(row => ({
        id: row.id,
        title: row.title,
        messages: (row.messages as ChatMessage[]) ?? [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      })));
    }
  }, [user]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Auto-select most recent session on initial load
  useEffect(() => {
    if (sessions.length > 0 && activeId === null) {
      setActiveId(sessions[0].id);
    }
  }, [sessions, activeId]);

  const createSession = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat', messages: [] })
      .select()
      .single();
    if (error || !data) return null;
    const newSession: ChatSession = {
      id: data.id,
      title: data.title,
      messages: [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveId(data.id);
    return data.id;
  }, [user]);

  const selectSession = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const saveMessages = useCallback(async (id: string, messages: ChatMessage[], title?: string) => {
    const now = new Date().toISOString();
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, messages, ...(title ? { title } : {}), updated_at: now } : s
      );
      return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    });
    const updates: Record<string, unknown> = { messages, updated_at: now };
    if (title) updates.title = title;
    const { error } = await supabase.from('chat_sessions').update(updates).eq('id', id);
    if (error) fetchSessions();
  }, [fetchSessions]);

  const deleteSession = useCallback(async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
    await supabase.from('chat_sessions').delete().eq('id', id);
  }, [activeId]);

  return { sessions, activeId, createSession, selectSession, saveMessages, deleteSession };
}
