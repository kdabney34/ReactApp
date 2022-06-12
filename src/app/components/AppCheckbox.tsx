import { Checkbox, FormControlLabel } from "@mui/material"; // Checkbox allows user to select one or more items from a set, formcontrollabel
import { useController, UseControllerProps } from "react-hook-form" 

//---  this is our created Checkbox we use at checkout that flips on 'use this address for payment details' at checkout  ---------------------------

// label displayed to client for the checkbox + disabled bool for usage within checkbox logic 
interface Props extends UseControllerProps {
    label: string;
    disabled: boolean;
}

// useController is react-hook-form's way of rendering a component that is capable of sending forms using given props
// ...props MUST be used, it makes another copy of props as we do not want to modify original props
// defaultValue must be included, just react syntax else won't load
export default function AppCheckbox(props: Props) {
    const {field} = useController({...props, defaultValue: false}); // {field} depends on react's class 'ControllerRenderProps' from useController hook
    return (                                            // and it returns a rendered field value
        <FormControlLabel // wraps everything in label
            control={ // jsx element ensures our useController can track state 'lazily' instead of traditionally ==> no errors due to double tracking
                <Checkbox 
                    {...field} // return a copy of created {field} obj
                    checked={field.value}
                    color='secondary'
                    disabled={props.disabled}
                />
            }
            label={props.label} // passed 'use this address for payment details' in form view
        />
    )
}