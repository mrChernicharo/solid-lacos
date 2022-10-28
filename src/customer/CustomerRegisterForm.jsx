import { createEffect, createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { setUserStore, userStore } from "../lib/userStore";
import { FiChevronLeft, FiChevronRight, FiCheck } from "solid-icons/fi";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { updateCustomer, updatePersonAvailability } from "../lib/mutationFuncs";

import AvailabilityTable from "../shared/AvailabilityTable";
import { Navigate, useParams, useRouteData, useRoutes, useNavigate } from "solid-app-router";
import { t } from "../lib/translations";
import {
  dateToWeekday,
  organizeAvailabilities,
  timeMinutesToStr,
  timeStrToMinutes,
  DBDateToDateStr,
  ISODateStrFromDateAndTime,
} from "../lib/helpers";
import { handleDateInput, normalizeDateStr } from "../lib/dateInputHelpers";
import { isDate } from "date-fns";
import Loading from "../shared/Loading";
import { addToast } from "../shared/Toast";

export default function CustomerRegisterForm(props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { customer } = queryClient.getQueryData(["customer", params.id]) ?? {};
  const updateMutation = createMutation(["customer", params.id], values => updateCustomer(params.id, values));
  const availabilityMutation = createMutation(["customer_availability", params.id], newAvailability =>
    updatePersonAvailability(customer, "customer", newAvailability)
  );

  const [currStep, setCurrStep] = createSignal(1);
  const [formStore, setFormStore] = createStore({});
  const isCustomer = () => userStore.user.category === "customer";

  const next = () => currStep() < FormComponents.length && setCurrStep(prev => prev + 1);
  const back = () => currStep() > 1 && setCurrStep(prev => prev - 1);
  const isLastStep = () => currStep() === FormComponents.length;
  const isFirstStep = () => currStep() === 1;
  const currComponentIdx = () => currStep() - 1;
  // const goTo = step => setCurrStep(step);

  const isNextStepDisabled = () => {
    const disablingRequirements = {
      1: !formStore.first_name || !formStore.last_name || updateMutation.isLoading,
      2:
        !formStore.date_of_birth ||
        !formStore.phone ||
        !isDate(normalizeDateStr(formStore.date_of_birth)) ||
        updateMutation.isLoading,
      3: formStore?.availability?.length < 3 || updateMutation.isLoading,
    };

    return disablingRequirements[currStep()];
  };

  onMount(() => {
    console.log("onMount", { customer });
    setFormStore({
      first_name: customer?.first_name ?? "",
      last_name: customer?.last_name ?? "",
      date_of_birth: customer?.date_of_birth ?? "",
      phone: customer?.phone ?? "",
      availability: customer?.availability || [],
    });
  });

  createEffect(() => {
    // console.log({ ...params });
    organizeAvailabilities(formStore.availability ?? []);
  });

  function handleSubmit(e) {
    e.preventDefault();
    console.log("handleSubmit", { formStore, customer });

    availabilityMutation.mutate(formStore.availability, {
      onSuccess: (data, variables, context) => {
        console.log({ data, variables });

        addToast({
          message: "Dados Cadastrados com sucesso!",
          status: "success",
        });

        const back = isCustomer() ? `/customer/${params.id}` : `/admin/customers/${params.id}`;

        navigate(back);
      },
      onError: err => {
        addToast({
          message: err.message,
          status: "danger",
        });
      },
    });
  }

  const WizardShell = props => {
    return (
      <div class="">
        {props.children}
        <div class="flex justify-end">
          <Show when={!isFirstStep()}>
            <button class="btn btn-ghost" onClick={back}>
              <FiChevronLeft /> Voltar
            </button>
          </Show>

          <Show
            when={!isLastStep()}
            fallback={
              <button class="btn btn-accent" onClick={handleSubmit}>
                <FiCheck class="mr-2 text-lg" /> Confirmar!
              </button>
            }
          >
            <button
              class="btn btn-ghost text-accent"
              disabled={isNextStepDisabled()}
              onClick={e => {
                const isSame = {
                  1: formStore.first_name === customer.first_name && formStore.last_name === customer.last_name,
                  2: formStore.date_of_birth === customer.date_of_birth && formStore.phone === customer.phone,
                };

                const updateData = {
                  1: { first_name: formStore.first_name, last_name: formStore.last_name },
                  2: {
                    phone: formStore.phone,
                    date_of_birth: formStore.date_of_birth,
                  },
                  3: null,
                  4: null,
                };

                const noNeedToUpdate = isSame[currStep()] || !updateData[currStep()];

                if (noNeedToUpdate) return next();

                updateMutation.mutate(updateData[currStep()], {
                  onSuccess: (data, variables, context) => {
                    if (currStep() === 1) {
                      // setUserStore("user", "first_name", formStore.first_name);
                      // setUserStore("user", "last_name", formStore.last_name);
                    }
                    if (currStep() === 2) {
                      // setUserStore("user", "phone", formStore.phone);
                      // setUserStore("user", "date_of_birth", formStore.date_of_birth);
                    }
                    next();
                  },
                });
              }}
            >
              Próximo <FiChevronRight /> {updateMutation.isLoading && <Loading />}
            </button>
          </Show>
        </div>
      </div>
    );
  };

  const FirstForm = props => {
    return (
      <div>
        <label class="label">
          <span class="label-text">Nome</span>
        </label>
        <input
          type="text"
          class="input w-full max-w-xs"
          value={formStore.first_name ?? ""}
          onInput={e => setFormStore("first_name", e.currentTarget.value)}
        />

        <label class="label">
          <span class="label-text">Sobrenome</span>
        </label>
        <input
          type="text"
          class="input w-full max-w-xs"
          value={formStore.last_name ?? ""}
          onInput={e => setFormStore("last_name", e.currentTarget.value)}
        />
      </div>
    );
  };

  const SecondForm = props => {
    let dateInputRef;
    return (
      <div>
        <label class="label">
          <span class="label-text">Data de nascimento</span>
        </label>
        <input
          ref={dateInputRef}
          type="text"
          class="input w-full max-w-xs"
          value={formStore.date_of_birth ?? ""}
          onInput={e => {
            handleDateInput(e);
            setFormStore("date_of_birth", dateInputRef.value);
          }}
        />

        <label class="label">
          <span class="label-text">Telefone</span>
        </label>
        <input
          type="text"
          class="input w-full max-w-xs"
          value={formStore.phone ?? ""}
          onInput={e => setFormStore("phone", e.currentTarget.value)}
        />
      </div>
    );
  };

  const Confirmation = props => {
    return (
      <div class="p-4">
        <h2 class="text-2xl font-bold">Confirmação</h2>

        <p>Confirme se seus dados estão corretos</p>

        <For each={Object.entries(formStore).filter(([k, v]) => k !== "availability")}>
          {([key, value]) => (
            <div>
              <div>
                {t(key)}:{value}
              </div>
            </div>
          )}
        </For>

        <div class="divider"></div>

        <div class="text-lg font-bold">Disponibilidade</div>

        <div class="">
          <Show when={formStore?.availability?.length}>
            <For each={Object.keys(organizeAvailabilities(formStore.availability))}>
              {day => (
                <div>
                  <div class="font-bold">{dateToWeekday(day)}</div>
                  <For each={organizeAvailabilities(formStore.availability)[day]}>
                    {av => (
                      <div class="pl-5">
                        {av.time} - {timeMinutesToStr(timeStrToMinutes(av.time) + 30)}
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>
    );
  };

  const FormComponents = [
    <FirstForm />,
    <SecondForm />,
    <AvailabilityTable
      canEdit
      embedded
      open
      role="customer"
      person={customer}
      availability={customer?.availability ?? []}
      onChange={values => setFormStore("availability", values)}
    />,
    <Confirmation />,
  ];

  return (
    <div>
      <h1>Register Form</h1>
      <div>{`0${currStep()}`}</div>

      <WizardShell>{FormComponents[currComponentIdx()]}</WizardShell>

      {/* <pre>{JSON.stringify(formStore, null, 2)}</pre>*/}
      {/*<pre>{JSON.stringify(userStore, null, 2)}</pre> */}
    </div>
  );
}
