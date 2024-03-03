const LIMIT_SEARCH = 24;
const BASE_URL = 'https://api.thecatapi.com/v1/';
const API_KEY = 'live_0IlQ7FRILvAL44Mwh3DhDGJ9e2m0sdyRfXtoGTDnbUDFptap1Lrvgp1JZ4HqhGaA';
const FETCH_GATITOS = `${BASE_URL}images/search?limit=${LIMIT_SEARCH}`;
const FETCH_FAVOURITES = `${BASE_URL}favourites`;
const DELETE_FAVOURITE = (id) => `${BASE_URL}favourites/${id}`;
const UPLOAD_CAT_IMAGE = `${BASE_URL}images/upload`;
const DEFAULT_UPLOAD_IMAGE = './img/cat-placeholder-lg.svg';

// Page Sections
const template = '<div class="avatar placeholder-glow"><div class="placeholder h-100 w-100 rounded-circle"></div></div>';
const fetchCatsButton = document.getElementById('fetchCats');
const randomElement = document.getElementById('randomGatitos');
const favouriteGatitosElements = document.getElementById('favouriteGatitos');
const alertElement = document.getElementById('alert');

// Buttons / Elements
const previewImage = document.getElementById('imgPreview');
const imgPreviewWrapper = document.getElementById('imgPreviewWrapper');
const uploadPhotoButton = document.getElementById('uploadPhoto');
const uploadInputForm = document.getElementById('uploadInputForm');
const removeImageButton = document.getElementById('removeImage');
const uploadImageForm = document.getElementById('uploadImageForm');
const selectImageButton = document.getElementById('selectImage');
const spinnerIcons = document.querySelectorAll('.fa-rotate-right');

/**
 *  ------------------------------
 *        FETCH API DATA
 *  ------------------------------
 */

const fetchData = async (URL, method = 'GET', headers, body) => {    
    alertElement.classList.add('d-none');
    showLoading();
    let result = {
        error: false,
        data: null
    };
    const response = await fetch(URL, {
        method,
        headers: {
            'X-API-KEY': API_KEY,
            ...headers
        },
        body
    });
    
    try {
        result.data = await response.json();
    } catch {
        result.data =  response;
    }

    if(response.status !== 200 && response.status !== 201) {
        alertElement.classList.remove('d-none');
        alertElement.classList.add('alert-danger');
        alertElement.querySelector('.alert-content').innerHTML =`Ha ocurrido un error: ${response.status} ${result.data}`
        result.error = true;
        hideLoading();
    }

    return result;
}

const fetchCats = async () => {
    generateRandomPlaceholders();
    console.log('test');
    const result = await fetchData(FETCH_GATITOS);
    randomElement.innerHTML = '';
    result?.data?.forEach(cat => {
        randomElement.innerHTML += `<div class="nav-item col-12 col-xs-6 col-sm-4 col-md-3 col-lg-2 mb-2">${generateAvatar(cat, 'add')}</div>`;
    });
    hideLoading();
}

const loadFavouriteCats = async () => {
    const result = await fetchData(FETCH_FAVOURITES);
    favouriteGatitosElements.innerHTML = '';
    result?.data?.forEach(cat => {
        favouriteGatitosElements.innerHTML += `<li class="nav-item col-12 col-md-6 mb-4">${generateAvatar(cat, 'delete')}</li>`;
    });
    hideLoading();
}

const addCatAsFavourite = async (event, image_id) => {
    let icon;
    if(event) {
        const button = event.target;
        icon = button.querySelector('.add-favourite-icon');
        icon.classList.remove('fa-heart', 'fa-regular');
        icon.classList.add('fas', 'fa-rotate-right', 'fa-spin');
        button.disabled = true;
    }

    const response = await fetchData(
        FETCH_FAVOURITES, 
        'POST', 
        {'Content-Type': 'application/json'},
        JSON.stringify({image_id: image_id})
    );
    if(!response.error) {
        alertElement.classList.remove('d-none');
        alertElement.classList.add('alert-success');
        alertElement.querySelector('.alert-content').innerHTML =`Gatito ha sido agregado de los favoritos correctamente`;
        if(icon) {
            icon.classList.add('fa-check', 'fa-regular');
            icon.classList.remove('fa-rotate-right', 'fa-spin');
        }
        removeImage.disabled = false;
        removeImage.click();
        await loadFavouriteCats();
    }
}

const deleteFavouriteGatito = async (event, image_id) => {
    const button = event?.target;
    if(button) {
        if(button.disabled) {
            return;
        }
        icon = button.querySelector('.remove-favourite-icon');
        icon.classList.remove('fa-trash', 'fa-regular');
        icon.classList.add('fas', 'fa-rotate-right', 'fa-spin');
        button.disabled = true;
    }
    const response = await fetchData(DELETE_FAVOURITE(image_id),'DELETE');

    if(!response.error) {
        alertElement.classList.add('alert-success');
        alertElement.querySelector('.alert-content').innerHTML =`Gatito ha sido eliminado de los favoritos correctamente`;
        await loadFavouriteCats();
    }
}

