import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// page
import {
  Home,
  Login,
  Register,
  ForgetPassword,
  Error,
  ProtectedLayout,
  ShareLayout,
  BookPage,
  ChatPage
} from "./page";
// layout
import {
  Dashboard,
  Admin,
  Browse,
  PostDetail,
  
  Profile,
  UpdateProfile,
  Search,
} from "./page/Layout";

const App = () => {
  return (
    <div className={` relative `}>
      {/* Notification */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover={false}
        theme="dark"
      />

      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <ShareLayout />
              </ProtectedLayout>
            }
          >
            <Route
              // @ts-ignore
              index
              path="/"
              element={<Dashboard />}
            />
            <Route path="/chat" element={<ChatPage />} />
            {/* <Route path="/browse" element={<Browse />} /> */}

            <Route path="/admin" element={<Admin />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/:id/:shelf" element={<Profile />} />

            <Route path="/book/:id" element={<BookPage />} />
            <Route path="/search" element={<Search />} />
            <Route path="/browse" element={<Search />} />


            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/detail/:id" element={<PostDetail />} />
          </Route>

          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forget-password" element={<ForgetPassword />} />


          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
