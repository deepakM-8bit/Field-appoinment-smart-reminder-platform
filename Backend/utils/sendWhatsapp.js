import axios from 'axios';

const API_VERSION = process.env.WA_API_VERSION || 'v17.0';
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;

const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export async function sendWhatsappTemplate({
    to,
    templateName,
    components = []
}) {
    try{
        const response = await axios.post(
            `${BASE_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template:{
                    name:templateName,
                    language: {code:"en_US"},
                    components
                }
            },
            {
                headers:{
                    Authorization:`Bearer ${ACCESS_TOKEN}`,
                    "content-Type": "application/json"
                }
            }
        );

        console.log("whatsapp sent:",response.data);
        return response.data;

    }catch(error){
        console.error(
            "whatsapp send failed:",
            error.response?.data || error.message 
        );
        throw error;
    }
}