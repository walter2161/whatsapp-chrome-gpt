// טעינת הקובץ config.json
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    const apiKey = config.OPENAI_API_KEY;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'sendToChatGPT') {
        const message = request.message;

        // שליחת בקשה ל-OpenAI API
        fetch('https://api.openai.com/v1/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: message
          })
        })
          .then(response => response.json())
          .then(data => {
            sendResponse({ success: true, response: data });
          })
          .catch(error => {
            console.error('Error:', error);
            sendResponse({ success: false, error: error.message });
          });

        return true; // מאפשר תגובה אסינכרונית
      }
    });
  })
  .catch(error => {
    console.error('Error loading config.json:', error);
  });
