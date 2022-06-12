import { TextField } from "@mui/material"; // mui text field
import { useController, UseControllerProps } from "react-hook-form"; // general hooks for controlled elements such as this one (AppTextInput)

// extending from UseControllerProps allows our controlled element's props to pass through react's official state-changer instead of us doing it ourself
// plus it yields tons of functionalities that allow for extra input data to be gathered and possibly change state
// It's important to be aware of each prop's responsibility when working with external controlled components, such as MUI.
// Its job is to spy on the input, report, and set its value.
interface Props extends UseControllerProps {
    label: string;
    multiline?: boolean; 
    rows?: number;
    type?: string;
} // WE MUST EXTEND FROM USECONTROLLERPROPS SO THAT OUR FIELDS CAN INFER THIER RESPECTIVE TYPE WITH EACH USER KEYSTROKE

export default function AppTextInput(props: Props) {
    const { fieldState, field } = useController({ ...props, defaultValue: '' }); // init fieldstate,field with hooks into ...props, with defaultValue=''
    return ( // react's multiline feature will automatically detect whether its true/false with each user input 
       // ...props must be passed as they are inheriting from usecontrollerprops which allows for this jsx textfield element to auto-detect field types
           // {field} is passed to render a jsx input field element
        // multiline,rows,type,fullWidth..== useController functionalities
        <TextField 
            {...props}
            {...field}
            multiline={props.multiline}
            rows={props.rows}
            type={props.type}
            fullWidth
            variant='outlined'
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
        />
    )
}