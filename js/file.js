/// Обновление названия файла
function updateFileName(inputElement, labelId) {
    const fileNameDisplay = document.getElementById(labelId);
    const fileName = inputElement.files.length > 0 ? inputElement.files[0].name : '';
    fileNameDisplay.textContent = `Ваш файл: ${fileName}`;
}

/// Просмотр на корректность файла
function handleFileUpload(event, fileType) {
    const input = event.target;
    const file = input.files[0];

    if (!file){
        return;
    } 

    // Проверка расширения
    const fileName = file.name;
    const allowedExtensions = fileType === 'txt' 
        ? /\.txt$/i 
        : /\.xlsx$/i;

    if (!allowedExtensions.test(fileName)) {
        alert(`Пожалуйста, загрузите файл формата .${fileType}`);
        input.value = ''; // Сбросить выбор файла
        return;
    }

    // Очистка localStorage перед загрузкой нового файла
    if (fileType === 'txt') {
        localStorage.removeItem('uploadedTxtContent');
    } else {
        localStorage.removeItem('uploadedXlsxContent');
    }

    // Чтение файла
    const reader = new FileReader();
    const isExcel = fileType === 'xlsx';

    reader.onload = function(e) {
        if (isExcel) {
            const data = new Uint8Array(e.target.result);
            localStorage.setItem('uploadedXlsxContent', JSON.stringify(Array.from(data)));
            window.location.href = 'objects/information';
        } 
        else {
            localStorage.setItem('uploadedTxtContent', e.target.result);
            window.location.href = 'sorting/search';
        }
    };

    reader.onerror = function() {
        alert('Ошибка чтения файла');
    };

    if (isExcel) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }

    updateFileName(input, fileType === 'txt' ? 'fileNameTxt' : 'fileNameXlsx');
}
