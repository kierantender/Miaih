import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import fs from 'fs'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello how can i help? '
  })
})

let conversationHistory = '';

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const preprompt = fs.readFileSync("preprompt.txt", "utf-8");
    conversationHistory = preprompt + conversationHistory;
    conversationHistory += `${prompt}\n`;
    if (conversationHistory.length > 3000) {
      conversationHistory = conversationHistory.slice(-3000);
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${conversationHistory}`,
      temperature: 0.73,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: "Miaih",
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong, best call Anne for help.');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
