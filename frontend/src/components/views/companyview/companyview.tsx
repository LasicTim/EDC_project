import React, { useState } from 'react';
import TinyMCEEditor from '../../tinymceeditor';
import "./companyview.css";
import DataTablePicker from '../../picker/datatablepicker';
import MultiSelectDataTablePicker from '../../picker/datatablesmultipicker';

interface User {
    id: number;
    name: string;
    email: string;
}

const CompanyView: React.FC = () => {
    const [content, setContent] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    return (
        <>
            <h1>TinyMCE 7.7 Without API Key (Local)</h1>
            <TinyMCEEditor
                onEditorChange={(newContent) => setContent(newContent)}
            />
            <h2>Preview:</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />

            {/* testing select */}
            <DataTablePicker onUserSelect={(user) => setSelectedUser(user)} />
            <MultiSelectDataTablePicker onUserSelect={(users) => setSelectedUsers(users)} />
        </>
    );
};

export default CompanyView;