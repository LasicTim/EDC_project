import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Header from "./components/header"; // Import Header component

const App: React.FC = () => {
  const [content, setContent] = useState("");

  return (
    <> {/* React Fragment to wrap multiple elements */}
      <Header /> {/* Add Header component */}
      <div style={{ padding: "20px" }}>
        <h1>TinyMCE 7.7 Without API Key (Local)</h1>
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          initialValue="<p>Start typing...</p>"
          init={{
            height: 400,
            menubar: false,
            plugins: "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
            toolbar:
              "undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help",
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
