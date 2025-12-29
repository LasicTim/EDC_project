import React from "react";
import { Editor } from "@tinymce/tinymce-react";

import type { Editor as TinyMCEEditorType } from "tinymce";

interface TinyMCEEditorProps {
  initialValue?: string;
  onEditorChange: (content: string) => void;
  height?: number;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  initialValue = "",
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
          "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount codesample",
        toolbar:
          "undo redo | formatselect | bold italic backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | removeformat | codesample | code | visualblocks | help | insert_jinja",
        setup: (editor: TinyMCEEditorType) => {
          // Add custom Jinja insertion button
          editor.ui.registry.addButton("insert_jinja", {
            text: "Jinja",
            onAction: function () {
              editor.windowManager.open({
                title: "Jinja",
                body: {
                  type: "panel",
                  items: [
                    {
                      type: "selectbox",
                      name: "snippet",
                      label: "Izberi Jinja predlogo",
                      items: [
                        {
                          text: "If / Elif / Else Block",
                          value: `{% if condition %}\n\n{% elif other_condition %}\n\n{% else %}\n\n{% endif %}`,
                        },
                        { text: "For Loop", value: "{% for item in items %}\n\n{% endfor %}" },
                        { text: "Variable", value: "{{ variable }}" },
                      ],
                    },
                  ],
                },
                buttons: [
                  { type: "cancel", text: "Close" },
                  { type: "submit", text: "Insert", primary: true },
                ],
                onSubmit: function (api) {
                  const data = api.getData();
                  editor.insertContent(data.snippet.replace(/\n/g, "<br>"));
                  api.close();
                },
              });
            },
          });
        },
      }}
      onEditorChange={onEditorChange}
    />
  );
};

export default TinyMCEEditor;
