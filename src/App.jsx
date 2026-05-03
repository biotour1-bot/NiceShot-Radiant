import React, { useState, useMemo, useEffect } from 'react';
import RadiantLogo from './components/RadiantLogo';
import { supabase } from './lib/supabase';
import LoginView from './components/LoginView';

// --- Premium Icons ---
const Icons = {
  Home: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H3V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Action: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  Rank: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Users: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Settings: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Notice: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  AdminBoard: ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "var(--accent-color)" : "none"} stroke="currentColor" strokeWidth="2" style={{ color: active ? "var(--accent-color)" : "currentColor" }}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
};

// --- Utils ---
const calculateAvg = (history) => {
  if (!history || !Array.isArray(history) || history.length === 0) return '-';
  const validScores = history.map(item => typeof item === 'number' ? item : (item?.score || NaN)).filter(s => !isNaN(s));
  if (validScores.length === 0) return '-';
  const sum = validScores.reduce((a, b) => a + b, 0);
  return (sum / validScores.length).toFixed(1);
};

// --- Mock Initial Data ---
const INITIAL_MEMBERS = [
  { id: 1, name: '김프로', grade: '정회원', handicap: 5.2, contact: '010-1234-5678', status: '활동', manager: '이철수', history: [72, 75, 74], awards: ['2024-04 메달리스트', '2023-12 우승'], donations: ['2024-05 타월 50매'] },
  { id: 2, name: '이사장', grade: '정회원', handicap: 18.0, contact: '010-9876-5432', status: '활동', manager: '박관장', history: [88, 92], awards: ['2024-03 롱기스트'], donations: ['2024-04 연회비 찬조 100만원'] },
  { id: 3, name: '정게스트', grade: '게스트', handicap: 12.0, contact: '010-1111-2222', status: '활동', manager: '이철수', history: [82], awards: [], donations: [] },
  { id: 4, name: '조대표', grade: '정회원', handicap: 28.0, contact: '010-4444-4444', status: '휴면', manager: '박관장', history: [95, 98], awards: [], donations: ['2024-02 공 10박스'] },
];

// --- Sub-View Components (Defined Outside App) ---

const MemberMgmtView = ({ members, setSubView, setEditingMember }) => (
  <div className="animate-fade-in section-spacing">
    <div className="flex justify-between items-center mb-6">
      <h2 className="heading text-xl">회원 정보 관리</h2>
      <div className="flex gap-2">
        <button className="btn-outline px-4 py-2 text-xs border-primary/40 text-primary" onClick={() => setSubView('MEMBER_LIST')}>회원 목록</button>
        <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MAIN')}>← 대시보드</button>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      {(members || []).map(m => (
        <div key={m?.id} className="glass-panel p-5 relative overflow-hidden" style={{ opacity: m?.status === '휴면' ? 0.6 : 1 }}>
          {m.status === '활동' && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>}
          <div className="flex justify-between items-start mb-4">
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold">{m.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${m.grade === '정회원' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>{m.grade}</span>
                </div>
                <div className="text-[10px] text-dim font-bold tracking-widest uppercase">{m.status} 회원</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-accent font-bold uppercase mb-1">ACCUMULATED AVG</div>
                <div className="text-2xl font-black italic">{calculateAvg(m.history)}</div>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-2xl border border-white/5 shadow-inner">
             <div className="flex flex-col">
                <span className="text-[10px] text-dim uppercase mb-0.5 font-bold">기초 핸디캡</span>
                <span className="text-sm font-bold text-white">{m.handicap}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-dim uppercase mb-0.5 font-bold">연락 담당자</span>
                <span className="text-sm font-bold text-accent">{m.manager}</span>
             </div>
             <div className="flex flex-col col-span-2">
                <span className="text-[10px] text-dim uppercase mb-0.5 font-bold">연락처</span>
                <span className="text-sm font-bold tracking-tighter">{m.contact}</span>
             </div>
          </div>
          <div className="flex gap-3 mt-5">
             <button className="btn-outline flex-1 py-3 text-xs" onClick={() => { setEditingMember(m); setSubView('MEMBER_FORM'); }}>정보 수정</button>
             <button className="btn-outline flex-1 py-3 text-xs">기록 보기</button>
          </div>
        </div>
      ))}
      <button className="btn-primary w-full py-4 mt-4" onClick={() => { setEditingMember(null); setSubView('MEMBER_FORM'); }}>+ 신규 회원 등록</button>
    </div>
  </div>
);

