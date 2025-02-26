import React, { useState } from 'react';
import TinyMCEEditor from './tinymceeditor';

const Home: React.FC = () => {
    const [content, setContent] = useState("");

    return (
        <>
            <h1>TinyMCE 7.7 Without API Key (Local)</h1>
            <TinyMCEEditor
                onEditorChange={(newContent) => setContent(newContent)}
            />
            <h2>Preview:</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </>
    );
};

export default Home;