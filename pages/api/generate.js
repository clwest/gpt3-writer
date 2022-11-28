import { Configuration, OpenAIApi} from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAIA_API_KEY,
})

const openai = new OpenAIApi(configuration);

const basePromptPrefix = 
`
Write a Twitter thread on making a career change into web3 over forty with no college or high school diploma featureing these high points! 

Title: 
`
const generateAction = async (req, res) => {
    // Run First prompt
    console.log(`API: ${basePromptPrefix}${req.body.userInput}`);

    const baseCompletion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `${basePromptPrefix}${req.body.userInput}\n`,
        temperature: 0.9,
        max_tokens: 1050,
    })

    const basePromptOutput = baseCompletion.data.choices.pop();

    // Adding a second prompt
    const secondPrompt = 
    `
    Take the Twitter thread below and generate a Twitter thread written in the style of Mark Cuban, make it in depth. Don't just list the hightlights list the pros and cons of why on both!
    Title: ${req.body.userInput}
    Twitter Tread: {$basePromptOutput.text}

    New Twitter Tread:

    `


    const secondPromptCompletion = await openai.createCompletion({
        model: 'text-davinci-002',
        prompt: `${secondPrompt}`,
        temperature: 0.09,
        max_tokens: 1050,
    });

    const secondPromptOutput = secondPromptCompletion.data.choices.pop();

    res.status(200).json({output: basePromptOutput})

};

export default generateAction;



