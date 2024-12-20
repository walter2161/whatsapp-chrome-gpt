// Enable or disable debugging
const debug = true;


const assistantBehavior = "You are an expert assistant focused on financial insights."; // Example from Dashboard

// Debugging helper function
const debugLog = (message, ...optionalParams) => {
  if (debug) {
    console.log(message, ...optionalParams);
  }
};
fetch(chrome.runtime.getURL('config.json'))
    .then(response => response.json())
    .then(config => {
        const preferredLanguage = config.PREFERRED_LANGUAGE || "en"; 
        const prompt = `Please respond in ${preferredLanguage}: ${message}`;
    });

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

    // Function to send a message to ChatGPT
    const sendMessageToChatGPT = (message, apiKey) => {
      debugLog('Preparing to send message to ChatGPT:', message);
      return fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
              //model: "gpt-3.5-turbo",
              model: "gpt-4-turbo",
              temperature: 0.7,
              messages: [
                { role: "system", content: assistantBehavior },
                { role: "user", content: message }
            ]
          })
      })
          .then(response => {
              debugLog('Received response from OpenAI:', response);
              if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
              return response.json();
          })
          .catch(error => {
              debugLog('Error during API request:', error);
              throw error; // Ensure the error propagates
          });
    };

    // Listen for messages from content.js
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        if (request.action === 'sendToChatGPT') {
          const message = request.message;

          debugLog('Received message from content.js:', message);
          sendMessageToChatGPT(message, apiKey)
              .then(data => {
                  debugLog('Data from OpenAI:', data);
                  if (data.choices && data.choices[0] && data.choices[0].message) {
                      sendResponse({ success: true, reply: data.choices[0].message.content });
                  } else {
                      sendResponse({ success: false, error: 'No valid response from API' });
                  }
              })
              .catch(error => {
                  console.error('Error contacting OpenAI:', error);
                  sendResponse({ success: false, error: error.message });
              });

          return true; // Keep the message channel open for async response
        }
      } catch (error) {
        console.error('Unexpected error in background.js:', error);
        sendResponse({ success: false, error: 'Unexpected error occurred' });
      }
    });
  })
  .catch(error => {
    console.error('Error loading config.json:', error);
  });
