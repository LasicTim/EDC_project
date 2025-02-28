import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableSelectEvent  } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";


// Define the type for the dynamic column configuration
interface ColumnConfig {
    field: string;
    header: string;
}

interface DatatablePickerProps<T> {
    onSelect: (selectedData: T | null) => void;  // Callback function to return selected data
    data: T[];  // Dynamic data
    columns: ColumnConfig[];  // Dynamic columns
    label: string;  // Label for the picker input
}

const DatatablePicker = <T extends Record<string, any>>({
    onSelect,
    data,
    columns,
    label,
}: DatatablePickerProps<T>) => {  
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [selectedRow, setSelectedRow] = useState<T | null>(null);


    // Function to handle row selection
    const handleRowSelect = () => {
        if (selectedRow) {
            setSelectedItem(selectedRow); // Update the selected items
            onSelect(selectedRow); // Pass selected users back to parent
            setVisible(false); // Close Dialog
        }
    };

    return (
        <div>
            {/* Picker Input */}
            <div className="p-field">
                <label htmlFor="data-picker">{label}</label>
                <div className="p-inputgroup">
                    <InputText
                        id="data-picker"
                        value={selectedItem ? String(selectedItem[columns[0].field]) : ""}
                        readOnly
                    />
                    <Button icon="pi pi-search" onClick={() => setVisible(true)} />
                </div>
            </div>

            {/* DataTable inside Dialog */}
            <Dialog header="Select an Item" visible={visible} style={{ width: "50vw" }} onHide={() => setVisible(false)}>
                <DataTable
                    value={data}
                    selectionMode="single"
                    selection={selectedRow}
                    onRowSelect={(e: DataTableSelectEvent) => setSelectedRow(e.data as T)}
                    dataKey={columns[0].field} // Use the first column's field as the unique identifier
                >
                    <Column selectionMode="single" headerStyle={{ width: '3rem' }} />
                    {/* Dynamically render columns based on the `columns` prop */}
                    {columns.map((col) => (
                        <Column key={col.field} field={col.field} header={col.header} />
                    ))}
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

export default DatatablePicker;