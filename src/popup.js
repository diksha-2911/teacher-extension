'use strict';

import './popup.css';
import Cerebras from '@cerebras/cerebras_cloud_sdk'; // Example import for Cerebras SDK
// import streamablehttp_client from mcp.client.streamable_http
// import ClientSession from mcp

const client = new Cerebras({
  apiKey: `csk-48pcpc54y2e6nn5x3256kx9w8vp44e9w93wkt462nhd8err9`, // or chrome.storage.local.get()
});

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  document.getElementById('summarizeBtn').addEventListener('click', () => {
    const result = document.getElementById('resultBox');
    result.textContent = 'Extracting text...';

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_SELECTED_TEXT' },
        async (response) => {
          if (chrome.runtime.lastError) {
            // e.g., no content script injected
            result.textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          if (!response || !response.text) {
            result.textContent = 'No selection made';
            return;
          }

          // result.textContent = response.text.slice(0, 300) + "..";
          try {
            // const summary = await getGeminiSummary(response.text);
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
            // e.g., no content script injected
            result.textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          if (!response || !response.text) {
            result.textContent = 'No selection made';
            return;
          }

          // result.textContent = response.text.slice(0, 300) + "..";
          try {
            // const summary = await getGeminiSummary(response.text);
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
    result.textContent = 'Extracting text...';

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_SELECTED_TEXT' },
        async (response) => {
          if (chrome.runtime.lastError) {
            // e.g., no content script injected
            result.textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          if (!response || !response.text) {
            result.textContent = 'No selection made';
            return;
          }

          // result.textContent = response.text.slice(0, 300) + "..";
          try {
            // const summary = await getGeminiSummary(response.text);
            const reply = await sendMessageToBackend(response.text);
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
    console.log(res.choices[0].message.content);
    return res.choices[0].message.content;
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
    // if (!res.ok) {
    //   const { error } = await res.choices[0].finish_reason;
    //   throw new Error(error?.message || 'Cerebras Request failed');
    // }

    // const data = await res.choices[0].message.content;
    console.log(res.choices[0].message.content);
    return res.choices[0].message.content ?? 'No summary';
  }
})();
