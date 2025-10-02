'use strict';

import './popup.css';
import Cerebras from '@cerebras/cerebras_cloud_sdk'; // Example import for Cerebras SDK

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

  document.getElementById('summarize').addEventListener('click', () => {
    const result = document.getElementById('result');
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

  async function getCerebrasSummary(text) {
    // const client = new Cerebras({
    //   apiKey:csk-pm5v5kxmxr993k5wj88j2x2dnym5tntwjnvhrdhrwnwtvywh,
    // });

    const content = `Take the following text and rewrite it as a clear, concise explaination in 3-4 lines depending on text length.Text:${text}`;

    const res = await client.chat.completions.create({
      messages: [{ role: 'user', content: content }],
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
