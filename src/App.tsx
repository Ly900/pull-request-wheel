import { useState } from 'react';
import './App.css';
import Wheel from './Wheel';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const addName = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (names.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" is already on the team.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setNames([...names, trimmed]);
    setInputValue('');
    setError('');
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const CMD_R_TEAM = ['Matt', 'Deepak', 'Joey', 'Mohan', 'Ly', 'Regina', 'Sage'];

  const addCmdRTeam = () => {
    const allPresent = CMD_R_TEAM.every((name) =>
      names.some((n) => n.toLowerCase() === name.toLowerCase())
    );
    if (allPresent) {
      setError('Cmd+R team is already added.');
      setTimeout(() => setError(''), 3000);
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

  return (
    <>
      <h1><span style={{ fontSize: '1em', verticalAlign: 'top' }}>💀</span> Pull Request Wheel of Death</h1>
      <p>Not sure who to assign the pull request to? Fret no more. Avoid those glares you get when you assign to the same dev over and over again. Blame it on the Wheel of Death!</p>

      <div className="layout">
        <aside className="sidebar">
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

          {error && <p className="add-dev__error">{error}</p>}

          <button type="button" className="add-dev__preset-btn" onClick={addCmdRTeam}>
            + Add Cmd+R Team
          </button>

          <div className="team-members">
            <div className="team-members__header">
              <h2>Team Members</h2>
              {names.length > 0 && (
                <button
                  type="button"
                  className="team-members__clear-btn"
                  onClick={() => setNames([])}
                >
                  Start Over
                </button>
              )}
            </div>
            {names.length > 0 ? (
              <ul className="dev-list">
                {names.map((name, index) => (
                  <li key={index} className="dev-list__item">
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
                ))}
              </ul>
            ) : (
              <p className="team-members__empty">No team members added yet.</p>
            )}
          </div>

          {history.length > 0 && (
            <div className="pr-history">
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
          )}
        </aside>

        <main className="wheel-area">
          <Wheel names={names} onWinner={(name) => setHistory((h) => [name, ...h])} />
        </main>
      </div>
    </>
  );
}

export default App;
