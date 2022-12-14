import { Link } from "solid-app-router";

/* Customers || Professionals */
export default function PersonList(props) {
  return (
    <ul class="list-group">
      {/* <pre>{JSON.stringify(props, null, 2)}</pre> */}
      <For each={props.personList}>
        {person => (
          <li class="list-group-item">
            <div class="flex">
              <Link class="w-100 text-decoration-none" style={{ color: "#000" }} href={`${props.url}/${person.id}`}>
                <div>{person.id}</div>
                <div>{person.first_name}</div>
                <div>{person.email}</div>
              </Link>
              <div class="flex align-items-center">
                <Button kind="delete" onClick={e => props.onDelete(person.id)} />
              </div>
            </div>
          </li>
        )}
      </For>
    </ul>
  );
}
