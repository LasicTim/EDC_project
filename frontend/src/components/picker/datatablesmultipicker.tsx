import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableSelectEvent, DataTableSelectionMultipleChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";


import "./picker.css"
import { FloatLabel } from "primereact/floatlabel";

// Define the type for the dynamic column configuration
interface ColumnConfig {
    field: string;
    header: string;
}

interface DatatablePickerProps<T> {
    onSelect: (selectedData: T[]) => void;  // Callback function to return selected data
    data: T[];  // Dynamic data
    columns: ColumnConfig[];  // Dynamic columns
    label: string;  // Label for the picker input
    maxWidth?: string;
}



const MultiSelectDataTablePicker = <T extends {}>({ onSelect, data, columns, label, maxWidth = "400px", }: DatatablePickerProps<T>) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<T[]>([]); // Ensure it's initialized as an empty array
    const [selectedRows, setSelectedRows] = useState<T[]>([]);

    // Function to handle selection
    const handleRowSelect = () => {
        setSelectedItems(selectedRows); // Update the selected items
        onSelect(selectedRows); // Pass selected users back to parent
        setVisible(false); // Close Dialog
    };

    return (
        <div>
            {/* Picker Input */}
            <div className="picker-input">
                <FloatLabel>
                    <label htmlFor="data-picker">{label}</label>
                    <div className="p-inputgroup">
                        <InputText
                            style={{"maxWidth": maxWidth}}
                            id="data-picker"
                            value={selectedItems.length > 0 ? selectedItems.map((item) => (item as any).name).join(", ") : ""}
                            readOnly
                        />
                        <Button icon="pi pi-search" onClick={() => setVisible(true)} />
                    </div>
                </FloatLabel>
            </div>

            {/* DataTable inside Dialog */}
            <Dialog header={`Select ${label}`} visible={visible} style={{ width: "50vw" }} onHide={() => setVisible(false)}>
                <DataTable
                    value={data}
                    selectionMode="multiple" // Enable multiple selection
                    selection={selectedRows}
                    onSelectionChange={(e: DataTableSelectionMultipleChangeEvent<T[]>) => setSelectedRows(e.value)}
                    dataKey="id"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    {columns.map((col, index) => (
                        <Column key={index} field={col.field} header={col.header} />
                    ))}
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
