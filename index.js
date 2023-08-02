const express = require('express')
const app = express()
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/webhook', express.json(), function (req, res) {
    const agent = new WebhookClient({ request:req, response:res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  
  function webhook(agent){
    agent.add(new Card({
              title: `AUTOMATRICULA`,
              buttonText: 'LINK',
              buttonUrl: 'https://assistant.google.com/'
            })
          );
    
  }
  async function fallback(agent) {
    const input = "A cuál de todas estas preguntas frecuentes:"+ preguntas +" cuál crees que más se podría acercar esta pregunta: "+req.body.queryResult.queryText+". Es muy importante que me devuelvas tan solo el número de la pregunta. ";

    try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
          temperature:0.6
        });
        console.log(completion.data.choices[0].message.content);
        const first_response = completion.data.choices[0].message.content;
        if (first_response.includes("SI")) {
            agent.add("Tu pregunta es válida");
        }else{
            agent.add("Tu pregunta no es válida");
        }
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
    }

    

    /* try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: req.body.queryResult.queryText,
          max_tokens: 1000
        });
        console.log(completion.data.choices[0].text);
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
    } */
    
  }
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('webhookPrueba', webhook);
  agent.handleRequest(intentMap);
})

app.listen(3000, () => {
    console.log("Ya está arriba el servidor en localhost:3000");
})

