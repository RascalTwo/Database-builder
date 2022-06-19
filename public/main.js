
const CHANGE_TYPE_TO_METHOD = {
    create: 'POST',
    read: 'GET',
    update: 'PUT',
    delaytay: 'DELETE',
}

const CHANGE_TYPE_EDITORS = {
    create: ['data'],
    read: ['filter'],
    update: ['filter', 'data'],
    delaytay: ['filter'],
}

const EDITORS = {
    filter: new JSONEditor(document.getElementById('filter-editor'), { mode: 'code' }),
    data: new JSONEditor(document.getElementById('data-editor'), { mode: 'code' }),
    results: new JSONEditor(document.getElementById('results'), { mode: 'preview' })
}

document.querySelector('.actions').addEventListener('click', ({ target: button }) => {
    if (button.tagName !== 'BUTTON') return;

    const previous = document.querySelector('.activeAction')
    if (previous === button) return makeChange();

    previous.textContent = 'Switch to ' + previous.textContent;
    previous.classList.remove('activeAction');

    const editorName = button.textContent.split(' ').at(-1)
    const editorType = editorName.toLowerCase();
    const showingEditors = CHANGE_TYPE_EDITORS[editorType];
    for (const editorType of ['data', 'filter']){
        EDITORS[editorType].container.parentElement.classList.toggle('hidden', !showingEditors.includes(editorType));
    }

    button.textContent = editorName;
    button.classList.add('activeAction');
});

function setUIState(disabled){
    document.querySelector('.actions').disabled = disabled;
    for (const editorType of ['data', 'filter']){
        EDITORS[editorType].setMode(disabled ? 'preview' : 'code');
    }
}

async function makeChange(){
    const changeType = document.querySelector('.activeAction').textContent.toLowerCase();
    const method = CHANGE_TYPE_TO_METHOD[changeType];
    try{
        setUIState(true);

        const payload = {};
        for (const editorType of CHANGE_TYPE_EDITORS[changeType]){
            payload[editorType] = EDITORS[editorType].get()
        }

        let url = new URL('/interact', window.location.origin)
        const options = {
            method,
            headers: {'Content-Type': 'application/json'},
        }
        if (method !== CHANGE_TYPE_TO_METHOD.read) options.body = JSON.stringify(payload)
        else for (const key in payload) url.searchParams.set(key, JSON.stringify(payload[key]));

        const response = await fetch(url, options)
        const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, 1000));
        EDITORS.results.set(data);
    }catch(err){
        console.error(err)
    } finally {
        setUIState(false);
    }
}

async function updateEntry(){
    try{
        const response = await fetch('updateEntry', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: document.getElementsByName("name")[0].value,
            speciesName: document.getElementsByName("speciesName")[0].value,
            features: document.getElementsByName("features")[0].value,
            homeworld: document.getElementsByName("homeworld")[0].value,
            image: document.getElementsByName("image")[0].value,
            interestingFact: document.getElementsByName("interestingFact")[0].value,
            notableExamples: document.getElementsByName("notableExamples")[0].value
        })
    })
    const data = await response.json()
    console.log(data)
    location.reload()

}catch(err){
    console.log(err)
}
}