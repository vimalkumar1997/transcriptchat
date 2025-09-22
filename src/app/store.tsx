import { configureStore } from "@reduxjs/toolkit";
import { loginAPISlice} from "./loginapi/loginAPIslice";

const store = configureStore({
    reducer: {
        [loginAPISlice.reducerPath]: loginAPISlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(loginAPISlice.middleware),
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;