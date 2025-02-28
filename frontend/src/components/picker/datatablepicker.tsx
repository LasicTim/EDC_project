import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableSelectEvent  } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

// Define the type for the data items
interface User {
    id: number;
    name: string;
    email: string;
}

interface DatatablePickerProps {
    onUserSelect: (user: User) => void; 
}

const DataTablePicker: React.FC<DatatablePickerProps> = ({onUserSelect}) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<User | null>(null);
    const [selectedRow, setSelectedRow] = useState<User | null>(null);

    // Sample Data
    const data: User[] = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com" }
    ];

    // Function to handle row selection
    const handleRowSelect = () => {
        if (selectedRow) {
            setSelectedItem(selectedRow);
            onUserSelect(selectedRow);
            setVisible(false); // Close Dialog
        }
    };

    return (
        <div>
            {/* Picker Input */}
            <div className="p-field">
                <label htmlFor="user-picker">Pick a User</label>
                <div className="p-inputgroup">
                    <InputText id="user-picker" value={selectedItem ? selectedItem.name : ""} readOnly />
                    <Button icon="pi pi-search" onClick={() => setVisible(true)} />
                </div>
            </div>

            {/* DataTable inside Dialog */}
            <Dialog header="Select a User" visible={visible} style={{ width: "50vw" }} onHide={() => setVisible(false)}>
                <DataTable
                    value={data}
                    selectionMode="single"
                    selection={selectedRow}
                    onRowSelect={(e: DataTableSelectEvent ) => setSelectedRow(e.data as User)}
                    dataKey="id"
                >
                    <Column field="name" header="Name" />
                    <Column field="email" header="Email" />
                </DataTable>

                {/* Action Buttons */}
                <div className="p-dialog-footer">
                    <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
                    <Button label="Select" icon="pi pi-check" onClick={handleRowSelect} disabled={!selectedRow} />
                </div>
            </Dialog>
        </div>
    );
};

export default DataTablePicker;
