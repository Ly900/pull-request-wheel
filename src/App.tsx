import { useState, useRef, useEffect } from 'react';
import './App.css';
import Wheel, { SOUND_OPTIONS } from './Wheel';
import Confetti from './Confetti';

function App() {
  const load = <T,>(key: string, fallback: T): T => {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
  };

  const [names, setNames] = useState<string[]>(() => load('prw_names', []));
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>(() => load('prw_history', []));
  const [noRepeats, setNoRepeats] = useState<boolean>(() => load('prw_noRepeats', false));
  const [devsOnly, setDevsOnly] = useState<boolean>(() => load('prw_devsOnly', false));
  const [qaOnly, setQaOnly] = useState<boolean>(() => load('prw_qaOnly', false));
  const [wheelKey, setWheelKey] = useState(0);
  const [sound, setSound] = useState<string>(() => load('prw_sound', 'evil-laugh'));
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => { localStorage.setItem('prw_names', JSON.stringify(names)); }, [names]);
  useEffect(() => { localStorage.setItem('prw_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('prw_noRepeats', JSON.stringify(noRepeats)); }, [noRepeats]);
  useEffect(() => { localStorage.setItem('prw_devsOnly', JSON.stringify(devsOnly)); }, [devsOnly]);
  useEffect(() => { localStorage.setItem('prw_qaOnly', JSON.stringify(qaOnly)); }, [qaOnly]);
  useEffect(() => { localStorage.setItem('prw_sound', JSON.stringify(sound)); }, [sound]);

  const QA_MEMBERS = ['Regina', 'Sage'];
  const CMD_R_TEAM = ['Matt', 'Deepak', 'Joey', 'Mohan', 'Ly', 'Regina', 'Sage'];
  const ALL_TEAM_MEMBERS = CMD_R_TEAM;
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setError(msg);
    errorTimerRef.current = setTimeout(() => setError(''), 3000);
  };

  const addName = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      showError('Please enter a name.');
      return;
    }

    if (names.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      showError(`"${trimmed}" is already on the team.`);
      return;
    }

    const newNames = [...names, trimmed];
    setNames(newNames);
    setInputValue('');
    setError('');
    // If the new name is not a known team member, hide the role filter
    if (!ALL_TEAM_MEMBERS.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setDevsOnly(false);
      setQaOnly(false);
    }
  };

  const removeName = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
    // If no QA members remain, reset role filters
    if (!newNames.some((n) => QA_MEMBERS.includes(n))) {
      setDevsOnly(false);
      setQaOnly(false);
    }
  };

  const addCmdRTeam = () => {
    const allPresent = CMD_R_TEAM.every((name) =>
      names.some((n) => n.toLowerCase() === name.toLowerCase())
    );
    if (allPresent) {
      showError('Cmd+R team is already added.');
      return;
    }
    const merged = [...names];
    for (const name of CMD_R_TEAM) {
      if (!merged.some((n) => n.toLowerCase() === name.toLowerCase())) {
        merged.push(name);
      }
    }
    setNames(merged);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addName();
  };

  const hasQaMember =
    names.some((n) => QA_MEMBERS.includes(n)) &&
    names.every((n) => ALL_TEAM_MEMBERS.some((t) => t.toLowerCase() === n.toLowerCase()));

  const displayedNames = devsOnly
    ? names.filter((n) => !QA_MEMBERS.includes(n))
    : qaOnly
    ? names.filter((n) => QA_MEMBERS.includes(n))
    : names;

  return (
    <>
      <Confetti key={confettiKey} active={confettiActive} />
      <h1><span style={{ fontSize: '1em', verticalAlign: 'top' }}>💀</span> Pull Request Wheel of Death</h1>
      <p>Not sure who to assign the pull request to? Fret no more. Avoid those glares you get when you assign to the same dev over and over again. Blame it on the Wheel of Death!</p>

      <div className="layout">
        <aside className="sidebar">
          <p className="add-dev__error" aria-live="polite">
            {error || <>&nbsp;</>}
          </p>

          <div className="add-dev">
            <input
              className="add-dev__input"
              type="text"
              placeholder="Enter name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="button" className="add-dev__btn" onClick={addName}>Add</button>
          </div>

          <button type="button" className="add-dev__preset-btn" onClick={addCmdRTeam}>
            + Add Cmd+R Team
          </button>

          <div className="wheel-filters">
            <label className="sound-picker">
              <span className="sound-picker__label">🔊 Winner sound</span>
              <select
                className="sound-picker__select"
                value={sound}
                onChange={(e) => setSound(e.target.value)}
              >
                {SOUND_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="no-repeats-toggle">
              <input
                type="checkbox"
                checked={noRepeats}
                onChange={(e) => setNoRepeats(e.target.checked)}
              />
              No repeats
            </label>
            {hasQaMember && (
              <div className="wheel-filters__group">
                <span className="wheel-filters__group-label">Filter by role</span>
                <label className="no-repeats-toggle">
                  <input
                    type="radio"
                    name="role-filter"
                    checked={!devsOnly && !qaOnly}
                    onChange={() => { setDevsOnly(false); setQaOnly(false); }}
                  />
                  All
                </label>
                <label className="no-repeats-toggle">
                  <input
                    type="radio"
                    name="role-filter"
                    checked={devsOnly}
                    onChange={() => { setDevsOnly(true); setQaOnly(false); }}
                  />
                  Devs only
                </label>
                <label className="no-repeats-toggle">
                  <input
                    type="radio"
                    name="role-filter"
                    checked={qaOnly}
                    onChange={() => { setQaOnly(true); setDevsOnly(false); }}
                  />
                  QA only
                </label>
              </div>
            )}
          </div>

          <div className="team-members">
            <div className="team-members__header">
              <h2>Team Members</h2>
            </div>
            {names.length === 0 ? (
              <p className="team-members__empty">No team members added yet.</p>
            ) : (
              <ul className="dev-list">
                {displayedNames.map((name) => {
                  const index = names.indexOf(name);
                  return (
                    <li key={name} className="dev-list__item">
                      <span>{name}</span>
                      <button
                        type="button"
                        className="dev-list__remove-btn"
                        onClick={() => removeName(index)}
                        aria-label={`Remove ${name}`}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {(names.length > 0 || history.length > 0) && (
            <button
              type="button"
              className="reset-btn"
              onClick={() => { setNames([]); setHistory([]); setNoRepeats(false); setDevsOnly(false); setQaOnly(false); setWheelKey((k) => k + 1); }}
            >
              Reset Everything
            </button>
          )}

        </aside>

        <main className="wheel-area">
          <Wheel
            key={wheelKey}
            names={(() => {
              let filtered = names;
              if (devsOnly) filtered = filtered.filter((n) => !QA_MEMBERS.includes(n));
              if (qaOnly) filtered = filtered.filter((n) => QA_MEMBERS.includes(n));
              if (noRepeats) filtered = filtered.filter((n) => !history.includes(n));
              return filtered;
            })()}
            onWinner={(name) => {
              setHistory((h) => [name, ...h]);
              setConfettiKey((k) => k + 1);
              setConfettiActive(true);
            }}
            sound={sound}
          />
        </main>

        <div className="pr-history" style={{ visibility: history.length > 0 ? 'visible' : 'hidden' }}>
          <div className="pr-history__header">
            <h2>PR Assignees</h2>
            <button
              type="button"
              className="team-members__clear-btn"
              onClick={() => setHistory([])}
            >
              Clear
            </button>
          </div>
          <ol className="pr-history__list">
            {history.map((name, i) => (
              <li key={i} className="pr-history__item">
                <span className="pr-history__rank">#{history.length - i}</span>
                <span>{name}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export default App;
