// Log when the script is loaded
console.log('Content script loaded');

// Create a floating action button
const button = document.createElement('button');
button.id = 'activate-extension';
button.style.position = 'fixed';
button.style.bottom = '50px';
button.style.right = '20px';
button.style.padding = '10px 15px';
button.style.backgroundColor = '#25D366';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '50px';
button.style.cursor = 'pointer';
button.style.zIndex = '10000';
button.innerText = 'Activate';

// Append the button to the body
document.body.appendChild(button);

// Create a div to display ChatGPT responses
const responseDiv = document.createElement('div');
responseDiv.id = 'chatgpt-response';
responseDiv.style.position = 'fixed';
responseDiv.style.bottom = '110px';
responseDiv.style.right = '20px';
responseDiv.style.padding = '15px';
responseDiv.style.backgroundColor = '#ffffff';
responseDiv.style.color = '#000';
responseDiv.style.border = '1px solid #ccc';
responseDiv.style.borderRadius = '10px';
responseDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
responseDiv.style.zIndex = '10000';
responseDiv.style.maxWidth = '300px';
responseDiv.style.display = 'none'; // Initially hidden

// Append the response div to the body
document.body.appendChild(responseDiv);

// Function to handle extension activation
const activateExtension = () => {
    console.log('Extension activated');

    // Function to get the last message in WhatsApp Web
    const getLastMessage = () => {
        try {
            const messageElements = document.querySelectorAll(
                'div.copyable-text > div._akbu > span._ao3e.selectable-text.copyable-text > span'
            );
            if (messageElements.length === 0) {
                console.log('No messages found');
                return null;
            }

            const lastMessage = messageElements[messageElements.length - 1];
            console.log('Last message:', lastMessage.innerText);
            return lastMessage.innerText;
        } catch (error) {
            console.error('Error retrieving last message:', error);
            return null;
        }
    };

    // Send the last message to ChatGPT via background.js
    const sendMessageToChatGPT = (message) => {
        if (!message) {
            console.error('No message to send to ChatGPT');
            return;
        }
        console.log('Sending to ChatGPT:', message);

        chrome.runtime.sendMessage(
            { action: 'sendToChatGPT', message: message },
            (response) => {
                if (response && response.success) {
                    console.log('ChatGPT Reply:', response.reply);
                    showResponse(response.reply);
                } else {
                    console.error('Error from ChatGPT:', response.error);
                    showResponse(`Error: ${response.error}`);
                }
            }
        );
    };

    // Function to display the response
    const showResponse = (responseText) => {
        responseDiv.innerText = responseText;
        responseDiv.style.display = 'block';
    };

    // Get the last message and send it to ChatGPT
    const lastMessage = getLastMessage();
    sendMessageToChatGPT(lastMessage);
};

// Add click event listener to activate the extension
button.addEventListener('click', activateExtension);
