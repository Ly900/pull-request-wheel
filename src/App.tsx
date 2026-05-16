import { useState } from 'react';
import './App.css';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addName = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setNames([...names, trimmed]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addName();
  };

  return (
    <>
      <h1>Pull Request Wheel of Death</h1>
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

          <div className="team-members">
            <h2>Team Members</h2>
            {names.length > 0 ? (
              <ul className="dev-list">
                {names.map((name, index) => (
                  <li key={index}>{name}</li>
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
