import axios, { AxiosError, AxiosResponse } from "axios"; // Axios is a modern and popular promise-based HTTP client that we can use to perform async HTTP requests
import { toast } from "react-toastify"; // react notification library
import { history } from "../.."; // createBrowserHistory() object initialized in index.tsx homepage of app render
import { PaginatedResponse } from "../models/pagination"; // returns class<T> of products with MetaData interface containing page num, total pages, etc.
import { store } from "../store/configureStore";
// define sleep function that sends and resolves async promise timer
const sleep = () => new Promise(resolve => setTimeout(resolve, 500));


//--------THIS IS OUR MAIN API THAT IS CALLED BY CLIENT OPERATING ON OUR WEBSITE, TO --> OUR CONTROLLERS, THROUGH --> AXIOS-----------------


axios.defaults.baseURL = process.env.REACT_APP_API_URL; // set axios base url
axios.defaults.withCredentials = true; // add security credentials for every request, configured in middleware, to prevent foreign requests

const responseBody = (response: AxiosResponse) => response.data; // response is of type AxiosRepsponse and it yields payload.data (main return)

// axios interceptor is just a function that gets called for every single HTTP request made and the response received by the app
axios.interceptors.request.use(config => { // configure axios request (FROM client on website TO -> our code) 
    const token = store.getState().account.user?.token; // access redux state store using redux BUILT-IN method(getState()) -> account_state -> user_interface -> token field value [associated with user]
    if (token) config.headers.Authorization = `Bearer ${token}`; // modify Axios request object -> headers -> add correct authorization string to request header to allow reception of request
    return config; // now our AxiosConfig obj is properly loaded with authorization headers if applicable to user
})

// axios interceptor is just a function that gets called for every single HTTP request made and the response received by the app
axios.interceptors.response.use(async response => { // response coming back FROM our codebase TO -> client logged in on our site
    if (process.env.NODE_ENV === 'development') await sleep(); // change to 'production' when deployed 
    const pagination = response.headers['pagination']; // axios makes it easy to implement pagination with this built-in method we save as 'pagination' obj contains total pages, page num, items per page..
    if (pagination) {
        response.data = new PaginatedResponse(response.data, JSON.parse(pagination)); // If pagination applicable return paginated response with payload.Data + our pagination info from headers
        return response;
    }
    return response;
}, (error: AxiosError) => {
    const { data, status } = error.response!;
    switch (status) {
        case 400: // error 400 = bad request
            if (data.errors) {
                const modelStateErrors: string[] = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modelStateErrors.push(data.errors[key]) // this push allows us to save the error in entity framework error logs
                    }
                }
                throw modelStateErrors.flat();
            }
            toast.error(data.title);
            break;
        case 401: // error 401 = unauthorized
            toast.error(data.title);
            break;
        case 403: // error 403 = forbidden
            toast.error('You are not allowed to do that!');
            break;
        case 500: // error 500 = generic error response. This error is usually returned by the server when no other error code is suitable
            history.push({
                pathname: '/server-error',
                state: {error: data}
            });
            break;
        default:
            break;
    }
    return Promise.reject(error.response);
})

// name requests obj such that all action types are setup to trigger Axios requests with proper url, parameters, error handling & THEN statement that returns result
const requests = {
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(responseBody), 
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => axios.post(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody),
    putForm: (url: string, data: FormData) => axios.put(url, data, { // put = modify existing entity
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody)
}

function createFormData(item: any) {
    let formData = new FormData(); // FormData = msft's way of easily turning form field values into key/value pairs that we send off with XMLHttpRquest.send()
    for (const key in item) {      // it uses same format as encoding set to "multipart / form data" 
        formData.append(key, item[key])
    }
    return formData;
}
// Admin-permission-only methods 
const Admin = {
    createProduct: (product: any) => requests.postForm('products', createFormData(product)),  // action type "products" reducer w/ formdata parameters
    updateProduct: (product: any) => requests.putForm('products', createFormData(product)),
    deleteProduct: (id: number) => requests.delete(`products/${id}`) // id required for delete product
}

const Catalog = {
    list: (params: URLSearchParams) => requests.get('products', params),
    details: (id: number) => requests.get(`products/${id}`),
    fetchFilters: () => requests.get('products/filters')
}

// for test purposes 
const TestErrors = {
    get400Error: () => requests.get('buggy/bad-request'),
    get401Error: () => requests.get('buggy/unauthorised'),
    get404Error: () => requests.get('buggy/not-found'),
    get500Error: () => requests.get('buggy/server-error'),
    getValidationError: () => requests.get('buggy/validation-error'),
}

// Basket = shopping cart 
const Basket = {
    get: () => requests.get('basket'), // get user's basket
    addItem: (productId: number, quantity = 1) => requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}), // override quantity in request possible but default is 1
    removeItem: (productId: number, quantity = 1) => requests.delete(`basket?productId=${productId}&quantity=${quantity}`) 
}

const Account = {  // send http request to account controller to run the associated methods with the given parameters
    login: (values: any) => requests.post('account/login', values), // attempt login using axios post request to our server
    register: (values: any) => requests.post('account/register', values),
    currentUser: () => requests.get('account/currentUser'),
    fetchAddress: () => requests.get('account/savedAddress')
}

const Orders = {  // send http request to orders controller to run the associated methods with the given parameters
    list: () => requests.get('orders'),
    fetch: (id: number) => requests.get(`orders/${id}`), // orders with 'id' parameter included
    create: (values: any) => requests.post('orders', values)
}

const Payments = {
    createPaymentIntent: () => requests.post('payments', {}) // generating payment intent ID is a necessary functionality of Stripe payment processing
}

// notice how we don't export 'requests' = bad practice, keep it in this file where it is used locally and those exports hold reference to 'requests' in this file
const agent = { 
    Catalog,
    TestErrors,
    Basket,
    Account,
    Orders,
    Payments,
    Admin
}

export default agent;