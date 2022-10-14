import { createSignal, onMount } from "solid-js";
import { useRouteData, Link } from "solid-app-router";
import { createQuery } from "@tanstack/solid-query";
import { fetchLoginFakeData } from "./lib/fetchFuncs";

import Button from "./shared/Button";

export default function Login() {
  const [cId, setCId] = createSignal("");
  const [pId, setPId] = createSignal("");
  // const data = useRouteData();
  const query = createQuery(() => ["admin"], fetchLoginFakeData, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    cacheTime: 0,
    staleTime: 0,
  });

  return (
    <div>
      <h1>Login</h1>
      <div>
        <Link href="/">
          <Button kind="light" type="button" text="👈🏽" />
        </Link>
      </div>

      <nav>
        <Link href="/admin">admin </Link>
        {cId() && (
          <>
            | <Link href={`/customer/${cId()}`}>customer </Link>
          </>
        )}
        {pId() && (
          <>
            | <Link href={`/professional/${pId()}`}>professional </Link>
          </>
        )}
      </nav>

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <select onChange={e => setCId(e.currentTarget.value)}>
            <For each={query.data?.customers}>
              {customer => <option value={customer.id}>{customer.name}</option>}
            </For>
          </select>
          <select onChange={e => setPId(e.currentTarget.value)}>
            <For each={query.data?.professionals}>
              {professional => <option value={professional.id}>{professional.name}</option>}
            </For>
          </select>
        </Suspense>
      </div>

      {/* <pre>{JSON.stringify(query, null, 2)}</pre> */}
    </div>
  );
}
