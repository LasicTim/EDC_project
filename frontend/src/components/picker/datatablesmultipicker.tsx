import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableSelectEvent, DataTableSelectionMultipleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

// Define the type for the data items
interface User {
    id: number;
    name: string;
    email: string;
}

interface DatatablePickerProps {
    onUserSelect: (users: User[]) => void; // Callback function to return selected users
}

const MultiSelectDataTablePicker: React.FC<DatatablePickerProps> = ({ onUserSelect }) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<User[]>([]); // Ensure it's initialized as an empty array
    const [selectedRows, setSelectedRows] = useState<User[]>([]);

    // Sample Data
    const data: User[] = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com" }
    ];

    // Function to handle selection
    const handleRowSelect = () => {
        setSelectedItems(selectedRows); // Update the selected items
        onUserSelect(selectedRows); // Pass selected users back to parent
        setVisible(false); // Close Dialog
    };

    return (
        <div>
            {/* Picker Input */}
            <div className="p-field">
                <label htmlFor="user-picker">Pick Users</label>
                <div className="p-inputgroup">
                    <InputText
                        id="user-picker"
                        value={selectedItems?.length > 0 ? selectedItems.map((user) => user.name).join(", ") : ""}
                        readOnly
                    />
                    <Button icon="pi pi-search" onClick={() => setVisible(true)} />
                </div>
            </div>

            {/* DataTable inside Dialog */}
            <Dialog header="Select Users" visible={visible} style={{ width: "50vw" }} onHide={() => setVisible(false)}>
                <DataTable
                    value={data}
                    selectionMode="multiple" // Enable multiple selection
                    selection={selectedRows}
                    onSelectionChange={(e: DataTableSelectionMultipleChangeEvent<User[]>) => setSelectedRows(e.value as User[])}
                    dataKey="id"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field="name" header="Name" />
                    <Column field="email" header="Email" />
                </DataTable>

                {/* Action Buttons */}
                <div className="p-dialog-footer">
                    <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
                    <Button label="Select" icon="pi pi-check" onClick={handleRowSelect} disabled={selectedRows.length === 0} />
                </div>
            </Dialog>
        </div>
    );
};

export default MultiSelectDataTablePicker;
