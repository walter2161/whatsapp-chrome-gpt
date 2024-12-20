// Read messages from whatsapp web
const messageElements = document.querySelectorAll('.message-text');
const lastMessage = messageElements[messageElements.length - 1];

if (lastMessage) {
  const message = lastMessage.innerText;
  
  //Send message to ChatGPT
  chrome.runtime.sendMessage(
    { action: 'sendToChatGPT', message: message },
    (response) => {
      if (response && response.reply) {
        // print output in whatsapp
        console.log('ChatGPT response:', response.reply);

        // כאן אפשר להוסיף קוד לשלוח את התשובה ב-WhatsApp Web
        // לדוגמה, להוסיף את התשובה לפוסטרק
        const outputElement = document.createElement('p');
      }
    }
  );
}