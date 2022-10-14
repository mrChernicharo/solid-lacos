import { lazy, createResource, createEffect } from "solid-js";
import { Routes, Route, Outlet, useNavigate } from "solid-app-router";

import { s } from "./lib/styles";
import Button from "./shared/Button";
import Header from "./shared/Header";

// import { userStore, logout } from "./userStore";

import Home from "./Home";
import NotFound from "./NotFound";
import { useQueryClient } from "@tanstack/solid-query";

const Login = lazy(() => import("./Login"));
const Admin = lazy(() => import("./admin/Admin"));
const Staff = lazy(() => import("./admin/Staff"));
const AdminProfessionals = lazy(() => import("./admin/Professionals"));
const AdminProfessional = lazy(() => import("./admin/Professionals/Professional"));
const AdminCustomers = lazy(() => import("./admin/Customers"));
const AdminCustomer = lazy(() => import("./admin/Customers/Customer"));
const AppointmentRequests = lazy(() => import("./admin/Requests"));
// const Appointments = lazy(() => import("./Appointments"));

const Customer = lazy(() => import("./customer/Customer"));
const Professional = lazy(() => import("./professional/Professional"));

export default function Router() {
  const queryClient = useQueryClient();

  const Layout = () => (
    <div>
      <Header />

      <Outlet />
    </div>
  );

  createEffect(() => {
    console.log({ ...queryClient });
    console.log({ cache: queryClient.getQueryCache(), map: queryClient.getQueryCache().findAll() });
  });

  return (
    <Routes>
      <Route path="/" component={Home} />

      <Route path="/login" component={Login} />

      <Route path="/admin" component={Layout}>
        <Route path="/" component={Admin} />
        <Route path="/customers" component={AdminCustomers} />
        <Route path="/customers/:id" component={AdminCustomer} />
        <Route path="/professionals" component={AdminProfessionals} />
        <Route path="/professionals/:id" component={AdminProfessional} />
        <Route path="/staff" component={Staff} />
        <Route path="/requests" component={AppointmentRequests} />
        {/* <Route path="/appointments" component={Appointments} /> */}
      </Route>

      <Route path="/customer" component={Layout}>
        <Route path="/:id" component={Customer} />
      </Route>

      <Route path="/professional" component={Layout}>
        <Route path="/:id" component={Professional} />
      </Route>

      <Route path="/**" component={NotFound} />
    </Routes>
  );
}
