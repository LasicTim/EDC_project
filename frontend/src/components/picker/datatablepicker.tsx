import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableSelectEvent  } from "primereact/datatable";
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
    onSelect: (selectedData: T | null) => void;  // Callback function to return selected data
    data: T[];  // Dynamic data
    columns: ColumnConfig[];  // Dynamic columns
    label: string;  // Label for the picker input
    maxWidth?: string;
    selectedId?: string;
    idField?: string;
}

const DatatablePicker = <T extends Record<string, any>>({
    onSelect,
    data,
    columns,
    label,
    maxWidth = "400px",
    selectedId,
    idField = 'Id',
}: DatatablePickerProps<T>) => {  
    const [visible, setVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [selectedRow, setSelectedRow] = useState<T | null>(null);
    const initialSelectionMade = useRef(false);

    useEffect(() => {
        if (!initialSelectionMade.current && selectedId && data.length > 0) {
            const found = data.find(item => String(item[idField]) === String(selectedId));
            if (found) {
                setSelectedItem(found);
                setSelectedRow(found);
                onSelect(found);
                initialSelectionMade.current = true;
            }
        }
    }, [selectedId, data, idField]);


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
            <div className="picker-input">
                <FloatLabel>
                    <label htmlFor="data-picker">{label}</label>
                    <div className="p-inputgroup">
                        <InputText
                            style={{"maxWidth": maxWidth}}
                            id="data-picker"
                            value={selectedItem ? String(selectedItem[columns[0].field]) : ""}
                            readOnly
                        />
                        <Button icon="pi pi-search" onClick={() => setVisible(true)} />
                    </div>
                </FloatLabel>
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