import { Toast } from "primereact/toast";

// Typing severity to only allow the specified types
type ToastSeverity = "success" | "info" | "warn" | "error" | "secondary" | "contrast" | undefined;

export const showToast = ((
        toasLoadtRef: React.RefObject<Boolean>, // Toast ref passed as argument
        toastref: React.RefObject<Toast | null>,
        severity: ToastSeverity = 'success', // Default value: success
        summary: string = 'Success', // Default value: 'Success'
        detail: string = 'Uspešno naloženo' // Default value: 'Operation successful'

      ) => {
        console.log('showToast called');
        console.log('toasLoadtRef:', toasLoadtRef);

        if (!toasLoadtRef.current) {
            toasLoadtRef.current = true;
            toastref.current?.show({
                severity,
                summary,
                detail,
                life: 3000, // Duration for how long the toast should be visible (optional)
            });
        }
      }
    );


export const showToastWithOutLoadRef = ((
    toastref: React.RefObject<Toast | null>,
    severity: ToastSeverity = 'success', // Default value: success
    summary: string = 'Success', // Default value: 'Success'
    detail: string = 'Uspešno naloženo' // Default value: 'Operation successful'
    
    ) => {

    toastref.current?.show({
        severity,
        summary,
        detail,
        life: 3000, // Duration for how long the toast should be visible (optional)
    });
    
    }
);