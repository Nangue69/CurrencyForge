
/* ==========================================================
   FORGE APPS
   FORGE-SELECT.JS

   Selector personalizado, accesible y reutilizable
========================================================== */

let forgeSelectCounter = 0;

/* ==========================================================
   CREAR SELECTOR
========================================================== */

export function createForgeSelect({
    root,
    items = [],
    value = "",
    placeholder = "Seleccionar",
    searchPlaceholder = "Buscar...",
    emptyMessage = "No se encontraron resultados.",
    getValue = (item) => item.value,
    getLabel = (item) => item.label,
    getSearchText = (item) => getLabel(item),
    renderSelected = null,
    renderOption = null,
    onChange = () => { }
}) {
    if (!(root instanceof HTMLElement)) {
        throw new TypeError(
            "Forge Select necesita un elemento raíz válido."
        );
    }

    const id = `forge-select-${++forgeSelectCounter}`;

    let currentItems = [...items];
    let filteredItems = [...items];
    let selectedValue = value;
    let activeIndex = -1;
    let isOpen = false;

    /* ======================================================
       ELEMENTOS
    ====================================================== */

    const container = document.createElement("div");
    container.classList.add("forge-select");

    const trigger = document.createElement("button");
    trigger.classList.add("forge-select__trigger");
    trigger.type = "button";

    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", `${id}-dropdown`);

    const selectedContent = document.createElement("span");
    selectedContent.classList.add("forge-select__selected");

    const arrow = document.createElement("span");
    arrow.classList.add("forge-select__arrow");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";

    trigger.appendChild(selectedContent);
    trigger.appendChild(arrow);

    const dropdown = document.createElement("div");
    dropdown.id = `${id}-dropdown`;
    dropdown.classList.add("forge-select__dropdown");
    dropdown.hidden = true;

    const searchWrapper = document.createElement("div");
    searchWrapper.classList.add("forge-select__search-wrapper");

    const searchInput = document.createElement("input");
    searchInput.id = `${id}-search`;
    searchInput.classList.add("forge-select__search");
    searchInput.type = "search";
    searchInput.autocomplete = "off";
    searchInput.spellcheck = false;
    searchInput.placeholder = searchPlaceholder;
    searchInput.setAttribute("aria-label", searchPlaceholder);

    searchWrapper.appendChild(searchInput);

    const list = document.createElement("ul");
    list.id = `${id}-listbox`;
    list.classList.add("forge-select__list");
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-labelledby", trigger.id || `${id}-trigger`);

    trigger.id = `${id}-trigger`;

    const emptyState = document.createElement("p");
    emptyState.classList.add("forge-select__empty");
    emptyState.textContent = emptyMessage;
    emptyState.hidden = true;

    dropdown.appendChild(searchWrapper);
    dropdown.appendChild(list);
    dropdown.appendChild(emptyState);

    container.appendChild(trigger);
    container.appendChild(dropdown);

    root.replaceChildren(container);

    /* ======================================================
       UTILIDADES
    ====================================================== */

    function normalizeText(text) {
        return String(text)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase()
            .trim();
    }

    function findSelectedItem() {
        return currentItems.find(
            (item) => getValue(item) === selectedValue
        ) || null;
    }

    function getOptionElements() {
        return [
            ...list.querySelectorAll(
                '[role="option"]'
            )
        ];
    }

    function setActiveIndex(index) {
        const options = getOptionElements();

        options.forEach((option) => {
            option.classList.remove(
                "forge-select__option--active"
            );

            option.tabIndex = -1;
        });

        if (options.length === 0) {
            activeIndex = -1;
            return;
        }

        const safeIndex = Math.max(
            0,
            Math.min(index, options.length - 1)
        );

        activeIndex = safeIndex;

        const activeOption = options[safeIndex];

        activeOption.classList.add(
            "forge-select__option--active"
        );

        activeOption.tabIndex = 0;

        activeOption.scrollIntoView({
            block: "nearest"
        });
    }

    function focusActiveOption() {
        const options = getOptionElements();

        if (
            activeIndex >= 0
            && options[activeIndex]
        ) {
            options[activeIndex].focus();
        }
    }

    /* ======================================================
       RENDERIZAR VALOR SELECCIONADO
    ====================================================== */

    function renderSelectedValue() {
        selectedContent.replaceChildren();

        const selectedItem = findSelectedItem();

        if (!selectedItem) {
            selectedContent.textContent = placeholder;
            trigger.classList.add(
                "forge-select__trigger--placeholder"
            );
            return;
        }

        trigger.classList.remove(
            "forge-select__trigger--placeholder"
        );

        if (typeof renderSelected === "function") {
            const content = renderSelected(selectedItem);

            if (content instanceof Node) {
                selectedContent.appendChild(content);
            } else {
                selectedContent.textContent =
                    String(content ?? "");
            }

            return;
        }

        selectedContent.textContent =
            getLabel(selectedItem);
    }

    /* ======================================================
       CREAR OPCIÓN
    ====================================================== */

    function createOption(item, index) {
        const option = document.createElement("li");

        const itemValue = getValue(item);
        const isSelected = itemValue === selectedValue;

        option.classList.add(
            "forge-select__option"
        );

        option.setAttribute("role", "option");
        option.setAttribute(
            "aria-selected",
            String(isSelected)
        );

        option.dataset.value = itemValue;
        option.tabIndex = -1;

        if (isSelected) {
            option.classList.add(
                "forge-select__option--selected"
            );
        }

        if (typeof renderOption === "function") {
            const content = renderOption(item);

            if (content instanceof Node) {
                option.appendChild(content);
            } else {
                option.textContent =
                    String(content ?? "");
            }

        } else {
            option.textContent = getLabel(item);
        }

        option.addEventListener("click", () => {
            selectItem(item);
        });

        option.addEventListener("mousemove", () => {
            setActiveIndex(index);
        });

        option.addEventListener("keydown", (event) => {
            handleOptionKeydown(event);
        });

        return option;
    }

    /* ======================================================
       RENDERIZAR OPCIONES
    ====================================================== */

    function renderOptions() {
        list.replaceChildren();

        emptyState.hidden =
            filteredItems.length > 0;

        list.hidden =
            filteredItems.length === 0;

        filteredItems.forEach((item, index) => {
            list.appendChild(
                createOption(item, index)
            );
        });

        const selectedIndex = filteredItems.findIndex(
            (item) => getValue(item) === selectedValue
        );

        activeIndex =
            selectedIndex >= 0
                ? selectedIndex
                : filteredItems.length > 0
                    ? 0
                    : -1;

        setActiveIndex(activeIndex);
    }

    /* ======================================================
       FILTRAR
    ====================================================== */

    function filterItems(query) {
        const normalizedQuery =
            normalizeText(query);

        filteredItems = normalizedQuery
            ? currentItems.filter((item) => {
                return normalizeText(
                    getSearchText(item)
                ).includes(normalizedQuery);
            })
            : [...currentItems];

        renderOptions();
    }

    /* ======================================================
       ABRIR Y CERRAR
    ====================================================== */

    function open() {
        if (isOpen) return;

        isOpen = true;

        dropdown.hidden = false;

        trigger.setAttribute(
            "aria-expanded",
            "true"
        );

        container.classList.add(
            "forge-select--open"
        );

        searchInput.value = "";

        filteredItems = [...currentItems];

        renderOptions();

        window.requestAnimationFrame(() => {
            searchInput.focus();
        });
    }

    function close({
        restoreFocus = true
    } = {}) {
        if (!isOpen) return;

        isOpen = false;

        dropdown.hidden = true;

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

        container.classList.remove(
            "forge-select--open"
        );

        searchInput.value = "";

        filteredItems = [...currentItems];

        if (restoreFocus) {
            trigger.focus();
        }
    }

    function toggle() {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    /* ======================================================
       SELECCIONAR
    ====================================================== */

    function selectItem(item, {
        emitChange = true
    } = {}) {
        const nextValue = getValue(item);
        const previousValue = selectedValue;

        selectedValue = nextValue;

        renderSelectedValue();
        renderOptions();
        close();

        if (
            emitChange
            && previousValue !== nextValue
        ) {
            onChange(nextValue, item);
        }
    }

    /* ======================================================
       TECLADO
    ====================================================== */

    function handleTriggerKeydown(event) {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
            case "Enter":
            case " ":
                event.preventDefault();
                open();
                break;

            case "Escape":
                close();
                break;

            default:
                break;
        }
    }

    function handleSearchKeydown(event) {
        const options = getOptionElements();

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();

                setActiveIndex(
                    activeIndex < options.length - 1
                        ? activeIndex + 1
                        : 0
                );

                focusActiveOption();
                break;

            case "ArrowUp":
                event.preventDefault();

                setActiveIndex(
                    activeIndex > 0
                        ? activeIndex - 1
                        : options.length - 1
                );

                focusActiveOption();
                break;

            case "Escape":
                event.preventDefault();
                close();
                break;

            case "Enter":
                if (
                    activeIndex >= 0
                    && filteredItems[activeIndex]
                ) {
                    event.preventDefault();

                    selectItem(
                        filteredItems[activeIndex]
                    );
                }
                break;

            default:
                break;
        }
    }

    function handleOptionKeydown(event) {
        const options = getOptionElements();

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();

                setActiveIndex(
                    activeIndex < options.length - 1
                        ? activeIndex + 1
                        : 0
                );

                focusActiveOption();
                break;

            case "ArrowUp":
                event.preventDefault();

                setActiveIndex(
                    activeIndex > 0
                        ? activeIndex - 1
                        : options.length - 1
                );

                focusActiveOption();
                break;

            case "Home":
                event.preventDefault();

                setActiveIndex(0);
                focusActiveOption();
                break;

            case "End":
                event.preventDefault();

                setActiveIndex(
                    options.length - 1
                );

                focusActiveOption();
                break;

            case "Enter":
            case " ":
                event.preventDefault();

                if (filteredItems[activeIndex]) {
                    selectItem(
                        filteredItems[activeIndex]
                    );
                }
                break;

            case "Escape":
                event.preventDefault();
                close();
                break;

            default:
                break;
        }
    }

    /* ======================================================
       EVENTOS
    ====================================================== */

    trigger.addEventListener(
        "click",
        toggle
    );

    trigger.addEventListener(
        "keydown",
        handleTriggerKeydown
    );

    searchInput.addEventListener(
        "input",
        () => {
            filterItems(searchInput.value);
        }
    );

    searchInput.addEventListener(
        "keydown",
        handleSearchKeydown
    );

    document.addEventListener(
        "pointerdown",
        handleOutsidePointer
    );

    function handleOutsidePointer(event) {
        if (
            isOpen
            && !container.contains(event.target)
        ) {
            close({
                restoreFocus: false
            });
        }
    }

    /* ======================================================
       API PÚBLICA
    ====================================================== */

    function setItems(nextItems) {
        currentItems = Array.isArray(nextItems)
            ? [...nextItems]
            : [];

        filteredItems = [...currentItems];

        const selectedExists =
            currentItems.some(
                (item) =>
                    getValue(item) === selectedValue
            );

        if (!selectedExists) {
            selectedValue = "";
        }

        renderSelectedValue();
        renderOptions();
    }

    function setValue(nextValue, {
        emitChange = false
    } = {}) {
        const item = currentItems.find(
            (currentItem) =>
                getValue(currentItem) === nextValue
        );

        if (!item) {
            return false;
        }

        selectItem(item, {
            emitChange
        });

        return true;
    }

    function getSelectedValue() {
        return selectedValue;
    }

    function refresh({
        nextPlaceholder = placeholder,
        nextSearchPlaceholder = searchPlaceholder,
        nextEmptyMessage = emptyMessage
    } = {}) {
        placeholder = nextPlaceholder;
        searchPlaceholder = nextSearchPlaceholder;
        emptyMessage = nextEmptyMessage;

        searchInput.placeholder =
            searchPlaceholder;

        searchInput.setAttribute(
            "aria-label",
            searchPlaceholder
        );

        emptyState.textContent =
            emptyMessage;

        renderSelectedValue();
        renderOptions();
    }

    function destroy() {
        document.removeEventListener(
            "pointerdown",
            handleOutsidePointer
        );

        root.replaceChildren();
    }

    renderSelectedValue();
    renderOptions();

    return {
        open,
        close,
        setItems,
        setValue,
        getValue: getSelectedValue,
        refresh,
        destroy
    };
}