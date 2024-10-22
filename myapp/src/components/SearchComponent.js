import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import useChat from "../controller/addMessage";

const FAQComponent = () => {
    const [formData, setFormData] = useState({ prompt: "" });
    const [loading, setLoading] = useState(false);
    const { payload, addMessage } = useChat();

    const handleChange = (event) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [event.target.name]: event.target.value
        }));
    };
    
    const getResponse = async (event) => {
        event.preventDefault();
        setLoading(true);
 
        const userMessage = formData.prompt;
        await addMessage(userMessage)
        setFormData({ prompt: '' });
        setLoading(false);
    };
 
    return (
        <div>
            <div>
                {payload.map((item, index) => (
                    <div key={index}>
                        <div>
                            {item.type === 'user' ? <b>{item.line}</b> : ''}
                        </div>
                        <div>
                            {item.type === 'bot' ? <ReactMarkdown>{item.line}</ReactMarkdown> : ''}
                        </div>
                    </div>
                ))}
                {loading && <div>Loading ...</div>}
            </div>
            <form onSubmit={getResponse}>
                <input
                    type="text"
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleChange}
                    placeholder="Message openup..."
                />
                <button type="submit">
                   submit
                </button>
            </form>
        </div>
    );
}
 
export default FAQComponent;