import { createContext, PropsWithChildren, useContext, useState } from "react"; // PropsWithChildren alows a component to render child components
import { Basket } from "../models/basket";

//------------------we want a StoreContext because at any point in UI store, customer can add an item to basket----------------------------------
//------------------so we need to be able to access BasketState and its changeFunctions from anywhere in store---------------------------------
interface StoreContextValue {
    basket: Basket | null;
    setBasket: (basket: Basket) => void;
    removeItem: (productId: number, quantity: number) => void;
}

// createContext() creates a React Context, which is a cloud store that all components can access, without having to pass args down as props
export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function useStoreContext() {
    const context = useContext(StoreContext); // context = useContext(createdContext) inside is how React\Context is used properly

    if (context === undefined) {
        throw Error('Oops - we do not seem to be inside the provider');
    }

    return context;
}
// export function StoreProvider({children}: PropsWithChildren<any>) is how we gain ability to render children components inside this function
export function StoreProvider({children}: PropsWithChildren<any>) {
    const [basket, setBasket] = useState<Basket | null>(null);

    function removeItem(productId: number, quantity: number) {
        if (!basket) return;
        const items = [...basket.items]; // items = list of new basket items (spread operator makes new copy of basket)
        const itemIndex = items.findIndex(i => i.productId === productId);
        if (itemIndex >= 0) { // if an item was successfully picked that's ID matches productID passed
            items[itemIndex].quantity -= quantity; // subtract its quantity by argument quantity
            if (items[itemIndex].quantity === 0) items.splice(itemIndex, 1); // if its =0 remove it(splice) from list
            setBasket(prevState => {
                return { ...prevState!, items } // ! = non-null assertion operator, asserts that value is not null or undefined
                                                // in cases such as this where the TypeScript type-checker is unable to conclude that fact
            })                                  // which is the case because its inside of a react hook which could be interpreted completely by react
        }
    }
    // StoreContext is our BasketState Context Store that holds interface StoreContextValue {
    // basket: Basket | null;
    // setBasket: (basket: Basket) => void;
    // removeItem: (productId: number, quantity: number) => void;  
    // }
    // 
    //
    // Provider gives StoreContext ability to render chlidren thru PropsWithChildren<any> React Prop Attribute passed
    // Provider also contains a useState<Basket> hook which gives StoreContext its StateChange functionality

    return (
        // StoreContext.Provider value gives {children} ability to mutate state values and stateChange functions from its parent 
        // component so that when this page is rendered and {children} are shopping baskets filled per item, we can easily
        // add and remove items from child component and state will be re-rendered
        <StoreContext.Provider value={{basket, setBasket, removeItem}}>
            {children}
        </StoreContext.Provider>
    )
}