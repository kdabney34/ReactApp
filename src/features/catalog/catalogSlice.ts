import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { MetaData } from "../../app/models/pagination";
import { Product, ProductParams } from "../../app/models/product";
import { RootState } from "../../app/store/configureStore";


// these items must be included in state because we want re-render of catalog for every change in these items
interface CatalogState {
    productsLoaded: boolean;
    filtersLoaded: boolean;
    status: string;
    brands: string[];
    types: string[];
    productParams: ProductParams;
    metaData: MetaData | null;
}

// A function that generates a set of prebuilt reducers and selectors for performing CRUD operations on a normalized state structure
// containing instances of a particular type of data object \
const productsAdapter = createEntityAdapter<Product>();

function getAxiosParams(productParams: ProductParams) {
    const params = new URLSearchParams();
    params.append('pageNumber', productParams.pageNumber.toString());
    params.append('pageSize', productParams.pageSize.toString());
    params.append('orderBy', productParams.orderBy);
    if (productParams.searchTerm) params.append('searchTerm', productParams.searchTerm);
    if (productParams.brands.length > 0) params.append('brands', productParams.brands.toString());
    if (productParams.types.length > 0) params.append('types', productParams.types.toString());
    return params;
}


// thunk is react's way of attaching middleware to each async fetch call
// we call agent's API functions with thunkAPI middleware to handle all possible server responses
export const fetchProductsAsync = createAsyncThunk<Product[], void, {state: RootState}>(
    'catalog/fetchProductsAsync',
    // _ == no parameter needed when fetching all products
    async (_, thunkAPI) => {
        // this is why we use thunk, it allows thunkAPI middleware to collect additional data like productParams that we want
        // to incorporate into our call cleanly
        const params = getAxiosParams(thunkAPI.getState().catalog.productParams);
        try {
            const response = await agent.Catalog.list(params);
            thunkAPI.dispatch(setMetaData(response.metaData)); // now react has metadata obtained thru Thunk 
            return response.items;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

// here createAsyncThunk has return type <Product> and argument Number(productID)
export const fetchProductAsync = createAsyncThunk<Product, number>(
    'catalog/fetchProductAsync',
    async (productId, thunkAPI) => {
        try { // call our async API
            return await agent.Catalog.details(productId);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

export const fetchFilters = createAsyncThunk(
    'catalog/fetchFilters',
    async (_, thunkAPI) => {
        try {
            return agent.Catalog.fetchFilters();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)

function initParams() {
    return {
        pageNumber: 1,
        pageSize: 6,
        orderBy: 'name',
        brands: [],
        types: []
    }
}

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: productsAdapter.getInitialState<CatalogState>({ // CataLogState == interface defined at top of this page
        productsLoaded: false,
        filtersLoaded: false,
        status: 'idle',
        brands: [],
        types: [],
        productParams: initParams(),
        metaData: null
    }),
    // An object of "case reducers". Key names will be used to generate actions.
    reducers: {
        // 'action' is a generic arg, in our case, action holds payload which == page number == action.payload
        setProductParams: (state, action) => {
            state.productsLoaded = false;
            state.productParams = {...state.productParams, ...action.payload, pageNumber: 1};
        },
        // set page num to action.payload passed, remember to load products after
        setPageNumber: (state, action) => {
            state.productsLoaded = false;
            state.productParams = {...state.productParams, ...action.payload};
        }, // pass axios metadata as action.payload
        setMetaData: (state, action) => {
            state.metaData = action.payload;
        }, // reset product params using local func defined this page
        resetProductParams: (state) => {
            state.productParams = initParams();
        }, 
        setProduct: (state, action) => {
            productsAdapter.upsertOne(state, action.payload);
            state.productsLoaded = false;
        },
        removeProduct: (state, action) => {
            productsAdapter.removeOne(state, action.payload);
            state.productsLoaded = false;
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchProductsAsync.pending, (state) => {
            state.status = 'pendingFetchProducts';
        });
        builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
            productsAdapter.setAll(state, action.payload);
            state.status = 'idle';
            state.productsLoaded = true;
        });
        builder.addCase(fetchProductsAsync.rejected, (state, action) => {
            console.log(action.payload);
            state.status = 'idle';
        });
        builder.addCase(fetchProductAsync.pending, (state) => {
            state.status = 'pendingFetchProduct';
        });
        builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
            productsAdapter.upsertOne(state, action.payload);
            state.status = 'idle';
        });
        builder.addCase(fetchProductAsync.rejected, (state, action) => {
            console.log(action);
            state.status = 'idle';
        });
        builder.addCase(fetchFilters.pending, (state) => {
            state.status = 'pendingFetchFilters';
        });
        builder.addCase(fetchFilters.fulfilled, (state, action) => {
            state.brands = action.payload.brands;
            state.types = action.payload.types;
            state.filtersLoaded = true;
            state.status = 'idle';
        });
        builder.addCase(fetchFilters.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        })
    })
})
// export productSelectors which is just catalog state of type RootState
export const productSelectors = productsAdapter.getSelectors((state: RootState) => state.catalog);

// export destructured variables created inside catalogSlice.actions so that we can use anywhere in app
export const {setProductParams, resetProductParams, setMetaData, setPageNumber, setProduct, removeProduct} = catalogSlice.actions;