import { createMemo, createSignal, For } from "solid-js";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { fetchCustomerRequestAvailability } from "../../lib/fetchFuncs";
import { createAppointmentOffers } from "../../lib/mutationFuncs";

import AvailabilityMatch from "./AvailabilityMatch";
import { dateToWeekday } from "../../lib/helpers";
import Button from "../../shared/Button";
import Icon from "../../shared/Icon";

const WEEKDAYS = ["0", "1", "2", "3", "4", "5", "6"];

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
    console.log(e);

    const selectedCheckboxes = [...e.currentTarget].filter(d => d.checked);

    const selectedTimeBlocks = selectedCheckboxes.map(d => ({
      ...d.dataset,
      customer_id: props.customerId,
    }));

    sendOffers.mutate(selectedTimeBlocks, {
      onSuccess: (data, variables, context) => {
        // invalidate parent page query so we can fetch fresh data
        // about what customers have/haven't offers/appointments now
        queryClient.invalidateQueries(["appointment_requests"]);
        query.refetch();
      },
    });
  }

  return (
    <form onSubmit={handleSubmitOffers}>
      <div>
        <div>
          <Icon filter />
          <Button type="button" kind="light" text="day" onClick={e => setFilter("day")} />
          <Button type="button" kind="light" text="professional" onClick={e => setFilter("professional")} />
        </div>
      </div>
      <For each={Object.keys(matchesObj())}>
        {k => (
          <div>
            <div class="fw-bold">{WEEKDAYS.includes(k) ? dateToWeekday(k) : k}</div>

            <ul class="list-group">
              <For each={matchesObj()[k]}>
                {match => <AvailabilityMatch match={match} offers={query.data.offers} />}
              </For>
            </ul>
          </div>
        )}
      </For>

      <div class="mt-3">
        <Button kind="CTA" text={<Icon plus />} />
      </div>

      <pre>{JSON.stringify(query, null, 1)}</pre>
      {/* <pre>{JSON.stringify(matchesObj(), null, 1)}</pre> */}
    </form>
  );
}