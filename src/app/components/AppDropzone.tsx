import { UploadFile } from '@mui/icons-material'; 
import { FormControl, FormHelperText, Typography } from '@mui/material'; // FormHelperText is the little text that appeaers for help in form, typography is the font package
import { useCallback } from 'react' // returns a memoized callback function (cached, predetermined callback function), callback function is a function passed into another function as an argument
import { useDropzone } from 'react-dropzone' // Dropzone = simple react file drag - n - drop area 
import { useController, UseControllerProps } from 'react-hook-form'
// FormControl makes sure the state isn't modified until form is submitted and successfully validated
// FormControl also provides context such as as --filled/focused/error/required-- properties for form inputs.
interface Props extends UseControllerProps { }

//------ this page creates our react dropzone used in forms across the site 

export default function AppDropzone(props: Props) { // props are the field values from view form
    // init fields + fieldState using props passed to here never forgetting defaultValue
    const { fieldState, field } = useController({ ...props, defaultValue: null });
    // useController is a custom hook that works with a controlled component providing both form and field level state
    // re-render is isolated at the hook level 

    // initial style of react dropzone area
    const dzStyles = {
        display: 'flex',
        border: 'dashed 3px #eee',
        borderColor: '#eee',
        borderRadius: '5px',
        paddingTop: '30px',
        alignItems: 'center',
        height: 200,
        width: 500
    }

    // we use this style when file has successfully been uploaded
    const dzActive = {
        borderColor: 'green'
    }

    const onDrop = useCallback(acceptedFiles => { // useCallback will return a memoized version of the callback that only changes if an input has changed
        acceptedFiles[0] = Object.assign(acceptedFiles[0], // Object.assign() copies the full enumerable of properties from submitted dropform and pastes into our variable
            {preview: URL.createObjectURL(acceptedFiles[0])}); // built-in dropzone preview feature easy to use like this
        field.onChange(acceptedFiles[0]); // specify that we send this file off onChange of field by form submit
    }, [field]) // [field] specifies that there's just one space for upload
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    // getRootProps IS REACT'S LIBRARY THAT PROVIDES THE DRAG-N-DROP FUNCTIONALITY
    //getInputProps IS REACT'S LIBRARY THAT PROVIDES CLICK + KEY-DOWN BEHAVIOR OF THE BUTTON 
     // isDragActive IS REACT'S LIBRARY THAT TELLS US WHETHER THE DROPPED FILE IS GOING TO BE ACCEPTED FOR SUBMISSION OR NOT

    // always remember to inject root props into parent div so we have associated props on submit
    // notice we trigger a style change on isDragActive (new border color on successful dropbox input file)
    return (
        <div {...getRootProps()}>
            <FormControl error={!!fieldState.error} style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}>  
                <input {...getInputProps()} />
                <UploadFile sx={{fontSize: '100px'}} />
                <Typography variant='h4'>Drop image here</Typography>
                <FormHelperText>{fieldState.error?.message}</FormHelperText> 
            </FormControl>
        </div>
    )
}