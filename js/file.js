/// Обновление названия файла
function updateFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : '';
    fileNameDisplay.textContent = `Ваш файл: ${fileName}`;
}

/// Просмотр на корректность файла
function handleFileUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');

    if (fileInput.files.length === 0) {
        alert("Для продолжения выберите файл");
        return;
    }

    const filePath = fileInput.value;
    const allowedExtensions = /(\.txt)$/i;

    if (!allowedExtensions.exec(filePath)) {
        alert('Пожалуйста, загрузите файл формата .txt');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        localStorage.setItem('uploadedFileContent', e.target.result);
        window.location.href = 'sorting/search';
    };

    reader.onerror = function(e) {
        alert('Ошибка чтения файла');
    };

    reader.readAsText(file);
}
