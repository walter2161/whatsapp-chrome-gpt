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

// Function to handle extension activation
const activateExtension = () => {
    console.log('Extension activated');

    // Wait for the chat container to load
    const waitForChatContainer = () => {
        return new Promise((resolve) => {
            const checkExist = setInterval(() => {
                const chatContainer = document.querySelector('div[data-testid="conversation-panel"]');
                if (chatContainer) {
                    clearInterval(checkExist);
                    resolve(chatContainer);
                }
            }, 500); // Check every 500ms
        });
    };

    // Monitor messages once the chat container is found
    const monitorMessages = async () => {
        const chatContainer = await waitForChatContainer();
        console.log('Chat container found:', chatContainer);

        // Mutation observer to watch for new messages
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const textElement = node.querySelector('.selectable-text span');
                            if (textElement) {
                                console.log('New message:', textElement.innerText);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the chat container
        observer.observe(chatContainer, { childList: true, subtree: true });
        console.log('Message monitoring started');
    };

    monitorMessages();
};

// Add click event listener to activate the extension
button.addEventListener('click', activateExtension);
