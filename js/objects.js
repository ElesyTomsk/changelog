let excelData = []; // Глобальный массив с данными из Excel
const colorPalette = ['#ffffff', '#f9f9f9'];
const versionColors = {};
let colorIndex = 0;

function assignColor(value) {
if (!versionColors[value]) {
    versionColors[value] = colorPalette[colorIndex % colorPalette.length];
    colorIndex++;
}
return versionColors[value];
}

document.addEventListener("DOMContentLoaded", function () {
const container = document.getElementById('tableContainer');
const excelJson = localStorage.getItem('uploadedXlsxContent');

if (!excelJson) {
    alert("Данные Excel не найдены.");
    window.location.href = '../WebChangeLog.html';
    return;
}


try {
    const dataArray = JSON.parse(excelJson);
    const data = new Uint8Array(dataArray);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Преобразование в JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
    container.innerHTML = '<p>Файл пуст.</p>';
    return;
    }

    const headers = jsonData[0]; // Первая строка — заголовки
    const rows = jsonData.slice(1);

    excelData = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
    });
    return obj;
    });

    // Создание таблицы
    const table = document.createElement('table');
    table.id = 'excelTable';

    // Создание thead
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Создание tbody (с id для фильтрации)
    const tbody = document.createElement('tbody');
    tbody.id = 'excel-table-body';
    table.appendChild(tbody);

    // Очистка контейнера и добавление таблицы
    container.innerHTML = '';
    container.appendChild(table);

    populateSelects(excelData); // Заполнение выпадающих списков
    filterExcelTable(); // Первичное отображение без фильтра

} catch (e) {
    console.error("Ошибка чтения Excel:", e);
    alert("Ошибка при чтении файла Excel");
    document.getElementById('tableContainer').innerHTML = '<p>Ошибка при обработке файла Excel</p>';
}
});

function populateSelects(data) {
    const addedName = new Set();
    const addedPrefab = new Set();
    const addedScene = new Set();

    const nameSelect = document.getElementById('name');
    const prefabSelect = document.getElementById('prefab');
    const sceneSelect = document.getElementById('scene');

    nameSelect.innerHTML = '<option value="1">Все имена</option>';
    prefabSelect.innerHTML = '<option value="1">Все Prefab</option>';
    sceneSelect.innerHTML = '<option value="1">Все Scene</option>';

    data.forEach(item => {
        const name = item['Имя'];
        const prefab = item['Prefab'];
        const scene = item['Scene'];

        if (name) addedName.add(name);
        if (prefab) addedPrefab.add(prefab);
        if (scene) addedScene.add(scene);
    });

    addedName.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        nameSelect.appendChild(opt);
    });

    addedPrefab.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        prefabSelect.appendChild(opt);
    });

    addedScene.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        sceneSelect.appendChild(opt);
    });
    }

    // Фильтруем и отображаем таблицу
    function filterExcelTable() {
    const selectedName = document.getElementById('name').value;
    const selectedPrefab = document.getElementById('prefab').value;
    const selectedScene = document.getElementById('scene').value;

    const filtered = excelData.filter(item => {
        let match = true;
        if (selectedName !== '1') match = match && item['Имя'] === selectedName;
        if (selectedPrefab !== '1') match = match && item['Prefab'] === selectedPrefab;
        if (selectedScene !== '1') match = match && item['Scene'] === selectedScene;
        return match;
    });

    const tbody = document.getElementById('excel-table-body');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="${excelData.length > 0 ? Object.keys(excelData[0]).length : 4}">Нет данных по вашему запросу</td>`;
        tbody.appendChild(tr);
        return;
    }

    nameColors = {}; // Очистка цветов
    colorIndex = 0;

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = assignColor(item['Имя']); // Цвет по имени

        // Вывод всех значений в порядке заголовков
        for (const key in item) {
        const td = document.createElement('td');
        td.textContent = item[key];
        tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });
}