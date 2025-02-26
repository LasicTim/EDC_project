import React from "react";
import { Editor } from "@tinymce/tinymce-react";

interface TinyMCEEditorProps {
  initialValue?: string;
  onEditorChange: (content: string) => void;
  height?: number;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  initialValue = "<p>Start typing...</p>",
  onEditorChange,
  height = 400,
}) => {
  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      initialValue={initialValue}
      init={{
        height: height,
        menubar: false,
        plugins:
          "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount",
        toolbar:
          "undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | code | help",
      }}
      onEditorChange={onEditorChange}
    />
  );
};

export default TinyMCEEditor;