// Load the config.json file
fetch(chrome.runtime.getURL('config.json'))
  .then(response => {
    if (!response.ok) throw new Error('Failed to load config.json');
    return response.json();
  })
  .then(config => {
    const apiKey = config.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('API Key is missing');
      return;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'sendToChatGPT') {
        const message = request.message;

        fetch('https://api.openai.com/v1/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }]
          })
        })
          .then(response => {
            if (!response.ok) throw new Error('API request failed');
            return response.json();
          })
          .then(data => {
            if (data.choices && data.choices[0] && data.choices[0].message) {
              sendResponse({ success: true, reply: data.choices[0].message.content });
            } else {
              sendResponse({ success: false, error: 'No valid response from API' });
            }
          })
          .catch(error => {
            console.error('Error:', error);
            sendResponse({ success: false, error: 'An error occurred while contacting the API' });
          });

        return true; // Keep the message channel open for async response
      }
    });
  })
  .catch(error => {
    console.error('Error loading config.json:', error);
  });
