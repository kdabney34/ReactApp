import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
// Menus display a list of choices on temporary surfaces. Like a GUI. 
// Menus have MenuItems and FormHelperText 
// FormControl provides context for the form such as filled, validations, selected, hovered..
// Select components are used for collecting user provided information from a list of options. (ex: Age:12,13,or 14?) Select one.
import { useController, UseControllerProps } from "react-hook-form";
// React Hook Form exposes type UseControllerProps which accepts generic type T which infers your input value types.
// or in other words the FieldValues type.Initially you define FieldValues type by passing type about your fields to useForm hook

// SINCE MUI IS A CONTROLLED COMPONENT, <useController, and Controller> is used as a wrapper around them to render nicely with react, which otherwise works in uncontrolled components
// interface extends UseControllerProps means it inherits from UseControllerProps
interface Props extends UseControllerProps {
    label: string;
    items: string[];
}

// this is our app select list that renders a validated dropdown list of apps that we provide that is built-in to the form we render it inside
// so that on submission the result return type<select> is submitted
export default function AppSelectList(props: Props) {
    const { fieldState, field } = useController({ ...props, defaultValue: '' });
    return (
        <FormControl fullWidth error={!!fieldState.error}>
            <InputLabel>{props.label}</InputLabel>
            <Select
                value={field.value}
                label={props.label}
                onChange={field.onChange}
            >
                {props.items.map((item, index) => (
                    <MenuItem key={index} value={item}>{item}</MenuItem>
                ))}
            </Select>
            <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
    )
    // onChange: send data back to hook form
}