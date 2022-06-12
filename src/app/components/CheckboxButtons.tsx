import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
// FormGroup wraps controls such as Checkbox and Switch. It provides compact row layout.
// FormControlLabel is a label for forms being controlled, in our case -> Checkbox
// Checkbox is a controlled MUI-react component that allows the user to select one or more items from a set.

import { useState } from "react";
//------------what is useState?
// useState is a Hook that allows you to have state variables in functional components. 
// You pass the initial state to this function (in our case, checked || []), and it returns
// a variable with the current state value(not necessarily the initial state) (in our case, checkedItems)
// and another function to update this value (setCheckedItems)

interface Props {
    items: string[];
    checked?: string[];
    onChange: (items: string[]) => void;
}

export default function CheckboxButtons({ items, checked, onChange }: Props) {
    // init state and statechangefunction with initial state
    const [checkedItems, setCheckedItems] = useState(checked || []);
    // checkedItems and setCheckedItems are built-in functions from MUI that help build hte checkbox buttons

    function handleChecked(value: string) { // value: string == item string that just got checked
        // currentIndex is the index of the first element in the 'items' string array that === value, else = -1
        const currentIndex = checkedItems.findIndex(item => item === value);
        // init new string arr newChecked
        let newChecked: string[] = [];
        // if we don't have a checked box yet (currentIndex=-1), fill newChecked with all items SPREAD into array EACH with their respective 'value' string field to the right
        if (currentIndex === -1) newChecked = [...checkedItems, value];
        // else set new checked array to all currently selected items, excluding the value (string arr that holds list of all selected items)
        else newChecked = checkedItems.filter(item => item !== value);
        setCheckedItems(newChecked); // built-in MUI function

        onChange(newChecked);
    }

    return (
        // FormGroup wraps controls such as checkbox and provides compact row layout
        <FormGroup>
            {items.map(item => (
                <FormControlLabel 
                    control={<Checkbox 
                        checked={checkedItems.indexOf(item) !== -1}
                        onClick={() => handleChecked(item)}
                    />} 
                    label={item} 
                    key={item} 
                />
            ))}
        </FormGroup>
    )
}