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

    const userData: User[] = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com" },
    ];

    const userColumns = [
        { field: "name", header: "Name" },
        { field: "email", header: "Email" }
    ];

    const handleUsersSelect = (selectedUsers: User[]) => {
        setSelectedUsers(selectedUsers);
    };

    const handleUserSelect = (selectedUser: User | null) => {
        setSelectedUser(selectedUser);
    };

    return (
        <>
            <h1>TinyMCE 7.7 Without API Key (Local)</h1>
            <TinyMCEEditor
                onEditorChange={(newContent) => setContent(newContent)}
            />
            <h2>Preview:</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />

            {/* testing select */}
            <DataTablePicker 
                onSelect={handleUserSelect}
                data={userData}
                columns={userColumns}
                label="Users"/>
            <MultiSelectDataTablePicker
                onSelect={handleUsersSelect}
                data={userData}
                columns={userColumns}
                label="Users"
            />
        </>
    );
};

export default CompanyView;