/**
 * Event generator
 */
const addEvents = (target, eventType, callback) => {
    if(target) {
        target.addEventListener(eventType, callback);
    }
}

const generateEvents = () => {
    // Open file selector
    addEvents(selectImageButton,'click', triggerInput);
    
    //Upload Photo Actions
    addEvents(document.getElementById('uploadPhoto'),'click', uploadCatPhoto);
    
    // Generate selected file preview
    addEvents(uploadInputForm, 'change', generatePreview);

    // Remove Image button
    addEvents(removeImageButton, 'click', clearImageInputFile);

    // Load more cats
    addEvents(fetchCatsButton, 'click', async () => { fetchCats()});
}

/**
 * ------------------------------
 *          ACTIONS
 * ------------------------------
 */
const triggerInput = () => {
    const inputForm = document.getElementById('uploadInputForm');
    inputForm.click();
}

const generateFavouritesPlaceholders = () => {
    let i = 0;
    while (i < (LIMIT_SEARCH / 2)) {
        favouriteGatitosElements.innerHTML += `<li class="nav-item col-12 col-md-6 mb-4 text-white">${template}</li>`;
        i++;
    }
    
}

const generateRandomPlaceholders = () => {
    let i = 0;
    randomGatitos.innerHTML = '';
    while (i < (LIMIT_SEARCH)) {
        randomGatitos.innerHTML += `<div class="nav-item col-12 col-xs-6 col-sm-4 col-md-3 col-lg-2 mb-2"><div class="avatar">${template}</div></div>`
        i++;
    }
    
}

const generatePreview = () => {
    const formData = new FormData(uploadImageForm);
    const reader = new FileReader();
    const file = formData.get('file');
    const isFileSelected = file.size > 0;
    reader.readAsDataURL(file);
    uploadPhotoButton.disabled = !isFileSelected;
    removeImageButton.disabled = !isFileSelected;

    reader.onload = () => {
        previewImage.src = isFileSelected ? reader.result : DEFAULT_UPLOAD_IMAGE;
        isFileSelected ? imgPreviewWrapper.classList.remove('d-none') : imgPreviewWrapper.classList.add('d-none');
    }

}

const generateAvatar = (cat, type) => {
    let action;
    
    if (type === 'delete') {
        action = `<button class="btn btn-danger rounded-circle" onClick="deleteFavouriteGatito(event,${cat.id})"><i class="remove-favourite-icon fa-regular fa-trash-can fa-md"></i></button>`;
    } else {
        action = `<button class="btn btn-outline-danger rounded-circle bg-white text-danger add-favourites" onClick="addCatAsFavourite(event, '${cat.id}')"><i class="add-favourite-icon fa-regular fa-heart fa-md"></i></button>`;
    }

    return `
        <div class="avatar">
            <img src="${cat?.image?.url || cat.url}">
            ${action}
        </div>
    `;
}

const clearImageInputFile = () => {
    if(removeImageButton.disabled) {
        return;
    }
    uploadImageForm.reset();
    uploadInputForm.dispatchEvent(new Event('change'))
}

const uploadCatPhoto = async () => {
    if(this.disabled) {
        return;
    }

    const icon = document.querySelector('.removeImageIcon');
    icon.classList.add('fa-rotate-right', 'fa-spin');
    icon.classList.remove('fa-remove');
    
    const formData = new FormData(uploadImageForm);
    const response = await fetchData(UPLOAD_CAT_IMAGE,'POST',{} ,formData);
    
    if(!response.error) {
        alertElement.classList.add('alert-success');
        alertElement.querySelector('.alert-content').innerHTML =`Foto de cat Subida`;
        addCatAsFavourite(null, response.data.id);
        icon.classList.remove('fa-rotate-right', 'fa-spin');
        icon.classList.add('fa-remove');
    }
}

const showLoading = () => {
    uploadImageForm.classList.add('d-none');
    fetchCatsButton.disabled = true;
    removeImageButton.disabled = true;
    spinnerIcons.forEach(spinnerIcon => spinnerIcon.classList.add('fa-spin'));
}

const hideLoading = () => {
    uploadImageForm.classList.remove('d-none');
    fetchCatsButton.disabled = false;
    spinnerIcons.forEach(spinnerIcon => spinnerIcon.classList.remove('fa-spin'));
}


/**
 * Upload Photo
 */

generateEvents();
generateFavouritesPlaceholders();
fetchCats();
loadFavouriteCats();