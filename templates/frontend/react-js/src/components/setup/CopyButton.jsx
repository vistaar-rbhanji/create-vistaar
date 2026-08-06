import { useState } from "react";

function copyToClipboard(value) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(value);
  }
  return Promise.reject(new Error("Clipboard API unavailable"));
}

function fallbackCopy(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await copyToClipboard(value);
    } catch {
      fallbackCopy(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" className="copy-button" onClick={handleClick}>
      {copied ? "Copied!" : label}
    </button>
  );
}
