import { useState } from 'react';
import './App.css';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

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

  console.log('names:', names);

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
              type="text"
              placeholder="Enter name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="button" onClick={addName}>Add</button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="team-members">
            <h2>Team Members</h2>
            {names.length > 0 ? (
              <ul className="dev-list">
                {names.map((name, index) => (
                  <li key={index}>
                    <span>{name}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeName(index)}
                      aria-label={`Remove ${name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No team members added yet.</p>
            )}
          </div>
        </aside>

        <main className="wheel-area">
          {/* Wheel will be rendered here */}
        </main>
      </div>
    </>
  );
}

export default App;
