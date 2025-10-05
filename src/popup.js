'use strict';

import './popup.css';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
  apiKey: `your_cerebras_key`, // replace with your Cerebras API key
});

(function () {
  document.getElementById('summarizeBtn').addEventListener('click', () => {
    const result = document.getElementById('resultBox');
    result.textContent = 'Extracting text...';

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_SELECTED_TEXT' },
        async (response) => {
          if (chrome.runtime.lastError) {
            result.textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          if (!response || !response.text) {
            result.textContent = 'No selection made';
            return;
          }
          try {
            const summary = await getCerebrasSummary(response.text);
            result.textContent = summary;
          } catch (e) {
            result.textContent = 'Cerebras API Error: ' + e.message;
          }
        }
      );
    });
  });

  document.getElementById('translateBtn').addEventListener('click', () => {
    const languageSelect = document.getElementById('languageSelect').value;
    const result = document.getElementById('resultBox');
    result.textContent = 'Extracting text...';

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_SELECTED_TEXT' },
        async (response) => {
          if (chrome.runtime.lastError) {
            result.textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          if (!response || !response.text) {
            result.textContent = 'No selection made';
            return;
          }
          try {
            const translation = await getCerebrasTranslation(
              response.text,
              languageSelect
            );
            result.textContent = translation;
          } catch (e) {
            result.textContent = 'Cerebras API Error: ' + e.message;
          }
        }
      );
    });
  });

  document.getElementById('addNotesBtn').addEventListener('click', () => {
    const result = document.getElementById('resultBox');
    const notesType = document.getElementById('notesTypeSelect').value;
    const languageSelect = document.getElementById('languageSelect').value;
    result.textContent = 'Extracting text...';

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_SELECTED_TEXT' },
        async (response) => {
          if (chrome.runtime.lastError) {
            result.textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          if (!response || !response.text) {
            result.textContent = 'No selection made';
            return;
          }
          try {
            let textToSend;

            if (notesType === 'selection') {
              textToSend = response.text;
            } else if (notesType === 'summarization') {
              textToSend = await getCerebrasSummary(response.text);
            } else if (notesType === 'translation') {
              textToSend = await getCerebrasTranslation(
                response.text,
                languageSelect
              );
            } else {
              throw new Error('Unsupported notesType: ' + notesType);
            }
            const reply = await sendMessageToBackend(textToSend);
            result.textContent = reply;
          } catch (e) {
            result.textContent = 'Backend API Error: ' + e.message;
          }
        }
      );
    });
  });

  async function sendMessageToBackend(text) {
    const response = await fetch('http://localhost:8000/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    console.log('Backend response:', data);
    return data.reply;
  }

  async function getCerebrasTranslation(text, language) {
    const content = `Translate ${text} into ${language} language. The translation is to the point, without much context given.`;

    const messages = [
      {
        role: 'system',
        content:
          'You are a translator. The user gives you text as well as language, and you translate it to the point.',
      },
      { role: 'user', content: `Translate ${text} into ${language} language.` },
    ];

    const res = await client.chat.completions.create({
      messages: messages,
      model: 'llama3.1-8b',
    });

    const data = await res.choices[0].message.content;
    return data;
  }

  async function getCerebrasSummary(text) {
    const messages = [
      {
        role: 'system',
        content:
          'You are a teacher. The user gives you text have to explain it in 3 sentences or less. if the text is short, you can use less sentences. The explanation has to be clear and concise.',
      },
      { role: 'user', content: text },
    ];

    const res = await client.chat.completions.create({
      messages: messages,
      model: 'llama3.1-8b',
    });

    const data = await res.choices[0].message.content;
    return data ?? 'No summary';
  }
})();
