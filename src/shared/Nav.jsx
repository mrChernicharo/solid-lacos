import { createSignal } from "solid-js";
import { FiChevronDown, FiMenu, FiX } from "solid-icons/fi";
import { classss } from "../lib/helpers";
import { FaSolidChevronDown } from "solid-icons/fa";
// import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};
const navigation = [
  { name: "Admin", href: "/admin", current: true },
  { name: "Team", href: "#", current: false },
  { name: "Calendar", href: "#", current: false },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "/login" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [userMenuOpen, setUserMenuOpen] = createSignal(false);

  return (
    <nav class="bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">🌺</div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <For each={navigation}>
                  {item => (
                    <a
                      key={item.name}
                      href={item.href}
                      class={classss(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "px-3 py-2 rounded-md text-sm font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  )}
                </For>
              </div>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <div class="relative ml-3">
                <div>
                  <button
                    class="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    onClick={e => setUserMenuOpen(prev => !userMenuOpen())}
                  >
                    <span class="sr-only">Open user menu</span>
                    <img class="h-8 w-8 rounded-full" src={user?.imageUrl ?? ""} alt="" />
                  </button>
                </div>
                <Show when={userMenuOpen()}>
                  <div class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <For each={userNavigation}>
                      {item => (
                        <div>
                          <a
                            href={item.href}
                            class={classss(
                              // active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {item.name}
                          </a>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </div>
          <div class="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              class="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={e => setMenuOpen(prev => !menuOpen())}
            >
              <span class="sr-only">Open main menu</span>
              {menuOpen() ? (
                <FiX class="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu class="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div class="md:hidden">
        <Show when={menuOpen()}>
          <div class="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            {navigation.map(item => (
              <a
                href={item.href}
                class={classss(
                  item.current
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block px-3 py-2 rounded-md text-base font-medium"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>
          <div class="border-t border-gray-700 pt-4 pb-3">
            <div class="flex items-center px-5">
              <div class="flex-shrink-0">
                <img class="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
              </div>
              <div class="ml-3">
                <div class="text-base font-medium leading-none text-white">{user.name}</div>
                <div class="text-sm font-medium leading-none text-gray-400">{user.email}</div>
              </div>
              <button
                type="button"
                class="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                onClick={e => setUserMenuOpen(!userMenuOpen())}
              >
                <FiChevronDown class="block h-6 w-6" />
              </button>
            </div>
            <Show when={userMenuOpen()}>
              <div class="mt-3 space-y-1 px-2">
                {userNavigation.map(item => (
                  <a
                    href={item.href}
                    class="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </nav>
  );
}