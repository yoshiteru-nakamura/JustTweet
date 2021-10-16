window.onload = function(){
    let prefix = chrome.storage.local.get('prefix');
    console.log("prefix",prefix);
    if (prefix == null) {
        prefix = 'NowBrowsing: ';
        chrome.storage.local.set({'prefix': prefix},function(){});
    }
    prefix = document.getElementById('id_prefix').value;

    let position = chrome.storage.local.get('position');
    if (position == null) {
        position = '1';
    }
}

document.getElementById('id_save').onclick = function() {
    chrome.storage.local.set({'prefix': document.getElementById('id_prefix').value},function(){});
    let positions = document.getElementsByName("name_position");
    for(let i = 0; i < positions.length; i++){
        if(positions[i].checked) {
            console.log("Radio button checked : ", positions[i].value);
            chrome.storage.local.set({'position': positions[i].value},function(){});
            window.close()
        }
    }
}