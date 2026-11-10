import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение

import {initSearching} from "./components/searching.js"
import {initPagination} from "./components/pagination.js"
import {initSorting} from "./components/sorting.js"
import {initFiltering} from "./components/filtering.js"



// Исходные данные используемые в render()
const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page        
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {};
    // @todo: использование
    // result = applySearching(result, state, action);
    // result = applyFiltering(result, state, action);
    // result = applySorting(result, state, action);
    // result = applyPagination(result, state, action);
    query = applyPagination(query, state, action); // обновляем query
    query = applyFiltering(query, state, action); // result заменяем на query
    query = applySearching(query, state, action); // result заменяем на query
    query = applySorting(query, state, action); // result заменяем на query 
    const { total, items } = await api.getRecords(query); // запрашиваем данные с собранными параметрами

    updatePagination(total, query); // перерисовываем пагинатор
    sampleTable.render(items)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация

// const applyPagination = initPagination(
//     sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
//     (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
//         const input = el.querySelector('input');
//         const label = el.querySelector('span');
//         input.value = page;
//         input.checked = isCurrent;
//         label.textContent = page;
//         return el;
//     }
// ); 

const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);  

const applySearching = initSearching('search', {
    elements: sampleTable.search.elements,
    searchField: 'search' // передаем имя поля для поиска
});

const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]); 

// const applyFiltering = initFiltering(sampleTable.filter.elements, {    // передаём элементы фильтра
//     searchBySeller: indexes.sellers                                    // для элемента с именем searchBySeller устанавливаем массив продавцов
// }); 
const {applyFiltering, updateIndexes} = initFiltering(
    sampleTable.filter.elements
);  


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

async function init() {
    const indexes = await api.getIndexes();

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });    
}

init().then(render);
