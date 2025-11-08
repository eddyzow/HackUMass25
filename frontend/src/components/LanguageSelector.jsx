function LanguageSelector({ currentLanguage, onLanguageChange }) {
  return (
    <div className="language-selector">
      <label>Language:</label>
      <select value={currentLanguage} onChange={(e) => onLanguageChange(e.target.value)}>
        <option value="zh-CN">🇨🇳 Mandarin Chinese</option>
        <option value="en-US">🇺🇸 English</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
