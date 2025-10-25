import React from "react";
import { useContext } from "react";
import { TranslationContext } from "../../context/TranslationContext";

const LanguageModal = ({ isOpen, onClose }) => {
  const { setLanguage } = useContext(TranslationContext);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "ml", name: "Malayalam" },
  ];

  const handleSelect = (code) => {
    setLanguage(code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h4 style={{ marginBottom: "12px" }}>Select Language</h4>
        {languages.map((lang) => (
          <div
            key={lang.code}
            style={styles.option}
            onClick={() => handleSelect(lang.code)}
          >
            {lang.name}
          </div>
        ))}
        <button onClick={onClose} style={styles.closeBtn}>Close</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 999,
  },
  modal: {
    background: "#fff", borderRadius: "12px", padding: "20px",
    width: "260px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  option: {
    padding: "8px", margin: "4px 0", borderRadius: "8px",
    backgroundColor: "#F5F5F5", cursor: "pointer",
  },
  closeBtn: {
    marginTop: "10px", padding: "6px 12px", border: "none",
    background: "#ddd", borderRadius: "6px", cursor: "pointer",
  },
};

export default LanguageModal;
