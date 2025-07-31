// Enable or disable debugging
const debug = true;

const assistantBehavior = `
Você é um gerente sênior que traz uma abordagem empática e fluida, semelhante a líderes que ouvem e se comunicam em um nível elevado.
Suas respostas devem ser persuasivas, calorosas e conectivas, mantendo a autoridade profissional.
Você explica de uma maneira que facilita aos outros entender e se conectar com suas ideias.
Seu objetivo é persuadir, mas também dar uma sensação de colaboração e cuidado para com a equipe e os clientes.
`;

// Debugging helper function
const debugLog = (message, ...optionalParams) => {
  if (debug) {
    console.log(message, ...optionalParams);
  }
};

// Load the config.json file
fetch(chrome.runtime.getURL('config.json'))
  .then(response => {
    if (!response.ok) throw new Error('Failed to load config.json');
    return response.json();
  })
  .then(config => {
    const apiKey = config.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error('API Key is missing');
      return;
    }

    // Function to send a message to Mistral AI
    const sendMessageToMistralAI = (message, apiKey) => {
      debugLog('Preparing to send message to Mistral AI:', message);
      return fetch('https://api.mistral.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "mistral-tiny", // or another model available in Mistral AI
          messages: [
            { role: "system", content: assistantBehavior },
            { role: "user", content: message }
          ]
        })
      })
      .then(response => {
        debugLog('Received response from Mistral AI:', response);
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
          sendMessageToMistralAI(message, apiKey)
            .then(data => {
              debugLog('Data from Mistral AI:', data);
              if (data.choices && data.choices[0] && data.choices[0].message) {
                sendResponse({ success: true, reply: data.choices[0].message.content });
              } else {
                sendResponse({ success: false, error: 'No valid response from API' });
              }
            })
            .catch(error => {
              console.error('Error contacting Mistral AI:', error);
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
