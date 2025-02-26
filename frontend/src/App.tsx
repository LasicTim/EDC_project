import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Header from "./components/header/header"; // Import Header component
import { useFetcher, useNavigate } from "react-router-dom";


const App: React.FC = () => {
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  return (
    <> 
      <Header /> 
      <div style={{ padding: "20px" }}>
        <h1>TinyMCE 7.7 Without API Key (Local)</h1>
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          initialValue="<p>Start typing...</p>"
          init={{
            height: 400,
            menubar: false,
            plugins:
              "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount",
            toolbar:
              "undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | code | help",
          }}
          onEditorChange={(newContent) => setContent(newContent)}
        />
        <h2>Preview:</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </>
  );
};

export default App;
