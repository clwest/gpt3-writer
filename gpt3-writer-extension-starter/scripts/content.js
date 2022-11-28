

const insert = (content) => {

    // Find elements needed
    const elements = document.getElementsByClassName('droid');

    if (elements.length === 0) {
        return;
    }

    const element = elements[0];

    // Grab the first p tag and replace it with injection
    const pToRemove = element.childNodes[0]
    pToRemove.remove()

    // Split content by \n
    const splitContent = content.split('\n')

    // Wrap the P tags
    splitContent.forEach((content) => {
        const p = document.createElement('p');

        if (content === '') {
            const br = document.createElement('br');
            p.appendChild(br);
        }
        else {
            p.textContent = content;
        }
        // Insert into HTML
        element.appendChild(p)
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
        const { content } = request;

        const result = insert(content);

        // if something goes wrong send a fail status
        if (!result) {
            sendResponse({stats: 'failed'});
        }

        sendResponse({ status: 'success' });
    }
})