import { Typography, Pagination } from "@mui/material";
import { Box } from "@mui/system"; // Box component serves as a wrapper component for most of the CSS utility needs. it packages all the style functions that are exposed in @mui/system
import { useState } from "react"; // basic state hook
import { MetaData } from "../models/pagination"; // total pages, total products, products per page..

interface Props {
    metaData: MetaData;
    onPageChange: (page: number) => void;
}

export default function AppPagination({metaData, onPageChange}: Props) {
    const {currentPage, totalCount, totalPages, pageSize} = metaData; // these come from Pagination(MUI) and we add them to MetaData as JSON obj
    const [pageNumber, setPageNumber] = useState(currentPage); // const [Currentstate, setStateFn] = uState(initialState) hook

    function handlePageChange(page: number) { 
        // setPageNumber is our state-altering function within the state array
        setPageNumber(page);
        // onPageChange is our local function defined in props that simply returns void *for now*
        onPageChange(page);
    } 

    return (
        // Box is wrapper component for CSS utility needs, packages MUI style
        // pay attention to the exclamation point in line below
        // Displaying {( !ARE WE ON ANY VALID PAGE IN PAGINATION RN? -> Display total count. ELSE, we are on a valid page# -> Display that Page Num)}
        // 
        <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography>
                Displaying {(currentPage-1)*pageSize+1}- 
                {currentPage*pageSize > totalCount 
                    ? totalCount 
                    : currentPage*pageSize} of {totalCount} items
            </Typography>
            <Pagination
                color='secondary'
                size='large'
                count={totalPages}
                page={pageNumber}
                onChange={(e, page) => handlePageChange(page)}
            />
        </Box>
    ) // onChange(event, page) takes the new page and it goes to local function to set state with it thru setPageNumber 
      // we can also do additional stuff with the local onPageChange
}