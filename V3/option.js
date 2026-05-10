window.onload = async function() {
    const data = await chrome.storage.local.get(['Prefix', 'position']);
    
    const prefix = data.Prefix || 'NowBrowsing: ';
    document.getElementById('id_prefix').value = prefix;

    const position = data.position || '1';
    const radios = document.getElementsByName("name_position");
    for (let radio of radios) {
        if (radio.value === position) {
            radio.checked = true;
        }
    }
}

document.getElementById('id_save').onclick = function() {
    const prefixValue = document.getElementById('id_prefix').value;
    let positionValue = '1';

    const positions = document.getElementsByName("name_position");
    for (let i = 0; i < positions.length; i++) {
        if (positions[i].checked) {
            positionValue = positions[i].value;
            break;
        }
    }

    chrome.storage.local.set({
        'Prefix': prefixValue,
        'position': positionValue
    }, function() {
        console.log("Settings saved");
        window.close();
    });
}