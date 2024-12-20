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
button.innerText = 'Send to GPT';




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
responseDiv.style.display = 'true'; // Initially hidden





// Append the response div to the body
document.body.appendChild(responseDiv);

// Add copy & paste buttons to the response div
const copyButton = document.createElement('button');
copyButton.innerText = 'Copy';
copyButton.style.marginRight = '10px';
copyButton.style.padding = '5px 10px';
copyButton.style.border = 'none';
copyButton.style.backgroundColor = '#007BFF';
copyButton.style.color = 'white';
copyButton.style.borderRadius = '5px';
copyButton.style.cursor = 'pointer';


// Create a minimize button
const minimizeButton = document.createElement('button');
minimizeButton.innerText = 'Hide';
minimizeButton.style.padding = '5px 10px';
minimizeButton.style.border = 'none';
minimizeButton.style.backgroundColor = '#28A745';
minimizeButton.style.color = 'white';
minimizeButton.style.borderRadius = '5px';
minimizeButton.style.cursor = 'pointer';


// const pasteButton = document.createElement('button');
// pasteButton.innerText = 'Paste';
// pasteButton.style.padding = '5px 10px';
// pasteButton.style.border = 'none';
// pasteButton.style.backgroundColor = '#28A745';
// pasteButton.style.color = 'white';
// pasteButton.style.borderRadius = '5px';
// pasteButton.style.cursor = 'pointer';

const buttonContainer = document.createElement('div');
buttonContainer.style.marginTop = '10px';
buttonContainer.appendChild(copyButton);
//buttonContainer.appendChild(pasteButton);
responseDiv.appendChild(buttonContainer);


// Minimize functionality
minimizeButton.addEventListener('click', () => {
    if (responseDiv.style.display === 'block') {
        responseDiv.style.display = 'none';
        button.innerText = 'Show Response';
    } else {
        responseDiv.style.display = 'block';
        button.innerText = 'Send to GPT';
    }
});

// Add minimize button to responseDiv
responseDiv.appendChild(minimizeButton);

function CopyToClipboard(element) {

    var doc = document
    , text = doc.getElementById(element)
    , range, selection;

if (doc.body.createTextRange)
{
    range = doc.body.createTextRange();
    range.moveToElementText(text);
    range.select();
} 

else if (window.getSelection)
{
    selection = window.getSelection();        
    range = doc.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
}
document.execCommand('copy');
window.getSelection().removeAllRanges();
document.getElementById("btn").value="Copied";
}

 

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

        try {
            chrome.runtime.sendMessage(
                { action: 'sendToChatGPT', message: message },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Extension context invalidated:', chrome.runtime.lastError.message);
                        alert('Extension context invalidated. Please reload the extension.');
                        return;
                    }
                    if (response && response.success) {
                        console.log('ChatGPT Reply:', response.reply);
                        showResponse(response.reply);
                    } else {
                        console.error('Error from ChatGPT:', response.error);
                        showResponse(`Error: ${response.error}`);
                    }
                }
            );
        } catch (error) {
            console.error('Failed to send message to ChatGPT:', error);
            showResponse('Error: Failed to send message. Please reload the extension and try again.');
        }
    };

    // Function to display the response in the chat input field, copy it, and show it in the response div
    const showResponse = (responseText) => {
        console.log('Inserting response into chat input, copying it, and displaying it:', responseText);
    
        try {
            // Ensure the response div is visible
            responseDiv.style.display = 'block';
    
            // Add a text container for the response if not present
            let responseTextContainer = document.getElementById('response-text');
            if (!responseTextContainer) {
                responseTextContainer = document.createElement('p');
                responseTextContainer.id = 'response-text';
                responseTextContainer.style.marginBottom = '10px';
                responseDiv.insertBefore(responseTextContainer, buttonContainer);
            }
            responseTextContainer.innerText = responseText;
    
            // Copy button functionality
            copyButton.onclick = () => {
                navigator.clipboard.writeText(responseText).then(() => {
                    console.log('Response copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy response to clipboard:', err);
                });
            };
    
            // Paste button functionality
            // pasteButton.onclick = () => {
            //     const chatInput = document.querySelector(
            //         'div[contenteditable="true"][data-tab="10"]'
            //     );
    
            //     if (!chatInput) {
            //         console.error('Chat input field not found');
            //         return;
            //     }
    
            //     chatInput.innerHTML = `
            //         <p class="selectable-text copyable-text x15bjb6t x1n2onr6" dir="ltr" style="text-indent: 0px; margin-top: 0px; margin-bottom: 0px;">
            //             <span class="selectable-text copyable-text false" data-lexical-text="true">${responseText}</span>
            //         </p>
            //     `;
    
            //     const inputEvent = new Event('input', { bubbles: true });
            //     chatInput.dispatchEvent(inputEvent);
    
            //     console.log('Response pasted into chat input');
            // };
    
            console.log('Response successfully processed.');
        } catch (error) {
            console.error('Error processing response:', error);
        }
    };
    
    // Get the last message and send it to ChatGPT
    const lastMessage = getLastMessage();
    sendMessageToChatGPT(lastMessage);
};

// Add click event listener to activate the extension
button.addEventListener('click', activateExtension);
