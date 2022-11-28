
// Function to get and decode API key 
const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if (result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        })
    })
}

// Talkin to the DOM
const sendMessage = (content) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0].id;

        chrome.tabs.sendMessage(
            activeTab,
            { message: 'inject', content },
            (response) => {
                if (response.status === 'failed') {
                    console.log("injection failed.")
                }
            }
        )
    })
}

// Generate function 
const generate = async (prompt) => {
    // get api key from storage
    const key = await getKey()
    const url = 'https://api.openai.com/v1/completions';

    // call the completions endpoint
    const completionResponse = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-002',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });

    // Select the top choices and return the result
    const completion = await completionResponse.json()
    return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
    try {
        sendMessage('generating...');

        
        const { selectionText } = info;
        const basePromptPrefix = `
            Write me a detailed Twitter thread about Crytpo and careers with the title below.
            
            Title:
        `;
        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`)

        const secondPrompt = `
            Take the table of contents and teh title of the Twitter thread below and generate a blog written in the style of Paul Graham. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.

            Title: ${selectionText}

            Table of Contents: ${baseCompletion.text}

            Blog Post:
        `;


        const secondPromptCompletion = await generate(secondPrompt)

        // send the output when we are done
        sendMessage(secondPromptCompletion.text);
    } catch (err) {
        console.log(err)

        // catching errors
        sendMessage(err.toString());
    }
}

chrome.contextMenus.create({
    id: 'context-run',
    title: 'Generate Twitter post',
    contexts: ['selection']
});




// Listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);