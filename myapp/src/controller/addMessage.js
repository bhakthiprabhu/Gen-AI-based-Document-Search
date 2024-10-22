import { useState } from 'react';
import { searchAzure, appendSasToken, createChatCompletion } from "../services/azureServices.js";

export const useChat = () => {
    const [payload, setPayload] = useState([]);

    const addMessageToPayload = (type, message, documents = []) => {
        setPayload(prevPayload => [...prevPayload, { type, line: message, documents }]);
    };

    const addMessage = async (userMessage) => {
        addMessageToPayload('user', userMessage);

        try {
            const documents = await searchAzure(userMessage); 
            const documentContents = documents.map(doc => doc.content).join('\n');
            const documentReferences = documents.map(doc => doc.url).join(', ');
            const modifiedUrls = appendSasToken(documentReferences); 
            const response = await createChatCompletion(userMessage, documentContents, modifiedUrls); 

            // Check if the response and message content are as expected
            if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
                const botMessage = response.data.choices[0].message.content;
                addMessageToPayload('bot', botMessage, documentReferences);
            } else {
                console.error('Unexpected API response format:', response);
                addMessageToPayload('bot', 'Sorry, there was an error processing your request.');
            }
        } catch (error) {
            console.error('Error getting response from OpenAI:', error);
            addMessageToPayload('bot', 'Sorry, there was an error processing your request.');
        }
        return payload;
    };
    return { payload, addMessage };
};