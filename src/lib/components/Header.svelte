<script lang="ts">
	import { Button, ButtonGroup, Dropdown, DropdownItem, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from 'flowbite-svelte';
	import { ChevronDownOutline, CloseOutline, HomeOutline } from 'flowbite-svelte-icons';
	import { _ } from 'svelte-i18n';

	import { activeTabId, tabs } from '$lib/stores/tabStore';
	import type { ClassValue } from 'svelte/elements';
	import { fly } from 'svelte/transition';

	interface Props {
		class?: ClassValue | undefined | null;
		onTabClick?: (id?: string) => void;
		onTabClose?: (id: string) => void;
	}

	let { class: customClass, onTabClick, onTabClose }: Props = $props();

	let dropDownIsOpen = $state(false);

	function innerOnTabClick(id?: string) {
		dropDownIsOpen = false;

		if (onTabClick) {
			onTabClick(id);
		}
	}

	function innerOnTabClose(id?: string) {
		if (!id) {
			return;
		}

		dropDownIsOpen = false;

		if (onTabClose) {
			onTabClose(id);
		}
	}
</script>


<Navbar class={customClass}>
  <NavBrand href="/">
    <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
  </NavBrand>
  <NavHamburger />
  <NavUl transition={fly} transitionParams={{ y: -20, duration: 250 }}>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/about">About</NavLi>
    <NavLi href="/docs/components/navbar">Navbar</NavLi>
    <NavLi href="/pricing">Pricing</NavLi>
    <NavLi href="/contact">Contact</NavLi>
  </NavUl>
</Navbar>
