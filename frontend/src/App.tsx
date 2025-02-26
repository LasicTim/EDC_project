import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Header from "./components/header/header"; // Import Header component
import { useFetcher, useNavigate } from "react-router-dom";
import TinyMCEEditor from "./components/tinymceeditor";


const App: React.FC = () => {
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  return (
    <> 
      <Header /> 
      <div style={{ padding: "20px" }}>
        <h1>TinyMCE 7.7 Without API Key (Local)</h1>
        <TinyMCEEditor
          onEditorChange={(newContent) => setContent(newContent)}
        />
        <h2>Preview:</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </>
  );
};

export default App;
