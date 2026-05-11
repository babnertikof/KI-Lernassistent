import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getQuestions } from './main';
import './index.css';

let hasInitializedQuestions = false;

function App() {
    const [text, setText] = useState<string>("Loading...");

    useEffect(() => {
        if (hasInitializedQuestions) {
            return;
        }

        hasInitializedQuestions = true;

        async function run() {
            const result = await getQuestions();
            setText(result);
        }

        run();
    }, []);

    return <pre>{text}</pre>;
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);