const MemberListView = ({ members, setSubView }) => {
  const [selectedHistoryMember, setSelectedHistoryMember] = useState(null);
  const sortedMembers = useMemo(() => [...(members || [])].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko')), [members]);
  if (selectedHistoryMember) {
    return (
      <div className="animate-fade-in section-spacing flex flex-col min-h-[75vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading text-xl">{selectedHistoryMember.name} <span className="text-sm font-bold text-dim ml-1">스코어 기록</span></h2>
        </div>
        
        <div className="flex-1 space-y-3 pb-32">
          {(!selectedHistoryMember.history || selectedHistoryMember.history.length === 0) ? (
            <div className="text-center py-20 text-dim italic text-sm font-bold">기록된 대회 스코어가 없습니다.</div>
          ) : (
            selectedHistoryMember.history.slice(0, 10).map((h, idx) => {
              const isObj = typeof h === 'object' && h !== null;
              const score = isObj ? h.score : h;
              const date = isObj ? (h.date || '').replace(/-/g, '.') : '';
              const title = isObj ? h.eventName : '과거 기록';
              const loc = isObj ? h.location : '';

              return (
                <div key={idx} className="glass-panel p-4 flex justify-between items-center">
                  <div className="flex-1 truncate pr-4">
                    <div className="text-[10px] text-accent font-black mb-1">{date}</div>
                    <div className="text-sm text-white font-bold truncate">{title}</div>
                    {loc && <div className="text-[10px] text-dim truncate">{loc}</div>}
                  </div>
                  <div className="text-3xl font-black italic text-primary">{score}</div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="fixed bottom-28 left-0 w-full flex justify-center z-50 pointer-events-none px-4">
          <button className="btn-primary w-2/3 py-4 text-base font-black shadow-2xl pointer-events-auto" onClick={() => setSelectedHistoryMember(null)}>확인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl">전체 회원 목록</h2>
        <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MEMBER_MGMT')}>← 회원 관리</button>
      </div>
      <div className="glass-panel overflow-hidden border-white/5">
        <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="bg-white/5 text-[10px] text-dim font-black uppercase tracking-widest border-b border-white/10">
              <th className="p-4 w-5/12">이름</th>
              <th className="p-4 text-center w-1/4">핸디</th>
              <th className="p-4 text-right w-1/3">기록보기</th>
            </tr>
          </thead>
          <tbody>
            {(sortedMembers || []).map(m => (
              <tr key={m.id} className="border-b last:border-b-0 border-white/5 active:bg-white/10 transition-colors" style={{ opacity: m.status === '휴면' ? 0.5 : 1 }}>
                <td className="p-4 font-bold text-white text-sm truncate">{m.name}</td>
                <td className="p-4 text-center font-bold text-accent text-sm">{m.handicap}</td>
                <td className="p-4 text-right">
                  <button className="btn-outline py-1.5 px-3 text-[10px] m-0 inline-block" onClick={() => setSelectedHistoryMember(m)}>기록 보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MemberFormView = ({ editingMember, members, setMembers, setSubView }) => {
  const initialForm = { name: '', grade: '정회원', handicap: 20.0, contact: '', status: '활동', manager: '', history: [], awards: [], donations: [] };
  const [formData, setFormData] = useState(editingMember || initialForm);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    let result;
    if (editingMember) {
      const { id, ...updateData } = formData;
      result = await supabase.from('members').update(updateData).eq('id', editingMember.id).select();
    } else {
      result = await supabase.from('members').insert(formData).select();
    }
    const { data, error } = result;
    
    if (error) {
      console.error('Error saving member:', error.message);
      alert(`저장 중 오류가 발생했습니다: ${error.message}\n\n(데이터베이스 테이블이 생성되었는지 확인해 주세요.)`);
      return;
    }

    if (!data || data.length === 0) {
      alert('저장되었으나 데이터를 다시 불러오지 못했습니다. 목록에서 확인해 주세요.');
      setSubView('MEMBER_MGMT');
      return;
    }

    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? data[0] : m));
      setSubView('MEMBER_MGMT');
    } else {
      setMembers([data[0], ...members]);
      setFormData(initialForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDelete = async () => {
    if (!editingMember) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('members').delete().eq('id', editingMember.id);
    if (error) {
      console.error('Error deleting member:', error.message);
      alert('삭제 중 오류가 발생했습니다.');
      return;
    }

    setMembers(members.filter(m => m.id !== editingMember.id));
    setSubView('MEMBER_MGMT');
  };

  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl">{editingMember ? '회원 정보 수정' : '신규 회원 등록'}</h2>
        <div className="flex gap-2">
           <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MAIN')}>대시보드</button>
           <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MEMBER_MGMT')}>목록으로</button>
        </div>
      </div>
      
      {success && (
        <div className="mb-6 bg-success/20 border border-success/30 p-4 rounded-2xl animate-bounce-subtle">
           <p className="text-center text-xs font-black italic text-success uppercase tracking-widest leading-none">✓ MEMBER SAVED SUCCESSFULLY</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
        <div>
          <label className="text-[10px] text-dim font-bold block mb-1">성명</label>
          <input 
            required 
            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-dim font-bold block mb-1">등급</label>
            <select className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white outline-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
              <option>정회원</option>
              <option>게스트</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-dim font-bold block mb-1">상태</label>
            <select className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option>활동</option>
              <option>휴면</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-dim font-bold block mb-1">핸디캡</label>
            <input 
              type="number" 
              step="0.1" 
              className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none" 
              value={formData.handicap} 
              onChange={e => setFormData({...formData, handicap: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] text-dim font-bold block mb-1">관리자</label>
            <input 
              className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none" 
              value={formData.manager} 
              onChange={e => setFormData({...formData, manager: e.target.value})} 
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-dim font-bold block mb-1">연락처</label>
          <input 
            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none" 
            placeholder="010-0000-0000" 
            value={formData.contact} 
            onChange={e => {
              const val = e.target.value.replace(/[^\d]/g, '');
              let formatted = val;
              if (val.length > 3 && val.length <= 7) {
                formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
              } else if (val.length > 7) {
                formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
              }
              setFormData({...formData, contact: formatted});
            }} 
          />
        </div>
        <button type="submit" className="btn-primary w-full py-4 mt-4 font-bold">{editingMember ? '정보 저장' : '회원 등록 완료'}</button>
        {editingMember && <button type="button" className="w-full py-2 text-xs text-error font-bold opacity-60 hover:opacity-100" onClick={handleDelete}>회원 삭제</button>}
      </form>
    </div>
  );
};

const EventSetupView = ({ eventData, setEventData, setTeams, setSubView }) => {
  const [localEvent, setLocalEvent] = useState(eventData || { name: '', location: '', date: '', teamCount: 4, teeTimes: [] });
  const handleCount = (n) => {
    const times = localEvent?.teeTimes || [];
    const nt = Array.from({length: n}, (_, i) => times[i] || '08:00');
    setLocalEvent({...localEvent, teamCount: n, teeTimes: nt});
  };

  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl">월례회 설정</h2>
        <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MAIN')}>← 대시보드</button>
      </div>
      <div className="glass-panel p-6 flex flex-col gap-6">
        <div className="space-y-4">
           <div>
             <label className="text-[10px] text-dim font-bold block mb-2">대회 명칭</label>
             <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white" value={localEvent.name} onChange={(e)=>setLocalEvent({...localEvent, name:e.target.value})} />
           </div>
           <div>
             <label className="text-[10px] text-dim font-bold block mb-2">장소 및 일시</label>
             <div className="flex gap-2">
                <input className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-white" value={localEvent.location} onChange={(e)=>setLocalEvent({...localEvent, location:e.target.value})} />
                <input type="date" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-white" value={localEvent.date} onChange={(e)=>setLocalEvent({...localEvent, date:e.target.value})} />
             </div>
           </div>
        </div>
        <div className="space-y-4">
           <label className="text-[10px] text-dim font-bold block mb-2">총 팀 수 설정 ({localEvent?.teamCount || 0}팀)</label>
           <div className="flex gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={()=>handleCount(n)} className={`flex-1 py-3 rounded-xl border text-sm ${localEvent?.teamCount===n?'bg-primary border-primary':'bg-white/5 border-white/10 text-white'}`}>{n}팀</button>
              ))}
           </div>
        </div>
        <div className="space-y-3">
           <label className="text-[10px] text-dim font-bold block">조별 개별 티오프 시간</label>
           <div className="grid grid-cols-2 gap-3">
              {(localEvent?.teeTimes || []).map((t, idx) => (
                <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-accent block mb-1">{idx+1}조</span>
                  <input type="time" className="bg-transparent text-white font-bold w-full outline-none" value={t} onChange={(e)=>{const nt=[...(localEvent?.teeTimes || [])]; nt[idx]=e.target.value; setLocalEvent({...localEvent, teeTimes:nt});}} />
                </div>
              ))}
           </div>
        </div>
        <button className="btn-primary w-full py-4 mt-4 font-bold" onClick={async () => {
          const payload = {
            name: localEvent.name,
            location: localEvent.location,
            date: localEvent.date,
            team_count: localEvent.teamCount,
            tee_times: localEvent.teeTimes 
          };
          
          let result;
          if (localEvent.id) {
            result = await supabase.from('events').update(payload).eq('id', localEvent.id).select();
          } else {
            result = await supabase.from('events').insert(payload).select();
          }
          
          const { data, error } = result;
          
          if (!error && data) {
            setEventData({
              ...data[0],
              teamCount: data[0].team_count,
              teeTimes: data[0].tee_times
            });
            // 신규 대회 생성 시 teams 초기화 (기존 조편성 잔류 방지)
            if (!localEvent.id) {
              setTeams([]);
            }
            setSubView('MAIN');
          } else {
             console.error('Error saving event:', error?.message);
             alert('대회 설정 저장 중 오류가 발생했습니다: ' + error?.message);
          }
        }}>대회 계획 확정</button>
      </div>
    </div>
  );
};

const TeamAssignmentView = ({ eventData, members, teams, setTeams, setSubView, setActiveTab }) => {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);

  useEffect(() => {
    const targetCount = eventData?.teamCount || 4;
    if (teams.length !== targetCount) {
      setTeams(prevTeams => {
        let newTeams = [...prevTeams];
        if (newTeams.length > targetCount) {
          newTeams = newTeams.slice(0, targetCount);
        } else if (newTeams.length < targetCount) {
          const additional = Array.from({ length: targetCount - newTeams.length }, (_, i) => ({
            id: newTeams.length + i + 1,
            name: `${newTeams.length + i + 1}조`,
            memberIds: []
          }));
          newTeams = [...newTeams, ...additional];
        }
        return newTeams;
      });
    }
  }, [eventData?.teamCount, setTeams, teams.length]);

  const unassignedMembers = (members || []).filter(
    m => !teams?.some(t => t?.memberIds?.includes(m?.id)) && m?.status === '활동'
  );

  // 조에서 이름 클릭 → 미편성으로 반환
  const removeMemberFromTeam = (teamId, memberId) => {
    setSelectedTeamId(null);
    setTeams(prev => prev.map(t =>
      t.id === teamId ? { ...t, memberIds: t.memberIds.filter(id => id !== memberId) } : t
    ));
  };

  // 빈 슬롯 클릭 → 해당 팀을 선택 상태로
  const selectTeamSlot = (teamId) => {
    setSelectedTeamId(prev => prev === teamId ? null : teamId);
  };

  // 사이드바에서 이름 클릭 → selectedTeamId 팀에 배정 or 빈 자리 첫 팀에 배정
  const assignMember = (memberId) => {
    if (selectedTeamId) {
      setTeams(prev => prev.map(t => {
        if (t.id === selectedTeamId) {
          if (t.memberIds.length >= 4) return t;
          return { ...t, memberIds: [...t.memberIds, memberId] };
        }
        return { ...t, memberIds: t.memberIds.filter(id => id !== memberId) };
      }));
      setSelectedTeamId(null);
    } else {
      // 선택된 슬롯 없으면 빈 자리 있는 첫 팀에 자동 배정
      setTeams(prev => {
        const next = [...prev];
        const idx = next.findIndex(t => t.memberIds.length < 4);
        if (idx !== -1) {
          next[idx] = { ...next[idx], memberIds: [...next[idx].memberIds, memberId] };
        }
        return next;
      });
    }
  };

  const handleAutoAssign = () => {
    setSelectedTeamId(null);
    const activeMembers = members.filter(m => m.status === '활동');
    const newTeams = teams.map(t => ({ ...t, memberIds: [] }));
    activeMembers.forEach((member, index) => {
      const teamIdx = index % (eventData?.teamCount || 4);
      if (newTeams[teamIdx] && newTeams[teamIdx].memberIds.length < 4) {
        newTeams[teamIdx].memberIds.push(member.id);
      }
    });
    setTeams(newTeams);
  };

  const handleSave = async () => {
    setSelectedTeamId(null);
    // Supabase의 events 테이블에 조편성 저장
    if (eventData?.id) {
      const { error } = await supabase
        .from('events')
        .update({ teams })
        .eq('id', eventData.id);
      if (error) {
        console.error('조편성 저장 실패:', error.message);
        alert('조편성 저장 중 오류가 발생했습니다:\n' + error.message);
        return;
      }
    }
    setHasSaved(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 송부용 텍스트 생성
  const buildDispatchText = () => {
    const lines = [];
    const eventName = eventData?.name || '월례회';
    const eventDate = eventData?.date ? eventData.date.replace(/-/g, '.') : '';
    const eventLoc = eventData?.location || '';
    lines.push(`📋 ${eventName} 조편성 안내`);
    if (eventDate || eventLoc) lines.push(`📅 ${eventDate}${eventLoc ? '  📍 ' + eventLoc : ''}`);
    lines.push('');
    teams.forEach((t, idx) => {
      const teeTime = eventData?.teeTimes?.[idx] || '08:00';
      lines.push(`🏌️ ${t.name}  (티업: ${teeTime})`);
      t.memberIds.forEach((mId, i) => {
        const m = members.find(x => x.id === mId);
        if (m) lines.push(`  ${i + 1}. ${m.name}  ${m.contact || '-'}`);
      });
      lines.push('');
    });
    return lines.join('\n');
  };

  return (
    <div className="animate-fade-in section-spacing" onClick={() => setSelectedTeamId(null)}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl">조편성 및 티오프</h2>
        <div className="flex gap-2">
          <button className="btn-outline px-4 py-2 text-[11px] border-primary/40 bg-primary/10" onClick={handleAutoAssign}>자동 조편성</button>
          <button className="btn-outline px-4 py-2 text-[11px]" onClick={() => { setActiveTab('HOME'); setSubView('MAIN'); }}>← 대시보드</button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* 좌측 사이드바: 항상 표시 */}
        <div className="w-28 flex-shrink-0 glass-panel p-3 flex flex-col gap-2 sticky top-24 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <h3 className="text-[9px] font-black text-dim uppercase tracking-widest text-center border-b border-white/5 pb-2">참가자 명단</h3>
          {selectedTeamId && (
            <div className="text-[9px] text-primary font-black text-center bg-primary/15 rounded-lg px-1 py-1.5 border border-primary/40">
              ↓ 선택하세요
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            {unassignedMembers.map(m => (
              <button
                key={m.id}
                className={`w-full p-2 rounded-xl text-[11px] transition-all text-center border ${
                  selectedTeamId
                    ? 'bg-primary border-primary font-black text-white shadow-lg shadow-primary/30 hover:bg-primary/80'
                    : 'bg-white/5 border-white/10 font-bold text-white hover:border-primary/60'
                }`}
                onClick={(e) => { e.stopPropagation(); assignMember(m.id); }}
              >
                {m.name}
              </button>
            ))}
            {unassignedMembers.length === 0 && (
              <div className="text-[10px] text-dim text-center py-4 opacity-60">모두 편성됨</div>
            )}
          </div>
        </div>

        {/* 우측: 조 목록 */}
        <div className="flex-1 flex flex-col relative pb-32">
          <div className="space-y-3">
            {teams.map((t, idx) => {
              const isTeamSelected = selectedTeamId === t.id;
              return (
                <div
                  key={t.id}
                  className={`glass-panel p-4 border-l-4 transition-all ${
                    isTeamSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded font-black">{t?.name || 'Team'}</span>
                      <span className="text-xs font-bold text-white">{eventData?.teeTimes?.[idx] || '08:00'}</span>
                    </div>
                    <span className="text-[10px] text-dim">{(t?.memberIds || []).length}/4 명</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map(slot => {
                      const mId = t.memberIds[slot];
                      const member = members.find(m => m.id === mId);
                      return (
                        <div
                          key={slot}
                          className={`h-10 rounded-lg border flex items-center px-3 justify-between cursor-pointer transition-all select-none ${
                            member
                              ? 'bg-black/30 border-white/10 hover:border-error/60 hover:bg-error/10'
                              : isTeamSelected
                                ? 'bg-primary/15 border-primary/60 border-solid'
                                : 'bg-transparent border-dashed border-white/10 hover:border-primary/40'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (member) {
                              // 이름 클릭 → 미편성으로 반환
                              removeMemberFromTeam(t.id, member.id);
                            } else {
                              // 빈 슬롯 클릭 → 이 팀을 선택 상태로
                              selectTeamSlot(t.id);
                            }
                          }}
                        >
                          {member ? (
                            <>
                              <span className="text-xs font-bold text-white">{member.name}</span>
                              <span className="text-[9px] text-error/50 font-bold">✕</span>
                            </>
                          ) : (
                            <span className={`text-[9px] font-bold ${isTeamSelected ? 'text-primary/80' : 'text-dim opacity-30'}`}>
                              {isTeamSelected ? '← 선택' : '비어있음'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-24 mt-6 z-50 flex gap-3">
            <button
              className={`btn-primary flex-1 py-4 shadow-2xl font-black italic tracking-widest text-lg transition-all ${saved ? 'opacity-70' : ''}`}
              onClick={handleSave}
            >
              {saved ? '✓ 저장 완료!' : '조편성 저장'}
            </button>
            {(hasSaved || teams.some(t => t.memberIds && t.memberIds.length > 0)) && (
              <button
                className="btn-outline flex-shrink-0 px-5 py-4 font-black text-sm border-accent/60 text-accent hover:bg-accent/10 transition-all"
                onClick={(e) => { e.stopPropagation(); setShowDispatch(true); }}
              >
                📨 송부
              </button>
            )}
          </div>

          {/* 조편성 송부 모달 */}
          {showDispatch && (
            <div
              className="fixed inset-0 z-[300] flex items-end justify-center"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowDispatch(false)}
            >
              <div
                className="w-full max-w-lg glass-panel rounded-t-3xl p-6 pb-10 animate-fade-in"
                style={{ maxHeight: '85vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-black text-white tracking-widest">📨 조편성 송부</span>
                  <button className="text-dim text-xs font-bold hover:text-white" onClick={() => setShowDispatch(false)}>✕ 닫기</button>
                </div>

                {/* 조별 카드 */}
                <div className="space-y-4 mb-6">
                  {teams.map((t, idx) => {
                    const teeTime = eventData?.teeTimes?.[idx] || '08:00';
                    const teamMembers = t.memberIds.map(mId => members.find(m => m.id === mId)).filter(Boolean);
                    return (
                      <div key={t.id} className="bg-black/40 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded font-black">{t.name}</span>
                          <span className="text-accent font-black text-sm">티업 {teeTime}</span>
                        </div>
                        <div className="space-y-2">
                          {teamMembers.map((m, i) => (
                            <div key={m.id} className="flex justify-between items-center">
                              <span className="text-white font-bold text-sm">{i + 1}. {m.name}</span>
                              <span className="text-dim text-xs font-bold tracking-wider">{m.contact || '-'}</span>
                            </div>
                          ))}
                          {teamMembers.length === 0 && <div className="text-dim text-xs italic">편성된 참가자 없음</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 복사 버튼 */}
                <button
                  className="btn-primary w-full py-4 font-black text-base"
                  onClick={() => {
                    navigator.clipboard.writeText(buildDispatchText())
                      .then(() => alert('클립보드에 복사되었습니다!\n메시지 앱에 붙여넣기 하세요.'))
                      .catch(() => alert('복사 실패. 아래 내용을 직접 복사해 주세요.'));
                  }}
                >
                  📋 텍스트 복사
                </button>

                {/* 미리보기 텍스트 */}
                <div className="mt-4 bg-black/60 border border-white/5 rounded-xl p-4">
                  <div className="text-[9px] text-dim uppercase tracking-widest mb-2 font-black">메시지 미리보기</div>
                  <pre className="text-[11px] text-white/80 whitespace-pre-wrap font-sans leading-relaxed">{buildDispatchText()}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RankingView = ({ members, setMembers, viewMode, teams }) => {
  const [viewState, setViewState] = useState('RANK'); // RANK | HISTORY
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState({ memberId: members[0]?.id, type: 'AWARDS', content: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const participatingMemberIds = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    return teams.flatMap(t => t.memberIds);
  }, [teams]);

  const sortedMembers = useMemo(() => {
    const activeMembers = members.filter(m => participatingMemberIds.includes(m.id));
    return [...activeMembers].sort((a, b) => {
      const getAvg = (hist) => {
        if (!hist || !Array.isArray(hist) || hist.length === 0) return 999;
        const valid = hist.map(item => typeof item === 'number' ? item : (item?.score || NaN)).filter(s => !isNaN(s));
        if (valid.length === 0) return 999;
        return valid.reduce((x, y) => x + y, 0) / valid.length;
      };
      return getAvg(a?.history) - getAvg(b?.history);
    });
  }, [members, participatingMemberIds]);

  const historyData = useMemo(() => {
    const records = [];
    members.forEach(m => {
      (m.awards || []).forEach((a, idx) => records.push({ type: 'AWARDS', content: a, name: m.name, memberId: m.id, index: idx, date: a.split(' ')[0] }));
      (m.donations || []).forEach((d, idx) => records.push({ type: 'DONATION', content: d, name: m.name, memberId: m.id, index: idx, date: d.split(' ')[0] }));
    });
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }, [members]);

  const handleAddRecord = async () => {
    if (!newRecord.content) return;
    const member = members.find(m => m.id === Number(newRecord.memberId));
    if (!member) return;

    const field = newRecord.type === 'AWARDS' ? 'awards' : 'donations';
    const dateStr = new Date().toISOString().split('T')[0];
    const newList = [`${dateStr} ${newRecord.content}`, ...(member[field] || [])];

    const { data, error } = await supabase.from('members')
      .update({ [field]: newList })
      .eq('id', member.id)
      .select();

    if (!error && data) {
      setMembers(members.map(m => m.id === member.id ? data[0] : m));
      setIsAdding(false);
      setNewRecord({ ...newRecord, content: '' });
    }
  };

  const handleDeleteRecord = async (memberId, type, index) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const field = type === 'AWARDS' ? 'awards' : 'donations';
    const newList = [...(member[field] || [])];
    newList.splice(index, 1);

    const { data, error } = await supabase.from('members')
      .update({ [field]: newList })
      .eq('id', member.id)
      .select();

    if (!error && data) {
      setMembers(members.map(m => m.id === member.id ? data[0] : m));
    }
  };

  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl text-white font-black italic">리더보드 & 기록</h2>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
           <button onClick={() => setViewState('RANK')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewState === 'RANK' ? 'bg-primary text-white shadow-lg' : 'text-dim'}`}>통합 랭킹</button>
           <button onClick={() => setViewState('HISTORY')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewState === 'HISTORY' ? 'bg-accent text-black shadow-lg' : 'text-dim'}`}>수상/찬조 내역</button>
        </div>
      </div>

      {viewState === 'RANK' ? (
        <div className="glass-panel overflow-hidden border-white/5">
          <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-white/5 text-[9px] text-dim font-black uppercase tracking-widest">
                <th className="p-4 w-16">Rank</th>
                <th className="p-4">Member</th>
                <th className="p-4 text-center w-20">Avg</th>
                <th className="p-4 text-center w-16">HD</th>
              </tr>
            </thead>
            <tbody>
              {(sortedMembers || []).map((m, idx) => (
                <tr key={m?.id || idx} className="border-t border-white/5 active:bg-white/10 transition-colors">
                  <td className="p-4 font-black italic text-primary text-lg">#{idx + 1}</td>
                  <td className="p-4 truncate align-middle">
                    <span className="font-bold text-[1.75rem] text-white tracking-tight leading-none">{m?.name || 'Unknown'}</span>
                  </td>
                  <td className="p-4 text-center font-black italic text-accent text-lg">{calculateAvg(m?.history)}</td>
                  <td className="p-4 text-center text-xs opacity-40 font-bold text-white">{m?.handicap || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {viewMode === 'ADMIN' && (
            <div className="mb-6">
              {!isAdding ? (
                <button className="btn-primary w-full py-3 text-xs" onClick={() => setIsAdding(true)}>+ 신규 기록 추가</button>
              ) : (
                <div className="glass-panel p-5 space-y-3 border-accent/20">
                   <div className="grid grid-cols-2 gap-2">
                      <select className="bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white" value={newRecord.memberId} onChange={e => setNewRecord({...newRecord, memberId: e.target.value})}>
                        {members.filter(m => m.status === '활동').map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <select className="bg-black/40 border border-white/10 p-2 rounded-lg text-xs text-white" value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value})}>
                         <option value="AWARDS">수상</option>
                         <option value="DONATION">찬조</option>
                      </select>
                   </div>
                   <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white" placeholder="기록 내용 (예: 5월 메달리스트)" value={newRecord.content} onChange={e => setNewRecord({...newRecord, content: e.target.value})} />
                   <div className="flex gap-2">
                      <button className="btn-primary flex-1 py-3 text-xs" onClick={handleAddRecord}>저장</button>
                      <button className="btn-outline flex-1 py-3 text-xs" onClick={() => setIsAdding(false)}>취소</button>
                   </div>
                </div>
              )}
            </div>
          )}

          <div className="glass-panel p-3 mb-4 bg-black/20 border-white/5 flex items-center gap-3">
            <span className="text-dim"><Icons.Users active={true} /></span>
            <input 
              type="text" 
              placeholder="이름으로 검색 (예: 홍길동)" 
              className="w-full bg-transparent border-none outline-none text-sm text-white font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button className="p-1 opacity-50 hover:opacity-100 text-xs text-white font-bold" onClick={() => setSearchTerm('')}>X</button>}
          </div>

          <div className="glass-panel overflow-hidden border-white/5">
            <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-white/5 text-[9px] text-dim font-black uppercase tracking-widest border-b border-white/5">
                  <th className="py-3 px-1 text-center w-16">분류</th>
                  <th className="py-3 px-1 text-center w-20">이름</th>
                  <th className="py-3 px-3 text-left">세부 내역</th>
                  {viewMode === 'ADMIN' && <th className="py-3 px-1 text-center w-10">관리</th>}
                </tr>
              </thead>
              <tbody>
                {historyData.filter(item => searchTerm ? item.name.includes(searchTerm) : true).map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 active:bg-white/10 transition-colors">
                    <td className="p-2 text-center align-top">
                      <div className="mt-1">
                         <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${item.type === 'AWARDS' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                           {item.type === 'AWARDS' ? '수상' : '찬조'}
                         </span>
                      </div>
                    </td>
                    <td className="p-2 text-center align-top font-black text-sm text-white pt-3">{item.name}</td>
                    <td className="p-2 px-3 align-top py-3 text-[11px] font-bold text-white/90 leading-relaxed break-words whitespace-pre-wrap">{viewMode === 'LIVE' ? item.content.replace(/^\d{4}-\d{2}(-\d{2})?\s/, '') : item.content}</td>
                    {viewMode === 'ADMIN' && (
                      <td className="p-2 text-center align-top pt-2">
                        <button className="text-[10px] text-error font-black px-1 py-1 opacity-50 hover:opacity-100" onClick={() => handleDeleteRecord(item.memberId, item.type, item.index)}>삭제</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {historyData.filter(item => searchTerm ? item.name.includes(searchTerm) : true).length === 0 && <div className="text-center py-20 text-dim italic">검색된 내역이 없습니다.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const LiveScoreInputView = ({ eventData, teams, members, setMembers, setActiveTab, viewMode, setSubView }) => {
  const [selectedTeam, setSelectedTeam] = useState(teams[0] || null);
  const [scores, setScores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTeams, setSubmittedTeams] = useState([]);

  const selectedTeamIndex = teams.findIndex(t => t?.id === selectedTeam?.id);
  const isLastTeam = selectedTeamIndex === teams.length - 1;

  const handleScoreChange = (mId, val) => {
    setScores(prev => ({ ...prev, [mId]: val }));
  };

  const handleSaveCurrentTeam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    let updatedCount = 0;
    let newMembers = [...members];
    
    for (const mId of selectedTeam.memberIds) {
      const scoreVal = scores[mId] !== undefined ? scores[mId] : 72;
      if (scoreVal !== '') {
        const score = parseInt(scoreVal);
        if (!isNaN(score)) {
          const memberIndex = newMembers.findIndex(m => m.id === mId);
          if (memberIndex > -1) {
            const member = newMembers[memberIndex];
            const currentEventName = eventData?.name || '월례회';
            const currentDate = eventData?.date || new Date().toISOString().split('T')[0];
            const currentLoc = eventData?.location || '미정';

            const filteredHistory = (member.history || []).filter(h => {
              if (typeof h === 'object' && h !== null) {
                return !(h.eventName === currentEventName && h.date === currentDate);
              }
              return true;
            });

            const newHistory = [{
              score,
              eventName: currentEventName,
              location: currentLoc,
              date: currentDate
            }, ...filteredHistory];
            
            const { error } = await supabase.from('members').update({ history: newHistory }).eq('id', mId);
            if (!error) {
              newMembers[memberIndex] = { ...member, history: newHistory };
              updatedCount++;
            }
          }
        }
      }
    }

    if (updatedCount > 0) {
      setMembers(newMembers);
      if (selectedTeam?.id) {
        setSubmittedTeams(prev => [...prev, selectedTeam.id]);
      }
    }
    
    setIsSubmitting(false);

    if (isLastTeam) {
      setActiveTab('RANK');
    } else {
      setSelectedTeam(teams[selectedTeamIndex + 1]);
    }
  };

  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl text-white font-black italic">스코어 입력</h2>
        {viewMode === 'ADMIN' && <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MAIN')}>← 대시보드</button>}
      </div>
      {!selectedTeam || selectedTeam.memberIds.length === 0 ? (
        <div className="glass-panel p-10 text-center text-dim italic">조편성이 필요합니다.</div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(teams || []).map(t => (
              <button key={t?.id} onClick={() => setSelectedTeam(t)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${selectedTeam?.id === t?.id ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white'}`}>
                {t?.name || 'Team'}
              </button>
            ))}
          </div>
          <div className="glass-panel p-5">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-black text-accent">{selectedTeam.name} 경기 진행</span>
                <span className="text-[10px] text-dim uppercase">Live Entry</span>
             </div>
             <div className="space-y-4">
                {selectedTeam.memberIds.map(mId => {
                  const member = members.find(m => m.id === mId);
                  const isTeamSubmitted = viewMode === 'LIVE' && submittedTeams.includes(selectedTeam?.id);
                  return (
                    <div key={mId} className="flex items-center gap-2 bg-black/20 p-3 rounded-2xl border border-white/5">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{member?.name}</div>
                        <div className="text-[9px] text-dim">AVG: {calculateAvg(member?.history)}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <span className="text-[10px] text-accent font-bold">스코어</span>
                         <input 
                           type="number" 
                           disabled={isTeamSubmitted}
                           className={`w-20 bg-black/40 border border-white/10 py-1 px-0 rounded-lg text-center font-black italic text-primary text-[1.7rem] leading-none ${isTeamSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`} 
                           placeholder="72"
                           value={scores[mId] !== undefined ? scores[mId] : 72}
                           onChange={(e) => handleScoreChange(mId, e.target.value)}
                         />
                      </div>
                    </div>
                  );
                })}
             </div>
             {viewMode === 'LIVE' && submittedTeams.includes(selectedTeam?.id) ? (
               <button className="btn-outline w-full py-4 mt-8 opacity-50 cursor-not-allowed border-white/10 text-dim" disabled>입력 완료됨</button>
             ) : (
               <button className="btn-primary w-full py-4 mt-8" onClick={handleSaveCurrentTeam} disabled={isSubmitting}>
                  {isSubmitting ? '저장 중...' : (isLastTeam ? '순위 집계 완료' : '스코어 저장')}
               </button>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

const NoticeView = ({ viewMode, notices, setNotices, setSubView }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const handleAdd = async () => {
    if (!newTitle || !newContent) return;
    const notice = { title: newTitle, content: newContent, date: new Date().toISOString().split('T')[0] };
    const { data, error } = await supabase.from('notices').insert(notice).select();
    
    if (!error && data) {
      setNotices([data[0], ...notices]);
      setIsAdding(false); setNewTitle(''); setNewContent('');
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (!error) {
      setNotices(notices.filter(item => item.id !== id));
    }
  };
  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl text-white">공지사항</h2>
        <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MAIN')}>← 대시보드</button>
      </div>
      {viewMode === 'ADMIN' && (
        <div className="mb-6">
          {!isAdding ? <button className="btn-primary w-full py-4 text-sm" onClick={() => setIsAdding(true)}>+ 신규 공지 등록</button> :
            <div className="glass-panel p-5 space-y-4">
              <input placeholder="제목" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <textarea placeholder="내용" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl h-24 text-sm text-white" value={newContent} onChange={e => setNewContent(e.target.value)} />
              <div className="flex gap-2">
                 <button className="btn-primary flex-1 py-3" onClick={handleAdd}>등록</button>
                 <button className="btn-outline flex-1 py-3" onClick={() => setIsAdding(false)}>취소</button>
              </div>
            </div>
          }
        </div>
      )}
      <div className="space-y-4">
        {(notices || []).map(n => (
          <div key={n?.id} className="glass-panel p-5 border-l-4 border-accent">
             <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm text-white">{n?.title || 'Notice'}</h3>
                <span className="text-[10px] text-dim">{n?.date}</span>
             </div>
             <p className="text-xs text-dim leading-relaxed">{n?.content}</p>
             {viewMode === 'ADMIN' && <button className="text-[9px] text-error mt-4 font-bold opacity-50 hover:opacity-100" onClick={() => handleDelete(n?.id)}>삭제</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminBoardView = ({ adminNotes, setAdminNotes, setSubView }) => {
  const [newNote, setNewNote] = useState('');
  const handleAdd = async () => {
    if (!newNote) return;
    const note = { content: newNote, date: new Date().toISOString().split('T')[0] };
    const { data, error } = await supabase.from('admin_notes').insert(note).select();
    
    if (!error && data) {
      setAdminNotes([data[0], ...adminNotes]);
      setNewNote('');
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('admin_notes').delete().eq('id', id);
    if (!error) {
      setAdminNotes(adminNotes.filter(item => item.id !== id));
    }
  };
  return (
    <div className="animate-fade-in section-spacing">
      <div className="flex justify-between items-center mb-6">
        <h2 className="heading text-xl text-white">운영자 게시판</h2>
        <button className="btn-outline px-4 py-2 text-xs" onClick={() => setSubView('MAIN')}>← 대시보드</button>
      </div>
      <div className="glass-panel p-5 mb-6 space-y-3">
         <textarea placeholder="운영용 비공개 메모" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl h-24 text-sm text-white" value={newNote} onChange={e => setNewNote(e.target.value)} />
         <button className="btn-primary w-full py-3" onClick={handleAdd}>메모 저장</button>
      </div>
      <div className="space-y-3">
        {adminNotes.map(n => (
          <div key={n.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-start text-white">
             <div className="flex-1">
               <p className="text-sm">{n.content}</p>
               <span className="text-[9px] text-dim block mt-2">{n.date}</span>
             </div>
             <button className="text-[9px] text-error font-bold ml-4" onClick={() => handleDelete(n.id)}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = ({ eventData, viewMode, notices, setSubView }) => (
  <div className="animate-fade-in section-spacing">
     <div className="glass-panel p-6 mb-4 text-center bg-gradient-to-br from-primary/20 to-black">
        <h2 className="heading text-xl mb-1 text-white">{eventData?.name || '준비 중...'}</h2>
        <p className="text-dim text-xs mb-6">{eventData?.location || '장소 미정'} | {eventData?.date || '일정 미정'}</p>
        {viewMode === 'ADMIN' ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
               <button className="btn-primary flex-col py-6 gap-2" onClick={() => setSubView('MEMBER_MGMT')}>
                  <Icons.Users active={true} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">회원 관리</span>
               </button>
               <button className="btn-outline flex-col py-6 gap-2 text-white" onClick={() => setSubView('EVENT_SETUP')}>
                  <Icons.Settings active={true} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">대회 설정</span>
               </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               <button className="btn-outline py-5 flex-col gap-2 border-accent/30 text-white" onClick={() => setSubView('NOTICES')}>
                  <Icons.Notice active={true} />
                  <span className="text-[11px] font-bold tracking-tight text-white">공지사항</span>
               </button>
               <button className="btn-outline py-5 flex-col gap-2 border-primary/30 text-white" onClick={() => setSubView('ADMIN_BOARD')}>
                  <Icons.AdminBoard active={true} />
                  <span className="text-[11px] font-bold tracking-tight text-white">운영게시판</span>
               </button>
               <button className="btn-primary py-5 flex-col gap-2 border-white/30 text-white" onClick={() => setSubView('SCORE_MGMT')}>
                  <Icons.Action active={true} />
                  <span className="text-[11px] font-bold tracking-tight text-white">스코어 관리</span>
               </button>
            </div>
          </>
        ) : (
              <div className="space-y-4 text-left">
                 <div className="flex items-center gap-2 mb-2">
                    <Icons.Notice active={true} />
                    <h3 className="heading text-sm font-bold text-white">공지사항</h3>
                 </div>
                 <div className="space-y-3">
                    {(notices || []).slice(0, 2).map(n => (
                      <div key={n?.id} className="glass-panel p-4 border-l-2 border-accent">
                         <h4 className="font-bold text-xs text-white mb-1">{n?.title || '공지'}</h4>
                         <p className="text-[11px] text-dim">{n?.content}</p>
                      </div>
                    ))}
                 </div>
              </div>
        )}
     </div>

     <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 flex flex-col items-center justify-center border-white/5">
           <div className="text-[10px] text-dim font-bold uppercase mb-1">총 팀 수</div>
           <div className="text-2xl font-black text-white">{eventData?.teamCount || 0} <small className="text-xs font-normal opacity-40">팀</small></div>
        </div>
        <div className="glass-panel p-5 flex flex-col items-center justify-center border-accent/20">
           <div className="text-[10px] text-accent font-bold uppercase mb-1">첫조 티오프</div>
           <div className="text-2xl font-black tracking-tighter text-white">{eventData?.teeTimes?.[0] || '--:--'}</div>
        </div>
     </div>
  </div>
);

// --- Main App Component ---

function App() {
  const [session, setSession] = useState(null);
  const [viewMode, setViewMode] = useState('ADMIN'); // ADMIN | LIVE
  const [activeTab, setActiveTab] = useState('HOME');
  const [subView, setSubView] = useState('MAIN');
  const [editingMember, setEditingMember] = useState(null);
  
  const [notices, setNotices] = useState([]);
  const [adminNotes, setAdminNotes] = useState([]);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [eventData, setEventData] = useState({
    name: '준비 중...',
    location: '',
    date: '',
    teamCount: 4,
    teeTimes: []
  });
  const [dbError, setDbError] = useState(null);

  const fetchData = async () => {
    if (!supabase) return;
    setDbError(null);

    try {
      // Fetch Members
      const { data: membersData, error: membersError } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (membersError) throw membersError;
      if (membersData) setMembers(membersData);

      // Fetch Notices
      const { data: noticesData, error: noticesError } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (noticesError) throw noticesError;
      if (noticesData) setNotices(noticesData);

      // Fetch Admin Notes
      const { data: adminNotesData, error: adminNotesError } = await supabase.from('admin_notes').select('*').order('created_at', { ascending: false });
      if (adminNotesError) throw adminNotesError;
      if (adminNotesData) setAdminNotes(adminNotesData);

      // Fetch Latest Event
      const { data: eventsData, error: eventsError } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(1);
      if (eventsError) throw eventsError;
      if (eventsData && eventsData.length > 0) {
        const ev = eventsData[0];
        setEventData({
          ...ev,
          teamCount: ev.team_count || 4,
          teeTimes: ev.tee_times || []
        });
        // 저장된 조편성 불러오기
        if (ev.teams && Array.isArray(ev.teams) && ev.teams.length > 0) {
          setTeams(ev.teams);
        }
      }
    } catch (err) {
      console.error('Database fetch error:', err.message);
      if (err.message.includes('relation') || err.message.includes('does not exist')) {
        setDbError('데이터베이스 테이블이 생성되지 않았습니다. SQL 스크립트를 실행해 주세요.');
      } else {
        setDbError(`데이터 로드 실패: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    if (!supabase) return;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchData();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };


  return (
    <div className="min-h-screen container pt-6">
        <header className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-4">
             {activeTab === 'HOME' && subView === 'MAIN' ? (
                <RadiantLogo className="w-32 h-8" />
             ) : (
                <div className="flex items-center gap-2 animate-fade-in">
                   <div className="w-8 h-8 bg-primary rounded-lg border border-accent/50 flex items-center justify-center font-black text-white italic text-sm shadow-lg">NS</div>
                   <h1 className="heading text-lg tracking-tighter italic font-black text-white">NICESHOT <span className="text-dim opacity-40 not-italic font-normal">{viewMode}</span></h1>
                </div>
             )}
          </div>
          <div className="flex items-center gap-2">
            {session && viewMode === 'ADMIN' && (
              <button 
                onClick={handleLogout}
                className="text-[9px] font-black tracking-widest text-dim hover:text-error transition-colors px-3 py-1.5 border border-white/5 rounded-full"
              >
                SIGN OUT
              </button>
            )}
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)} 
              className="bg-success/20 border border-success/30 text-[10px] px-3 py-1.5 rounded-full font-black text-white outline-none shadow-2xl transition-all cursor-pointer hover:bg-success/30 text-center"
              style={{ textAlignLast: 'center' }}
            >
               <option value="ADMIN" className="bg-surface text-white">ADMIN</option>
               <option value="LIVE" className="bg-surface text-white">LIVE VIEW</option>
            </select>
          </div>
       </header>

       <main>
          {dbError && (
            <div className="mb-6 bg-error/20 border border-error/30 p-4 rounded-2xl animate-fade-in mx-2">
               <p className="text-center text-xs font-black italic text-error uppercase tracking-widest leading-relaxed">
                 ⚠️ DATABASE ERROR: {dbError}
               </p>
               <button 
                 onClick={fetchData} 
                 className="mt-2 w-full text-[9px] font-bold text-error/50 hover:text-error underline"
               >
                 RETRY CONNECTION
               </button>
            </div>
          )}
          {viewMode === 'ADMIN' && (
            session ? (
              <>
                {activeTab === 'HOME' && (
                  <>
                    {subView === 'MAIN' && <AdminDashboard eventData={eventData} viewMode={viewMode} notices={notices} setSubView={setSubView} />}
                    {subView === 'MEMBER_MGMT' && <MemberMgmtView members={members} setSubView={setSubView} setEditingMember={setEditingMember} />}
                    {subView === 'MEMBER_LIST' && <MemberListView members={members} setSubView={setSubView} />}
                    {subView === 'EVENT_SETUP' && <EventSetupView eventData={eventData} setEventData={setEventData} setTeams={setTeams} setSubView={setSubView} />}
                    {subView === 'MEMBER_FORM' && <MemberFormView editingMember={editingMember} members={members} setMembers={setMembers} setSubView={setSubView} />}
                    {subView === 'NOTICES' && <NoticeView viewMode={viewMode} notices={notices} setNotices={setNotices} setSubView={setSubView} />}
                    {subView === 'ADMIN_BOARD' && <AdminBoardView adminNotes={adminNotes} setAdminNotes={setAdminNotes} setSubView={setSubView} />}
                    {subView === 'SCORE_MGMT' && <LiveScoreInputView eventData={eventData} teams={teams} members={members} setMembers={setMembers} setActiveTab={setActiveTab} viewMode={viewMode} setSubView={setSubView} />}
                  </>
                )}
                {activeTab === 'ACTION' && <TeamAssignmentView eventData={eventData} members={members} teams={teams} setTeams={setTeams} setSubView={setSubView} setActiveTab={setActiveTab} />}
                {activeTab === 'RANK' && <RankingView members={members} setMembers={setMembers} viewMode={viewMode} teams={teams} />}
              </>
            ) : (
              <LoginView onCancel={() => setViewMode('LIVE')} />
            )
          )}
          {viewMode === 'LIVE' && (
            <div className="space-y-6">
              {activeTab === 'HOME' && <AdminDashboard eventData={eventData} viewMode={viewMode} notices={notices} setSubView={setSubView} />}
              {activeTab === 'ACTION' && (
                <div className="animate-fade-in section-spacing">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="heading text-xl">조편성 현황</h2>
                    <div className="flex items-center gap-2">
                      {eventData?.name && <span className="text-[10px] text-dim font-bold">{eventData.name}</span>}
                    </div>
                  </div>
                  {(!teams || teams.length === 0 || !teams.some(t => t.memberIds && t.memberIds.length > 0)) ? (
                    <div className="glass-panel p-10 text-center text-dim italic text-sm">
                      <div className="text-3xl mb-3 opacity-30">🏌️</div>
                      아직 조편성이 완료되지 않았습니다.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teams.map((t, idx) => (
                        <div key={t.id} className="glass-panel p-4 border-l-4 border-primary/40">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded font-black">{t?.name || 'Team'}</span>
                              <span className="text-xs font-bold text-white">{eventData?.teeTimes?.[idx] || '08:00'}</span>
                            </div>
                            <span className="text-[10px] text-dim">{(t?.memberIds || []).length}명</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[0, 1, 2, 3].map(slot => {
                              const mId = t.memberIds[slot];
                              const member = members.find(m => m.id === mId);
                              return (
                                <div key={slot} className={`h-10 rounded-lg border flex items-center px-3 justify-between ${
                                  member ? 'bg-black/30 border-white/10' : 'bg-transparent border-dashed border-white/5'
                                }`}>
                                  {member ? (
                                    <>
                                      <span className="text-xs font-bold text-white">{member.name}</span>
                                      <span className="text-[10px] text-accent italic">{calculateAvg(member.history)}</span>
                                    </>
                                  ) : (
                                    <span className="text-[9px] text-dim opacity-30">비어있음</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'RANK' && <RankingView members={members} setMembers={setMembers} viewMode={viewMode} teams={teams} />}
            </div>
          )}
       </main>

       {(activeTab !== 'HOME' || subView !== 'MAIN') && (
         <div className="fixed bottom-24 left-6 z-[100] animate-fade-in opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
           <RadiantLogo className="w-24 h-6 px-3 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/5" />
         </div>
       )}

       <div className="nav-container">
         <nav className="glass-panel flex justify-around p-2 rounded-full shadow-2xl border border-white/10">
            {[{id:'HOME', i:Icons.Home, l:'홈'}, {id:'ACTION', i:Icons.Action, l:'조편성'}, {id:'RANK', i:Icons.Rank, l:'순위'}]
              .map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); setSubView('MAIN'); }} className="flex flex-col items-center gap-1 transition-all py-2 flex-1 outline-none" style={{ opacity: activeTab === t.id ? 1 : 0.4 }}>
                  <t.i active={activeTab === t.id} />
                  <span className="text-[10px] font-bold text-primary">{t.l}</span>
                </button>
              ))}
         </nav>
       </div>
    </div>
  );
}

export default App;
