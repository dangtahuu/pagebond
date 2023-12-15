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
} from "./page";
// layout
import {
  Dashboard,
  Message,
  Admin,
  Browse,
  PostDetail,
  BookDetail,
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
        draggable
        pauseOnHover={false}
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
            <Route path="/messenger" element={<Message />} />
            {/* <Route path="/browse" element={<Browse />} /> */}

            <Route path="/admin" element={<Admin />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/:id/:shelf" element={<Profile />} />

            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/browse" element={<Search />} />


            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/detail/:type/:id" element={<PostDetail />} />
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
