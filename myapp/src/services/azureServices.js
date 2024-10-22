import axios from 'axios';
import { Configuration, OpenAIApi } from "azure-openai";

export const searchAzure = async (query) => {
    const url = `${process.env.REACT_APP_AZURE_SEARCH_ENDPOINT}/indexes/${process.env.REACT_APP_AZURE_SEARCH_INDEX_NAME}/docs`;
    const searchResponse = await axios.get(url, {
            params: {
                'api-version': process.env.REACT_APP_AZURE_SEARCH_API_VERSION,
                'search': query
            },
            headers: {
                'api-key': process.env.REACT_APP_AZURE_SEARCH_API_KEY
            }
    });
    return searchResponse.data.value;
};

export function appendSasToken(inputUrls) {
    const urls = inputUrls.split(",").map(url => url.trim());
    const modifiedUrls = urls.map(url => {
        // Check if URL already contains a query string
        const separator = url.includes("?") ? "&" : "?";
        //https://<storage-account-name>.blob.core.windows.net/<container>/<blob name>?<sas-token>
        return `${url}${separator}${process.env.REACT_APP_AZURE_BLOB_STORAGE_SAS_TOKEN}`;
    });
    return modifiedUrls.join(",");
}

const callOpenAI = new OpenAIApi(
    new Configuration({
        azure: {
            apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY,
            endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
            deploymentName: process.env.REACT_APP_AZURE_DEPLOYMENT_NAME
        }
    }),
);

export const createChatCompletion = async (userMsg, docContents, modifiedUrl) =>{
    const res = await callOpenAI.createChatCompletion({
        model:process.env.REACT_APP_AZURE_DEPLOYMENT_NAME,
        messages: [
            { role: "system", content: "You are an AI assistant that helps people find information by understanding documents and their context. Your task is to respond to user queries using the information from the provided documents, offering relevant content along with reference document links. You must not reveal any information about yourself, such as your development or underlying language model." },
            { role: "user", content: userMsg },
            { role: "system", content: `Relevant documents: \n${docContents}` },
            { role: "system", content: `Document references: \n${modifiedUrl}` },
        ],
        max_tokens:1000
    })
    console.log(res)
    return res;
}