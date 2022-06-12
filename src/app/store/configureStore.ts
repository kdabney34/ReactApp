import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { accountSlice } from "../../features/account/accountSlice"; 
import { basketSlice } from "../../features/basket/basketSlice";
import { catalogSlice } from "../../features/catalog/catalogSlice";
import { counterSlice } from "../../features/contact/counterSlice";

// export function configureStore() {
//     return createStore(counterReducer);
// }

// name and point to our redux store reducers
// the redux store has all kinds of properties we can call on like getState()
export const store = configureStore({ 
reducer: { 
        counter: counterSlice.reducer,
        basket: basketSlice.reducer,
        catalog: catalogSlice.reducer,
        account: accountSlice.reducer
    }
})

//name and point to our root state type, app dispatch type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//name and point to our default generic app dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

//allows for hooks to communicate with our root state types for easy curation
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;