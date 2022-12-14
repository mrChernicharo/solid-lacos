import { createEffect, createMemo, createSignal, For, Suspense } from "solid-js";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";

import { fetchCustomerRequestAvailability } from "../../lib/fetchFuncs";
import { createAppointmentOffers } from "../../lib/mutationFuncs";
import { STR_NUM_WEEKDAYS } from "../../lib/constants";
import { classss, dateToWeekday } from "../../lib/helpers";

import AvailabilityMatch from "./AvailabilityMatch";
import Loading from "../../shared/Loading";
import { channel } from "../../lib/supabaseClient";
import { addToast } from "../../shared/Toast";
import { FiSend, FiFilter } from "solid-icons/fi";
import Badge from "../../shared/Badge";

export default function CustomerRequestAvailability(props) {
  const queryClient = useQueryClient();
  const query = createQuery(
    () => ["customer_request_availability", props.customerId],
    () => fetchCustomerRequestAvailability(props.customerId)
  );
  const sendOffers = createMutation(["customer_request_availability", props.customerId], offers =>
    createAppointmentOffers(props.customerId, offers)
  );

  const [filter, setFilter] = createSignal("day"); /* day | professional */
  const [isLoading, setIsLoading] = createSignal(false);

  const matchesObj = createMemo(() => {
    if (!query.data?.matches) return [];

    const mObj = {};
    query.data?.matches.forEach(match => {
      if (!(match[filter()] in mObj)) mObj[match[filter()]] = [];
      mObj[match[filter()]].push(match);
    });

    return mObj;
  });

  function handleSubmitOffers(e) {
    e.preventDefault();
    setIsLoading(true);

    const selectedCheckboxes = [...e.currentTarget].filter(d => d.checked);
    const selectedTimeBlocks = selectedCheckboxes.map(d => ({
      ...d.dataset,
      customer_id: props.customerId,
    }));

    sendOffers.mutate(selectedTimeBlocks, {
      onSuccess: (data, variables, context) => {
        // UPDATE BADGE AT THE PARENT
        props.onOffersSent({ data, variables, selectedTimeBlocks });
        console.log({ data, variables, selectedTimeBlocks });
        addToast({ title: "Tudo certo!", message: "ofertas de atendimento enviadas!", status: "success" });
      },
      onSettled: () => setIsLoading(false),
    });
  }

  channel.on("broadcast", { event: "person_availability_updated" }, payload => {
    console.log("just heard person_availability_updated");
    query.refetch();
  });
  channel.on("broadcast", { event: `${props.customerId}::customer_availability_updated` }, payload => {
    console.log(`just heard ${props.customerId}::customer_availability_updated`);
    // UPDATE BADGE AT THE PARENT
    query.refetch();
  });

  channel.on("broadcast", { event: "new_appointment_created" }, payload => {
    console.log("just heard new_appointment_created!!! Update that shit and make this client disappear");
    // queryClient.invalidateQueries(["customer_request_availability", props.customerId]);
    queryClient.invalidateQueries(["appointment_requests"]);
    query.refetch();
  });

  return (
    <div data-component="CustomerRequestAvailability">
      <form onSubmit={handleSubmitOffers}>
        <Show when={query.data} fallback={<Loading />}>
          {/* <Badge danger={!query.data.offers.length} warn={query.data.offers.length} /> */}
          <div class="">
            <div class="flex items-center gap-1 mt-6 mb-4">
              <span class="mr-1">Agrupar por</span>
              <button
                type="button"
                class={classss("btn btn-sm", filter() === "day" && "btn-success")}
                onClick={e => setFilter("day")}
              >
                Dia
              </button>
              <button
                type="button"
                class={classss("btn btn-sm", filter() === "professional" && "btn-success")}
                onClick={e => setFilter("professional")}
              >
                Profissional
              </button>
            </div>
            <For each={Object.keys(matchesObj())}>
              {k => (
                <div>
                  <div class="font-bold capitalize">{STR_NUM_WEEKDAYS.includes(k) ? dateToWeekday(k) : k}</div>
                  <ul class="flex gap-3 py-2 pl-2 flex-wrap ">
                    <For each={matchesObj()[k]}>
                      {match => <AvailabilityMatch match={match} offers={query.data.offers} filter={filter()} />}
                    </For>
                  </ul>
                </div>
              )}
            </For>

            <div class="mt-3">
              <button class="btn btn-accent">
                <div class="flex items-center">
                  {isLoading() ? <Loading small color="#fff" /> : <FiSend size={20} />}
                  {/* <Show when={sendOffers.isLoading} fallback={<FiSend size={20} />}>
                   
                  </Show> */}
                  <span class="mx-2">Enviar Ofertas</span>
                </div>
              </button>
            </div>
          </div>
        </Show>
      </form>
    </div>
  );
}
