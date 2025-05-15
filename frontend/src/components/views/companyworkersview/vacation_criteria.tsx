import React, { useEffect, useRef, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { api } from '../../../api';
import { showToast, showToastWithOutLoadRef } from '../../../utils/toast';

export interface VacationCriteria {
    min_vacation_days: number;
    worker_older_then_55: number;
    underage_worker: number;
    disabled_worker: number;
    worker_disability_60_percent: number;
    night_worker: number;
    worker_with_disabled_children: number;
    total_working_time: number;
    work_complexity: number;
}

interface VacationCriteriaProps {
    Id_Worker?: string;
    criteria?: VacationCriteria;
    onChange: (criteria: VacationCriteria) => void;
}
const VacationCriteriaView: React.FC<VacationCriteriaProps> = ({ Id_Worker, criteria, onChange }) => {
    const [localCriteria, setLocalCriteria] = useState<VacationCriteria>({
        min_vacation_days: 20,
        worker_older_then_55: 0,
        underage_worker: 0,
        disabled_worker: 0,
        worker_disability_60_percent: 0,
        night_worker: 0,
        worker_with_disabled_children: 0,
        total_working_time: 0,
        work_complexity: 0
    });
    const [totalVacationDays, setTotalVacationDays] = useState<number>(0);

    const currentCriteria = criteria ?? localCriteria;

    const toast = useRef<Toast>(null);
    const toastShown = useRef(false);
    const updateErrorToast = useRef<Toast>(null);

    useEffect(() => {
        if (Id_Worker) {
            const fetchUserVacationCriteria = async () => {
                try {
                    const response = await api.post('/users/get_vacation_criteria', { Id: Id_Worker });
                    if (response.status === 200 && response.data.length > 0) {
                        const fetched = response.data[0];

                        onChange(fetched);
                        setLocalCriteria(fetched);
                        
                        showToast(toastShown, toast);
                    }
                } catch (err) {
                    showToastWithOutLoadRef(updateErrorToast, 'success',"Posodobitev", "Delavec posodobljen");
                }
            };

            fetchUserVacationCriteria();
        }
    }, [Id_Worker]);

    const handleChange = (field: keyof VacationCriteria, value: any) => {
        const updated: VacationCriteria = {
            ...currentCriteria,
            [field]: value ?? 0, // fallback to 0 to ensure valid numbers
        };


        console.log('Calling onChange with:', updated);
        onChange?.(updated);
        setLocalCriteria(updated);
        

        // Total should always be recalculated from updated values
        setTotalVacationDays(
            Object.values(updated).reduce((sum, val) => sum + (val || 0), 0)
        );
    };

    return (
        <div className="p-fluid p-4 max-w-md grid gap-4">
            <Toast ref={toast} />

            <div className="field">
                <label htmlFor="min_vacation_days">Minimalno število dni dopusta</label>
                <InputNumber
                    id="min_vacation_days"
                    value={currentCriteria.min_vacation_days}
                    onValueChange={(e) => handleChange('min_vacation_days', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="worker_older_then_55">Delavec starejši od 55 let</label>
                <InputNumber
                    id="worker_older_then_55"
                    value={currentCriteria.worker_older_then_55}
                    onValueChange={(e) => handleChange('worker_older_then_55', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="underage_worker">Mladoletni delavec</label>
                <InputNumber
                    id="underage_worker"
                    value={currentCriteria.underage_worker}
                    onValueChange={(e) => handleChange('underage_worker', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="disabled_worker">Invalidni delavec</label>
                <InputNumber
                    id="disabled_worker"
                    value={currentCriteria.disabled_worker}
                    onValueChange={(e) => handleChange('disabled_worker', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="worker_disability_60_percent">Invalidnost delavca ≥ 60%</label>
                <InputNumber
                    id="worker_disability_60_percent"
                    value={currentCriteria.worker_disability_60_percent}
                    onValueChange={(e) => handleChange('worker_disability_60_percent', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="night_worker">Nočni delavec</label>
                <InputNumber
                    id="night_worker"
                    value={currentCriteria.night_worker}
                    onValueChange={(e) => handleChange('night_worker', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="worker_with_disabled_children">Delavec z otroki s posebnimi potrebami</label>
                <InputNumber
                    id="worker_with_disabled_children"
                    value={currentCriteria.worker_with_disabled_children}
                    onValueChange={(e) => handleChange('worker_with_disabled_children', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="total_working_time">Skupna delovna doba (v mesecih)</label>
                <InputNumber
                    id="total_working_time"
                    value={currentCriteria.total_working_time}
                    onValueChange={(e) => handleChange('total_working_time', e.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="work_complexity">Kompleksnost dela</label>
                <InputNumber
                    id="work_complexity"
                    value={currentCriteria.work_complexity}
                    onValueChange={(e) => handleChange('work_complexity', e.value)}
                />
            </div>

            <div className="field font-bold text-right pt-4">
                Skupna vrednost: {totalVacationDays || Object.values(currentCriteria).reduce((sum, val) => sum + (val || 0), 0)} dni
            </div>      
        </div>
    );


};
export default VacationCriteriaView;