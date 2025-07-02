document.addEventListener('DOMContentLoaded', function () {
    const savedContent = localStorage.getItem('uploadedFileContent');

    if (savedContent) {
        processFileContent(savedContent);
    } else {
        alert('Файл не был загружен');
        window.location.href = '../index';
    }
});

let globalData = [];  //Глобальная переменная для объектов

function processFileContent(content) {
    // Элементы
    const lines = content.split('\n');   // Строки
    const outputTableBody = document.getElementById('informations-table__body');  // Контейнер для вывод инфомрации
    const outputNameProject = document.getElementById('project-name');  // Элемент id для имени проекта
    const outputClient = document.getElementById('client');  // Элемент id для названия заказчика
    const dropdownVersions = document.getElementById('version');  // Выпадающее меню выбора версий
    const dropdownActions = document.getElementById('action');  // Выпадающее меню выбора действий
    const dropdownObjects = document.getElementById('object');  // Выпадающее меню выбора объектов
    const authorDropdown = document.getElementById('author');  // Выпадающее меню выбора авторов

    // Очистка
    outputTableBody.innerHTML = '';   // Очистка контейнера
    outputNameProject.textContent = '';   // Очистка названия проекта
    outputClient.textContent = '';  // Очистка имени заказчика 
    globalData = [];  // Очистка массива объектов
    
    // Переменные
    let nameProject = '';  // Название проекта
    let client = '';  // Имя заказчика
    let inActionSection = false;  // Флаг на #ADD
    let currentVersion = '';  // Версия
    let currentAction = '';  // Действие
    let currentAuthor = '';  // Автор

    // Уникальность
    const addedVersions = new Set();  // Хранилище уникальных версий
    const addedActions = new Set();  // Хранилище уникальных действий
    const addedObjects = new Set();  // Хранилище уникальных объектов
    const addedAuthor = new Set();  // Хранилище уникальных авторов

    // Поиск
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Первая строка - название проекта и заказчик
        if (i === 0) {
            const parts = line.split(/\s+/);

            client = parts[0] || '';
            nameProject = parts[1] || '';
            continue;
        }

        // Нахождение версий
        if (line.startsWith('!')) {
            const cleanedLine = line.slice(1);
            const parts = cleanedLine.split(/\s+/);
            const vers = parts[0];
            const versionOption = document.createElement('option');

            if (!addedVersions.has(vers))
            {  
                versionOption.value = vers;
                versionOption.textContent = vers;
                dropdownVersions.appendChild(versionOption);
                addedVersions.add(vers);
            }

            //Запоминание версии
            currentVersion = vers;

            inActionSection = false;
            continue;
        }

        // Нахождение действий
        if (line.startsWith('#')) {
            const actionOption = document.createElement('option');
            const parts = line.split(/\s+/);
            const act = parts[0]
            const authorName = parts[1];

            if (!addedActions.has(act))
            {  
                actionOption.value = act;
                actionOption.textContent = act;
                dropdownActions.appendChild(actionOption);
                addedActions.add(act);
            }

            inActionSection = true;
            currentAction = act;
            currentAuthor = authorName;
            
            if (!addedAuthor.has(authorName) && authorName) {
                const authorOption = document.createElement('option');
                authorOption.value = authorName;
                authorOption.textContent = authorName;
                authorDropdown.appendChild(authorOption);
                addedAuthor.add(authorName);
            }

            continue;
        }

        //Нахождение объектов
        if (inActionSection) {
            const match = line.match(/^([^\S\r\n]*)(\S.*?)\s*-\s*(.*)/);

            if (match) {
                const objectRaw = match[2];
                const normalizedLine = objectRaw.replace(/\s+/g, '');
                const fullText = match[3].trim();

                if (!addedObjects.has(normalizedLine) && normalizedLine != "") {
                    const objectOption = document.createElement('option');
                    objectOption.value = normalizedLine;
                    objectOption.textContent = normalizedLine;
                    dropdownObjects.appendChild(objectOption);
                    addedObjects.add(normalizedLine);
                }

                // Сохраняем данные
                globalData.push({
                    version: currentVersion,
                    action: currentAction,
                    object: normalizedLine,
                    author: currentAuthor,
                    text: fullText
                });
            }
        }
        
    }

    // Вывод в html
    if (nameProject) {
        outputNameProject.textContent = nameProject;
    }
    if (client) {
        outputClient.textContent = client;
    }

    
}

/// Запись в таблицу
function recordInTable() {
    const selectedVersion = document.getElementById('version').value;
    const selectedAction = document.getElementById('action').value;
    const selectedObject = document.getElementById('object').value;
    const selectedAuthor = document.getElementById('author').value;
    
    const tableBody = document.getElementById('informations-table__body');
    
    tableBody.innerHTML = '';

    const filtered = globalData.filter(item => {
        let match = true;

        if (selectedVersion !== '1') {
            match = match && item.version === selectedVersion;
        }

        if (selectedAction !== '1') {
            match = match && item.action === selectedAction;
        }

        if (selectedObject !== '1') {
            match = match && item.object === selectedObject;
        }

        if (selectedAuthor !== '1') {
            match = match && item.author === selectedAuthor;
        }

        return match;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Нет данных по вашему запросу</td></tr>';
        return;
    }

    const versionColors = {};
    const colorPalette = ['#ffffff', '#ebebeb', '#d7d7d7'];
    let colorIndex = 0;

    function assignColor(version) {
        if (!versionColors[version]) {
            versionColors[version] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        }
        return versionColors[version];
    }

    // Создание строк с цветом
    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = assignColor(item.version);

        tr.innerHTML = `
            <td>${item.version}</td>
            <td>${item.action}</td>
            <td>${item.object}</td>
            <td>${item.author}</td>
            <td>${item.text}</td>
        `;
        tableBody.appendChild(tr);
    });
}




  // Заполняем таблицу
  populateTable(globalData);

